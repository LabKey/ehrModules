/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/triggers");

function onUpsert(context, errors, row, oldRow){
    if(!row.observation && !row.remark){
        EHR.Server.Validation.addError(errors, 'remark', 'Must enter observation or remark', 'WARN');
    }
}

function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if(row.category)
        description.push('Category: ' + row.category);
    if(row.area)
        description.push('Area: ' + row.area);
    if(row.observation)
        description.push('Observation: ' + row.observation);

    return description;
}