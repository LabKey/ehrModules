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
#vec;

cols<- length(colnames(kin))
thin<-data.frame(cbind(row.names(kin)[rep(1:cols, each=cols)] , colnames(kin)), stringsAsFactors=FALSE)
thin<- cbind(thin, matrix(as.matrix(kin), 16,1))
colnames(thin)<-c("Id", "Id2", "kinship")
thin

#we now compare this dataframe with the existing dataset

#labkey.deleteRows(
#    baseUrl=labkey.url.base,
#    folderPath="/WNPRC/EHR",
#    schemaName="study",
#    queryName="kinship",
#    toDelete=data.frame(lsid=labkey.data$lsid)
#    );

#labkey.insertRows(
#    baseUrl=labkey.url.base,
#    folderPath="/WNPRC/EHR",
#    schemaName="study",
#    queryName="kinship",
#    toInsert=kin
#    );

#colnames(kin);
#rownames(kin);

