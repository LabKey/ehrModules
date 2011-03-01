/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

//include("/ehr/validation");


function repairRow(row, errors){

}

function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if(row.category)
        description.push('Category: ' + row.category);
    if(row.type)
        description.push('Area: ' + row.area);
    if(row.observation)
        description.push('Observation: ' + row.observation);

    return description;
}
