/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

require("ehr/triggers").initScript(this);

function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if(row.tissue)
        description.push('Organ/Tissue: ' + EHR.Server.Validation.snomedToString(row.tissue, row.tissueMeaning));
    if(row.weight)
        description.push('Weight: ' + row.weight);

    return description;
}