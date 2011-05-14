##
#  Copyright (c) 2010-2011 LabKey Corporation
# 
#  Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
##

#options(echo=TRUE);
library(kinship)
library(Rlabkey)
#library(PAAFunction)

str(labkey.data);

#query all animals in the DB
allPed <- labkey.selectRows(
    baseUrl=labkey.url.base,
    folderPath="/WNPRC/EHR",
    schemaName="study",
    queryName="demographicsPedigree",
    colSelect=c('Id', 'Sire', 'Dam', 'Gender'),
    showHidden = TRUE,
    colNameOpt = 'fieldname',  #rname
    #showHidden = FALSE
)
#print("allPed")
#str(allPed)

#print("labkey.data")
#str(labkey.data)

#this adds missing parents to the pedigree
`addMissing` <-
function(ped)
  {
    if(ncol(ped)<4)stop("pedigree should have at least 4 columns")
    head <- names(ped)

    nsires <- match(ped[,2],ped[,1])
    nsires <- as.character(unique(ped[is.na(nsires),2]))
    nsires <- nsires[!is.na(nsires)]
    ped <- rbind(ped,data.frame(Id=nsires, Sire=rep(NA, length(nsires)), Dam=rep(NA, length(nsires)), gender=rep(1, length(nsires))));

    ndams <- match(ped[,3],ped[,1])
    ndams <- as.character(unique(ped[is.na(ndams),3]))
    ndams <- ndams[!is.na(ndams)];
    ped <- rbind(ped,data.frame(Id=ndams, Sire=rep(NA, length(ndams)), Dam=rep(NA, length(ndams)), gender=rep(2, length(ndams))));

    names(ped) <- head
    return(ped)
  }


#start the script
ped = data.frame(Id=labkey.data$id, Dam=labkey.data$dam, Sire=labkey.data$sire, gender=labkey.data$gender);
remove(labkey.data)

print("initial ped:")
nrow(ped);
str(ped)


gens = 3;

#build backwards
queryIds = !is.na(unique(c(ped$Sire, ped$Dam)));
for(i in 1:gens){
    if (length(queryIds) == 0){break};

    newRows <- subset(allPed, Id %in% queryIds);
#    print("genR:",i)
#    queryIds
#    str(newRows);
    if (nrow(newRows)==0){break};

    queryIds = c(newRows$Sire, newRows$Dam);
    queryIds <- !is.na(queryIds);
    ped <- unique(rbind(newRows,ped));
}
nrow(ped);

#build forwards
queryIds = unique(ped$Id);
for(i in 1:gens){
    if (length(queryIds)==0){break};

    newRows <- subset(allPed, Sire %in% queryIds | Dam %in% queryIds);
#    print("genF:",i)
#    queryIds
#    str(newRows)
    if (nrow(newRows)==0){break};

    queryIds = newRows$Id;
    queryIds <- !is.na(queryIds);
    ped <- unique(rbind(newRows,ped));
}
remove(allPed)

nrow(ped);
#ped;

ped$gender <- as.integer(ped$gender);
#print("pedEnd:")
#str(ped)

fixedPed <- addMissing(ped)
remove(ped)

fixedPed$Dam[is.na(fixedPed$Sire)] <- NA
fixedPed$Sire[is.na(fixedPed$Dam)] <- NA

print("fixed ped:")
str(fixedPed);
fixedPed;


if(nrow(fixedPed)>1){
    ptemp = pedigree(id=fixedPed$Id, momid=fixedPed$Dam, dadid=fixedPed$Sire, sex=fixedPed$gender);

    png(filename="${imgout:png_pedigree}");
    par(xpd=TRUE);    
    plot(ptemp, symbolsize=0.5)  #density = c(-1, 50, 70, 90)
    dev.off();
}

