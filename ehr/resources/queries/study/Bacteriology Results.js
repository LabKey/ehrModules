/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

//include("/ehr/validation");


function repairRow(row, errors){
    //this is a hack so mySQL records go in.
    EHR.validation.antibioticSens(row, errors);

}

function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if (row.source)
        description.push(EHR.validation.snomedString('Source', row.source,  row.sourceMeaning));

    if (row.result)
        description.push(EHR.validation.snomedString('Result', row.result,  row.resultMeaning));

    if (row.antibiotic)
        description.push(EHR.validation.snomedString('Antibiotic', row.antibiotic, row.antibioticMeaning));

    if (row.sensitivity)
        description.push('Sensitivity: ' + row.sensitivity);

//    if (row.Remark)
//        description.push('Remark: ' + row.Remark);

    return description;
}


function onUpsert(row, errors){
    if (row.sensitivity != null && row.antibiotic == null){
        errors.sensitivity = "Must provide an antibiotic to go with sensitivity";
    }

}

