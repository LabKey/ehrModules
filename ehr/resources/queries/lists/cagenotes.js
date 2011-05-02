/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var console = require("console");
var LABKEY = require("labkey");
var Ext = require("Ext").Ext;
var EHR = {};

console.log("** evaluating: " + this['javax.script.filename']);

//NOTE: old cage obs are going to be sycned through the ETL
//it's a little awkward, but we are going to shuttle it into cage_observations
//we do this b/c that hard table is going to be used long term and the ETL doesnt support hard tables

function afterInsert(row, errors){
    LABKEY.Query.insertRows({
        schemaName: 'ehr',
        queryName: 'cage_observations',
        rows: [{
            date: new Date(row.date.toGMTString()),
            room: row.room,
            cage: row.cage,
            remark: row.note,
            userid: row.userId,
            objectId: row.objectid,
            //NOTE: these records should always come from the ETL
            dataSource: 'etl'

        }],
        success: function(data){
            console.log('Success cascade inserting into cage_observations')
        },
        failure: function(error){
            console.log(error.message);
            throw "Error inserting into cage_observations";
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
            throw "Error updating cage_observations";
        }
    });

    if(rowId){
        LABKEY.Query.updateRows({
            schemaName: 'ehr',
            queryName: 'cage_observations',
            rows: [{
                date: new Date(row.date.toGMTString()),
                room: row.room,
                cage: row.cage,
                remark: row.note,
                userid: row.userId,
                objectId: row.objectid,
                rowId: rowId,
                dataSource: 'etl'
            }],
//            success: function(data){
//                console.log('Success cascade inserting into cage_observations')
//            },
            failure: function(error){
                console.log(error.message);
                throw "Error updating cage_observations";
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
                rowId: rowId,
                dataSource: 'etl'
            }],
//            success: function(data){
//                console.log('Success cascade deleting into cage_observations')
//            },
            failure: function(error){
                console.log(error.message);
                throw "Error deleting from cage_observations";
            }
        });
    }
}
