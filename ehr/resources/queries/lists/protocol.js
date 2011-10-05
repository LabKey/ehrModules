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

//NOTE: old snomed are going to be sycned through the ETL
//it's a little awkward, but we are going to shuttle it into ehr.snomed
//we do this b/c that hard table is going to be used long term and the ETL doesnt support hard tables

function beforeInsert(row, errors){
    beforeBoth(errors, row);
}

function beforeUpdate(row, oldRow, errors){
    beforeBoth(errors, row, oldRow);
}


function beforeBoth(errors, row, oldRow){

    if(row.protocol)
        row.protocol = row.protocol.toLowerCase();
}



function afterInsert(row, errors){
    if(row.protocol){
        LABKEY.Query.insertRows({
            schemaName: 'ehr',
            queryName: 'protocol',
            rows: [{
                protocol: row.protocol,
                inves: row.inves,
                approve: (row.approve ? row.approve.toLocaleString() : null)
            }],
            success: function(data){
                console.log('Success cascade inserting into ehr.protocol')
            },
            failure: function(error){
                console.log(error.exception);
                console.log(error);
                throw "Error inserting into ehr.protocol";
            }
        });
    }
    else {
        console.log('ERROR: lacking protocol')
        console.log(row);
    }
}

function afterUpdate(row, errors){
    var protocol;
    if(row.approve)
        row.approve = new Date(row.approve.toGMTString());

    LABKEY.Query.selectRows({
        schemaName: 'ehr',
        queryName: 'protocol',
        filterArray: [
            LABKEY.Filter.create('protocol', row.protocol, LABKEY.Filter.Types.EQUAL)
        ],
        extraContext: {
            dataSource: 'etl'
        },
        success: function(data){
            if(data.rows && data.rows.length){
                protocol = data.rows[0].protocol;
            }
        },
        failure: function(error){
            console.log(error.message);
        }
    });

    if(protocol){
        LABKEY.Query.updateRows({
            schemaName: 'ehr',
            queryName: 'protocol',
            extraContext: {
                dataSource: 'etl'
            },
            rows: [{
                protocol: row.protocol,
                inves: row.inves,
                approve: row.approve,
                description: row.description
            }],
            success: function(data){
                console.log('Success cascade updating into ehr.protocol')
            },
            failure: function(error){
                console.log(error.exception);
                console.log(error);
                throw "Error updating ehr.protocol";
            }
        });
    }
}


function afterDelete(row, errors){
    var protocol;
    LABKEY.Query.selectRows({
        schemaName: 'ehr',
        queryName: 'protocol',
        filterArray: [
            LABKEY.Filter.create('protocol', row.protocol, LABKEY.Filter.Types.EQUAL)
        ],
        extraContext: {
            dataSource: 'etl'
        },
        success: function(data){
            if(data.rows && data.rows.length){
                protocol = data.rows[0].protocol;
            }
        },
        failure: function(error){
            console.log(error.message);
        }
    });

    if(protocol){
        LABKEY.Query.deleteRows({
            schemaName: 'ehr',
            queryName: 'protocol',
            rows: [{
                protocol: protocol
            }],
            extraContext: {
                dataSource: 'etl'
            },
            failure: function(error){
                console.log(error.message);
            }
        });
    }
}

