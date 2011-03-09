/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, shared, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");

//TODO: untested
function onUpsert(row, errors){
    //make sure the anmimal is female
    if(row.id)
        EHR.validation.verifyIsFemale(row, errors);

}

function setDescription(row, errors){
    return ["Interval: "+row.interval];
}

