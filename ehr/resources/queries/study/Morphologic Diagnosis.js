/*
 * Copyright (c) 2010-2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/triggers");

function onInit(event, context){
    context.allowDeadIds = true;
}

function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if (row.tissue)
        description.push('Tissue: '+EHR.Server.Validation.snomedToString(row.tissue));
    if (row.severity)
        description.push('Severity: '+EHR.Server.Validation.snomedToString(row.severity));
    if (row.duration)
        description.push('Duration: '+EHR.Server.Validation.snomedToString(row.duration));
    if (row.distribution)
        description.push('Distribution: '+EHR.Server.Validation.snomedToString(row.distribution));
    if (row.distribution2)
        description.push('Distribution: '+EHR.Server.Validation.snomedToString(row.distribution2));
    if (row.inflammation)
        description.push('Inflammation: '+EHR.Server.Validation.snomedToString(row.inflammation));
    if (row.inflammation2)
        description.push('Inflammation: '+EHR.Server.Validation.snomedToString(row.inflammation2));
    if (row.etiology)
        description.push('Etiology: '+EHR.Server.Validation.snomedToString(row.etiology));
    if (row.process)
        description.push('Process: '+EHR.Server.Validation.snomedToString(row.process));

    return description;
}
