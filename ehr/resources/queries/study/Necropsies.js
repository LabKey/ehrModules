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

    description.push('Case No: '+EHR.Server.Validation.nullToString(row.caseno));

    return description;
}

function onUpsert(context, errors, row){
    if(context.extraContext.dataSource != 'etl' && row.caseno)
        EHR.Server.Validation.verifyCasenoIsUnique(context, row, errors);

    if(row.Id){
        EHR.Server.Validation.findDemographics({
            participant: row.Id,
            scriptContext: context,
            scope: this,
            callback: function(data){
                if(data){
                    if(!row.project){
                        EHR.Server.Validation.addError(errors, 'project', 'Must enter a project for all center animals.', 'WARN');
                    }
                }
            }
        });
    }
}


function onBecomePublic(errors, scriptContext, row, oldRow){
    if(scriptContext.extraContext.dataSource != 'etl'){
        //if not already present, we insert into demographics
        var doSubmit = false;
        if(row.Id.match(/^pd/)){
            doSubmit = true;
        }
        else {
            EHR.Server.Validation.findDemographics({
                participant: row.Id,
                scriptContext: scriptContext,
                scope: this,
                callback: function(data){
                    if(data){
                        doSubmit = true;
                    }
                }
            });
        }

        if(doSubmit){
            var obj = {
                Id: row.Id,
                project: row.project,
                date: (row.timeofdeath ? new Date(row.timeofdeath.toGMTString()) : null),
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
                            scope: this,
                            rows: [obj],
                            success: function(data){
                                console.log('Success updating '+queryName+' from necropsy for '+row.Id)
                            },
                            failure: EHR.Server.Utils.onFailure
                        });
                    }
                    //otherwise we create a new record
                    else {
    //                    LABKEY.Query.insertRows({
    //                        schemaName: 'study',
    //                        queryName: queryName,
    //                        scope: this,
    //                        rows: [obj],
    //                        success: function(data){
    //                            console.log('Success inserting into '+queryName+' from necropsy for '+row.Id)
    //                        },
    //                        failure: EHR.Server.Utils.onFailure
    //                    });
                        EHR.Server.Validation.addError(errors, 'Id', 'No death record exists.  Please use the button near the bottom of the page to create one.', 'ERROR');
                    }
                },
                failure: EHR.Server.Utils.onFailure
            });
        }
    }
}