/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");




function onETL(row, errors){
    if(row.caseno)
        EHR.ETL.fixNecropsyCase(row, errors);
}

function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    description.push('Case No: '+EHR.validation.nullToString(row.caseno));

    return description;
}

function onInsert(context, errors, row){
    // auto-calculate the CaseNo
    if(row.dataSource != 'etl' && row.date)
        EHR.validation.calculateCaseno(row, errors, 'necropsy', 'c')

}