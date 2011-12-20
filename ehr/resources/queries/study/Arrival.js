/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


var {EHR, LABKEY, Ext, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");


function onInit(event, context){
    context.allowAnyId = true;
}


function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if (row.source)
        description.push('Source: ' + row.source);

    return description;
};


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
                        rows: [{Id: row.Id, gender: row.gender, species: row.species, dam: row.dam, sire: row.sire, geoOrigin: row.geoOrigin, birth: new Date(row.birth.toGMTString()), date: new Date(row.birth.toGMTString())}],
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
//                            rows: [{Id: row.Id, date: new Date(row.birth.toGMTString()), dam: row.dam, sire: row.sire, skipDemographicsAdd: true}],
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
                rows: [{Id: row.Id, room: row.initialRoom, cage: row.initialCage, cond: row.initialCond, date: new Date(row.date.toGMTString())}],
                success: function(data){
                    console.log('Success inserting into housing table from arrival')
                },
                failure: EHR.Server.Utils.onFailure
            });
        }
    }
}

function onComplete(event, errors, scriptContext){
    if(scriptContext.publicParticipantsModified.length){
        EHR.Server.Validation.updateStatusField(scriptContext.publicParticipantsModified);
    }
/*
    //NOTE: we will no longer cache this in demographics
    //we will update the demographics table arrivedate field for all publicParticipantsModified
    if(scriptContext.publicParticipantsModified.length){
        //find the most recent arrival date per participant
        var toUpdate = [];
        var idsFound = [];
        LABKEY.Query.executeSql({
            schemaName: 'study',
            scope: this,
            sql: 'SELECT a.Id, max(a.date) as maxDate FROM study.arrival a ' +
                'WHERE a.id IN (\''+scriptContext.publicParticipantsModified.join(',')+'\') AND a.qcstate.publicdata = true ' +
                'GROUP BY a.id',
            success: function(data){
                if(data.rows && data.rows.length){
                    var row;
                    for (var i=0;i<data.rows.length;i++){
                        row = data.rows[i];
                        EHR.Server.Validation.findDemographics({
                            participant: row.Id,
                            scope: this,
                            scriptContext: scriptContext,
                            forceRefresh: true,
                            callback: function(data){
                                if(data){
                                    if(row.maxDate != data.arrivedate)
                                        toUpdate.push({arrivedate: row.maxDate, Id: row.Id, lsid: data.lsid});
                                }
                            }
                        });
                    }
                }
            },
            failure: EHR.Server.Utils.onFailure
        });

        if(toUpdate.length != scriptContext.publicParticipantsModified.length){
            Ext.each(scriptContext.publicParticipantsModified, function(p){
                if(idsFound.indexOf(p) == -1){
                    EHR.Server.Validation.findDemographics({
                        participant: p,
                        forceRefresh: true,
                        scriptContext: scriptContext,
                        scope: this,
                        callback: function(data){
                            if(data){
                                toUpdate.push({arrivedate: null, Id: data.Id, lsid: data.lsid});
                            }
                        }
                    });
                }
            }, this);
        }

        if(toUpdate.length){
            LABKEY.Query.updateRows({
                schemaName: 'study',
                queryName: 'demographics',
                extraContext: {
                    schemaName: 'study',
                    queryName: 'Demographics'
                },
                rows: toUpdate,
                success: function(data){
                    console.log('Success updating demographics')
                },
                failure: EHR.Server.Utils.onFailure
            });
        }
    }
*/

};

