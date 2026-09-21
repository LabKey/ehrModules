##
#  Copyright (c) 2012-2026 LabKey Corporation
#
#  Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
##

# This R script will calculate and store kinship coefficients (aka. relatedness) for all animals in the colony.  This is a large, sparse matrix.
# The matrix is written out as a very long 3-column TSV file (animal1, animal2, coefficient), which is normally imported into
# ehr.kinship by java code in GeneticCalculationsImportTask.
#
# This runs as a child of the web server, so its peak is charged against the same memory budget as the JVM.  Two things bound it.
# Each family -- animals joined by a chain of parent-child links -- is computed as its own dense matrix and streamed to disk before
# the next is allocated.  And the kinship recursion runs here rather than through kinship2::kinship(), which allocates (n+1)^2
# doubles, copies them to n^2, and updates a whole generation at once; at a 24,000-animal family that is three times the matrix.
#
# In a managed breeding colony almost every animal descends from a shared founder set, so the largest family is most of the species
# (76% to 100% at the colonies measured).  The split is what lets one matrix be released before the next, not a way to make the
# largest one small.
library(getopt)

# Columns of the dense matrix copied out at a time.  The index and value vectors and the frame handed to write.table are all derived
# from the slab, so a mostly-nonzero slab costs roughly four times this while it is written.  Smaller is not cheaper: 4e6 and 512e6
# both raised the peak at a 25,000-animal colony.
BLOCK_BYTES <- 64e6

# Rows of one generation updated per pass in kinshipDense, bounding that pass's temporaries to CHUNK_ROWS x n doubles
CHUNK_ROWS <- 512L

OUTPUT_FILE <- 'kinship.txt'
TEMP_FILE <- 'kinship.txt.part'
FAMILY_OUTPUT <- 'kinship.families.txt'

spec <- matrix(c(
    'inputFile', 'f', 1, 'character',
	'minCoefficient', 'mc', 1, 'double'
), ncol=4, byrow=TRUE)
opts <- getopt(spec, commandArgs(trailingOnly = TRUE))


# Minimum coefficient to emit; omitting the argument disables the filter.  Enabling this silently lowers colony-wide kinship averages, because those
# queries divide by an independent population count rather than by the rows present: at 2^-6 it removed 62% of the rows and a
# third of the total kinship at one colony measured.
if (is.null(opts$minCoefficient)) opts$minCoefficient <- -1

# Row index of each animal's parent, 0 where the parent is unknown
parentIndex <- function(id, parent)
{
    match(parent, id, nomatch = 0L)
}

# The conditions that fail the run: a blank id, an id with two rows, and an id recorded as both a dam and a sire or as its own parent
validatePedigree <- function(id, dam, sire)
{
    if (anyNA(id) || any(grepl('^ *$', id)))
        stop('Pedigree contains a blank id')

    dup <- unique(id[duplicated(id)])
    if (length(dup) > 0)
        stop(paste('Duplicate subject id:', paste(head(dup, 6), collapse = ' ')))

    both <- intersect(dam[!is.na(dam)], sire[!is.na(sire)])
    if (length(both) > 0)
        stop(paste('Id recorded as both a dam and a sire:', paste(head(both, 6), collapse = ' ')))

    # Caught here rather than as a loop in generationDepth, which cannot say which animal is at fault
    self <- id[(!is.na(dam) & id == dam) | (!is.na(sire) & id == sire)]
    if (length(self) > 0)
        stop(paste('Id recorded as its own parent:', paste(head(self, 6), collapse = ' ')))
}

# Warned rather than fatal: autosomal kinship never reads gender, so a contradiction here cannot move a coefficient.  An unknown
# gender is a gap rather than a contradiction, so only an explicitly male dam or female sire is reported.
reportParentSex <- function(species, id, dam, sire, gender)
{
    femaleSires <- unique(id[id %in% sire & !is.na(gender) & gender == 2])
    maleDams <- unique(id[id %in% dam & !is.na(gender) & gender == 1])

    if (length(femaleSires) > 0)
        warning(paste0(species, ': ', length(femaleSires), ' id(s) recorded female but used as a sire: ',
                       paste(head(femaleSires, 6), collapse = ' ')), immediate. = TRUE, call. = FALSE)

    if (length(maleDams) > 0)
        warning(paste0(species, ': ', length(maleDams), ' id(s) recorded male but used as a dam: ',
                       paste(head(maleDams, 6), collapse = ' ')), immediate. = TRUE, call. = FALSE)
}

