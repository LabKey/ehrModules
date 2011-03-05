/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, shared, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");






function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if(row.problem_no)
        description.push('Problem No: '+row.problem_no);

    description.push('Date Observed: '+EHR.validation.dateTimeString(row.date_observed));
    description.push('Date Resolved: '+EHR.validation.dateTimeString(row.enddate));

    return description;
}


EHR.onInsert = function(row, errors){
    //TODO: untested

    //autocalculate problem #
    if(row.Id){
        LABKEY.Query.executeSql({
            schemaName: 'study',
            sql: "SELECT MAX(problem_no) as problem_no FROM study.problem WHERE id='"+row.Id+"'",
            success: function(data){
                if(data && data.rows && data.rows.length==1){
                    console.log('problemno: '+data.rows[0]);
                    row.problem_no = data.rows[0].problem_no + 1;

                }
            },
            failure: EHR.onFailure
        });
    }

}