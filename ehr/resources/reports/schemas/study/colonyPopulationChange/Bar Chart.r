##
#  Copyright (c) 2010-2012 LabKey Corporation
#
#  Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
##
#options(echo=TRUE);
library(lattice);

if (length(labkey.data$category) > 0){

    l <-length(unique(labkey.data$category));
    colors = c("darkblue","red","yellow","green");

    png(filename="${imgout:barchart}",
        width=1100,
        height=(500),
        #type="cairo"
        );
    #print(str(labkey.data));

    # determine which species column to use for display
    labkey.data$species = labkey.data$id_dataset_demographics_species;
    if ("id_dataset_demographics_species_common_name" %in% colnames(labkey.data)) {
        labkey.data$species = labkey.data$id_dataset_demographics_species_common_name;
    }

    data <- table(labkey.data$category, labkey.data$species);
    barplot(data,
        main="Population Change By Species",
        xlab="Category",
        col=colors,
        legend = rownames(data),
        beside=TRUE
        );

    dev.off();

    theTable <- table(factor(labkey.data$species), labkey.data$category)
    theTable

    write.table(theTable, file = "${tsvout:tsvfile}", sep = "\t", qmethod = "double", col.names=NA)

} else {
    write("No Records For This Timeframe", file = "${txtout:message}");
}