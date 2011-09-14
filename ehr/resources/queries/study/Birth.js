/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");


function onBecomePublic(errors, scriptContext, row, oldRow){
    if(scriptContext.extraContext.dataSource != 'etl' && !row.skipDemographicsAdd){
        //if a weight is provided, we insert into the weight table:
        if(row.weight && row.wdate){
            LABKEY.Query.insertRows({
                schemaName: 'study',
                queryName: 'Weight',
                rows: [{Id: row.Id, date: new Date(row.wdate.toGMTString()), weight: row.weight}],
                success: function(data){
                    console.log('Success updating weight table from birth')
                },
                failure: EHR.onFailure
            });
        }

        //if room provided, we insert into housing
        if(row.room && row.cage){
            LABKEY.Query.insertRows({
                schemaName: 'study',
                queryName: 'Housing',
                rows: [{Id: row.Id, room: row.room, cage: row.cage, cond: row.cond, date: new Date(row.date.toGMTString())}],
                success: function(data){
                    console.log('Success updating housing table from birth')
                },
                failure: EHR.onFailure
            });
        }

        //if not already present, we insert into demographics
        EHR.findDemographics({
            participant: row.Id,
            scope: this,
            callback: function(data){
                if(!data){
                    LABKEY.Query.insertRows({
                        schemaName: 'study',
                        queryName: 'Demographics',
                        extraContext: {
                            schemaName: 'study',
                            queryName: 'Demographics'
                        },
                        rows: [{Id: row.Id, gender: row.gender, dam: row.dam, sire: row.sire, origin: row.origin, birth: new Date(row.date.toGMTString()), date: new Date(row.date.toGMTString())}],
                        success: function(data){
                            console.log('Success updating demographics table from birth')
                        },
                        failure: EHR.onFailure
                    });
                }
            }
        });
    }
}

function onComplete(event, errors, scriptContext){
    if(scriptContext.publicParticipantsModified.length){
        var valuesMap = {};
        Ext.each(scriptContext.rows, function(r){
            valuesMap[r.Id] = {};
            valuesMap[r.Id].birth = r.date;
        }, this);
        EHR.validation.updateStatusField(scriptContext.publicParticipantsModified, null, valuesMap);
    }
}

function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if(row.conception)
        description.push('Conception: '+ row.conception);

    if(row.gender)
        description.push('Gender: '+ EHR.validation.nullToString(row.gender));
    if(row.dam)
        description.push('Dam: '+ EHR.validation.nullToString(row.dam));
    if(row.sire)
        description.push('Sire: '+ EHR.validation.nullToString(row.sire));
    if(row.room)
        description.push('Room: '+ EHR.validation.nullToString(row.room));
    if(row.cage)
        description.push('Cage: '+ EHR.validation.nullToString(row.cage));
    if(row.cond)
        description.push('Cond: '+ EHR.validation.nullToString(row.cond));
    if(row.weight)
        description.push('Weight: '+ EHR.validation.nullToString(row.weight));
    if(row.wdate)
        description.push('Weigh Date: '+ EHR.validation.nullToString(row.wdate));
    if(row.origin)
        description.push('Origin: '+ row.origin);
    if(row.type)
        description.push('Type: '+ row.type);

    return description;
}

function onInit(event, context){
    context.allowDeadIds = true;
    context.allowAnyId = true;
    context.extraContext = context.extraContext || {};
    context.extraContext.skipIdFormatCheck = true;
}