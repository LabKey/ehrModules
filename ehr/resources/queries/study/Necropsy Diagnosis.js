/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */



function repairRow(row, errors){

}

function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if (row.tissue)
        description.push(EHR.validation.snomedString('Tissue', row.tissue));
    if (row.severity)
        description.push(EHR.validation.snomedString('Severity', row.severity));
    if (row.duration)
        description.push(EHR.validation.snomedString('Duration', row.duration));
    if (row.distribution)
        description.push(EHR.validation.snomedString('Distribution', row.distribution));
    if (row.process)
        description.push(EHR.validation.snomedString('Process', row.process));

    return description;
}

