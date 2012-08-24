/*
 * Copyright (c) 2010-2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/triggers");

function onComplete(event, errors, scriptContext){
    if(scriptContext.publicParticipantsModified.length){
        EHR.Server.Validation.updateStatusField(scriptContext.publicParticipantsModified);
    }
}

function onBecomePublic(errors, scriptContext, row, oldRow){
    //this will close any existing assignments, housing and treatment records
    if(scriptContext.extraContext.dataSource != 'etl')
        EHR.Server.Validation.onDeathDeparture(row.Id, row.date);
}

function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if (row.authorize)
        description.push('Authorized By: '+ row.authorize);

    if (row.destination)
        description.push('Destination: '+ row.destination);

    return description;
}