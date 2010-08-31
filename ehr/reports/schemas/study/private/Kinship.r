##
#  Copyright (c) 2010 LabKey Corporation
# 
#  Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
##
#options(echo=TRUE);
library(kinship)

print("The kinship coefficient is a measure of relatedness between two individuals.")
print("It represents the probability that two genes, sampled at random from each individual are identical")
print("(e.g. the kinship coefficient between a parent and an offspring is 0.25)")

#kinship coefficient between two individuals equals the inbreeding coefficient of a hypotheticial offspring between them

kinship(labkey.data$id, labkey.data$dam, labkey.data$sire)