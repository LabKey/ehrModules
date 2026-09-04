##
#  Copyright (c) 2012-2026 LabKey Corporation
#
#  Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
##

# This R script will calculate and store kinship coefficients (aka. relatedness) for all animals in the colony.  This is a large, sparse matrix.
# The matrix is written out as a very long 3-column TSV file (animal1, animal2, coefficient), which is normally imported into
# ehr.kinship by java code in GeneticCalculationsImportTask.
#
# This runs as a child of the web server, so its peak is charged against the same memory budget as the JVM.  The saving comes from
# streaming: rows are appended to disk as each matrix is produced, rather than accumulated into one data frame for the whole colony
# and sorted at the end.
#
# The pedigree is also split into unrelated families, but that is worth little by itself.  In a managed breeding colony almost every
# animal descends from a shared founder set, so the largest family is most of the species; at the three colonies measured it was 76%,
# 98% and 100% of the largest species.  The split is kept because it is what allows each matrix to be written and released before the
# next is allocated, not because it meaningfully lowers the largest allocation.
library(kinship2)
library(getopt)

# Minimum coefficient to emit; 0 disables the filter.  Enabling this silently lowers colony-wide kinship averages, because those
# queries divide by an independent population count rather than by the rows present.  The useful range is 2^-5 to 2^-6.
MIN_COEFFICIENT <- 0

# Size of the column slab copied out of the dense matrix at a time.  This is not the peak added by the streaming loop: the index
# vector, the value vector and the frame handed to write.table are all derived from the slab, so a slab whose cells are mostly
# nonzero costs roughly four times this figure while it is being written.  Halve it if a site needs the transients smaller.
BLOCK_BYTES <- 64e6

OUTPUT_FILE <- 'kinship.txt'
TEMP_FILE <- 'kinship.txt.part'

spec <- matrix(c(
    'inputFile', '-f', 1, 'character'
), ncol=4, byrow=TRUE)
opts <- getopt(spec, commandArgs(trailingOnly = TRUE))

# One direction of a set of pairs.  Kept separate so the frame and the character image write.table builds from it -- together the
# largest transient in the loop below -- are only as long as the pair count, rather than twice that.
writePairs <- function(a, b, x, con)
{
    write.table(data.frame(Id = a, Id2 = b, coefficient = x, stringsAsFactors = FALSE),
                file = con, row.names = FALSE, col.names = FALSE, quote = FALSE, sep = '\t')
}

# Emits both directions of every related pair in one family.  Walks the dense matrix in column blocks so the index and value
# transients stay bounded no matter how large the family is.
writeFamily <- function(kin, con)
{
    ids <- colnames(kin)
    if (is.null(ids))
        stop('Kinship matrix has no column names')

    n <- length(ids)

    # Equivalent to the previous "^(?!addin).*$" filter, but over the ids rather than over every emitted row
    keep <- !startsWith(ids, 'addin')

    blockCols <- max(1L, as.integer(BLOCK_BYTES %/% (8 * n)))
    written <- 0

    for (start in seq.int(1L, n, by = blockCols))
    {
        end <- min(start + blockCols - 1L, n)

        block <- kin[, start:end, drop = FALSE]
        mask <- block != 0

        # which() skips an NA in the mask but block[mask] returns an element for it, so a single NA would shift every value
        # against its ids from that point on and write wrong coefficients with no error.  kinship() should never produce one;
        # this turns the case into a visible failure rather than silent corruption.  anyNA() scans without allocating.
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
        sel <- i < j & keep[i] & keep[j]
        if (MIN_COEFFICIENT > 0)
            sel <- sel & vals >= MIN_COEFFICIENT

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
processFamily <- function(fixed, idx, con)
{
    sub <- fixed[idx, ]
    ped <- with(sub, pedigree(id = id, dadid = dadid, momid = momid, sex = sex, missid = 0))
    kin <- kinship(ped)
    rm(sub, ped)

    writeFamily(kin, con)
}

main <- function()
{
    allPed <- read.table(opts$inputFile, quote="\"")
    colnames(allPed)<-c('Id', 'Dam', 'Sire', 'Gender', 'Species')

    allPed$Id[allPed$Id == ""] <- NA
    allPed$Dam[allPed$Dam == ""] <- NA
    allPed$Sire[allPed$Sire == ""] <- NA
    allPed$Gender[allPed$Gender == "" | is.na(allPed$Gender)] <- 3 # 3 = unknown

    allPed$Species <- as.character(allPed$Species)
    allPed$Species[is.na(allPed$Species)] <- c('Unknown')
    allPed$Species <- as.factor(allPed$Species)

    if (any(allPed$Species == 'Unknown')) {
        print(paste0('There are ', sum(allPed$Species == 'Unknown'), ' Ids with species = Unknown'))
    }

    if (file.exists(TEMP_FILE))
        unlink(TEMP_FILE)

    con <- file(TEMP_FILE, open = 'wt')
    on.exit(if (!is.null(con)) close(con), add = TRUE)

    # The header is retained because the importer detects it by testing whether the third field equals "coefficient"
    writeLines(paste('Id', 'Id2', 'coefficient', sep = '\t'), con)

    totalRows <- 0
    totalFamilies <- 0
    for (species in unique(allPed$Species)){
        allRecordsForSpecies <- allPed[allPed$Species %in% species,]
        print(paste0('Processing species: ', species, ', with ', nrow(allRecordsForSpecies), ' IDs'))
        if (nrow(allRecordsForSpecies) == 1) {
            print('single record, skipping')
            next
        }

        # Add missing parents for accurate kinship calculations
        fixed <- with(allRecordsForSpecies, fixParents(id = Id, dadid = Sire, momid = Dam, sex = Gender))
        rm(allRecordsForSpecies)

        # Split into unrelated families.  Kinship across families is zero and was never emitted, so the output is unchanged.
        fam <- makefamid(fixed$id, fixed$dadid, fixed$momid)
        famIds <- unique(fam[fam != 0]) # 0 means no relatives, so there is nothing but a self-pair to emit
        print(paste0('  ', length(famIds), ' families, largest ', max(c(0, tabulate(fam[fam != 0])))))

        speciesRows <- 0
        for (f in famIds)
        {
            idx <- which(fam == f)
            if (length(idx) < 2)
                next

            totalFamilies <- totalFamilies + 1
            speciesRows <- speciesRows + processFamily(fixed, idx, con)

            # Only worth forcing for families whose matrix is large enough to be worth returning to the OS;
            # a species can have hundreds of tiny families and R collects those on its own
            if (length(idx) > 1000)
                gc(verbose = FALSE)
        }

        print(paste0('  wrote ', speciesRows, ' rows'))
        totalRows <- totalRows + speciesRows
        rm(fixed, fam)
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

    print(paste0('Total kinship records: ', totalRows))

    # Rename only once the file is known to be complete.  The importer deletes every existing row before reading it and only checks
    # that it has three lines, so a partial file would silently replace good data with partial data.  The old file is removed first
    # because file.rename does not reliably replace an existing destination on Windows; a crash in that window leaves no file at all,
    # which the importer already reports as an error, rather than a truncated one, which it does not.
    if (file.exists(OUTPUT_FILE))
        unlink(OUTPUT_FILE)
    if (!file.rename(TEMP_FILE, OUTPUT_FILE))
        stop(paste0('Unable to rename ', TEMP_FILE, ' to ', OUTPUT_FILE))
}

main()
