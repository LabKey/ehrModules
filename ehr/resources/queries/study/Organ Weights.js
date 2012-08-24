/*
 * Copyright (c) 2010-2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/triggers");

function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if(row.tissue)
        description.push('Organ/Tissue: ' + EHR.Server.Validation.snomedToString(row.tissue));
    if(row.weight)
        description.push('Weight: ' + row.weight);

    return description;
}