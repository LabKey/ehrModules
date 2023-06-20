##
#  Copyright (c) 2012-2017 LabKey Corporation
#
#  Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
##

# This R script will calculate and store kinship coefficients (aka. relatedness) for all animals in the colony.  This is a large, sparse matrix.
# The matrix is converted into a very long 3-column dataframe (animal1, animal2, coefficient).  This dataframe is output to a TSV file,
# which is normally imported into ehr.kinship by java code in GeneticCalculationsImportTask


#options(echo=TRUE);
options(error = dump.frames);
library(methods);
library(kinship2);
library(getopt);
library(Matrix);
library(dataCompareR);
library(Rlabkey);
library(lme4);
library(parallel);


spec <- matrix(c(
#'containerPath', '-c', 1, "character",
#'baseUrl', '-b', 1, "character"
'inputFile', '-f', 1, "character"
), ncol=4, byrow=TRUE);
opts = getopt(spec, commandArgs(trailingOnly = TRUE));

allPed <- read.table(opts$inputFile, quote="\"");
colnames(allPed)<-c('Id', 'Dam', 'Sire', 'Gender', 'Species');

is.na(allPed$Id)<-which(allPed$Id=="")
is.na(allPed$Dam)<-which(allPed$Dam=="")
is.na(allPed$Sire)<-which(allPed$Sire=="")
is.na(allPed$Gender)<-which(allPed$Gender=="")

allPed$Species <- as.character(allPed$Species)
allPed$Species[is.na(allPed$Species)] <- c('Unknown')
allPed$Species <- as.factor(allPed$Species)

##### commented out after checking data
# duplicatedId=allPed$Id[duplicated(allPed$Id)]
# allPed[allPed$Id%in%duplicatedId,]# Check for duplication: passed
# Id.Dam=unique(allPed$Dam)
# allPed[(allPed$Id%in%Id.Dam)&(allPed$Gender!=2),]#Check for Dam that is not female
# Id.Sire=unique(allPed$Sire)
# allPed[(allPed$Id%in%Id.Sire)&(allPed$Gender!=1),]#Check for Sire that is not male:1 not passed

# this function adds missing parents to the pedigree
# it is similar to add.Inds from kinship; however, we retain gender
addMissing <- function(ped, species){
    if(ncol(ped)<4)stop("pedigree should have at least 4 columns")
    head <- names(ped)

    nsires <- match(ped[,3],ped[,1])# [Quoc] change ped,2 to ped,3
    nsires <- as.character(unique(ped[is.na(nsires),3]))
    nsires <- nsires[!is.na(nsires)]
    if(length(nsires)){
        ped <- rbind(ped, data.frame(Id=nsires, Dam=rep(NA, length(nsires)), Sire=rep(NA, length(nsires)), Gender=rep(1, length(nsires)), Species=rep(species, length(nsires))));
    }

    ndams <- match(ped[,2],ped[,1])# [Quoc] change ped,3 to ped,2
    ndams <- as.character(unique(ped[is.na(ndams),2]))
    ndams <- ndams[!is.na(ndams)];

    if(length(ndams)){
        ped <- rbind(ped,data.frame(Id=ndams, Dam=rep(NA, length(ndams)), Sire=rep(NA, length(ndams)), Gender=rep(2, length(ndams)), Species=rep(species, length(ndams))));
    }

    names(ped) <- head
    return(ped)
}

print(paste0('Getting previousKinship'))
library(Rlabkey);
labkey.url.base = "http://localhost:8080/labkey/"
labkey.url.path = "/WNPRC/EHR"

#labkey.setCurlOptions(ssl.verifypeer=FALSE, ssl.verifyhost=TRUE)
#previousRecords=NULL
previousKinship <- function(bool){
    print('fetching previousKinship using quarterOfCores')
    previousRecords <- labkey.selectRows (
    baseUrl=labkey.url.base,
    #to run directly in R, uncomment this line.  otherwise providing a containerPath is not necessary
    folderPath=labkey.url.path,
    schemaName="ehr",
    queryName="kinship",
    colSelect=c('Id', 'Id2','coefficient'),
    showHidden = TRUE,
    colNameOpt = 'fieldname',  #rname
    #showHidden = FALSE
    )
}
numCores <- detectCores()
quarterOfCores <- numCores/2
print(quarterOfCores)
#mclapply(TRUE,previousKinship, mc.cores = quarterOfCores)

# In order to reduce the max matrix size, calculate famids using makefamid, then analyze each group separately
# It resizes the biggest matrix from 12000^2 to 8200^2 thus reduces the memory used by half


