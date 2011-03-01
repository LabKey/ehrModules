/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

//include("/ehr/validation");

//TODO: dont allow any deletes
//cascade delete from ehr.cage_obs to this

function repairRow(row, errors){

}

function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();
    description.push('Cage Observation');

    return description;
}
