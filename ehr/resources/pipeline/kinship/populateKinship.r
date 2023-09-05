##
#  Copyright (c) 2013-2019 LabKey Corporation
#
#  Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
##

# This R script will calculate and store kinship coefficients (aka. relatedness) for all animals in the colony.  This is a large, sparse matrix.
# The matrix is converted into a very long 3-column dataframe (animal1, animal2, coefficient).  This dataframe is output to a TSV file,
# which is normally imported into ehr.kinship by java code in GeneticCalculationsImportTask
library(kinship2)
library(getopt)
library(Matrix)
library(dplyr)

spec <- matrix(c(
    'inputFile', '-f', 1, 'character',
    'mergeSpeciesWithHybrids', '-m', 0, 'logical',
    'performKinshipValidation', '-v', 0, 'logical'
), ncol=4, byrow=TRUE)
opts <- getopt(spec, commandArgs(trailingOnly = TRUE))

if (is.null(opts$mergeSpeciesWithHybrids)){
    opts$mergeSpeciesWithHybrids <- FALSE
}

if (is.null(opts$performKinshipValidation)){
    opts$performKinshipValidation <- FALSE
}

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

# The purpose of this function is to handle instances where there was cross-breeding.
# While this is probably rare, it can occur. When this happens, simply merge the entire species together and process as one unit.
# This ensures that all relevant ancestors from both species are present
generateSpeciesToProcess <- function(allPed, mergeSpeciesWithHybrids) {
    hybridParents <- dplyr::bind_rows(
      merge(allPed, allPed, by.x = 'Dam', by.y = 'Id') %>% filter(Species.x != Species.y) %>% select(Id, Dam, Species.x, Species.y) %>% rename(Parent = Dam) %>% mutate(ParentType = 'Dam'),
      merge(allPed, allPed, by.x = 'Sire', by.y = 'Id') %>% filter(Species.x != Species.y) %>% select(Id, Sire, Species.x, Species.y) %>% rename(Parent = Sire) %>% mutate(ParentType = 'Sire')
    )

    if (nrow(hybridParents) > 0) {
        print(paste0('There were ', nrow(hybridParents), ' records with parents of a different species'))
    }

    if (mergeSpeciesWithHybrids && nrow(hybridParents) > 0) {
        speciesGroups <- as.list(as.character(unique(allPed$Species)))
        toMerge <- unique(hybridParents[c('Species.x', 'Species.y')])
        for (idx in 1:nrow(toMerge)){
            speciesToCollapse <- as.character(unlist(toMerge[idx,,drop = TRUE]))
            matchingIdx <- sapply(speciesGroups, function(x){
                return(length(intersect(speciesToCollapse, x)) > 0)
            })

            speciesToCollapse <- sort(unique(c(speciesToCollapse, unlist(speciesGroups[matchingIdx]))))
            speciesGroups <- speciesGroups[!matchingIdx]
            speciesGroups <- append(speciesGroups, list(speciesToCollapse))
        }

        print('These species will be merged for processing:')
        invisible(lapply(speciesGroups, function(x){
            if (length(x) > 1) {
                print(x)
            }
        }))

        return(speciesGroups)
    } else {
        return(unique(allPed$Species[allPed$Species != 'Unknown']))
    }
}

validateExpectedKinshipSubset <- function(dataToTest, expectedValues, errorRows, testReciprocal = TRUE) {
    # Generate the reciprocal of relationships as well:
    if (testReciprocal) {
        ret2 <- data.frame(Id = expectedValues$Id2, Id2 = expectedValues$Id, Relationship = expectedValues$Relationship, ExpectedCoefficient = expectedValues$ExpectedCoefficient)
        ret2$Relationship <- sapply(expectedValues$Relationship, function(x){
            x <- unlist(strsplit(x, split = '/'))
            if (length(x) == 1) {
                return(x)
            }

            return(paste0(x[2], '/', x[1]))
        })
        expectedValues <- dplyr::bind_rows(expectedValues, ret2)
        rm(ret2)
    }

    dat <- merge(dataToTest, expectedValues, by = c('Id', 'Id2'), all.x = T, all.y = T) %>%
      filter(!is.na(ExpectedCoefficient)) %>%
      filter(is.na(coefficient) | coefficient < ExpectedCoefficient)

    if (nrow(dat) == 0) {
        return(errorRows)
    }

    if (all(is.null(errorRows))) {
        return(dat)
    }

    return(dplyr::bind_rows(errorRows, dat))
}

