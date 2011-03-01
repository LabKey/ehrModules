/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */



function repairRow(row, errors){
    if(row.stringResults){
        EHR.validation.fixChemValue(row, errors);
    }

}

function setDescription(row, errors){
    var description = new Array();

    if(row.testid)
         description.push('Test: '+EHR.validation.null2string(row.testid));

    if(row.results)
        description.push('Value: '+EHR.validation.null2string(row.results)+' '+EHR.validation.null2string(row.units));

    return description;
}

