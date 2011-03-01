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

    if (row.userid)
        description.push('UserId: '+row.userid);

//    if (row.Remark)
//        description.push('Remark: '+row.Remark);

    //TODO: maybe modify description to include summary of results?

    return description;
}

