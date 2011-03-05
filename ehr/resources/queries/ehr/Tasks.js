/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, shared, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");

console.log("** evaluating: " + this['javax.script.filename']);



function onUpsert(row, errors, oldRow){
    row.title = row.title || '';

}


function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();
    return description.join(',\n');
}

