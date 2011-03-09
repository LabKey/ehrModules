/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


var {EHR, LABKEY, Ext, shared, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");


//TODO: manage date vs begindate fields

function onETL(row, errors){
    //sort of a hack.  since mySQL doesnt directly store project for these records, we need to calculate this in the ETL using group_concat
    // 00300901 is a generic WNPRC project.  if it's present with other projects, it shouldnt be.
    if(row.project && row.project.match && (row.project.match(/,/))){
        row.project.replace(/,00300901/, '');
        row.project.replace(/00300901,/, '');
    }

    EHR.ETL.fixDrugUnits(row, errors);
}

function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if(row.code)
        description.push('Code: '+EHR.validation.snomedToString(row.code,  row.meaning));

    if(row.amount)
        description.push('Amount: '+ row.amount+' '+EHR.validation.nullToString(row.amount_units));

    if(row.route)
        description.push('Route: '+row.route);

    return description;
}