# Appends a founder row for every parent that is referenced but has no row of its own, sires first then dams.  These animals reach
# the output like any other; a parent that is simply unknown is left unknown, which the recursion handles directly.
closePedigree <- function(id, dam, sire)
{
    absentSires <- unique(sire[!is.na(sire) & !(sire %in% id)])
    id <- c(id, absentSires)
    absentDams <- unique(dam[!is.na(dam) & !(dam %in% id)])
    id <- c(id, absentDams)

    added <- length(absentSires) + length(absentDams)
    list(id = id, dam = c(dam, rep(NA_character_, added)), sire = c(sire, rep(NA_character_, added)))
}

# Family label per animal: the smallest row index reachable through parent-child links.  Kinship between different families is
# exactly zero, so each can be computed and written on its own.
familyIds <- function(dadIdx, momIdx)
{
    n <- length(dadIdx)
    fam <- seq_len(n)
    hasDad <- dadIdx > 0L
    hasMom <- momIdx > 0L

    pullUp <- function(lab, has, idx)
    {
        if (!any(has))
            return(lab)
        up <- tapply(lab[has], idx[has], min)
        k <- as.integer(names(up))
        lab[k] <- pmin(lab[k], as.integer(up))
        lab
    }

    repeat
    {
        new <- fam
        new[hasDad] <- pmin(new[hasDad], new[dadIdx[hasDad]])
        new[hasMom] <- pmin(new[hasMom], new[momIdx[hasMom]])
        new <- pullUp(new, hasDad, dadIdx)
        new <- pullUp(new, hasMom, momIdx)
        if (identical(new, fam))
            break
        fam <- new
    }

    fam
}

# Generation of each animal: founders are 0, everyone else is one more than their deepest parent.  Stops if the links loop.
generationDepth <- function(dadIdx, momIdx)
{
    n <- length(dadIdx)
    depth <- integer(n)
    parents <- which(dadIdx == 0L & momIdx == 0L)

    for (i in seq_len(n))
    {
        child <- match(momIdx, parents, nomatch = 0L) + match(dadIdx, parents, nomatch = 0L)
        if (all(child == 0L))
            break
        if (i == n)
            stop('Impossible pedigree: an animal is its own ancestor')
        parents <- which(child > 0L)
        depth[parents] <- i
    }

    if (any(depth == 0L & (dadIdx > 0L | momIdx > 0L)))
        stop('Impossible pedigree: an animal is its own ancestor')

    depth
}

# Dense kinship matrix for one family.  Founders start at 0.5 on the diagonal; each generation's rows and then columns become the
# mean of its parents', and the diagonal becomes (1 + kinship of the parents) / 2.  An unknown parent contributes a zero row, and
# (x + 0) / 2 is the same double as x / 2, so that case is written directly.  Rows within a generation are independent, so they
# are updated in chunks to bound the temporaries.
kinshipDense <- function(dadIdx, momIdx, depth, chunk = CHUNK_ROWS)
{
    n <- length(dadIdx)
    if (n == 1L)
        return(matrix(0.5, 1L, 1L))

    kmat <- diag(0.5, n)

    for (gen in seq_len(max(depth)))
    {
        indx <- which(depth == gen)
        chunks <- split(indx, ceiling(seq_along(indx) / chunk))

        for (ch in chunks)
        {
            mm <- momIdx[ch]; dd <- dadIdx[ch]
            both <- mm != 0L & dd != 0L; mo <- mm != 0L & dd == 0L; do <- mm == 0L & dd != 0L
            if (any(both)) kmat[ch[both], ] <- (kmat[mm[both], , drop = FALSE] + kmat[dd[both], , drop = FALSE]) / 2
            if (any(mo))   kmat[ch[mo], ]   <-  kmat[mm[mo], , drop = FALSE] / 2
            if (any(do))   kmat[ch[do], ]   <-  kmat[dd[do], , drop = FALSE] / 2
        }
        for (ch in chunks)
        {
            mm <- momIdx[ch]; dd <- dadIdx[ch]
            both <- mm != 0L & dd != 0L; mo <- mm != 0L & dd == 0L; do <- mm == 0L & dd != 0L
            if (any(both)) kmat[, ch[both]] <- (kmat[, mm[both], drop = FALSE] + kmat[, dd[both], drop = FALSE]) / 2
            if (any(mo))   kmat[, ch[mo]]   <-  kmat[, mm[mo], drop = FALSE] / 2
            if (any(do))   kmat[, ch[do]]   <-  kmat[, dd[do], drop = FALSE] / 2
        }
        for (j in indx)
            kmat[j, j] <- if (momIdx[j] != 0L && dadIdx[j] != 0L) (1 + kmat[momIdx[j], dadIdx[j]]) / 2 else 0.5
    }

    kmat
}

