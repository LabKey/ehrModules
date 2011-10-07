/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");





function onUpsert(context, errors, row, oldRow){
    row.title = row.title || '';

}


function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    var createdby = row.createdby || LABKEY.Security.currentUser.id;

    if (createdby)
        description.push('Created By: '+ EHR.utils.findPrincipalName(createdby));
    if (row.notify1)
        description.push('Notify 1: '+ EHR.utils.findPrincipalName(row.notify1));
    if (row.notify2)
        description.push('Notify 2: '+ EHR.utils.findPrincipalName(row.notify2));
    if (row.notify3)
        description.push('Notify 3: '+ EHR.utils.findPrincipalName(row.notify3));

    return description;
}

