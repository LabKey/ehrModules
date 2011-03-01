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

    if (row.score)
        description.push('BCS: '+ row.score);
    if (row.done_for)
        description.push('Weight OK? '+ row.weightStatus);

    return description;
}
