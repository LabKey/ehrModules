/*
 * Copyright (c) 2010-2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/triggers");

function onInit(event, scriptContext){
     scriptContext.quickValidation = true;
}

function setDescription(row, errors){
    var description = ['Cage Observation'];

    if(row.feces)
        description.push('Feces: '+row.feces);

    return description;
}
