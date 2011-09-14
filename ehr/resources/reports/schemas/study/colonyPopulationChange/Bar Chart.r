##
#  Copyright (c) 2010 LabKey Corporation
#
#  Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
##
#options(echo=TRUE);
library(lattice);
#library(hwriter);


if (length(labkey.data$category) > 0){

l <-length(unique(labkey.data$category));
colors = c("darkblue","red","yellow","green");

png(filename="${imgout:barchart}",
    width=1100,
    height=(500),
    #type="cairo"
    );
#print(str(labkey.data));

data <- table(labkey.data$category, labkey.data$id_dataset_demographics_species);
barplot(data,
    main="Population Change By Species",
    xlab="Category",
    col=colors,
    legend = rownames(data),
    beside=TRUE
    );

dev.off();

theTable <- table(factor(labkey.data$id_dataset_demographics_species), labkey.data$category)
theTable

#write(theTable, file="${tsvout:table}")
write.table(theTable, file = "${tsvout:tsvfile}", sep = "\t", qmethod = "double", col.names=NA)

theTable;

} else {

print("No Records For This Timeframe");

}

