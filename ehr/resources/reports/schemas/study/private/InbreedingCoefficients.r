##
#  Copyright (c) 2010 LabKey Corporation
# 
#  Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
##
#options(echo=TRUE);
library(pedigree)

print('The inbreeding coefficient is the kinship coefficient between the individual\'s parents')
print('It measures the probability that the two alleles of a gene are identical by descent in the same individual (autozygosity).')
print('It is zero if the individual is not inbred.')


#kinship coefficient between two individuals equals the inbreeding coefficient of a hypotheticial offspring between them

ib = calcInbreeding(labkey.data);

df = data.frame(Id=labkey.data$id, "Inbreeding Coefficient"=ib);

df