validateExpectedKinship <- function(pedDf, dataToTest) {
    errorRows <- NULL

    # See reference: https://en.wikipedia.org/wiki/Coefficient_of_relationship#Kinship_coefficient
    self <- data.frame(Id = pedDf$Id, Id2 = pedDf$Id, Relationship = 'Self', ExpectedCoefficient = 0.5)
    errorRows <- validateExpectedKinshipSubset(dataToTest, self, errorRows, testReciprocal = FALSE)
    rm(self)

    parentChild <- dplyr::bind_rows(
      data.frame(Id = pedDf$Id, Id2 = pedDf$Dam, Relationship = 'Child/Parent'),
      data.frame(Id = pedDf$Id, Id2 = pedDf$Sire, Relationship = 'Child/Parent')
    ) %>% filter(!is.na(Id2)) %>% mutate(ExpectedCoefficient = 0.25)
    errorRows <- validateExpectedKinshipSubset(dataToTest, parentChild, errorRows)
    rm(parentChild)

    grandParentOffspring1 <- merge(pedDf[!is.na(pedDf$Dam),], pedDf, by.x = c('Dam'), by.y = c('Id'), all.x = F, all.y = F)
    grandParentOffspring1 <- dplyr::bind_rows(
      grandParentOffspring1 %>% select(Id, Dam.y) %>% filter(!is.na(Dam.y)) %>% rename(Id2 = Dam.y) %>% mutate(Relationship = 'Grandchild/Maternal Granddam'),
      grandParentOffspring1 %>% select(Id, Sire.y) %>% filter(!is.na(Sire.y)) %>% rename(Id2 = Sire.y) %>% mutate(Relationship = 'Grandchild/Maternal Grandsire')
    ) %>% mutate(ExpectedCoefficient = 0.125)
    errorRows <- validateExpectedKinshipSubset(dataToTest, grandParentOffspring1, errorRows)
    rm(grandParentOffspring1)

    grandParentOffspring2 <- merge(pedDf[!is.na(pedDf$Sire),], pedDf, by.x = c('Sire'), by.y = c('Id'), all.x = F, all.y = F)
    grandParentOffspring2 <- dplyr::bind_rows(
      grandParentOffspring2 %>% select(Id, Dam.y) %>% filter(!is.na(Dam.y)) %>% rename(Id2 = Dam.y) %>% mutate(Relationship = 'Grandchild/Paternal Granddam'),
      grandParentOffspring2 %>% select(Id, Sire.y) %>% filter(!is.na(Sire.y)) %>% rename(Id2 = Sire.y) %>% mutate(Relationship = 'Grandchild/Paternal Grandsire')
    ) %>% mutate(ExpectedCoefficient = 0.125)
    errorRows <- validateExpectedKinshipSubset(dataToTest, grandParentOffspring2, errorRows)
    rm(grandParentOffspring2)

    fullSibs <- merge(pedDf[!is.na(pedDf$Dam) & !is.na(pedDf$Sire),], pedDf[!is.na(pedDf$Dam) & !is.na(pedDf$Sire),], by = c('Sire', 'Dam'), all.x = F, all.y = F) %>%
      select(Id.x, Id.y) %>%
      rename(Id = Id.x, Id2 = Id.y) %>%
      filter(Id != Id2) %>%
      mutate(Relationship = 'Full sib', ExpectedCoefficient = 0.25)
    errorRows <- validateExpectedKinshipSubset(dataToTest, fullSibs, errorRows)
    rm(fullSibs)

    halfSibs1 <- merge(pedDf[!is.na(pedDf$Dam),], pedDf[!is.na(pedDf$Dam),], by = c('Dam'), all.x = F, all.y = F) %>%
      filter(Sire.x != Sire.y) %>%
      select(Id.x, Id.y) %>%
      rename(Id = Id.x, Id2 = Id.y) %>%
      filter(Id != Id2) %>%
      mutate(Relationship = 'Half sib', ExpectedCoefficient = 0.125)
    errorRows <- validateExpectedKinshipSubset(dataToTest, halfSibs1, errorRows)
    rm(halfSibs1)

    halfSibs2 <- merge(pedDf[!is.na(pedDf$Sire),], pedDf[!is.na(pedDf$Sire),], by = c('Sire'), all.x = F, all.y = F) %>%
      filter(Dam.x != Dam.y) %>%
      select(Id.x, Id.y) %>%
      rename(Id = Id.x, Id2 = Id.y) %>%
      filter(Id != Id2) %>%
      mutate(Relationship = 'Half sib', ExpectedCoefficient = 0.125)
    errorRows <- validateExpectedKinshipSubset(dataToTest, halfSibs2, errorRows)
    rm(halfSibs2)

    return(errorRows)
}

