/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


var {EHR, LABKEY, Ext, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");


//TODO: update housing table to end open housing records & assignments

function onComplete(event, errors, scriptContext){
    if(scriptContext.publicParticipantsModified.length){
        var valuesMap = {};
        Ext.each(scriptContext.rows, function(r){
            valuesMap[r.Id] = {};
            valuesMap[r.Id].death = r.date;
        }, this);
        EHR.validation.updateStatusField(scriptContext.publicParticipantsModified, null, valuesMap);
    }




    /*
    if(scriptContext.publicParticipantsModified.length){
        var toUpdate = [];
        var idsFound = [];
        LABKEY.Query.executeSql({
            schemaName: 'study',
            scope: this,
            sql: 'SELECT a.Id, a.date, a.cause FROM study.deaths a WHERE a.id IN (\''+scriptContext.publicParticipantsModified.join(',')+'\') AND a.qcstate.publicdata = true',
            success: function(data){
                if(data.rows && data.rows.length){
                    var row;
                    for (var i=0;i<data.rows.length;i++){
                        row = data.rows[i];
                        idsFound.push(row.Id);
                        EHR.findDemographics({
                            participant: row.Id,
                            forceRefresh: true,
                            scope: this,
                            callback: function(data){
                                if(data){
                                    if(row.date != data.death)
                                        var status;
                                        switch (row.cause){
                                            case 'experimental':

                                                break;
                                            case 'other':

                                                break;
                                            case 'clinical':

                                                break;
                                        }
                                        toUpdate.push({death: row.date, status: status, Id: row.Id, lsid: data.lsid});
                                }
                            }
                        });
                    }
                }
            },
            failure: EHR.onFailure
        });

        if(toUpdate.length != scriptContext.publicParticipantsModified.length){
            Ext.each(scriptContext.publicParticipantsModified, function(p){
                if(idsFound.indexOf(p) == -1){
                    EHR.findDemographics({
                        participant: p,
                        forceRefresh: true,
                        scope: this,
                        callback: function(data){
                            if(data){
                                toUpdate.push({death: null, Id: data.Id, lsid: data.lsid});
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
                    console.log('Success updating demographics for deaths')
                },
                failure: EHR.onFailure
            });
        }
    }
    */
};


function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if(row.cause)
        description.push('Cause: '+row.cause);
    if(row.necropsy)
        description.push('Necropsy #: '+row.necropsy);

    return description;
}

