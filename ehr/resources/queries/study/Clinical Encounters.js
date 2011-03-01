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

    if(row.type)
        description.push('Type: ' + row.type);
    if(row.type)
        description.push('Title: ' + row.title);
//    if(row.userid)
//        description.push('UserId: ' + row.userid);
    if(row.enddate)
        description.push('Completed: ' + row.enddate);

    return description;
}
