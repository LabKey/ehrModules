##
#  Copyright (c) 2011-2012 LabKey Corporation
# 
#  Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
##
#options(echo=TRUE);
library(lattice);

labkey.data <- labkey.data[!is.na(labkey.data$date),];
labkey.data <- labkey.data[!is.na(labkey.data$viralload),];
labkey.data <- labkey.data[!is.na(labkey.data$subjectid),];

labkey.data$date = as.Date(labkey.data$date);
labkey.data$viralload = log(labkey.data$viralload);

size = length(unique(labkey.data$subjectid));

if (size > 0){

    png(filename="${imgout:graph.png}",
        width=800,
        height=(400 * size)
    );

    myPlot = xyplot(viralload ~ date | subjectid,
        data=labkey.data,
        layout=c(1,size),
        xlab="Sample Date",
        ylab="Log Viral Load (copies/mL)",
        auto.key = TRUE,
        scales=list(
            #x=list(alternating=FALSE,tick.number = 11),
            y=list(limits=c(0,15))
        )
    );

    print(myPlot);
    dev.off();

} else {
    #print("No animals selected");
}

