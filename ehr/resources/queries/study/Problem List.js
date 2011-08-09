/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");


function onUpsert(context, errors, row, oldRow){
    if(context.extraContext.dataSource != 'etl'){
        EHR.validation.removeTimeFromDate(row, errors);
        EHR.validation.removeTimeFromDate(row, errors, 'enddate');
    }
}


function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if(row.problem_no)
        description.push('Problem No: '+row.problem_no);

    description.push('Date Observed: '+EHR.validation.dateTimeToString(row.date));
    description.push('Date Resolved: '+EHR.validation.dateTimeToString(row.enddate));

    return description;
}


function onInsert(context, errors, row){
    //autocalculate problem #
    //TODO: testing needed
    if(context.extraContext.dataSource != 'etl' && row.Id){
        LABKEY.Query.executeSql({
            schemaName: 'study',
            sql: "SELECT MAX(problem_no)+1 as problem_no FROM study.problem WHERE id='"+row.Id+"'",
            //NOTE: remove QC filter because of potential conflicts: +" AND qcstate.publicdata = TRUE",
            success: function(data){
                if(data && data.rows && data.rows.length==1){
                    //console.log('problemno: '+data.rows[0].problem_no);
                    row.problem_no = data.rows[0].problem_no || 1;
                }
                else {
                    row.problem_no = 1;
                }
            },
            failure: EHR.onFailure
        });
    }

}