/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, shared, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");

//TODO: untested
function onUpsert(row, errors){
    if(row.date){
        LABKEY.Query.selectRows({
            schemaName: 'study',
            queryName: 'Menses',
            filterArray: [
                LABKEY.Filter.create('Id', row.Id, LABKEY.Filter.Types.EQUAL),
                LABKEY.Filter.create('date', row.date, LABKEY.Filter.Types.LESS_THAN),
                LABKEY.Filter.create('menses', false, LABKEY.Filter.Types.NEQ_OR_NULL)
            ],
            maxRows: 1,
            success: function(data){
                if(data && data.rows && data.rows.length==1){
                    console.log('Interval: '+data.rows[0]);
                    row.interval = row.date - data.rows[0].Date;
                }
            },
            failure: EHR.onFailure
        });
    }
}

function setDescription(row, errors){
    return ["Interval: "+row.interval];
}

