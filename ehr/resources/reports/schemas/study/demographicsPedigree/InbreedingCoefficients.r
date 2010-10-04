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
#kinship coefficient between two individuals equals the inbreeding coefficient of a hypothetical offspring between them

#find and delete old records first
oldRecords <- labkey.selectRows(
    baseUrl='http://localhost:8080/labkey/',
    folderPath="/WNPRC/EHR",
    schemaName="study",
    queryName="inbreeding",
    colSelect=c('lsid', 'Id', 'date', 'coefficient'),
    showHidden = TRUE
)
str(oldRecords);
if(length(oldRecords$Id)){
    del <- labkey.deleteRows(
        baseUrl='http://localhost:8080/labkey/',
        folderPath="/WNPRC/EHR",
        schemaName="study",
        queryName="inbreeding",
        toDelete=data.frame(lsid=oldRecords$Lsid)
    );
}

df = data.frame(labkey.data$id, labkey.data$dam, labkey.data$sire)
ib = calcInbreeding(df);

date <- c(Sys.Date());

df = data.frame(Id=as.character(labkey.data$id), coefficient=ib, date=c(as.Date('2010-01-01')), stringsAsFactors=FALSE);

str(df);
print("created df");

insert <- labkey.insertRows(
    baseUrl=labkey.url.base,
    #baseUrl='https://xnight.primate.wisc.edu:8443/labkey/',
    folderPath="/WNPRC/EHR",
    schemaName="study",
    queryName="inbreeding",
    toInsert=df
    );
