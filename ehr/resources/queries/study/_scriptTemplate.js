/*
 * Copyright (c) 2011-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

/*
 * This imports default functions for all standard labkey triggers.  These triggers will run a standard set of
 * checks on the incoming data.  If this dataset needs specialized validation, you can create functions with defined names
 * below (ie. onUpdate, onInsert, etc).  See JS doc on EHR.Server.Triggers for more detail.
 */
require("ehr/triggers").initScript(this);


/*
 * This will populate the description field.  Every dataset should probably contain a custom function for this.
 */
function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    //you may wish to follow a pattern like this, on the fields that would normally be included in the description
//    if(row.score)
//        description.push('Alopecia Score: ' + EHR.Server.Validation.nullToString(row.score));
//    if(row.cause)
//        description.push('Cause: ' + EHR.Server.Validation.nullToString(row.cause));

    return description;
}

