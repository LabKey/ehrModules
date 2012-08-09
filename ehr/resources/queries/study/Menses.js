/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/triggers");

function onUpsert(scriptContext, errors, row, oldRow){
    //make sure the anmimal is female
    if(row.id)
        EHR.Server.Validation.verifyIsFemale(row, errors, scriptContext);
}

function setDescription(row, errors){
    return [];//["Interval: "+row.interval];
}

