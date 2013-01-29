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

    if (row.source)
        description.push('Source: '+row.source);

    if (row.testid)
        description.push('Test: '+row.testid);
    if (row.virus)
        description.push('Test: '+row.virus);
    if (row.virusCode)
        description.push('Virus: '+EHR.Server.Validation.snomedToString(row.virusCode,  row.virusMeaning));

    if (row.method)
        description.push('Method: '+row.method);
    if (row.sampleCode)
        description.push('Sample Type: '+EHR.Server.Validation.snomedToString(row.sampleType,  row.sampleMeaning));

    if(row.result)
        description.push('Result: '+EHR.Server.Validation.nullToString(row.result)+' '+EHR.Server.Validation.nullToString(row.units));
    if(row.qualResult)
        description.push('Qual Result: '+EHR.Server.Validation.nullToString(row.qualResult));

    return description;
}

