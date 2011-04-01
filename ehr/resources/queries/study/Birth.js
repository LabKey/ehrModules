/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");



function onComplete(event, errors, scriptContext){
    if(scriptContext.publicParticipantsModified.length){
        var toUpdate = [];
        var idsFound = [];
        LABKEY.Query.executeSql({
            schemaName: 'study',
            scope: this,
            sql: 'SELECT a.Id, a.date FROM study.birth a ' +
                'WHERE a.id IN (\''+scriptContext.publicParticipantsModified.join(',')+'\') AND a.qcstate.publicdata = true',
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
                                    if(row.date != data.birth)
                                        toUpdate.push({birth: row.date, dam: row.dam, sire: row.sire, Id: row.Id, lsid: data.lsid});
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
                                toUpdate.push({birth: null, Id: data.Id, lsid: data.lsid});
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
                    console.log('Success updating demographics for birth')
                },
                failure: EHR.onFailure
            });
        }
    }
};


function onBecomePublic(errors, context, row, oldRow){
    //TODO: update major events table

}

function onDelete(errors, context, row){
    //TODO: cascade delete to major events table
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

