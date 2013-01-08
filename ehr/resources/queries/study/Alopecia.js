/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

require("ehr/triggers").initScript(this);

function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if(row.score)
        description.push('Alopecia Score: ' + EHR.Server.Validation.nullToString(row.score));

    if(row.cause)
        description.push('Cause: ' + EHR.Server.Validation.nullToString(row.cause));

    return description;
}
