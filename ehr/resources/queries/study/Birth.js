/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, shared, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");




//TODO: update demographics, major events



function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if(row.conception)
        description.push('Conception: '+ row.conception);

    if(row.gender)
        description.push('Gender: '+ EHR.validation.null2string(row.gender));
    if(row.dam)
        description.push('Dam: '+ EHR.validation.null2string(row.dam));
    if(row.sire)
        description.push('Sire: '+ EHR.validation.null2string(row.sire));
    if(row.room)
        description.push('Room: '+ EHR.validation.null2string(row.room));
    if(row.cage)
        description.push('Cage: '+ EHR.validation.null2string(row.cage));
    if(row.cond)
        description.push('Cond: '+ EHR.validation.null2string(row.cond));
    if(row.weight)
        description.push('Weight: '+ EHR.validation.null2string(row.weight));
    if(row.wdate)
        description.push('Weigh Date: '+ EHR.validation.null2string(row.wdate));
    if(row.origin)
        description.push('Origin: '+ row.origin);
    if(row.type)
        description.push('Type: '+ row.type);

    return description;
}

