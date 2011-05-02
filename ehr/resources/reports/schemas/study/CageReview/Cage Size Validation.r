##
#  Copyright (c) 2010 LabKey Corporation
# 
#  Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
##
#options(echo=TRUE);

#this is a very slow query.  the purpose of this report is to run the query in the background
#then cache the results in TSV.  users can initiate the job, then come back for the results

write.table(labkey.data, file = "${tsvout:tsvfile}", sep = "\t", qmethod = "double", col.names=NA)