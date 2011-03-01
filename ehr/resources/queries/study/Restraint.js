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

    if(row.type)
        description.push('Type: '+row.type);
    if(row.totalTime)
        description.push('Total Time: '+row.totalTime);

    return description;
}
