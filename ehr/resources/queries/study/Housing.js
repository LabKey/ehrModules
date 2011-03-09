/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, shared, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");




function onComplete(event, errors){
    // TODO: update current housing in demographics


}

function onBecomePublic(row, errors, oldRow){
    //todo: deactivate any old housing records
    //TODO: account for QC state
    //TODO: switch to enddate
    if(!row.odate){
        var toUpdate = [];
        LABKEY.Query.selectRows({
            schemaName: 'study',
            queryName: 'housing',
            columns: 'lsid,id,date',
            filterArray: [
                LABKEY.Filter.create('Id', row.Id, LABKEY.Filter.Types.EQUAL),
                LABKEY.Filter.create('odate', null, LABKEY.Filter.Types.ISBLANK)
            ],
            scope: this,
            success: function(data){
                if(data && data.rows && data.rows.length){
                    toUpdate.push({lsid: data.rows[0].lsid, odate: row.odate})
                }
            },
            failure: EHR.onFailure
        });

        if(toUpdate.length){
            LABKEY.Query.updateRows({
                schemaName: 'study',
                queryName: 'demographics',
                rowDataArray: toUpdate,
                success: function(data){
                    console.log('Success updating demographics')
                },
                failure: EHR.onFailure
            });
        }
    }
}




function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if (row.room)
        description.push('Room: '+ row.room);
    if (row.cage)
        description.push('Cage: '+ row.cage);
    if (row.cond)
        description.push('Condition: '+ row.cond);

    description.push('In Time: '+ row.Date);
    description.push('Out Time: '+ EHR.validation.nullToString(row.odate));

    return description;
}
