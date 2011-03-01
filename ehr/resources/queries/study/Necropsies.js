/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


function repairRow(row, errors){
    EHR.validation.fixNecropsyCase(row, errors);
}

function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    description.push('Case No: '+EHR.validation.null2string(row.caseno));

    return description;
}

function onInsert(row, errors){
    //TODO: auto-calculate the CaseNo
}