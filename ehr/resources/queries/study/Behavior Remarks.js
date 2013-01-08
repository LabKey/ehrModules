/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

require("ehr/triggers").initScript(this);

function onUpsert(context, errors, row, oldRow){
    if(!row.so && !row.a && !row.p && !row.remark){
        EHR.Server.Validation.addError(errors, 'remark', 'Must enter at least one comment', 'WARN');
        EHR.Server.Validation.addError(errors, 'so', 'Must enter at least one comment', 'WARN');
    }
}

function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if (row.category)
        description.push('Category: '+row.category);

    if (row.so)
        description.push('s/o: '+row.so);
    if (row.a)
        description.push('a: '+row.a);
    if (row.p)
        description.push('p: '+row.p);

//    if (row.userid)
//        description.push('UserId: '+row.userid);

    return description;
}

