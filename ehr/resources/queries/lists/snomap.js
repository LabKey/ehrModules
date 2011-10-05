/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var console = require("console");
var LABKEY = require("labkey");
//var Ext = require("Ext").Ext;
var EHR = {};

console.log("** evaluating: " + this['javax.script.filename']);

//NOTE: old snomap records are going to be sycned through the ETL
//it's a little awkward, but we are going to shuttle it into ehr.snomap
//we do this b/c that hard table is going to be used long term and the ETL doesnt support hard tables
var toInsert = [];



function afterInsert(row, errors){
    //console.log(row)
    LABKEY.Query.insertRows({
        schemaName: 'ehr_lookups',
        queryName: 'snomap',
        extraContext: {
            dataSource: 'etl'
        },
        rows: [{
            ocode: row.ocode,
            ncode: row.ncode,
            meaning: row.meaning,
            date: (row.date ? row.date.toLocaleString() : null),
            objectid: row.objectid
        }],
        success: function(data){
            console.log('Success cascade inserting into snomap');
        },
        failure: function(error){
            console.log(error.exception);
            console.log(error);
            throw "Error inserting into snomap";
        }
    });
}




function afterDelete(row, errors){
    var code;
    if(row.objectid){
        LABKEY.Query.selectRows({
            schemaName: 'ehr_lookups',
            queryName: 'snomap',
            filterArray: [
                LABKEY.Filter.create('objectid', row.objectid, LABKEY.Filter.Types.EQUAL)
            ],
            extraContext: {
                dataSource: 'etl'
            },
            success: function(data){
                if(data.rows && data.rows.length){
                    code = data.rows[0].rowid;
                }
            },
            failure: function(error){
                console.log(error.message);
            }
        });
    }

    if(code){
        LABKEY.Query.deleteRows({
            schemaName: 'ehr_lookups',
            queryName: 'snomap',
            rows: [{
                rowid: code
            }],
            extraContext: {
                dataSource: 'etl'
            },
            failure: function(error){
                console.log(error.message);
                throw "Error deleting from snomap";
            }
        });
    }
}
