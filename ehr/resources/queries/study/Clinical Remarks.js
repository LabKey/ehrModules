/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");

function onInit(event, context){
    context.allowDeadIds = true;
}

function onUpsert(context, errors, row, oldRow){
    if(!row.so && !row.a && !row.p && !row.remark){
        EHR.addError(errors, 'remark', 'Must enter at least one comment', 'WARN');
        EHR.addError(errors, 'so', 'Must enter at least one comment', 'WARN');
    }

    //for compatibility with old system
    row.userid = row.performedby;

}


function onETL(row, errors){
    EHR.ETL.remarkToSoap(row, errors);
}

function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if (row.so)
        description.push('s/o: '+row.so);
    if (row.a)
        description.push('a: '+row.a);
    if (row.p)
        description.push('p: '+row.p);

    return description;
}
