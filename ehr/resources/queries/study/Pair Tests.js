/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/triggers");

function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

//    if(row.bhav)
//        description.push('BHAV: ' + row.bhav);
    if(row.testNo)
        description.push('Test No: ' + row.testNo);
    if(row.conclusion)
        description.push('Conclusion: ' + row.conclusion);

    return description;
}