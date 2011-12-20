/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");







function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if(row.tissue)
        description.push('Tissue: ' + EHR.Server.Validation.snomedToString(row.tissue));
    if(row.qualifier)
        description.push('Qualifier: ' + row.qualifier);
    if(row.diagnosis)
        description.push('Diagnosis: ' + row.diagnosis);
    if(row.recipient)
        description.push('Recipient: ' + row.recipient);
    if(row.container_type)
        description.push('Container: ' + row.container_type);
    if(row.accountToCharge)
        description.push('Account to Charge: ' + row.accountToCharge);
    if(row.ship_to)
        description.push('Ship To: ' + row.ship_to);

    return description;
}

