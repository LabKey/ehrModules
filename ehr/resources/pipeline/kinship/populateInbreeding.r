##
#  Copyright (c) 2013-2019 LabKey Corporation
#
#  Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
##

# This R script will calculate and store inbreeding coefficients for all animals in the colony.  This data will be compared against
# the information currently stored in the DB and the minimal number of inserts/updates/deletes are then performed.  This script is designed
# to run as a daily cron job.
library(pedigree)
library(getopt)
library(Matrix)
library(dplyr)

spec <- matrix(c(
  'inputFile', '-f', 1, 'character'
), ncol=4, byrow=TRUE)
opts <- getopt(spec, commandArgs(trailingOnly = TRUE))

allPed <- read.table(opts$inputFile)
colnames(allPed)<-c('Id', 'Dam', 'Sire', 'Gender')

allPed$Id[allPed$Id == ""] <- NA
allPed$Dam[allPed$Dam == ""] <- NA
allPed$Sire[allPed$Sire == ""] <- NA
allPed$Gender[allPed$Gender == ""] <- NA

df <- data.frame(id=as.character(allPed$Id), 'id parent1'=allPed$Dam, 'id parent2'=allPed$Sire, stringsAsFactors=FALSE)
originalIds <- df$id
print(paste0('Input IDs: ', nrow(df)))

#this is a function in the pedigree package designed to add missing parents to the dataframe
#see pedigree package documentation for more detail
df <- add.Inds(df)
ord <- orderPed(df)
df <- df[order(ord),]

#use an existing package to calculate inbreeding
ib <- calcInbreeding(df)

#only calculate inbreeding for Ids at the center
newRecords <- data.frame(Id=as.character(df$id), coefficient=ib, stringsAsFactors=FALSE) %>%
  dplyr::filter(Id %in% originalIds)

if (nrow(newRecords) != length(originalIds)) {
  stop(paste0('Output dataframe and input IDs not the same length! Expected: ', length(originalIds), ', was: ', nrow(newRecords)))
}

write.table(newRecords, file = "inbreeding.txt", append = FALSE, row.names=F, quote=F, sep="\t")