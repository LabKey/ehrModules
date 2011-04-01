/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");

//TODO: test generation of remark field


//TODO: testing needed
function onDelete(errors, context, row){

    //throw new error("Deletes not allowed on this dataset.  Must delete from ehr.cage_observations instead.");

}

function setDescription(row, errors){
    return ['Cage Observation'];
}
