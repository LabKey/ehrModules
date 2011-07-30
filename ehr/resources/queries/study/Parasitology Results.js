/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");



function onUpsert(context, errors, row, oldRow){
    if(context.extraContext.dataSource != 'etl')
        EHR.validation.removeTimeFromDate(row, errors);
}


function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if(row.organism || row.meaning)
        description.push('Organism: '+EHR.validation.snomedToString(row.organism,  row.meaning));
    if (row.method)
        description.push('Method: '+row.method);

    if(row.result)
        description.push('Result: '+EHR.validation.nullToString(row.result)+' '+EHR.validation.nullToString(row.units));
    if(row.qualResult)
        description.push('Qual Result: '+EHR.validation.nullToString(row.qualResult));

    return description;
}

