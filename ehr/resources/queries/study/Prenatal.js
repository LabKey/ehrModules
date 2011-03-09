/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, shared, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");






function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if(row.species)
        description.push('Species: '+row.species);
    if(row.gender)
        description.push('Gender: '+row.gender);
    if(row.weight)
        description.push('Weight: '+row.weight);
    if(row.dam)
        description.push('Dam: '+row.dam);
    if(row.sire)
        description.push('Sire: '+row.sire);
    if(row.room)
        description.push('Room: '+row.room);
    if(row.cage)
        description.push('Cage: '+row.cage);
    if(row.conception)
        description.push('Conception: '+row.conception);

    return description;
}

