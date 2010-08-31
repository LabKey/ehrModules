##
#  Copyright (c) 2010 LabKey Corporation
# 
#  Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
##

#options(echo=TRUE);
library(kinship)
library(Rlabkey)
#library(PAAFunction)

#query all animals in the DB
allPed <- labkey.selectRows(
    baseUrl=labkey.url.base,
    folderPath="/WNPRC/EHR",
    schemaName="study",
    queryName="demographicsPedigree",
    #queryName="pedigree",
    showHidden = FALSE
)
#allPed$Gender <- as.integer(allPed$Genderint);
#allPed$Genderint <- NULL;
print("allPed")
str(allPed)

print("labkey.data")
str(labkey.data)

#this adds missing parents to the pedigree
`addMissing` <-
function(ped)
  {
    if(ncol(ped)<4)stop("pedigree should have at least 4 columns")
    head <- names(ped)
    ndams <- match(ped[,2],ped[,1])
    ndams <- as.character(unique(ped[is.na(ndams),2]))
    ndams <- ndams[!is.na(ndams)];
    nsires <- match(ped[,3],ped[,1])
    nsires <- as.character(unique(ped[is.na(nsires),3]))
    nsires <- nsires[!is.na(nsires)]
    nped <- data.frame(matrix(NA,nrow = length(ndams) + length(nsires),
                              ncol = ncol(ped)))
    names(nped) <- names(ped)
    nped[,1] <- c(ndams,nsires)
    nped[,4] <- c(rep(2, length(ndams)),rep(1, length(nsires)))
    #nped[,4] <- c(rep("female", length(ndams)),rep("male", length(nsires)))
    ped <- rbind(nped,ped)
    names(ped) <- head
    return(ped)
  }


#start the script
ped = data.frame(Id=labkey.data$id, Dam=labkey.data$dam, Sire=labkey.data$sire, Gender=labkey.data$gender);
#nrow(ped);
print("initial ped:")
str(ped)


gens = 3;

#build backwards
queryIds = !is.na(unique(c(ped$Sire, ped$Dam)));
for(i in 1:gens){
    if (length(queryIds) == 0){break};

    newRows <- subset(allPed, Id %in% queryIds);
print("genR:",i)
queryIds
str(newRows);
    queryIds = c(newRows$Sire, newRows$Dam);
    queryIds <- !is.na(queryIds);
    ped <- unique(rbind(newRows,ped));
}
#nrow(ped);

#build forwards
queryIds = unique(ped$Id);
for(i in 1:gens){
    if (length(queryIds)==0){break};

    newRows <- subset(allPed, Sire %in% queryIds | Dam %in% queryIds);
print("genF:",i)
queryIds
str(newRows)
    queryIds = newRows$Id;
    queryIds <- !is.na(queryIds);
    ped <- unique(rbind(newRows,ped));
}

#nrow(ped);

#ped;

ped$Gender <- as.integer(ped$Gender);
print("pedEnd:")
str(ped)
fixedPed <- addMissing(ped)
print("fixed ped:")
str(fixedPed);
#fixedPed;

if(nrow(fixedPed)>1){
    ptemp = pedigree(id=fixedPed$Id, momid=fixedPed$Dam, dadid=fixedPed$Sire, gender=fixedPed$Gender);

    png(filename="${imgout:png_pedigree}");
    par(xpd=TRUE);    
    plot(ptemp, symbolsize=0.5)  #density = c(-1, 50, 70, 90)
    dev.off();
}

