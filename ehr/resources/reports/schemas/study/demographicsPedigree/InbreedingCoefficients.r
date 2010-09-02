##
#  Copyright (c) 2010 LabKey Corporation
# 
#  Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
##
#options(echo=TRUE);
library(pedigree)
library(Rlabkey)

print('The inbreeding coefficient is the kinship coefficient between the individual\'s parents')
print('It measures the probability that the two alleles of a gene are identical by descent in the same individual (autozygosity).')
print('It is zero if the individual is not inbred.')
#kinship coefficient between two individuals equals the inbreeding coefficient of a hypothetical offspring between them


oldRecords <- labkey.selectRows(
    baseUrl=labkey.url.base,
    folderPath="/WNPRC/EHR",
    schemaName="study",
    queryName="Inbreeding",
    colSelect=c('lsid', 'Id', 'coefficient'),
    showHidden = FALSE
)
str(oldRecords);
oldRecords;

ib = calcInbreeding(labkey.data);

df = data.frame(Id=as.character(labkey.data$id), "InbreedingCoefficient"=ib, stringsAsFactors=FALSE);
str(df)

labkey.deleteRows(
    baseUrl=labkey.url.base,
    folderPath="/WNPRC/EHR",
    schemaName="study",
    queryName="inbreeding",
    toDelete=data.frame(lsid=labkey.data$lsid)
    );

labkey.insertRows(
    baseUrl=labkey.url.base,
    folderPath="/WNPRC/EHR",
    schemaName="study",
    queryName="inbreeding",
    toInsert=df
    );