calculationKinship <- function(species){
    newRecords=NULL
    filename=NULL
    previousRecords=NULL
    compareResults=NULL
    summaryResults=NULL
    mismatchResults=NULL
    #columnKeys=NULL


    print(paste0('processing species: ', species))
    recordsForSpecies <- allPed[allPed$Species == species,]
    print(paste0('total subjects: ', nrow(recordsForSpecies)))

    recordsForSpecies <- addMissing(recordsForSpecies, species)
    gc()
    print(paste0('total subjects after adding missing: ', nrow(recordsForSpecies)))

    fami=makefamid(id=recordsForSpecies$Id,father.id=recordsForSpecies$Sire,mother.id=recordsForSpecies$Dam)
    famid=unique(fami)
    famid=famid[famid!=0]
    gc()

    print(paste0('total families: ', length(famid)))
    for (fam.no in famid){
        familytemp=recordsForSpecies[fami==fam.no,]
       # print(paste0('family size: ',species, ' ' , nrow(familytemp)))

        temp.kin=kinship(familytemp$Id,familytemp$Sire,familytemp$Dam)
        rownames(temp.kin) <- colnames(temp.kin) #add rownames to make matrix symmetric, which is required downstream
        sparse.kin=as(temp.kin,"dsTMatrix") #change kinship matrix to symmetric triplet sparse matrix

        # convert to a sparse matrix usng S4 object from Matrix library
        temp.tri=data.frame(Id=colnames(temp.kin)[sparse.kin@i+1],Id2=colnames(temp.kin)[sparse.kin@j+1],coefficient=sparse.kin@x,stringsAsFactors=FALSE)
        newRecords=rbind(newRecords,temp.tri)
    }

    filename <- paste0("kinship_",species,".txt");

    firstRun = TRUE
    print(paste("value of file.exists",file.exists(filename), filename))


    if (file.exists(filename)){
        print(paste0("opening previouskinship for ", species))
        previousRecords <- read.table(filename, header = TRUE, sep="\t", colClasses = c("character","character", "numeric"))
        #colnames(previousRecords)<c('Id', 'Id2', 'coefficient')
        print(paste("removing duplicates",species,"previous", nrow(previousRecords), "newRecords",nrow(newRecords)))
        #trimpreviousRecords <- subset(previousRecords,previousRecords$Id==previousRecords$Id2)
        #removing coefficients for animals with same IDs
        trimpreviousRecords <-previousRecords[(previousRecords$Id!=previousRecords$Id2),]
        trimnewRecords <- newRecords[(newRecords$Id!=newRecords$Id2),]
        #trimnewRecords <- subset(newRecords,newRecords$Id==newRecords$Id2)
        #print number of records after trim
        print(paste("after removal",species,"previous", nrow(trimpreviousRecords), "newRecords",nrow(trimnewRecords)))

        compareResults <- rCompare(trimpreviousRecords,trimnewRecords,keys = c("Id","Id2"),roundDigits = 7,mismatches = NA,trimChars = TRUE);

        summaryResults <- summary(compareResults)
        print(summaryResults)
        print(summaryResults$nrowSomeUnequal)

        print(paste0('Generate mismatches for: ',species))
        mismatchResults <- generateMismatchData(compareResults,trimpreviousRecords,trimnewRecords)
        #print(mismatchResults)

        print(paste0("nrowInAOnly ", summaryResults$nrowInAOnly, "nrowSomeUnequal ", summaryResults$nrowSomeUnequal))
        oldFile <- paste0("previous_",filename)
        file.rename(filename,oldFile)
        firstRun = FALSE

    }
    print(paste("number of new records", is.null(newRecords)))

    if ((firstRun || is.null(mismatchResults)) && !is.null(newRecords)){
        print("Output table:")
        print(str(newRecords))
        print(filename)
        write.table(newRecords, file = filename, append = FALSE,row.names=F,quote=F,sep="\t")
    }
    else if (!is.null(mismatchResults) ){
        #&& (summaryResults$nrowInAOnly>0 && summaryResults$nrowSomeUnequal>0)
        print("print comparison")
        detailMismatches <- colsWithUnequalValues(COEFFICIENT,mismatchResults)
        #print(summaryResults$colsWithUnequalValues)
        mismatchFile <- paste0("mismatchesKinship",species,".txt")
        saveReport(compareResults,reportName = mismatchFile, HTMLReport = FALSE)
        write.table(detailMismatches, file = 'mismatches', append = FALSE,row.names=F,quote=F,sep="\t")
        #write.table(mismatchResults, file = mismatchFile, append = FALSE, row.name=F,quote=F,sep="\t")
    }


}
system.time({
    #lapply(unique(allPed$Species), calculationKinship)
    mclapply(unique(allPed$Species), calculationKinship, mc.cores = quarterOfCores)
})




#summary(previousRecords)
#See size of previousKinship to determine to add initial ran.

#columnKeys <- c('Id','Id2')
#compareResults <- rCompare(previousRecords,newRecords,keys = columnKeys,roundDigits = NA,mismatches = NA,trimChars = FALSE);
#summaryResults <- summary(compareResults)
#print(summaryResults)
#print(summaryResults('nrowSomeUnequal'))
print(paste0('nrowCommon'))
#print(summaryResults$nrowCommon)
#print(summaryResults$nrowInAOnly)
#print(summaryResults$nrowInBOnly)
#print(summaryResults$datasetSummary)
#print(paste0('Number of rows with same results: ',nrowSomeUnequal(summaryResults)))
#print(paste0('Generate mismatches'))
#mismatchResults <- generateMismatchData(compareResults,previousKinship,newRecords)
#print(mismatchResults)



# write TSV to disk
print("Output table:");
#print(str(newRecords));
#print('value of mismatches ',is.null(mismatchResults))
#if (is.null(mismatchResults)){
#write.table(newRecords, file = "kinship.txt", append = FALSE,row.names=F,quote=F,sep="\t")
#}
#if(!is.null(mismatchResults)){
#write.table('null', file = "kinship.txt", append = FALSE, row.name=F,quote=F,sep="\t")
#}