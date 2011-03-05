/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, shared, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");




//function onETL(row, errors){
//    EHR.validation.fixSurgMajor(row, errors);
//}

function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if(row.Date)
        description.push('Start: '+EHR.validation.dateTimeString(row.Date));
    if(row.enddate)
        description.push('End: '+EHR.validation.dateTimeString(row.enddate));
    if(row.age)
        description.push('Age: '+row.age);
    if(row.inves)
        description.push('Investigator: '+row.inves);
    if(row.surgeon)
        description.push('Surgeon: '+row.surgeon);
    if(row.major)
        description.push('Is Major?: '+row.major);

    return description;
}

