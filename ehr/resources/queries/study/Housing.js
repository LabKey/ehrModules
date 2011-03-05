/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, shared, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");




//todo: deactivate any old housing records
//todo: calculate condition field.  update current housing in demographics
function onComplete(event, errors){

}

function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if (row.room)
        description.push('Room: '+ row.room);
    if (row.cage)
        description.push('Cage: '+ row.cage);
    if (row.cond)
        description.push('Condition: '+ row.cond);

    description.push('In Time: '+ row.Date);
    description.push('Out Time: '+ EHR.validation.null2string(row.odate));

    return description;
}
