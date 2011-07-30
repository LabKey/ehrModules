##
#  Copyright (c) 2010 LabKey Corporation
# 
#  Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
##

#options(echo=TRUE);
library(kinship)
library(Rlabkey)

library(Matrix)

#print('Labkey.data:')
#str(labkey.data);


#NOTE: to run directly in R instead of through labkey, uncomment this:
#labkey.url.base = "https://ehr.primate.wisc.edu/"

#this section queries labkey to obtain the pedigree data
#you could replace it with a command that loads from TSV if you like
allPed <- labkey.selectRows(
    baseUrl=labkey.url.base,
    folderPath="/WNPRC/EHR",
    schemaName="study",
    queryName="Pedigree",
    colSelect=c('Id', 'Dam','Sire', 'Gender'),
    showHidden = TRUE,
    colNameOpt = 'fieldname',  #rname
    #showHidden = FALSE
)
colnames(allPed)<-c('Id', 'Dam', 'Sire', 'Gender')

# goodPed <- labkey.selectRows(
#     baseUrl=labkey.url.base,
#     folderPath="/WNPRC/EHR",
#     schemaName="study",
#     queryName="Demographics",
#     colSelect=c('Id', 'Dam','Sire', 'Gender'),
#     showHidden = TRUE,
#     colNameOpt = 'fieldname',  #rname
#     #showHidden = FALSE
# )
# colnames(goodPed)<-c('Id', 'Dam', 'Sire', 'Gender')
#print("All ped");
#str(allPed)
# Since the dataset is built from different sources, missing value is either NA or blank
# which create a bug for the following functions.
# We will change blank to NA
# Temporary solution, write and read back the file, time consuming, maybe prohibitive in server
# write.table(allPed, file="test.tsv", sep="\t")
# allPed1=read.delim("test.tsv",sep="\t",header=TRUE,na.strings=c("","NA"))
# Permanent solution: Assign "" as NA
is.na(allPed$Id)<-which(allPed$Id=="")
is.na(allPed$Dam)<-which(allPed$Dam=="")
is.na(allPed$Sire)<-which(allPed$Sire=="")
is.na(allPed$Gender)<-which(allPed$Gender=="")
#print("All ped2");
#str(allPed)
#allPedfile=read.delim("demographics_2011-07-01.txt",header=TRUE,na.strings="")
#allPedfile=allPedfile[,1:4]
#str(allPed[(is.na(allPed$Dam))&(!is.na(allPed$Sire)),])
#str(allPed[(!is.na(allPed$Dam))&(is.na(allPed$Sire)),])

##### These code are commented out after checking data
# duplicatedId=allPed$Id[duplicated(allPed$Id)]
# allPed[allPed$Id%in%duplicatedId,]# Check for duplication: passed
# Id.Dam=unique(allPed$Dam)
# allPed[(allPed$Id%in%Id.Dam)&(allPed$Gender!=2),]#Check for Dam that is not female
# Id.Sire=unique(allPed$Sire)
# allPed[(allPed$Id%in%Id.Sire)&(allPed$Gender!=1),]#Check for Sire that is not male:1 not passed

#this function adds missing parents to the pedigree
#it is similar to add.Inds from kinship; however, we retain gender
`addMissing` <-
function(ped)
  {
    if(ncol(ped)<4)stop("pedigree should have at least 4 columns")
    head <- names(ped)

    nsires <- match(ped[,3],ped[,1])# [Quoc] change ped,2 to ped,3
    nsires <- as.character(unique(ped[is.na(nsires),3]))
    nsires <- nsires[!is.na(nsires)]
    if(length(nsires)){
        ped <- rbind(ped, data.frame(Id=nsires, Dam=rep(NA, length(nsires)), Sire=rep(NA, length(nsires)), Gender=rep(1, length(nsires))));
    }

    ndams <- match(ped[,2],ped[,1])# [Quoc] change ped,3 to ped,2
    ndams <- as.character(unique(ped[is.na(ndams),2]))
    ndams <- ndams[!is.na(ndams)];

    if(length(ndams)){
        ped <- rbind(ped,data.frame(Id=ndams, Dam=rep(NA, length(ndams)), Sire=rep(NA, length(ndams)), Gender=rep(2, length(ndams))));
    }

    names(ped) <- head
    return(ped)
  }

#str(allPed)
allPed <- addMissing(allPed)
#print("All ped 3");
#str(allPed)
#[Quoc: new code to collapse sparse matrix]
#[makefamid separate the giant dataset to unrelated families]
#[It resizes the biggest matrix from 12000^2 to 8200^2 thus reduces the memory used by half ]
fami=makefamid(id=allPed$Id,father.id=allPed$Sire,mother.id=allPed$Dam)
famid=unique(fami)
famid=famid[famid!=0]
newRecords=NULL
for (fam.no in famid){
  familytemp=allPed[fami==fam.no,]
  temp.kin=kinship(familytemp$Id,familytemp$Sire,familytemp$Dam)
  sparse.kin=as(temp.kin,"dsTMatrix") #change kinship matrix to symmetric triplet sparse matrix
  #[Quoc this more efficient than do it manually, sparse matrix is S4 object from library Matrix]
  temp.tri=data.frame(Id=colnames(temp.kin)[sparse.kin@i+1],Id2=colnames(temp.kin)[sparse.kin@j+1],coefficient=sparse.kin@x,stringsAsFactors=FALSE)
  newRecords=rbind(newRecords,temp.tri)
  #str(newRecords)
}

#print("New Records");
#str(newRecords);

results <- subset(newRecords, Id %in% labkey.data$id);
results <- results[order(Id, -coefficient) , ]

write.table(results, file = "${tsvout:tsvfile}", sep = "\t", qmethod = "double", col.names=NA)
