##
#  Copyright (c) 2010-2017 LabKey Corporation
# 
#  Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
##

options(echo=FALSE);
library(kinship2)
library(Rlabkey)
#library(stringr);

#print('Labkey.data:')
#str(labkey.data);
#warnings();

labkey.setCurlOptions(ssl.verifypeer=FALSE, ssl.verifyhost=FALSE)

#NOTE: to run directly in R instead of through labkey, uncomment this:
#labkey.url.base = "http://localhost:8080/labkey/"

if (length(labkey.data$id) == 0){
    print("*************************************");
    print ("");
    print ("");
    print("No pedigree data found for the supplied animals");
    print("");
    print("");
    print("*************************************");
    stop();
}

#this section queries labkey to obtain the pedigree data
#you could replace it with a command that loads from TSV if you like
allPed <- labkey.selectRows(
    baseUrl=labkey.url.base,
    #to run directly in R, uncomment this line.  otherwise providing a containerPath is not necessary
    folderPath=labkey.url.path,
    schemaName="study",
    queryName="Pedigree",
    colSelect=c('Id', 'Dam','Sire', 'Gender', 'Status', 'Display'),
    showHidden = TRUE,
    colNameOpt = 'fieldname',  #rname
    #showHidden = FALSE
)
colnames(allPed)<-c('Id', 'Dam', 'Sire', 'Gender', 'Status', 'Display')

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
is.na(allPed$Status)<-which(allPed$Status=="")

#this function adds missing parents to the pedigree
#it is similar to add.Inds from kinship; however, we retain gender
'addMissing' <- function(ped)
  {

    if(ncol(ped)<4)stop("pedigree should have at least 4 columns")
    head <- names(ped)

    nsires <- match(ped[,3],ped[,1]);# [Quoc] change ped,2 to ped,3
    nsires <- as.character(unique(ped[is.na(nsires),3]));
    nsires <- nsires[!is.na(nsires)];
    if(length(nsires)){
        ped <- rbind(ped, data.frame(Id=nsires, Dam=rep(NA, length(nsires)), Sire=rep(NA, length(nsires)), Gender=rep(1, length(nsires)), Status=rep(1, length(nsires)), Display=rep("", length(nsires))));
    };
    #print(nsires);
    ndams <- match(ped[,2],ped[,1]);# [Quoc] change ped,3 to ped,2
    ndams <- as.character(unique(ped[is.na(ndams),2]))
    ndams <- ndams[!is.na(ndams)];

    if(length(ndams)){
        ped <- rbind(ped,data.frame(Id=ndams, Dam=rep(NA, length(ndams)), Sire=rep(NA, length(ndams)), Gender=rep(2, length(ndams)), Status=rep(1, length(ndams)), Display=rep("", length(ndams))));
    }

    names(ped) <- head
    return(ped)
  };


'addMissingUnknown' <- function(ped)
  {

    if(ncol(ped)<4)stop("pedigree should have at least 4 columns")
    head <- names(ped)

    nsires <- match(ped[,3],ped[,1]);# [Quoc] change ped,2 to ped,3
    nsires <- as.character(unique(ped[is.na(nsires),3]));
    nsires <- nsires[!is.na(nsires)];
    if(length(nsires)){
        ped <- rbind(ped, data.frame(Id=nsires, Dam=rep(NA, length(nsires)), Sire=rep(NA, length(nsires)), Gender=rep(1, length(nsires)), Status=rep(1, length(nsires)), Display=rep("", length(nsires))));

    };
    #print(nsires);
    ndams <- match(ped[,2],ped[,1]);# [Quoc] change ped,3 to ped,2
    ndams <- as.character(unique(ped[is.na(ndams),2]))
    ndams <- ndams[!is.na(ndams)];

    if(length(ndams)){
        ped <- rbind(ped,data.frame(Id=ndams, Dam=rep(NA, length(ndams)), Sire=rep(NA, length(ndams)), Gender=rep(2, length(ndams)), Status=rep(1, length(ndams)), Display=rep("", length(ndams))));

    }

    names(ped) <- head
    return(ped)
  };


#str(allPed)
allPed <- addMissing(allPed);
#print(allPed);

#start the script

#the dataframe labkey.data is supplied by labkey. it will contain one row per initial animal
ped = data.frame(Id=labkey.data$id, Sire=labkey.data$sire, Dam=labkey.data$dam, Gender=labkey.data$gender, Status=labkey.data$status, Display=labkey.data$display);

#these will allow you to test the script
#this will work
#ped = data.frame(Id=c('r95061'), Dam=c('r84002'), Sire=c('rhao46'), Gender=c(2));

#this throws an error with align=T but OK with align=F
#ped = data.frame(Id=c('r95092'), Dam=c('rhad73'), Sire=c('rhao39'), Gender=c(1));

origIds = as.character(ped$Id);

#remove(labkey.data)



gens = 5;

#below are 2 loops that build the pedigree forward and backwards
#each loop adds 1 generation
# i do not know if this is the best approach.  figuring out how other programs do this could help
#it may be we could just use some pre-existing package instead of writing our own code
# [Quoc: This actually is very good approach]

#build forwards
#queryIds = unique(ped$Id);

