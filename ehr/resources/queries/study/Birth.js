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
        description.push('Gender: '+ EHR.validation.nullToString(row.gender));
    if(row.dam)
        description.push('Dam: '+ EHR.validation.nullToString(row.dam));
    if(row.sire)
        description.push('Sire: '+ EHR.validation.nullToString(row.sire));
    if(row.room)
        description.push('Room: '+ EHR.validation.nullToString(row.room));
    if(row.cage)
        description.push('Cage: '+ EHR.validation.nullToString(row.cage));
    if(row.cond)
        description.push('Cond: '+ EHR.validation.nullToString(row.cond));
    if(row.weight)
        description.push('Weight: '+ EHR.validation.nullToString(row.weight));
    if(row.wdate)
        description.push('Weigh Date: '+ EHR.validation.nullToString(row.wdate));
    if(row.origin)
        description.push('Origin: '+ row.origin);
    if(row.type)
        description.push('Type: '+ row.type);

    return description;
}

