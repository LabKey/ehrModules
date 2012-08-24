/*
 * Copyright (c) 2010-2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/triggers");

function onInit(event, context){
    context.extraContext.removeTimeFromDate = true;
}

function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if(row.testid)
         description.push('Test: '+EHR.Server.Validation.nullToString(row.testid));
    if (row.method)
        description.push('Method: '+row.method);

    if(row.result)
        description.push('Result: '+EHR.Server.Validation.nullToString(row.result)+' '+EHR.Server.Validation.nullToString(row.units));
    if(row.qualResult)
        description.push('Qual Result: '+EHR.Server.Validation.nullToString(row.qualResult));

    return description;
}
