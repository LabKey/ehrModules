##
#  Copyright (c) 2013-2019 LabKey Corporation
#
#  Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
##

# This R script will calculate and store kinship coefficients (aka. relatedness) for all animals in the colony.  This is a large, sparse matrix.
# The matrix is converted into a very long 3-column dataframe (animal1, animal2, coefficient).  This dataframe is output to a TSV file,
# which is normally imported into ehr.kinship by java code in GeneticCalculationsImportTask


#options(echo=TRUE);
options(error = dump.frames);
library(methods);
library(kinship2);
library(getopt);
library(Matrix);
library(dplyr);

spec <- matrix(c(
#'containerPath', '-c', 1, "character",
#'baseUrl', '-b', 1, "character"
'inputFile', '-f', 1, "character"
), ncol=4, byrow=TRUE);
opts = getopt(spec, commandArgs(trailingOnly = TRUE));

allPed <- read.table(opts$inputFile, quote="\"");
colnames(allPed)<-c('Id', 'Dam', 'Sire', 'Gender', 'Species');

is.na(allPed$Id)<-which(allPed$Id=="")
is.na(allPed$Dam)<-which(allPed$Dam=="")
is.na(allPed$Sire)<-which(allPed$Sire=="")
is.na(allPed$Gender)<-which(allPed$Gender=="")

allPed$Species <- as.character(allPed$Species)
allPed$Species[is.na(allPed$Species)] <- c('Unknown')
allPed$Species <- as.factor(allPed$Species)

# In order to reduce the max matrix size, calculate famids using makefamid, then analyze each group separately
# It resizes the biggest matrix from 12000^2 to 8200^2 thus reduces the memory used by half
newRecords=NULL
for (species in unique(allPed$Species)){
    print(paste0('processing species: ', species))
    allRecordsForSpecies <- allPed[allPed$Species == species,]

    # Add missing parents for accurate kinship calculations
    fixedRecords <- with(allRecordsForSpecies, fixParents(id = Id, dadid = Sire, momid = Dam, sex = Gender))

    # Kinship is expecting records to be sorted IAW it's own pedigree function
    recordsForSpecies <- with(fixedRecords, pedigree(id=id,dadid=dadid,momid=momid,sex=sex,missid=0))

    temp.kin=kinship(recordsForSpecies)

    # Add rownames to make matrix symmetric, which is required downstream
    rownames(temp.kin) <- colnames(temp.kin)

    # Convert kinship matrix to a triplet list of two ids and their coefficient
    summaryDf = as.data.frame(summary(as(temp.kin, "dgCMatrix")))
    idList <- rownames(temp.kin)
    temp.tri = data.frame(Id=idList[summaryDf$i], Id2=idList[summaryDf$j], coefficient=summaryDf$x)

    # Now filter out parents added for kinship calculation
    temp.tri <- dplyr::filter(temp.tri, grepl("^(?!addin).*$", Id, perl = TRUE))
    temp.tri <- dplyr::filter(temp.tri, grepl("^(?!addin).*$", Id2, perl = TRUE))

    newRecords=rbind(newRecords,temp.tri)
    print(paste0('total subjects: ', nrow(allRecordsForSpecies)))
}

# write TSV to disk
print("Output table:");
print(str(newRecords));
write.table(newRecords, file = "kinship.txt", append = FALSE,row.names=F,quote=F,sep="\t");