# One direction of a set of pairs.  Kept separate so the frame and the character image write.table builds from it -- together the
# largest transient in the loop below -- are only as long as the pair count, rather than twice that.
writePairs <- function(a, b, x, con)
{
    write.table(data.frame(Id = a, Id2 = b, coefficient = x, stringsAsFactors = FALSE),
                file = con, row.names = FALSE, col.names = FALSE, quote = FALSE, sep = '\t')
}

# Emits both directions of every related pair in one family.  Walks the dense matrix in column blocks so the index and value
# transients stay bounded no matter how large the family is.
writeFamily <- function(kin, ids, con)
{
    n <- length(ids)
    blockCols <- max(1L, as.integer(BLOCK_BYTES %/% (8 * n)))
    written <- 0

    for (start in seq.int(1L, n, by = blockCols))
    {
        end <- min(start + blockCols - 1L, n)

        block <- kin[, start:end, drop = FALSE]
        mask <- block != 0

        # which() skips an NA in the mask but block[mask] returns an element for it, so a single NA would shift every value
        # against its ids from that point on and write wrong coefficients with no error.  anyNA() scans without allocating.
        if (anyNA(mask))
            stop('Kinship matrix contains NA')

        # which(arr.ind) and block[mask] both walk in column-major order, so these line up row for row
        nz <- which(mask, arr.ind = TRUE, useNames = FALSE)
        vals <- block[mask]
        rm(block, mask)

        if (nrow(nz) == 0)
        {
            rm(nz, vals)
            next
        }

        i <- nz[, 1L]
        j <- nz[, 2L] + (start - 1L)
        rm(nz)

        # Upper triangle only: the matrix is symmetric, so the mirror row is emitted below rather than stored.  This also drops
        # the diagonal, and the importer discards self-pairs anyway.
        sel <- i < j
        if (opts$minCoefficient >= 0)
            sel <- sel & vals > opts$minCoefficient

        i <- i[sel]
        j <- j[sel]
        x <- vals[sel]
        rm(vals, sel)

        if (length(i) > 0)
        {
            # Both directions are required: the importer never symmetrises and the ONPRC aggregates join on Id and Id2 separately
            writePairs(ids[i], ids[j], x, con)
            writePairs(ids[j], ids[i], x, con)
            written <- written + 2 * length(i)
        }

        rm(i, j, x)
    }

    written
}

# Kept in its own frame so the dense matrix is released before the next family allocates its own
processFamily <- function(id, dam, sire, idx, con)
{
    ids <- id[idx]
    dadIdx <- parentIndex(ids, sire[idx])
    momIdx <- parentIndex(ids, dam[idx])

    kin <- kinshipDense(dadIdx, momIdx, generationDepth(dadIdx, momIdx))
    writeFamily(kin, ids, con)
}

