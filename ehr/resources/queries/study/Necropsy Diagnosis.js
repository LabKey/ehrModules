/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");






function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if (row.tissue)
        description.push('Tissue: '+EHR.validation.snomedToString(row.tissue));
    if (row.severity)
        description.push('Severity: '+EHR.validation.snomedToString(row.severity));
    if (row.duration)
        description.push('Duration: '+EHR.validation.snomedToString(row.duration));
    if (row.distribution)
        description.push('Distribution: '+EHR.validation.snomedToString(row.distribution));
    if (row.process)
        description.push('Process: '+EHR.validation.snomedToString(row.process));

    return description;
}

