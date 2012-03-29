/*
 * Copyright (c) 2011-2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
var LABKEY = require("labkey");
var console = require("console");

function updateTable(errors, row, oldRow, schemaName, tableName, pk, sourceField, targetField, containerPath){
    var toUpdate = [];
    var success;

    console.log('Updating records in table: '+tableName);

    LABKEY.Query.selectRows({
        containerPath: containerPath,
        schemaName: schemaName,
        queryName: tableName,
        scope: this,
        filterArray: [
            LABKEY.Filter.create(targetField, oldRow[sourceField], LABKEY.Filter.Types.EQUAL)
        ],
        success: function(data){
            if(data.rows && data.rows.length){
                var rowData;
                for (var i=0;i<data.rows.length;i++){
                    rowData = data.rows[i];
                    var object = {};
                    object[pk] = rowData[pk];
                    object[targetField] = row[sourceField];
                    toUpdate.push(object);
                }
            }
        },
        failure: function(error){
            console.log('Select rows error');
            console.log(error);

            errors[sourceField] = 'Unable to update table: ' + tableName + ' to reflect this change';
            success = false;
        }
    });

    console.log('Records to update: '+toUpdate.length);

    if(toUpdate.length){
        LABKEY.Query.updateRows({
            containerPath: containerPath,
            schemaName: schemaName,
            queryName: tableName,
            rows: toUpdate,
            success: function(data){
                console.log('Success updating '+tableName)
            },
            failure: function(error){
                console.log('EHR compliance db updateTable.js Error');
                console.log(error);

                errors[sourceField] = 'Unable to update table: ' + tableName + ' to reflect this change';
                success = false;
            }
        });
    }

    return success !== false;
}
exports.updateTable = updateTable;