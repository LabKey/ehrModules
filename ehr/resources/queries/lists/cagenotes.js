/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var console = require("console");
var LABKEY = require("labkey");
var Ext = require("Ext").Ext;
var EHR = {};

//NOTE: old cage obs are going to be syned through the ETL
//it's a little awkward, but we are going to shuttle it into cage_observations

function afterInsert(row, errors){
    LABKEY.Query.insertRows({
        schemaName: 'ehr',
        queryName: 'cage_observations',
        rows: [{
            date: new Date(row.Date),
            room: row.room,
            cage: row.cage,
            remark: row.note,
            userid: row.userId,
            objectId: row.objectid

        }],
        success: function(data){
            console.log('Success cascade inserting into cage_observations')
        },
        failure: function(error){
            console.log(error.message);
        }
    });
}



function afterUpdate(row, errors){
    var rowId;
    LABKEY.Query.selectRows({
        schemaName: 'ehr',
        queryName: 'cage_observations',
        filterArray: [
            LABKEY.Filter.create('objectid', row.objectid, LABKEY.Filter.Types.EQUAL)
        ],
        success: function(data){
            if(data.rows && data.rows.length){
                rowId = data.rows[0].rowid;
            }
        },
        failure: function(error){
            console.log(error.message);
        }
    });

    if(rowId){
        LABKEY.Query.updateRows({
            schemaName: 'ehr',
            queryName: 'cage_observations',
            rows: [{
                date: new Date(row.Date),
                room: row.room,
                cage: row.cage,
                remark: row.note,
                userid: row.userId,
                objectId: row.objectid,
                rowId: rowId
            }],
            success: function(data){
                console.log('Success cascade inserting into cage_observations')
            },
            failure: function(error){
                console.log(error.message);
            }
        });
    }
}


function afterDelete(row, errors){
    var rowId;
    LABKEY.Query.selectRows({
        schemaName: 'ehr',
        queryName: 'cage_observations',
        filterArray: [
            LABKEY.Filter.create('objectid', row.objectid, LABKEY.Filter.Types.EQUAL)
        ],
        success: function(data){
            if(data.rows && data.rows.length){
                rowId = data.rows[0].rowid;
            }
        },
        failure: function(error){
            console.log(error.message);
        }
    });

    if(rowId){
        LABKEY.Query.deleteRows({
            schemaName: 'ehr',
            queryName: 'cage_observations',
            rows: [{
                rowId: rowId
            }],
            success: function(data){
                console.log('Success cascade deleting into cage_observations')
            },
            failure: function(error){
                console.log(error.message);
            }
        });
    }
}