/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


var {EHR, LABKEY, Ext, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");


function onUpsert(context, errors, row, oldRow){
    row.date = new Date();
}



function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if(row.type)
        description.push('Type: ' + EHR.Server.Validation.nullToString(row.type));

    if(row.amount)
        description.push('Amount: ' + EHR.Server.Validation.nullToString(row.amount));

    return description;
}

