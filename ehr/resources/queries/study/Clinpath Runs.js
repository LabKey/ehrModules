/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");


function onInit(event, context){
    context.allowDeadIds = true;
    context.allowAnyId = true;
    context.extraContext = context.extraContext || {};
    context.extraContext.skipIdFormatCheck = true;
}


function onUpsert(context, errors, row, oldRow){
    if(context.extraContext.dataSource != 'etl')
        EHR.validation.removeTimeFromDate(row, errors);
}


function onETL(row, errors){
    if(row.sampleQuantity)
        EHR.ETL.fixSampleQuantity(row, errors, 'sampleQuantity');

}


function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if (row.type)
        description.push('Type: '+row.type);

    if (row.serviceRequested)
        description.push('Service Requested: '+row.serviceRequested);

    if (row.sampleType)
        description.push('Sample Type: '+row.sampleType);

    if (row.sampleId)
        description.push('Sample Id: '+row.sampleId);

    if (row.collectedBy)
        description.push('Collected By: '+row.collectedBy);

    if (row.collectionMethod)
        description.push('Collection Method: '+row.collectionMethod);

    if (row.clinremark)
        description.push('Clinical Remark: '+row.clinremark);

    return description;
}

