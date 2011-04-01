/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");




function onETL(row, errors){
    EHR.ETL.remarkToSoap(row, errors);
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