main <- function()
{
    # Gender is reported on when it contradicts a parent role; the kinship recursion itself never reads it
    allPed <- read.table(opts$inputFile, quote="\"")
    colnames(allPed)<-c('Id', 'Dam', 'Sire', 'Gender', 'Species')

    allPed$Id <- as.character(allPed$Id)
    allPed$Dam <- as.character(allPed$Dam)
    allPed$Sire <- as.character(allPed$Sire)
    allPed$Id[allPed$Id == ""] <- NA
    allPed$Dam[allPed$Dam == ""] <- NA
    allPed$Sire[allPed$Sire == ""] <- NA

    allPed$Species <- as.character(allPed$Species)
    allPed$Species[is.na(allPed$Species)] <- c('Unknown')
    allPed$Species <- as.factor(allPed$Species)

    if (any(allPed$Species == 'Unknown')) {
        print(paste0('There are ', sum(allPed$Species == 'Unknown'), ' Ids with species = Unknown'))
    }

    if (file.exists(TEMP_FILE))
        unlink(TEMP_FILE)

    con <- file(TEMP_FILE, open = 'wt')
    complete <- FALSE
    # Discards the partial file left by a failure.  Once every row is written the file is the whole result of the run, so it is
    # kept even if the rename below fails.
    on.exit({ if (!is.null(con)) close(con); if (!complete) unlink(TEMP_FILE) }, add = TRUE)

    # The header is retained because the importer detects it by testing whether the third field equals "coefficient"
    writeLines(paste('Id', 'Id2', 'coefficient', sep = '\t'), con)

    totalRows <- 0
    totalFamilies <- 0
	allPed$FamilyId <- NA
    for (species in unique(allPed$Species)){
        allRecordsForSpecies <- allPed[allPed$Species %in% species,]
        print(paste0('Processing species: ', species, ', with ', nrow(allRecordsForSpecies), ' IDs'))
        if (nrow(allRecordsForSpecies) == 1) {
            print('single record, skipping')
            next
        }

        validatePedigree(allRecordsForSpecies$Id, allRecordsForSpecies$Dam, allRecordsForSpecies$Sire)
        with(allRecordsForSpecies, reportParentSex(species, Id, Dam, Sire, Gender))
        ped <- with(allRecordsForSpecies, closePedigree(Id, Dam, Sire))
        rm(allRecordsForSpecies)

        dadIdx <- parentIndex(ped$id, ped$sire)
        momIdx <- parentIndex(ped$id, ped$dam)
        fam <- familyIds(dadIdx, momIdx)
        sizes <- tabulate(fam)
        famIds <- which(sizes >= 2) # a family of one has nothing but a self-pair to emit
        print(paste0('  ', length(famIds), ' families, largest ', max(c(0, sizes[famIds]))))

        speciesRows <- 0
        for (f in famIds)
        {
            idx <- which(fam == f)
			allPed$FamilyId[allPed$Id %in% ped$id[idx]] <- paste0(species, '-', f)
            totalFamilies <- totalFamilies + 1
            speciesRows <- speciesRows + processFamily(ped$id, ped$dam, ped$sire, idx, con)

            # Only worth forcing for families whose matrix is large enough to be worth returning to the OS;
            # a species can have hundreds of tiny families and R collects those on its own
            if (length(idx) > 1000)
                gc(verbose = FALSE)
        }

        print(paste0('  wrote ', speciesRows, ' rows'))
        totalRows <- totalRows + speciesRows
        rm(ped, dadIdx, momIdx, fam)
    }

    if (totalRows == 0)
    {
        # Families were found but produced nothing, so something is wrong upstream of the write.  Stopping leaves the previous
        # kinship.txt in place, which matters because the import deletes every existing row before reading the file.
        if (totalFamilies > 0)
            stop(paste0('Found ', totalFamilies, ' related families but produced no kinship records, so the output was not written.'))

        # No parent-child links anywhere in the pedigree.  That is a legitimate state -- demo containers, newly provisioned sites
        # and colonies loaded without parentage all reach it -- and the previous version of this script succeeded there because the
        # matrix diagonal padded the file past the importer's three-line minimum.  Emit that same diagonal so those sites keep
        # working: the importer discards self-pairs, so this correctly clears ehr.kinship instead of failing the nightly job.
        # With no relationships every animal is non-inbred, so its self-kinship is exactly 0.5.
        print('No parent-child relationships found in the pedigree; writing self-pairs only, which the import discards')
        selfIds <- unique(allPed$Id[!is.na(allPed$Id)])
        writePairs(selfIds, selfIds, rep(0.5, length(selfIds)), con)
        totalRows <- length(selfIds)
    }

    close(con)
    con <- NULL
    complete <- TRUE

    print(paste0('Total kinship records: ', totalRows))

    # Rename only once the file is known to be complete.  The importer deletes every existing row before reading it and only checks
    # that it has three lines, so a partial file would silently replace good data with partial data.  The old file is removed first
    # because file.rename does not reliably replace an existing destination on Windows; a crash in that window leaves no file at all,
    # which the importer already reports as an error, rather than a truncated one, which it does not.
    if (file.exists(OUTPUT_FILE))
        unlink(OUTPUT_FILE)
    if (!file.rename(TEMP_FILE, OUTPUT_FILE))
        stop(paste0('Unable to rename ', TEMP_FILE, ' to ', OUTPUT_FILE, '.  The completed output is in ', TEMP_FILE, '.'))

    # Save the family IDs, primarily for debugging.  Warned rather than fatal: kinship.txt is already in place, and a non-zero exit
    # here would fail the pipeline and skip the import of a good file.
    tryCatch({
        if (file.exists(FAMILY_OUTPUT))
            unlink(FAMILY_OUTPUT)
        write.table(allPed[c('Id', 'FamilyId')], sep = '\t', quote = FALSE, row.names = FALSE, file = FAMILY_OUTPUT)
    }, error = function(e) warning(paste0('Unable to write ', FAMILY_OUTPUT, ': ', conditionMessage(e)),
                                   immediate. = TRUE, call. = FALSE))
}

main()