/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");


function onInit(event, context){
    context.allowDeadIds = true;
    context.allowAnyId = true;
    context.extraContext = context.extraContext || {};
    context.extraContext.skipIdFormatCheck = true;
}


function onETL(row, errors){
    if(row.caseno)
        EHR.ETL.fixPathCaseNo(row, errors, 'a|c|e');
}

function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    description.push('Case No: '+EHR.validation.nullToString(row.caseno));

    return description;
}

function onUpsert(context, errors, row){
    if(context.extraContext.dataSource != 'etl' && row.caseno)
        EHR.validation.verifyCasenoIsUnique(context, row, errors)
}


function onBecomePublic(errors, scriptContext, row, oldRow){
    if(scriptContext.extraContext.dataSource != 'etl'){
        var obj = {
            Id: row.Id,
            date: row.timeofdeath,
            cause: row.causeofdeath,
            manner: row.mannerofdeath,
            necropsy: row.caseno,
            parentid: row.objectid
        };

        var queryName;
        if(row.Id.match(/^pd/))
            queryName = 'Prenatal Deaths';
        else
            queryName = 'Deaths';

        //we look for a deaths record
        LABKEY.Query.selectRows({
            schemaName: 'study',
            queryName: queryName,
            filterArray: [
                LABKEY.Filter.create('Id', row.Id, LABKEY.Filter.Types.EQUAL)
            ],
            success: function(data){
                if(data && data.rows && data.rows.length){
                    obj.lsid = data.rows[0].lsid;
                    LABKEY.Query.updateRows({
                        schemaName: 'study',
                        queryName: queryName,
                        rows: [obj],
                        success: function(data){
                            console.log('Success updating '+queryName+' from necropsy for '+row.Id)
                        },
                        failure: EHR.onFailure
                    });
                }
                //otherwise we create a new record
                else {
//                    LABKEY.Query.insertRows({
//                        schemaName: 'study',
//                        queryName: queryName,
//                        rows: [obj],
//                        success: function(data){
//                            console.log('Success inserting into '+queryName+' from necropsy for '+row.Id)
//                        },
//                        failure: EHR.onFailure
//                    });
                    EHR.addError(errors, 'Id', 'No death record exists.  Please use the button near the bottom of the page to create one.', 'ERROR');
                }
            },
            failure: EHR.onFailure
        });
    }
}