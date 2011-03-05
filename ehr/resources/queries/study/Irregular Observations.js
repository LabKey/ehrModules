/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

//todo auto-update observations table with mens, diar.
//TODO: cascade delete/update them too


var {EHR, LABKEY, Ext, shared, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");


function onUpsert(row, errors, oldRow){
    //todo: testing needed

    //store room at time / cage at time

}

function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if(row.feces)
        description.push('Feces: '+row.feces);
    if(row.menses)
        description.push('Menses: '+row.menses);
    if(row.behavior)
        description.push('Behavior: '+row.behavior);
    if(row.breeding)
        description.push('Breeding: '+row.breeding);
    if(row.other)
        description.push('Other: '+row.other);
    if(row.tlocation)
        description.push('Trauma Location: '+row.tlocation);
    if(row.otherbehavior)
        description.push('Other Behavior: '+row.otherbehavior);

    if(!row.isIrregular)
        description.push('No Irregular Observations');

    return description;
}


//unique to obs:
function onUpsert(row, errors){
    if (
        row.feces ||
        row.menses ||
        row.behavior ||
        row.breeding ||
        row.other ||
        row.tlocation ||
        row.remark ||
        row.otherbehavior
    ){
        row.isIrregular = true;
    }
    else {
        row.isIrregular = false;
    }
}