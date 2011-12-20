/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");


function onUpsert(context, errors, row, oldRow){
    if(context.extraContext.dataSource != 'etl')
        EHR.Server.Validation.removeTimeFromDate(row, errors);
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

