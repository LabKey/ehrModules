/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, shared, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");




function onETL(row, errors){
    //this is a hack so mySQL records go in.
    EHR.validation.antibioticSens(row, errors);

}


function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if (row.source)
        description.push('Source: '+EHR.validation.snomedToString(row.source,  row.sourceMeaning));

    if (row.result)
        description.push('Result: '+EHR.validation.snomedToString(row.result,  row.resultMeaning));

    if (row.antibiotic)
        description.push('Antibiotic: '+EHR.validation.snomedToString(row.antibiotic, row.antibioticMeaning));

    if (row.sensitivity)
        description.push('Sensitivity: ' + row.sensitivity);

    return description;
}


function onUpsert(row, errors){
    if (row.sensitivity && row.antibiotic == null){
        EHR.addError(errors, 'sensitivity', "Must provide an antibiotic to go with sensitivity", 'WARN');
    }

}

