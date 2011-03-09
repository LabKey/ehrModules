/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, shared, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");





function onETL(row, errors){
    if(row.stringResults){
        EHR.ETL.fixChemValue(row, errors);
    }

}

function setDescription(row, errors){
    var description = new Array();

    if(row.testid)
         description.push('Test: '+EHR.validation.nullToString(row.testid));

    if(row.results)
        description.push('Value: '+EHR.validation.nullToString(row.results)+' '+EHR.validation.nullToString(row.units));

    return description;
}

