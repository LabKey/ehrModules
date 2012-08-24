/*
 * Copyright (c) 2010-2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/triggers");

function onUpsert(context, errors, row, oldRow){
    if(context.extraContext.dataSource != 'etl' && row.date && !row.requestdate){
        row.requestdate = row.date;
    }

    EHR.Server.Validation.checkRestraint(row, errors);
}

function onETL(row, errors){
    //we grab the first sentence as title
    if(row.type == 'Surgery' && !row.title && row.remark && row.remark.length > 200){
        var match = row.remark.match(/^(.*?)\./);
        if(match && match[1] && match[1].length < 35){
            var title = match[1];

            if(!title.match(/^\(con/) && !title.match(/^cont/)){
                row.title = title;
            }
        }
    }

    EHR.ETL.fixSurgMajor(row, errors);

    //applies to biopsy / necropsy
    if(row.caseno){
        var code;
        if(row.type=='Necropsy')
            code='a|c|e';
        else if (row.type == 'Biopsy')
            code = 'b';

        if(code)
            EHR.ETL.fixPathCaseNo(row, errors, code);
    }

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
