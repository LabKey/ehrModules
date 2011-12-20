/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");



function onUpsert(context, errors, row, oldRow){
    //check for existing animals in this room/cage
    if(context.extraContext.dataSource != 'etl' && !context.extraContext.quickValidation && row.room && row.cage){
        LABKEY.Query.executeSql({
            schemaName: 'study',
            scope: this,
            sql: "SELECT group_concat(h.Id) as Ids, count(h.Id) as num FROM (select case when (enddate is null) then (h.Id||'*') else h.Id end as id from study.housing h WHERE h.room='"+row.room+"' AND h.cage='"+row.cage+"' AND h.id != '"+row.Id+"' and (h.enddate is null or h.enddate >= '"+row.date+"')) h",
            success: function(data){
                if(data.rows && data.rows.length){
                    row['id/numroommates/cagemates'] = (data.rows[0].num ? ('('+data.rows[0].num+') ') + data.rows[0].Ids.join(',') : ' ');
                }
            },
            failure: EHR.Server.Utils.onFailure
        });

    }

    if(context.extraContext.dataSource != 'etl'){
        if(row.cond && row.cond.match(/x/) && !row.remark){
            EHR.Server.Validation.addError(errors, 'cond', 'If you pick a special housing condition (x), you need to enter a remark stating the type');
        }
    }
}


function onComplete(event, errors, scriptContext){

    //NOTE: we assume that onBecomePublic() enforces only 1 active housing record per animal
//    if(scriptContext.publicParticipantsModified.length){
//        var toUpdate = [];
//        var idsFound = [];
//        var totalIds = {};
//        LABKEY.Query.executeSql({
//            schemaName: 'study',
//            scope: this,
//            sql: 'SELECT a.Id, a.room, a.cage, a.cond FROM study.housing a WHERE a.id IN (\''+scriptContext.publicParticipantsModified.join(',')+'\') ' +
//                'AND a.enddate IS NULL AND a.qcstate.publicdata = true',
//            success: function(data){
//                if(data.rows && data.rows.length){
//                    var row;
//                    for (var i=0;i<data.rows.length;i++){
//                        row = data.rows[i];
//                        idsFound.push(row.Id);
//
//                        if(totalIds[row.Id]){
//                            //raise alert for duplicate active rooms
//                            console.log("ERROR: there are two active housing records for: "+row.Id);
//                            //throw "ERROR: there are two active housing records for: "+row.Id;
//                        }
//
//                        totalIds[row.Id] = 1;
//                        EHR.Server.Validation.findDemographics({
//                            participant: row.Id,
//                            scriptContext: scriptContext,
//                            forceRefresh: true,
//                            scope: this,
//                            callback: function(data){
//                                if(data){
//console.log(data)
//                                    if(row.room != data.room || row.cage != data.cage || row.cond != data.cond)
//                                        toUpdate.push({room: row.room, cage: row.cage, cond: row.cond, Id: row.Id, lsid: data.lsid});
//                                }
//                            }
//                        });
//                    }
//                }
//            },
//            failure: EHR.Server.Utils.onFailure
//        });
//
//        if(toUpdate.length != scriptContext.publicParticipantsModified.length){
//            Ext.each(scriptContext.publicParticipantsModified, function(p){
//                if(idsFound.indexOf(p) == -1){
//                    EHR.Server.Validation.findDemographics({
//                        participant: p,
//                        scriptContext: scriptContext,
//                        forceRefresh: true,
//                        scope: this,
//                        callback: function(data){
//                            if(data){
//                                toUpdate.push({room: null, cage: null, cond: null, Id: data.Id, lsid: data.lsid});
//                            }
//                        }
//                    });
//                }
//            }, this);
//        }
//
//        if(toUpdate.length){
//            LABKEY.Query.updateRows({
//                schemaName: 'study',
//                queryName: 'ActiveHousing',
//                extraContext: {
//                    schemaName: 'study',
//                    queryName: 'ActiveHousing'
//                },
//                rows: toUpdate,
//                success: function(data){
//                    console.log('Success updating ActiveHousing')
//                },
//                failure: EHR.Server.Utils.onFailure
//            });
//        }
//        throw 'error';
//    }

};

function onBecomePublic(errors, scriptContext, row, oldRow){
    //console.log('on become public')
    //if this record is active and public, deactivate any old housing records
    if(scriptContext.extraContext.dataSource != 'etl' && !row.enddate){
        var toUpdate = [];
        LABKEY.Query.selectRows({
            schemaName: 'study',
            queryName: 'housing',
            columns: 'lsid,id,date',
            ignoreFilter: 1,
            filterArray: [
                LABKEY.Filter.create('Id', row.Id, LABKEY.Filter.Types.EQUAL),
                LABKEY.Filter.create('enddate', null, LABKEY.Filter.Types.ISBLANK),
                //LABKEY.Filter.create('date', row.Date, LABKEY.Filter.Types.LESS_THAN),
                LABKEY.Filter.create('lsid', row.lsid, LABKEY.Filter.Types.NEQ)
                //LABKEY.Filter.create('qcstate/publicdata', true, LABKEY.Filter.Types.EQUAL)
            ],
            scope: this,
            success: function(data){
                if(data && data.rows && data.rows.length){
                    var r;
                    for(var i=0;i<data.rows.length;i++){
                        r = data.rows[i];

                        toUpdate.push({lsid: r.lsid, enddate: new Date(row.date.toGMTString())});

                        //if there's an existing public active housing record
                        if(Date.parse(row.date.toGMTString()) < Date.parse(r.date)){
                            EHR.Server.Validation.addError(errors, 'Id', 'You cannot enter an open ended housing while there is another record starting on: '+r.date);
                            toUpdate = [];
                            return false;
                        }
                    };

                }
            },
            failure: EHR.Server.Utils.onFailure
        });

        if(toUpdate.length){
            LABKEY.Query.updateRows({
                schemaName: 'study',
                queryName: 'Housing',
                extraContext: {
                    quickValidation: true
                },
                rows: toUpdate,
                success: function(data){
                    console.log('Success deactivating old housing records')
                },
                failure: EHR.Server.Utils.onFailure
            });
        }

    }
}

function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if (row.room)
        description.push('Room: '+ row.room);
    if (row.cage)
        description.push('Cage: '+ row.cage);
    if (row.cond)
        description.push('Condition: '+ row.cond);

    description.push('In Time: '+ row.Date);
    description.push('Out Time: '+ EHR.Server.Validation.nullToString(row.enddate));

    return description;
}
