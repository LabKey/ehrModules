/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

//include("/ehr/validation");


function repairRow(row, errors){
    EHR.validation.fixHemaMiscMorphology(row, errors);
}

function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if(row.morphology)
        description.push('Morphology: '+ row.morphology);
    if(row.severity)
        description.push('Serverity: '+ row.severity);
    

    return description;
}

