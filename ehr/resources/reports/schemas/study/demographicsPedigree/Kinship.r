##
#  Copyright (c) 2010 LabKey Corporation
# 
#  Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
##

#options(echo=TRUE);
library(kinship)
library(Rlabkey)

#print("The kinship coefficient is a measure of relatedness between two individuals.")
#print("It represents the probability that two genes, sampled at random from each individual are identical")
#print("(e.g. the kinship coefficient between a parent and an offspring is 0.25)")

#kinship coefficient between two individuals equals the inbreeding coefficient of a hypotheticial offspring between them

#calculate kinship using an R package
kin = kinship(labkey.data$id, labkey.data$dam, labkey.data$sire)

#transform this matrix into a 3 column dataframe
vec <- c(kin);
cols<- length(colnames(kin))
newRecords<-data.frame(cbind(row.names(kin)[rep(1:cols, each=cols)] , colnames(kin), as.character( date() )), stringsAsFactors=FALSE);
newRecords<- cbind(thin, matrix(as.matrix(kin), 16,1))
colnames(newRecords)<-c("Id", "Id2", "date", "coefficient")
#newRecords

#we now compare this dataframe with the existing dataset

#find old records first
oldRecords <- labkey.selectRows(
    baseUrl=labkey.url.base,
    folderPath="/WNPRC/EHR",
    schemaName="study",
    queryName="kinship",
    colSelect=c('lsid', 'Id', 'Id2', 'date', 'coefficient'),
    showHidden = TRUE,
    colNameOpt = 'fieldname'  #rname
)
#str(oldRecords);
#str(newRecords);

IdxToDelete <- setdiff(oldRecords$Id, newRecords$Id);
#IdxToDelete
toDelete <- oldRecords[match(IdxToDelete, oldRecords$Id),]
#toDelete

if(length(toDelete$Id)){
    del <- labkey.deleteRows(
        baseUrl=labkey.url.base,
        folderPath="/WNPRC/EHR",
        schemaName="study",
        queryName="kinship",
        toDelete=data.frame(lsid=toDelete$Lsid)
    );
    del;
}


IdxToUpdate <- intersect(oldRecords$Id, newRecords$Id);
coefficient1 <- oldRecords[match(IdxToUpdate, oldRecords$Id),]
#coefficient1
coefficient2 <- newRecords[match(IdxToUpdate, newRecords$Id),]
#coefficient2

toGet <- (!is.na(coefficient1$coefficient) & is.na(coefficient2$coefficient)) | (is.na(coefficient1$coefficient) & !is.na(coefficient2$coefficient)) | (!is.na(coefficient1$coefficient) & !is.na(coefficient2$coefficient) & coefficient1$coefficient != coefficient2$coefficient)
toUpdate <- coefficient1[toGet,];
toUpdate$coefficient <- coefficient2$coefficient[toGet];
toUpdate$date <- c( as.character( date() ) );

str(toUpdate);

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

IdxToInsert <- setdiff(newRecords$Id, oldRecords$Id);
toInsert <- newRecords[match(IdxToInsert, newRecords$Id),]
#str(toInsert)

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

