##
#  Copyright (c) 2010 LabKey Corporation
# 
#  Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
##
options(echo=TRUE);
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
newRecords <- data.frame(Id=as.character(labkey.data$id), coefficient=ib, date=c(date), stringsAsFactors=FALSE);

#find old records first
oldRecords <- labkey.selectRows(
    baseUrl=labkey.url.base,
    folderPath="/WNPRC/EHR",
    schemaName="study",
    queryName="inbreeding",
    colSelect=c('lsid', 'Id', 'date', 'coefficient'),
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
        queryName="inbreeding",
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

if(length(toUpdate$Id)){
    update <- labkey.updateRows(
        baseUrl=labkey.url.base,
        folderPath="/WNPRC/EHR",
        schemaName="study",
        queryName="inbreeding",
        toUpdate=toUpdate
    );    
    update
}

IdxToInsert <- setdiff(newRecords$Id, oldRecords$Id);
toInsert <- newRecords[match(IdxToInsert, newRecords$Id),]
#str(toInsert)

if(length(toInsert$Id)){
    ins <- labkey.insertRows(
        baseUrl=labkey.url.base,
        folderPath="/WNPRC/EHR",
        schemaName="study",
        queryName="inbreeding",
        toInsert=toInsert
    );
    ins;
}