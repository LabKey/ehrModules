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
var toInsert = [];



function afterInsert(row, errors){
    LABKEY.Query.insertRows({
        schemaName: 'ehr_lookups',
        queryName: 'full_snomed',
        extraContext: {
            dataSource: 'etl'
        },
        rows: [{
            code: row.code,
            meaning: row.meaning
        }],
        success: function(data){
//            console.log('Success cascade inserting into full_snomed')
        },
        failure: function(error){
            console.log(error.exception);
            console.log(error);
            throw "Error inserting into full_snomed";
        }
    });
}




function afterDelete(row, errors){
    var code;
    LABKEY.Query.selectRows({
        schemaName: 'ehr_lookups',
        queryName: 'full_snomed',
        filterArray: [
            LABKEY.Filter.create('code', row.code, LABKEY.Filter.Types.EQUAL)
        ],
        extraContext: {
            dataSource: 'etl'
        },
        success: function(data){
            if(data.rows && data.rows.length){
                code = data.rows[0].code;
            }
        },
        failure: function(error){
            console.log(error.message);
        }
    });

    if(code){
        LABKEY.Query.deleteRows({
            schemaName: 'ehr_lookups',
            queryName: 'full_snomed',
            rows: [{
                code: code
            }],
            extraContext: {
                dataSource: 'etl'
            },
            failure: function(error){
                console.log(error.message);
                throw "Error deleting from full_snomed";
            }
        });
    }
}
