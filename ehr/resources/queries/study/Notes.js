/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");







function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    description.push('Start Date: ' + (row.Date ? EHR.Server.Validation.dateTimeToString(row.Date) : ''));
    description.push('End Date: ' + (row.EndDate ? EHR.Server.Validation.dateTimeToString(row.EndDate) : ''));

    if(row.category)
        description.push('Category: ' + row.category);
    if(row.value)
        description.push('Value: ' + row.value);

    return description;
}

