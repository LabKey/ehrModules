##
#  Copyright (c) 2010 LabKey Corporation
# 
#  Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
##

#options(echo=TRUE);
library(kinship)
library(Rlabkey)

#query all animals in the DB
allPed <- labkey.selectRows(
    baseUrl=labkey.url.base,
    folderPath="/WNPRC/EHR",
    schemaName="study",
    queryName="demographicsPedigree",
    showHidden = FALSE,
)

#this adds missing parents to the pedigree
addMissing <- function(ped)
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

#fixes single parent rows
fixSingles <- function(ped)  {

print("Names:")
str(ped)
    #missing Dam
    new <- subset(ped, Sire == 'r87084' & Dam != NA)
    print ("New")
    str(new)
    print (new)

    #missing Sire
    #new2 <- subset(ped, is.na(dam) && !is.na(sire))
    #print ("New2")
    #new2

    return(ped)
    }

findKin <- function(id, dadid, momid, index, generations=1) {
   idrow <- match(index, id)
   if (any(is.na(idrow))) stop("Index subject not found")
   for (i in 1:generations) {
       # add parents
       idrow <- c(idrow, match(momid[idrow], id, nomatch=0),
                         match(dadid[idrow], id, nomatch=0))
       idrow <- unique(idrow[idrow>0])  # toss the zeros

       # add children
       idrow <- c(idrow, which(match(momid, id[idrow], nomatch=0) >0),
                         which(match(dadid, id[idrow], nomatch=0) >0))
       idrow <- unique(idrow[idrow>0])
       }
   idrow
   }
   
#start the script
#data.frame(Id=labkey.data$id, Dam=labkey.data$dam, Sire=labkey.data$sire, Gender=labkey.data$gender);
#print("labkey.data")
#str(labkey.data)
#print("allPed")
#str(allPed)

#Calculate the kin of the index animal(s)
newIds <- findKin(allPed$Id, allPed$Sire, allPed$Dam, as.character(labkey.data$id), 2);
newPed <- allPed[newIds,]
#print("newPed")
#str(newPed);

print("fixed ped:")
fixedPed <- addMissing(newPed)
str(fixedPed);
fixedPed



fixedPed <- fixSingles(fixedPed)
#print("No Singles:")
#str(fixedPed);
#fixedPed



#
#if(nrow(fixedPed)>1){
#    ptemp = pedigree(id=fixedPed$Id, momid=fixedPed$Dam, dadid=fixedPed$Sire, gender=fixedPed$Gender);
#
#    png(filename="${imgout:png_pedigree}");
#    par(xpd=TRUE);
#    plot(ptemp, symbolsize=0.5, xpd=TRUE)  #density = c(-1, 50, 70, 90)
#    dev.off();
#}

