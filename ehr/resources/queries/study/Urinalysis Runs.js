/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");


function onETL(row, errors){
    EHR.ETL.fixSampleQuantity(row, errors);
}

function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if(row.quantity)
        description.push('Quantity: '+ row.quantity);
    if(row.userid)
        description.push('Collected By: '+ row.userid);
    if(row.method)
        description.push('Method: '+ row.method);

    return description;
}

