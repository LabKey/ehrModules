##
#  Copyright (c) 2013-2019 LabKey Corporation
#
#  Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
##

# This R script will calculate and store kinship coefficients (aka. relatedness) for all animals in the colony.  This is a large, sparse matrix.
# The matrix is converted into a very long 3-column dataframe (animal1, animal2, coefficient).  This dataframe is output to a TSV file,
# which is normally imported into ehr.kinship by java code in GeneticCalculationsImportTask
options(error = dump.frames)
library(kinship2)
library(getopt)
library(Matrix)
library(dplyr)

spec <- matrix(c(
    'inputFile', '-f', 1, "character"
), ncol=4, byrow=TRUE)
opts <- getopt(spec, commandArgs(trailingOnly = TRUE))

allPed <- read.table(opts$inputFile, quote="\"")
colnames(allPed)<-c('Id', 'Dam', 'Sire', 'Gender', 'Species')

allPed$Id[allPed$Id == ""] <- NA
allPed$Id[allPed$Dam == ""] <- NA
allPed$Id[allPed$Sire == ""] <- NA
allPed$Id[allPed$Gender == ""] <- NA

allPed$Species <- as.character(allPed$Species)
allPed$Species[is.na(allPed$Species)] <- c('Unknown')
allPed$Species <- as.factor(allPed$Species)

# In order to reduce the max matrix size, calculate famids using makefamid, then analyze each group separately
# It resizes the biggest matrix from 12000^2 to 8200^2 thus reduces the memory used by half
newRecords <- NULL
for (species in unique(allPed$Species)){
    allRecordsForSpecies <- allPed[allPed$Species == species,]
    print(paste0('Processing species: ', species, ', with ', nrow(allRecordsForSpecies), ' IDs'))

    # Add missing parents for accurate kinship calculations
    fixedRecords <- with(allRecordsForSpecies, fixParents(id = Id, dadid = Sire, momid = Dam, sex = Gender))

    # Kinship is expecting records to be sorted IAW it's own pedigree function
    recordsForSpecies <- with(fixedRecords, pedigree(id=id,dadid=dadid,momid=momid,sex=sex,missid=0))

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

    newRecords <- rbind(newRecords,temp.tri)
    print(paste0('Total subjects: ', nrow(allRecordsForSpecies)))
}

generateExpectedKinship <- function(pedDf) {
    parentChild <- rbind(
      data.frame(Id = pedDf$Id, Id2 = pedDf$Dam, Species = pedDf$Species, Relationship = 'Child/Parent'),
      data.frame(Id = pedDf$Id, Id2 = pedDf$Sire, Species = pedDf$Species, Relationship = 'Child/Parent')
    ) %>% filter(!is.na(Id2)) %>% mutate(ExpectedCoefficient = 0.5)

    grandParentOffspring1 <- merge(pedDf[!is.na(pedDf$Dam),], pedDf, by.x = c('Dam', 'Species'), by.y = c('Id', 'Species'), all.x = F, all.y = F)
    grandParentOffspring1 <- rbind(
      grandParentOffspring1 %>% select(Id, Dam.y, Species) %>% filter(!is.na(Dam.y)) %>% rename(Id2 = Dam.y) %>% mutate(Relationship = 'Grandchild/Maternal Granddam'),
      grandParentOffspring1 %>% select(Id, Sire.y, Species) %>% filter(!is.na(Sire.y)) %>% rename(Id2 = Sire.y) %>% mutate(Relationship = 'Grandchild/Maternal Grandsire')
    ) %>% mutate(ExpectedCoefficient = 0.25)

    grandParentOffspring2 <- merge(pedDf[!is.na(pedDf$Sire),], pedDf, by.x = c('Sire', 'Species'), by.y = c('Id', 'Species'), all.x = F, all.y = F)
    grandParentOffspring2 <- rbind(
      grandParentOffspring2 %>% select(Id, Dam.y, Species) %>% filter(!is.na(Dam.y)) %>% rename(Id2 = Dam.y) %>% mutate(Relationship = 'Grandchild/Paternal Granddam'),
      grandParentOffspring2 %>% select(Id, Sire.y, Species) %>% filter(!is.na(Sire.y)) %>% rename(Id2 = Sire.y) %>% mutate(Relationship = 'Grandchild/Paternal Grandsire')
    ) %>% mutate(ExpectedCoefficient = 0.25)

    fullSibs <- merge(pedDf[!is.na(pedDf$Dam) & !is.na(pedDf$Sire),], pedDf[!is.na(pedDf$Dam) & !is.na(pedDf$Sire),], by = c('Sire', 'Dam', 'Species'), all.x = F, all.y = F) %>%
      select(Id.x, Id.y, Species) %>%
      rename(Id = Id.x, Id2 = Id.y) %>%
      mutate(Relationship = 'Full sib', ExpectedCoefficient = 0.25)

    ret <- rbind(
      parentChild,
      grandParentOffspring1,
      grandParentOffspring2,
      fullSibs
    )

    # Generate the reciprocal of relationships as well:
    ret2 <- data.frame(Id = ret$Id2, Id2 = ret$Id, Species = ret$Species, Relationship = ret$Relationship, ExpectedCoefficient = ret$ExpectedCoefficient)
    ret2$Relationship <- sapply(ret2$Relationship, function(x){
        x <- unlist(strsplit(x, split = '/'))
        if (length(x) == 1) {
            return(x)
        }

        return(paste0(x[2], '/', x[1]))
    })

    return(rbind(ret, ret2))
}

# Basic validation:
toValidate <- merge(newRecords, generateExpectedKinship(pedDf), by = c('Id', 'Id2', 'Species'), all.x = T, all.y = T) %>%
    filter(!is.na(ExpectedCoefficient)) %>%
    mutate(MinCoefficient = ExpectedCoefficient / 2) %>%
    filter(is.na(coefficient) | coefficient < MinCoefficient)

if (nrow(toValidate) > 0) {
    print(paste0('There were unexpected kinship values! See the file kinshipErrors.txt for more information'))
    write.table(newRecords, file = "kinshipErrors.txt", append = FALSE, row.names=F, quote=F, sep='\t')
}

# write TSV to disk
print("Output table:")
print(str(newRecords))
write.table(newRecords, file = "kinship.txt", append = FALSE, row.names = FALSE, quote = FALSE, sep='\t')