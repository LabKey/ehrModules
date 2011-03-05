/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, shared, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");




function onETL(row, errors){
    EHR.validation.fixNecropsyCase(row, errors);
}

function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    description.push('Case No: '+EHR.validation.null2string(row.caseno));

    return description;
}

EHR.onInsert = function(row, errors){
    //TODO: untested

    // auto-calculate the CaseNo
    if(row.date){
        var year = row.date.getYear();
        var procedureType = 'c';

        LABKEY.Query.executeSql({
            schemaName: 'study',
            sql: "SELECT SUBSTRING(MAX(caseno), 5, 8) as caseno FROM study.necropsies WHERE caseno LIKE '" + year + procedureType + "%'",
            success: function(data){
                if(data && data.rows && data.rows.length==1){
                    console.log('Caseno: '+data.rows[0]);
                    row.caseno = year + procedureType + (data.rows[0].caseno + 1);

                }
            },
            failure: EHR.onFailure
        });
    }

}