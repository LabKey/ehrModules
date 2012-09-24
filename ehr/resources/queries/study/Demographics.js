/*
 * Copyright (c) 2010-2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/triggers");

//function onInit(event, context){
//    context.extraContext.allowAnyId = true;
//}

function onUpsert(context, errors, row, oldRow){
    //TODO: do we need this for every ETL record?
    //NOTE: this should be getting set by the birth, death, arrival & departure tables
    if(!row.calculated_status || context.extraContext.dataSource == 'etl'){
        row = EHR.Server.Validation.updateStatusField([row.Id], row);
    }
}

function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    return description;
}