speciesToProcess <- generateSpeciesToProcess(allPed, opts$mergeSpeciesWithHybrids)

newRecords <- NULL
for (speciesSet in speciesToProcess){
    allRecordsForSpecies <- allPed[allPed$Species %in% speciesSet,]
    print(paste0('Processing species set: ', paste0(speciesSet, collapse = ','), ', with ', nrow(allRecordsForSpecies), ' IDs'))
    if (nrow(allRecordsForSpecies) == 1) {
        print('single record, skipping')
        newRecords <- dplyr::bind_rows(newRecords,data.frame(Id = allRecordsForSpecies$Id, Id2 = allRecordsForSpecies$Id, coefficient = 0.5, Species = allRecordsForSpecies$Species))
        next
    }

    pctMissingSex <- sum(allRecordsForSpecies$Gender > 2) / nrow(allRecordsForSpecies)
    if (pctMissingSex > 0.25) {
        paste0('More than 25% of this species group are missing sex and cannot be processed by fixParents(), skipping')
        newRecords <- dplyr::bind_rows(newRecords,data.frame(Id = allRecordsForSpecies$Id, Id2 = allRecordsForSpecies$Id, coefficient = 0.5, Species = allRecordsForSpecies$Species))
        next
    }

    # Add missing parents for accurate kinship calculations
    fixedRecords <- with(allRecordsForSpecies, fixParents(id = Id, dadid = Sire, momid = Dam, sex = Gender))

    # Kinship is expecting records to be sorted IAW it's own pedigree function
    recordsForSpecies <- with(fixedRecords, pedigree(id = id, dadid = dadid, momid = momid, sex = sex, missid = 0))

    temp.kin <- kinship(recordsForSpecies)

    # Add rownames to make matrix symmetric, which is required downstream
    rownames(temp.kin) <- colnames(temp.kin)

    # Convert kinship matrix to a triplet list of two ids and their coefficient
    summaryDf <- as.data.frame(summary(as(temp.kin, "dgCMatrix")))
    idList <- rownames(temp.kin)
    temp.tri <- data.frame(Id=idList[summaryDf$i], Id2=idList[summaryDf$j], coefficient=summaryDf$x)

    # Now filter out parents added for kinship calculation
    temp.tri <- dplyr::filter(temp.tri, grepl("^(?!addin).*$", Id, perl = TRUE))
    temp.tri <- dplyr::filter(temp.tri, grepl("^(?!addin).*$", Id2, perl = TRUE))
    temp.tri <- merge(temp.tri, allRecordsForSpecies[c('Id', 'Species')], by = 'Id', all.x = TRUE)

    newRecords <- dplyr::bind_rows(newRecords,temp.tri)

    # NOTE: perform per-species to save memory
    if (opts$performKinshipValidation) {
        print('Validating coefficients against expected values')
        errorRows <- validateExpectedKinship(allRecordsForSpecies, temp.tri)
        if (!all(is.null(errorRows))) {
            fileName <- paste0('kinshipErrors_', paste0(speciesSet, collapse = '.'), '.txt')
            print(paste0('There were unexpected kinship values! See the file ', fileName, ' for more information'))
            write.table(newRecords, file = fileName, row.names = FALSE, quote = FALSE, sep = '\t')
        } else {
            print('All coefficients were within expected ranges from predicted values')
        }
    }
}

# write TSV to disk
write.table(newRecords, file = "kinship.txt", append = FALSE, row.names = FALSE, quote = FALSE, sep = '\t')