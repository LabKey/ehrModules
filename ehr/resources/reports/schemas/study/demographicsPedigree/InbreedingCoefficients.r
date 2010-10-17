##
#  Copyright (c) 2010 LabKey Corporation
# 
#  Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
##
#options(echo=TRUE);
options(expressions = 1000);
library(pedigree)
library(Rlabkey)

print('The inbreeding coefficient is the kinship coefficient between the individual\'s parents')
print('It measures the probability that the two alleles of a gene are identical by descent in the same individual (autozygosity).')
print('It is zero if the individual is not inbred.')


#use an existing package to calculate inbreeding
df = data.frame(labkey.data$id, labkey.data$dam, labkey.data$sire)
ib = calcInbreeding(df);

#we set date=now() as a timestamp
date <- as.character( date() );
newRecords = data.frame(Id=as.character(labkey.data$id), coefficient=ib, date=c(date), stringsAsFactors=FALSE);

#find old records first
oldRecords <- labkey.selectRows(
    baseUrl=labkey.url.base,
    folderPath="/WNPRC/EHR",
    schemaName="study",
    queryName="inbreeding",
    colSelect=c('lsid', 'Id', 'date', 'coefficient'),
    showHidden = TRUE
)

#we need to find the intersect of oldRecords and newRecords based on Id and coefficient
#which tells us records to update

#if(length(toDelete$Id)){
#    del <- labkey.deleteRows(
#        baseUrl=labkey.url.base,
#        folderPath="/WNPRC/EHR",
#        schemaName="study",
#        queryName="inbreeding",
#        toDelete=data.frame(lsid=toDelete$Lsid)
#    );
#}



#we need to find records present in oldRecords, but not newRecords, based on Id and coefficient
#which tells us records to delete

#if(length(toUpdate$Id)){
#    del <- labkey.deleteRows(
#        baseUrl=labkey.url.base,
#        folderPath="/WNPRC/EHR",
#        schemaName="study",
#        queryName="inbreeding",
#        toUpdate=toUpdate
#    );
#}


#we need to find records present in newRecords, but not oldRecords, based on Id and coefficient
#which tells us records to insert

#if(length(toInsert$Id)){
#    del <- labkey.insertRows(
#        baseUrl=labkey.url.base,
#        folderPath="/WNPRC/EHR",
#        schemaName="study",
#        queryName="inbreeding",
#        toInsert=toInsert
#    );
#}


