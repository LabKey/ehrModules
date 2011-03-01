    /*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

//include("/ehr/validation");

//TODO: allowable blood vol

function repairRow(row, errors){

}

function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if (row.quantity)
        description.push('Total Quantity: '+ row.quantity);
    if (row.done_by)
        description.push('Performed By: '+ row.performedby);
    if (row.done_for)
        description.push('Requestor: '+ row.requestor);
    if (row.caretaker)
        description.push('Caretaker: '+ row.caretaker);
    if (row.sampleId)
        description.push('SampleId', row.sampleId);
    if (row.tube_type)
        description.push('Tube Type: '+ row.tube_type);

    return description;
}
