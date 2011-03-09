/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, shared, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");






function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if(row.type)
        description.push('Type: '+row.type);
    if(row.type)
        description.push('Quantity: '+row.quantity);
    if(row.type)
        description.push('Total Cost: '+row.totalCost);

    return description;
}

function onUpsert(row, errors){
    row.totalCost = row.unitCost * row.quantity;
}