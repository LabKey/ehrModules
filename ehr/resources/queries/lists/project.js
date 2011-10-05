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


function afterInsert(row, errors){
    console.log('insert: '+row);
    if(row.project){
        LABKEY.Query.insertRows({
            schemaName: 'ehr',
            queryName: 'Project',
            extraContext: {
                dataSource: 'etl'
            },
            rows: [{
                project: row.project,
                protocol: row.protocol,
                account: row.account,
                inves: row.inves,
                avail: row.avail,
                title: row.title,
                research: row.research,
                reqname: row.reqname
            }],
            success: function(data){
                console.log('Success cascade inserting into ehr.project')
            },
            failure: function(error){
                console.log(error.exception);
                console.log(error);
                throw "Error inserting into ehr.project";
            }
        });
    }
    else {
        console.log('ERROR: lacking project');
        console.log(row);
    }
}

function afterUpdate(row, errors){
    var oldRow;
    LABKEY.Query.selectRows({
        schemaName: 'ehr',
        queryName: 'Project',
        filterArray: [
            LABKEY.Filter.create('project', row.project, LABKEY.Filter.Types.EQUAL)
        ],
        extraContext: {
            dataSource: 'etl'
        },
        success: function(data){
            if(data.rows && data.rows.length){
                oldRow = data.rows[0].project;
            }
        },
        scope: this,
        failure: function(error){
            console.log(error.message);
            console.log(error);
            console.log(row);
        }
    });

    if(oldRow){
        LABKEY.Query.updateRows({
            schemaName: 'ehr',
            queryName: 'Project',
            extraContext: {
                dataSource: 'etl'
            },
            rows: [{
                project: row.project,
                protocol: row.protocol,
                account: row.account,
                inves: row.inves,
                avail: row.avail,
                title: row.title,
                research: row.research,
                reqname: row.reqname
            }],
            success: function(data){
                console.log('Success cascade updating into ehr.project')
            },
            scope: this,
            failure: function(error){
                console.log(error.exception);
                console.log(row)
                console.log(error);
                throw "Error updating ehr.project";
            }
        });
    }
}


function afterDelete(row, errors){
    var project;
    LABKEY.Query.selectRows({
        schemaName: 'ehr',
        queryName: 'Project',
        filterArray: [
            LABKEY.Filter.create('project', row.project, LABKEY.Filter.Types.EQUAL)
        ],
        extraContext: {
            dataSource: 'etl'
        },
        success: function(data){
            if(data.rows && data.rows.length){
                project = data.rows[0].project;
            }
        },
        failure: function(error){
            console.log(error.message);
        }
    });

    if(project){
        LABKEY.Query.deleteRows({
            schemaName: 'ehr',
            queryName: 'Project',
            rows: [{
                project: project
            }],
            extraContext: {
                dataSource: 'etl'
            },
            scope: this,
            failure: function(error){
                console.log(row);
                console.log(error.message);
            }
        });
    }
}
