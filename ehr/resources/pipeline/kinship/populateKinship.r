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
    'inputFile', '-f', 1, 'character'
), ncol=4, byrow=TRUE)
opts <- getopt(spec, commandArgs(trailingOnly = TRUE))

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

newRecords <- NULL
for (species in unique(allPed$Species)){
    allRecordsForSpecies <- allPed[allPed$Species %in% species,]
    print(paste0('Processing species: ', species, ', with ', nrow(allRecordsForSpecies), ' IDs'))
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
}

# write TSV to disk
write.table(newRecords, file = "kinship.txt", append = FALSE, row.names = FALSE, quote = FALSE, sep = '\t')