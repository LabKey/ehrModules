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


function onETL(row, errors){
    if(row.caseno)
        EHR.ETL.fixPathCaseNo(row, errors, 'b');
}

function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if(row.caseno)
        description.push('Case No: '+EHR.validation.nullToString(row.caseno));
    if(row.type)
        description.push('Type: '+EHR.validation.nullToString(row.type));
    if(row.veterinarian)
        description.push('Veterinarian: '+EHR.validation.nullToString(row.veterinarian));
    if(row.nhpbmd)
        description.push('NHPBMD?: '+EHR.validation.nullToString(row.nhpbmd));

    return description;
}
