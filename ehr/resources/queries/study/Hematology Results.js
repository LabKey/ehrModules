/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

require("ehr/triggers").initScript(this);

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
        description.push('Result: '+EHR.Server.Validation.nullToString(row.result));

    if(row.qualResult)
        description.push('Qualitative Result: '+EHR.Server.Validation.nullToString(row.qualResult));

    return description;
}