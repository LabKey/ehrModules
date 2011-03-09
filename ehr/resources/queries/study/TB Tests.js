/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, shared, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");




function onETL(row, errors){
    if (row.result1 == '-') row.result1 = 0;
    if (row.result2 == '-') row.result2 = 0;
    if (row.result3 == '-') row.result3 = 0;

    if (row.result1 == '+') row.result1 = 5;
    if (row.result2 == '+') row.result2 = 5;
    if (row.result3 == '+') row.result3 = 5;
}

function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if(row.eye)
        description.push('Eye: '+row.eye);
    if(row.lot)
        description.push('Lot: '+row.lot);
    if(row.dilution)
        description.push('Dilution: '+row.dilution);
    if(typeof(row.result1)!==undefined)
        description.push('24H: '+row.result1);
    if(typeof(row.result2)!==undefined)
        description.push('48H: '+row.result2);
    if(typeof(row.result3)!==undefined)
        description.push('72H: '+row.result3);

    return description;
}

function onUpsert(row, errors){
    if(row.result1===null && row.result2===null && row.result3===null){
        row.missingResults = false
    }
    else {
        row.missingResults = true
    }
}

function onUpdate(row, errors){
    //TODO: once past a certain QC state, result1,result2,etc are non-editable
}