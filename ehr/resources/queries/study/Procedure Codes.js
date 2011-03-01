/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

<<<<<<< .mine
=======
//==includeStart
/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
console.log("** evaluating: " + this['javax.script.filename']);
>>>>>>> .r15703


function repairRow(row, errors){

}

function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    description.push(EHR.validation.snomedString('Code', row.code,  row.meaning));

    return description;
}