#for(i in 1:gens){
#    if (length(queryIds)==0){break};

#    newRows <- subset(allPed, Sire %in% queryIds | Dam %in% queryIds);
#    if (nrow(newRows)==0){break};

#    queryIds = newRows$Id;
#    queryIds <- !is.na(queryIds);
#    ped <- unique(rbind(newRows,ped));

#}

#build backwards
queryIds = factor(c(as.character(ped$Sire), as.character(ped$Dam)));
queryIds <- queryIds[!is.na(queryIds)];
queryIds <- unique(queryIds);
queryIds
for(i in 1:gens){

    if (length(queryIds) == 0){break};
    newRows <- subset(allPed, Id %in% queryIds);

    if (nrow(newRows)==0){break};

    queryIds = c(newRows$Sire, newRows$Dam);
    queryIds <- queryIds[!is.na(queryIds)];

    ped <- unique(rbind(newRows,ped));
};

ped$Gender <- as.integer(ped$Gender);
ped$Status <- as.integer(ped$Status);

#Format the display value by replacing '|' with '\n' and putting in '\n'
#where lines run too long
'formatDisplay' <- function(line)
 {
    displayNL = gsub('\\|', "\n", line);
    return (gsub('(.{1,30})(\\s|$)', '\\1\n', displayNL));
 };

#[Quoc: remove ]
#The pedigree program expects all individuals to have either 2 parents or 1.
#Sometimes the father is not known. For missing parents we give them a unique id and
#the unknown label.  We are also adding the display value (if defined) to the dam and
#sire Ids here. This will allow us to match them with the actual Ids and carry through
#the display value to the plot.
#[Quoc: This restriction is hard-coded in the kinship package so we can not avoid ]
for (i in 1:nrow(ped)) {
    damIndex <- which((ped$Id == ped$Dam[i]));
    sireIndex <- which((ped$Id == ped$Sire[i]));

    if((is.na(ped$Sire[i]))& (!is.na(ped$Dam[i]))){
        xt <- sample (1:30,1)
        #typeof(ped$Sire);
        #typeof(xt);
        ped$Sire[i] <- paste('xxs',xt)
        ped$Sire[i] <- paste (ped$Sire[i], "Unknown Sire", sep="\n")
        #print(ped$Dam[i])
        #print(ped$Sire[i])
    }
    if((is.na(ped$Dam[i]))& (!is.na(ped$Sire[i]))){
            xt <- sample (1:30,1)
            #typeof(ped$Sire);
            #typeof(xt);
            ped$Dam[i] <- paste ('xxd',xt);
            ped$Dam[i] <- paste (ped$Dam[i], "Unknown Dam", sep="\n")
            #print(ped$Sire);
    }

    if (length(damIndex) > 0) {
        ped$Dam[i] <- paste (ped$Dam[i], formatDisplay(ped$Display[damIndex]), sep="\n");
    }

    if (length(sireIndex) > 0) {
        ped$Sire[i] <- paste (ped$Sire[i], formatDisplay(ped$Display[sireIndex]), sep="\n");
    }
};

#Add the display value to the Id to be displayed in the plot
for (i in 1:nrow(ped)) {
    ped$Id[i] <- paste (ped$Id[i], formatDisplay(ped$Display[i]), sep="\n");
};

#print (nrow(ped));
#for (i in 1:nrow(ped)){
#    if((is.na(ped$Dam[i]))& (!is.na(allPed$Sire[i]))){
#        xt <- sample (1:30,1)
        #typeof(ped$Sire);
        #typeof(xt);
#        ped$Dam[i] <- paste ('rxxd',xt);
#        print(ped$Sire);
#    }
#};
#ped$Dam[is.na(ped$Sire)] <- NA;
#ped$Sire[is.na(ped$Dam)] <- NA;
#print(ped);
#[Quoc: add missing after NA change]
fixedPed <- addMissingUnknown(ped);
#print(fixedPed);

#once we get the initial pedigree working, I would prefer to explore other options
#like adding colors.  for example, the index animals could be colored red
for (j in 1:nrow(fixedPed)){
    if(fixedPed$Gender[j] == 2)  {
        fixedPed$colors[j] = 'red';
    }
    if(fixedPed$Gender[j] == 1){
        fixedPed$colors [j] = 'blue';
    }
}

rows = nrow(fixedPed)

if(rows>1){
    ptemp = pedigree(id=fixedPed$Id, momid=fixedPed$Dam, dadid=fixedPed$Sire, sex=fixedPed$Gender, status=fixedPed$Status);

    png(filename="${imgout:png_pedigree}", width = 1500, height=900);
    par(xpd=TRUE);

    # attempt to adjust text size based on size of pedigree
    if (rows < 10) {
        cexSize = 1.1
    }
    else if (rows < 20) {
        cexSize = 1.0
    }
    else if (rows < 30) {
        cexSize = 0.9
    }
    else {
        cexSize = 0.8
    }

    plot(ptemp, align=T, width=15, symbolsize=1.5, cex=cexSize, col=fixedPed$colors, mar=c(4.1,3.5,4.1,3.8), density=c(-1, 35, 55, 25))
    #dev.off();
};