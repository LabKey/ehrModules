/*
 * Copyright (c) 2010-2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

require("ehr/triggers").initScript(this);

function onUpsert(context, errors, row, oldRow){
    if(context.extraContext.dataSource != 'etl' && row.date && !row.requestdate){
        row.requestdate = row.date;
    }

    EHR.Server.Validation.checkRestraint(row, errors);
}

function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if(row.type)
        description.push('Type: ' + row.type);
    if(row.title)
        description.push('Title: ' + row.title);
    if(row.caseno)
        description.push('CaseNo: ' + row.caseno);
    if(row.major)
        description.push('Is Major?: '+row.major);
    if(row.performedby)
        description.push('Performed By: ' + row.performedby);
    if(row.enddate)
        description.push('Completed: ' + EHR.Server.Validation.dateTimeToString(row.enddate));

    //NOTE: only show this for non-final data
    if(row.serviceRequested && row.QCStateLabel && EHR.Server.Security.getQCStateByLabel(row.QCStateLabel).PublicData === false)
        description.push('Service Requested: ' + row.serviceRequested);

    return description;
}
