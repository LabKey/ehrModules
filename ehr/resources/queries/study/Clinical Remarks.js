/*
 * Copyright (c) 2010-2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/triggers");

function onInit(event, context){
    context.allowDeadIds = true;
}

function onUpsert(context, errors, row, oldRow){
    if(!row.so && !row.a && !row.p && !row.remark){
        EHR.Server.Validation.addError(errors, 'remark', 'Must enter at least one comment', 'WARN');
        EHR.Server.Validation.addError(errors, 'so', 'Must enter at least one comment', 'WARN');
    }

    //for compatibility with old system
    row.userid = row.performedby;

}

function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if (row.hx)
        description.push('hx: '+row.hx);
    if (row.so)
        description.push('s/o: '+row.so);
    if (row.s)
        description.push('s: '+row.so);
    if (row.o)
        description.push('o: '+row.so);
    if (row.a)
        description.push('a: '+row.a);
    if (row.p)
        description.push('p: '+row.p);
    if (row.p2)
        description.push('p2: '+row.p2);

    return description;
}
