/*
 * Copyright (c) 2010-2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

require("ehr/triggers").initScript(this);

function onInit(event, context){
    context.allowDeadIds = true;
    context.extraContext.allowAnyId = true;
    context.extraContext = context.extraContext || {};
    context.extraContext.skipIdFormatCheck = true;
}

function onBecomePublic(errors, scriptContext, row, oldRow){
    if(scriptContext.extraContext.dataSource != 'etl' && !row.skipDemographicsAdd){
        //if a weight is provided, we insert into the weight table:
        if(row.weight && row.wdate){
            LABKEY.Query.insertRows({
                schemaName: 'study',
                queryName: 'Weight',
                rows: [{Id: row.Id, date: new Date(row.wdate.toGMTString()), weight: row.weight}],
                extraContext: {
                    quickValidation: true
                },
                success: function(data){
                    console.log('Success updating weight table from birth')
                },
                failure: EHR.Server.Utils.onFailure
            });
        }

        //if room provided, we insert into housing
        if(row.room && row.cage){
            LABKEY.Query.insertRows({
                schemaName: 'study',
                queryName: 'Housing',
                extraContext: {
                    quickValidation: true
                },
                rows: [{Id: row.Id, room: row.room, cage: row.cage, cond: row.cond, date: new Date(row.date.toGMTString())}],
                success: function(data){
                    console.log('Success updating housing table from birth')
                },
                failure: EHR.Server.Utils.onFailure
            });
        }

        //if not already present, we insert into demographics
        if(!row.notAtCenter){
            EHR.Server.Validation.findDemographics({
                participant: row.Id,
                scriptContext: scriptContext,
                scope: this,
                callback: function(data){
                    if(!data){
                        LABKEY.Query.insertRows({
                            schemaName: 'study',
                            queryName: 'Demographics',
                            extraContext: {
                                quickValidation: true
                            },
                            rows: [{Id: row.Id, gender: row.gender, dam: row.dam, sire: row.sire, origin: row.origin, birth: new Date(row.date.toGMTString()), date: new Date(row.date.toGMTString())}],
                            success: function(data){
                                console.log('Success updating demographics table from birth')
                            },
                            failure: EHR.Server.Utils.onFailure
                        });
                    }
                }
            });
        }
    }
}

function onComplete(event, errors, scriptContext){
    if(scriptContext.publicParticipantsModified.length && scriptContext.extraContext.dataSource != 'etl'){
        var valuesMap = {};
        var r;
        for(var i=0;i<scriptContext.rows.length;i++){
            r = scriptContext.rows[i];
            valuesMap[r.row.Id] = {};
            valuesMap[r.row.Id].birth = r.row.date;
        };
        EHR.Server.Validation.updateStatusField(scriptContext.publicParticipantsModified, null, valuesMap);
    }
}

function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if(row.conception)
        description.push('Conception: '+ row.conception);

    if(row.gender)
        description.push('Gender: '+ EHR.Server.Validation.nullToString(row.gender));
    if(row.dam)
        description.push('Dam: '+ EHR.Server.Validation.nullToString(row.dam));
    if(row.sire)
        description.push('Sire: '+ EHR.Server.Validation.nullToString(row.sire));
    if(row.room)
        description.push('Room: '+ EHR.Server.Validation.nullToString(row.room));
    if(row.cage)
        description.push('Cage: '+ EHR.Server.Validation.nullToString(row.cage));
    if(row.cond)
        description.push('Cond: '+ EHR.Server.Validation.nullToString(row.cond));
    if(row.weight)
        description.push('Weight: '+ EHR.Server.Validation.nullToString(row.weight));
    if(row.wdate)
        description.push('Weigh Date: '+ EHR.Server.Validation.nullToString(row.wdate));
    if(row.origin)
        description.push('Origin: '+ row.origin);
    if(row.type)
        description.push('Type: '+ row.type);

    return description;
}