##
#  Copyright (c) 2010-2011 LabKey Corporation
# 
#  Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
##

#options(echo=TRUE);
library(kinship)
library(Rlabkey)

#print("The kinship coefficient is a measure of relatedness between two individuals.")
#print("It represents the probability that two genes, sampled at random from each individual are identical")
#print("(e.g. the kinship coefficient between a parent and an offspring is 0.25)")

#kinship coefficient between two individuals equals the inbreeding coefficient of a hypothetical offspring between them

#calculate kinship using an R package
kin = kinship(labkey.data$id, labkey.data$dam, labkey.data$sire)

#transform this matrix into a 3 column dataframe
vec <- c(kin);
cols<- length(colnames(kin))
newRecords<-data.frame(cbind(row.names(kin)[rep(1:cols, each=cols)] , colnames(kin)), stringsAsFactors=FALSE);
newRecords<- cbind(newRecords, matrix(as.matrix(kin), cols,1))

colnames(newRecords)<-c("Id", "Id2", "coefficient")

newRecords$key1 <- paste(newRecords$Id, newRecords$Id2, sep=":")
print('Test0')
newRecords$key2 <- paste(newRecords$key1, newRecords$coefficient, sep=":")
print('Test')
newRecords$date <- c(date())
print('Test2')
newRecords$date <- as.character(newRecords$date)

str(newRecords);

#we now compare this dataframe with the existing dataset

#find old records first
oldRecords <- labkey.selectRows(
    baseUrl=labkey.url.base,
    folderPath="/WNPRC/EHR",
    schemaName="study",
    queryName="kinship",
    colSelect=c('lsid', 'Id', 'Id2', 'date', 'coefficient'),
    showHidden = TRUE,
    stringsAsFactors = FALSE,
    colNameOpt = 'fieldname'  #rname
)

oldRecords$key1 <- paste(oldRecords$id, oldRecords$id2, sep=":")
oldRecords$key2 <- paste(oldRecords$key1, oldRecords$coefficient, sep=":")


#find id pairs not present in the new records
IdxToDelete <- setdiff(oldRecords$key1, newRecords$key1);
IdxToDelete
toDelete <- oldRecords[IdxToDelete,]
str(toDelete)
toDelete


#if(length(toDelete$Id)){
#    del <- labkey.deleteRows(
#        baseUrl=labkey.url.base,
#        folderPath="/WNPRC/EHR",
#        schemaName="study",
#        queryName="kinship",
#        toDelete=data.frame(lsid=toDelete$Lsid)
#    );
#    del;
#}


#find id pairs not present in the old records
IdxToDelete <- setdiff(newRecords$key1, oldRecords$key1);
IdxToDelete
toInsert <- newRecords[match(IdxToInsert, newRecords$Id),]
str(toInsert)
toInsert


#if(length(toInsert$Id)){
#    ins <- labkey.insertRows(
#        baseUrl=labkey.url.base,
#        folderPath="/WNPRC/EHR",
#        schemaName="study",
#        queryName="kinship",
#        toInsert=toInsert
#    );
#    ins;
#}


SharedIdPairs <- intersect(oldRecords$key1, newRecords$key1);
coefficient1 <- oldRecords[match(SharedIdPairs, oldRecords$key1),]
coefficient1
coefficient2 <- newRecords[match(SharedIdPairs, newRecords$key1),]
coefficient2

#find records where the old coefficient does not equal the new one:
toGet <- (!is.na(coefficient1$coefficient) & is.na(coefficient2$coefficient)) | (is.na(coefficient1$coefficient) & !is.na(coefficient2$coefficient)) | (!is.na(coefficient1$coefficient) & !is.na(coefficient2$coefficient) & coefficient1$coefficient != coefficient2$coefficient)
toUpdate <- coefficient1[toGet,];
toUpdate$coefficient <- coefficient2$coefficient[toGet];
toUpdate$date <- c(as.character(date()));
str(toUpdate);
toUpdate


#if(length(toUpdate$Id)){
#    update <- labkey.updateRows(
#        baseUrl=labkey.url.base,
#        folderPath="/WNPRC/EHR",
#        schemaName="study",
#        queryName="kinship",
#        toUpdate=toUpdate
#    );
#    update
#}



