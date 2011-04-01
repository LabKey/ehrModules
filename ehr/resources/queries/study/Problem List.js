/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");






function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if(row.problem_no)
        description.push('Problem No: '+row.problem_no);

    description.push('Date Observed: '+EHR.validation.dateTimeToString(row.date_observed));
    description.push('Date Resolved: '+EHR.validation.dateTimeToString(row.enddate));

    return description;
}


function onInsert(context, errors, row){
    //autocalculate problem #
    //TODO: testing needed
    if(row.Id){
        LABKEY.Query.executeSql({
            schemaName: 'study',
            sql: "SELECT MAX(problem_no)+1 as problem_no FROM study.problem WHERE id='"+row.Id+"' AND qcstate.publicdata = TRUE",
            success: function(data){
                if(data && data.rows && data.rows.length==1){
                    console.log('problemno: '+data.rows[0]);
                    row.problem_no = data.rows[0].problem_no;

                }
            },
            failure: EHR.onFailure
        });
    }

}