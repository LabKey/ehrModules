/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, shared, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");




//TODO: testing needed
function onDelete(row, errors){
    throw new error("Deletes not allowed on this dataset.  Must delete from ehr.cage_observations instead.");
}

function setDescription(row, errors){
    return ['Cage Observation'];
}
