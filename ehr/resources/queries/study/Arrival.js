/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

require("ehr/triggers").initScript(this);

function onInit(event, context){
    context.extraContext.allowAnyId = true;
}

function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if (row.source)
        description.push('Source: ' + row.source);

    return description;
}

function onBecomePublic(errors, scriptContext, row, oldRow){
    if(scriptContext.extraContext.dataSource != 'etl'){
        //if not already present, we insert into demographics
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
                        rows: [{Id: row.Id, gender: row.gender, species: row.species, dam: row.dam, sire: row.sire, origin: row.source, geographic_origin: row.geographic_origin, birth: new Date(row.birth.getTime()), date: new Date(row.birth.getTime())}],
                        success: function(data){
                            console.log('Success inserting into demographics table from arrival')
                        },
                        failure: EHR.Server.Utils.onFailure
                    });

//                    if(row.birth){
//                        LABKEY.Query.insertRows({
//                            schemaName: 'study',
//                            queryName: 'Birth',
//                            extraContext: {
//                                quickValidation: true
//                            },
//                            rows: [{Id: row.Id, date: new Date(row.birth.getTime()), dam: row.dam, sire: row.sire, skipDemographicsAdd: true}],
//                            success: function(data){
//                                console.log('Success inserting into birth table from arrival')
//                            },
//                            failure: EHR.Server.Utils.onFailure
//                        });
//                    }
                }
            }
        });

        //if room provided, we insert into housing
        if(row.initialRoom && row.initialCage){
            LABKEY.Query.insertRows({
                schemaName: 'study',
                queryName: 'Housing',
                extraContext: {
                    quickValidation: true
                },
                rows: [{Id: row.Id, room: row.initialRoom, cage: row.initialCage, cond: row.initialCond, date: new Date(row.date.getTime())}],
                success: function(data){
                    console.log('Success inserting into housing table from arrival')
                },
                failure: EHR.Server.Utils.onFailure
            });
        }
    }
}

function onComplete(event, errors, scriptContext){
    if(scriptContext.publicParticipantsModified.length && scriptContext.extraContext.dataSource != 'etl'){
        EHR.Server.Validation.updateStatusField(scriptContext.publicParticipantsModified);
    }
}
