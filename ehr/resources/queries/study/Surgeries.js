/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");




function onETL(row, errors){
    EHR.ETL.fixSurgMajor(row, errors);
}

function onInsert(context, errors, row){
    if(context.extraContext.dataSource != 'etl' && row.Id && row.date){
        LABKEY.Query.executeSql({
            schemaName: 'study',
            sql: "SELECT age_in_months(d.birth, CONVERT('"+EHR.Server.Validation.dateToString(row.date)+"', DATE)) as age FROM study.demographics d WHERE d.id='"+row.Id+"'",
            success: function(data){
                if(data && data.rows && data.rows.length){
                    row.age = data.rows[0].age;
                }
            },
            failure: EHR.Server.Utils.onFailure
        });
    }
}

function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if(row.Date)
        description.push('Start: '+EHR.Server.Validation.dateTimeToString(row.Date));
    if(row.enddate)
        description.push('End: '+EHR.Server.Validation.dateTimeToString(row.enddate));
    if(row.age)
        description.push('Age: '+row.age);
    if(row.inves)
        description.push('Investigator: '+row.inves);
    if(row.surgeon)
        description.push('Surgeon: '+row.surgeon);
    if(row.major)
        description.push('Is Major?: '+row.major);

    return description;
}

