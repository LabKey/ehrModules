/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var console = require("console");
var LABKEY = require("labkey");
//var Ext = require("Ext").Ext;


function beforeInsert(row, errors){
    beforeBoth(errors, row);
}

function beforeUpdate(row, oldRow, errors){
    beforeBoth(errors, row, oldRow);
}


function beforeBoth(errors, row, oldRow){
    if(row.protocol)
        row.protocol = row.protocol.toLowerCase();

    if(row.species){
        if(row.species.match(/cyno/i)){
            row.species = 'Cynomolgus';
        }
        else if(row.species.match(/rhesus/i)){
            row.species = 'Rhesus';
        }
        if(row.species.match(/vervet/i)){
            row.species = 'Vervet';
        }
        if(row.species.match(/pigtail/i)){
            row.species = 'Pigtail';
        }
        if(row.species.match(/marmoset/i)){
            row.species = 'Marmoset';
        }
    }
}

function afterInsert(row, errors){
    if(row.protocol && row.species){
        LABKEY.Query.insertRows({
            schemaName: 'ehr',
            queryName: 'protocol_counts',
            extraContext: {
                dataSource: 'etl'
            },
            rows: [{
                protocol: row.protocol,
                species: row.species,
                allowed: row.allowed
            }],
//            success: function(data){
//                console.log('Success cascade inserting into ehr.protocol_counts')
//            },
            failure: function(error){
                console.log(error.exception);
                console.log(error);
                throw "Error inserting into ehr.protocol_counts";
            }
        });
    }
    else {
        console.log('ERROR: lacking protocol or species')
        console.log(row);
    }
}

function afterUpdate(row, errors){
    var RowId;
    LABKEY.Query.selectRows({
        schemaName: 'ehr',
        queryName: 'protocol_counts',
        filterArray: [
            LABKEY.Filter.create('protocol', row.protocol, LABKEY.Filter.Types.EQUAL),
            LABKEY.Filter.create('species', row.species, LABKEY.Filter.Types.EQUAL)
        ],
        extraContext: {
            dataSource: 'etl'
        },
        success: function(data){
            if(data.rows && data.rows.length){
                RowId = data.rows[0].RowId;
            }
        },
        failure: function(error){
            console.log(error.message);
        }
    });

    if(RowId){
        LABKEY.Query.updateRows({
            schemaName: 'ehr',
            queryName: 'protocol_counts',
            extraContext: {
                dataSource: 'etl'
            },
            rows: [{
                protocol: row.protocol,
                species: row.species,
                allowed: row.allowed
            }],
//            success: function(data){
//                console.log('Success cascade updating into ehr.protocol_counts')
//            },
            failure: function(error){
                console.log(error.exception);
                console.log(error);
                throw "Error updating ehr.protocol_counts";
            }
        });
    }
}


function afterDelete(row, errors){
    var RowId;
    LABKEY.Query.selectRows({
        schemaName: 'ehr',
        queryName: 'protocol_counts',
        filterArray: [
            LABKEY.Filter.create('protocol', row.protocol, LABKEY.Filter.Types.EQUAL),
            LABKEY.Filter.create('species', row.species, LABKEY.Filter.Types.EQUAL)
        ],
        extraContext: {
            dataSource: 'etl'
        },
        success: function(data){
            if(data.rows && data.rows.length){
                RowId = data.rows[0].RowId;
            }
        },
        failure: function(error){
            console.log(error.message);
        }
    });

    if(RowId){
        LABKEY.Query.deleteRows({
            schemaName: 'ehr',
            queryName: 'protocol_counts',
            rows: [{
                RowId: RowId
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

