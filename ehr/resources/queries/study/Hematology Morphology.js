/*
 * Copyright (c) 2010-2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/triggers");

 function onInit(event, context){
    context.extraContext.removeTimeFromDate = true;
}

function onETL(row, errors){
    EHR.ETL.fixHemaMiscMorphology(row, errors);
}

function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if(row.morphology)
        description.push('Morphology: '+ row.morphology);
    if(row.severity)
        description.push('Serverity: '+ row.severity);
    if(row.score)
        description.push('Score: '+ row.score);


    return description;
}