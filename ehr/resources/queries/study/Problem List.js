/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


function repairRow(row, errors){

}

function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if(row.problem_no)
        description.push('Problem No: '+row.problem_no);

    description.push('Date Observed: '+EHR.validation.dateTimeString(row.date_observed));
    description.push('Date Resolved: '+EHR.validation.dateTimeString(row.enddate));

    return description;
}

function onInsert(row, errors){
    //TODO: autocalculate problem #
}