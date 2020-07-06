##
#  Copyright (c) 2010-2015 LabKey Corporation
# 
#  Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
##

options(echo=FALSE)
library(visPedigree)
library(Rlabkey)

##############################################
#data(package="visPedigree")
#tidy_simple_ped <- tidyped(simple_ped)

#tidy_small_ped <-
#  tidyped(ped = small_ped,
#         cand = c("Y","Z1","Z2"))


# ${imgout:labkey_visPedigree.png}
#png(file="${imgout:labkey_visPedigree.png}")
#visped(tidy_small_ped, showgraph = TRUE)
#dev.off()


# ${pdfout:labkey_visPedigree.pdf}
#pdf(file="${pdfout:labkey_visPedigree.pdf}")
#visped(tidy_small_ped, showgraph = TRUE)
#dev.off()

##############################################

labkey.setCurlOptions(ssl.verifypeer=FALSE, ssl.verifyhost=FALSE)

id <- as.character(labkey.data$id)
method <- "down"

#NOTE: to run from local machine uncomment these lines, it should also run in R,
#but note that you have to supply an animal id above, because it will not know labkey.data$id
#labkey.url.base = "http://localhost:8080/labkey/"
#labkey.url.path = "/WNPRC/EHR"

#this section queries labkey to obtain the pedigree data
allPed <- labkey.selectRows(
    baseUrl=labkey.url.base,
    #to run directly in R, uncomment this line.  otherwise providing a containerPath is not necessary
    folderPath=labkey.url.path,
    schemaName="study",
    queryName="Pedigree",
    colSelect=c('Id', 'Dam','Sire', 'Gender'),
    showHidden = TRUE,
    colNameOpt = 'fieldname',  #rname
    #showHidden = FALSE
)

#print(allPed)

#Rename gender to sex for the vispedigree program
colnames(allPed)<-c('Id', 'Dam', 'Sire', 'Sex')

#need to replace WNPRC sex codes with strings
allPed$Sex[allPed$Sex == 1] <- "male"
allPed$Sex[allPed$Sex == 2] <- "female"
allPed$Sex[allPed$Sex == 3] <- NA

print("*********************************************")
print("Parents of this animal:")
print(allPed[allPed$Id == id,])
print("*********************************************")

print("*********************************************")
print("Output from the pedigree plot:")
tidy_ped <-
  tidyped(ped = allPed, cand=c(id),trace=method)

print("**********************************************************")
print(tidy_ped)
print("**********************************************************")

# ${imgout:labkey_visPedigree.png}
png(file="${imgout:labkey_visPedigree.png}")
visped(tidy_ped, showgraph = TRUE)
#dev.off()

# ${pdfout:labkey_visPedigree.pdf}
pdf(file="${pdfout:labkey_visPedigree.pdf}")
visped(tidy_ped, showgraph = TRUE)
#dev.off()
