/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");




//TODO: cascade deletes to ehr.cage_obs
//TODO: insert into ehr.cage_obs.

function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();
    description.push('Cage Observation');

    return description;
}
