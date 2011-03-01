/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */



function repairRow(row, errors){
    if(row.project && (row.project.match(/,00300901/) || row.project.match(/00300901,/))){
        row.project.replace(/,00300901/, '');
        row.project.replace(/00300901,/, '');
    }

    EHR.validation.fixDrugUnits(row, errors);
}

function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if(row.code)
        description.push(EHR.validation.snomedString('Code', row.code,  row.meaning));

    if(row.amount)
        description.push('Amount: '+ row.amount+' '+EHR.validation.null2string(row.amount_units));

    if(row.route)
        description.push('Route: '+row.route);

    return description;
}

