/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");


function onUpsert(scriptContext, scriptErrors, row){
    row.performedby = row.performedby || row.userid || null;

    if(row.cage && !isNaN(row.cage)){
        row.cage = EHR.validation.padDigits(row.cage, 4);
    }

    if(row.no_observations && (row.feces || row.remark != 'ok')){
        row.no_observations = false;
    }

    //verify an animal is housed here
    if(row.Date && row.room){
        var sql = "SELECT Id, room, cage, lsid FROM study.housing h " +
        "WHERE h.room='"+row.room+"' AND " +
        "h.date <= '"+row.Date+"' AND " +
        "(h.enddate >= '"+row.Date+"' OR h.enddate IS NULL) AND " +
        "h.qcstate.publicdata = true ";

        if(row.cage)
            sql += " AND h.cage='"+row.cage+"'";
        //console.log(sql);
        LABKEY.Query.executeSql({
            schemaName: 'study',
            sql: sql,
            success: function(data){
                if(!data || !data.rows || !data.rows.length){
                    if(!row.cage)
                        EHR.addError(scriptErrors, 'room', 'No animals are housed in this room on this date', 'WARN');
                    else
                        EHR.addError(scriptErrors, 'cage', 'No animals are housed in this cage on this date', 'WARN');
                }
            },
            failure: EHR.onFailure
        });
    }
}

function onInsert(scriptContext, scriptErrors, row){
    row.objectid = row.objectid || LABKEY.Utils.generateUUID()
}

//cascade changes into study.cage observations:
function onAfterInsert(scriptContext, errors, row, oldRow){
    if(scriptContext.extraContext.dataSource != 'etl'){
        //find animals overlapping with this record
        if(row.Date && row.room){
            var sql = "SELECT Id, room, cage, lsid FROM study.housing h " +
            "WHERE h.room='"+row.room+"' AND " +
            "h.date <= '"+row.Date+"' AND " +
            "(h.enddate >= '"+row.Date+"' OR h.enddate IS NULL) AND " +
            "h.qcstate.publicdata = true ";

            if(row.cage)
                sql += " AND h.cage='"+row.cage+"'";
            //console.log(sql);
            var toInsert = [];
            LABKEY.Query.executeSql({
                schemaName: 'study',
                sql: sql,
                success: function(data){
                    if(data && data.rows && data.rows.length){
                        var obj;
                        Ext.each(data.rows, function(r){
                            obj = {Id: r.Id, QCStateLabel: row.QCStateLabel, RoomAtTime: r.room, date: new Date(row.date), observationRecord: row.objectid, housingRecord: r.lsid, remark: row.remark, taskid: row.taskid, performedby: row.performedby, feces: row.feces};

                            if(row.cage)
                                obj.CageAtTime = r.cage;

                            toInsert.push(obj);
                        }, this);
                    }
                    else {
                        console.log('No animals found in this room/cage: '+row.room + '/'+row.cage)
                    }
                },
                failure: EHR.onFailure
            });

            if(toInsert.length){
                LABKEY.Query.insertRows({
                    schemaName: 'study',
                    queryName: 'Cage Observations',
                    rows: toInsert,
                    scope: this,
                    success: function(data){
                        console.log('Success Cascade Inserting')
                    },
                    failure: function(error){
                        console.log(error.exceptionClass)
                    }
                });
            }
        }
    }
}

function onAfterUpdate(errors, scriptContext, row, oldRow){
    //find animals overlapping with this record
    if(row.Date && row.room && row.rowid){
        //first we locate existing records to avoid unnecessary inserts
        var existingRecords = [];
        var distinctIds = [];
        var existingRecordMap = {};
        LABKEY.Query.selectRows({
            schemaName: 'study',
            queryName: 'Cage Observations',
            filterArray: [
                LABKEY.Filter.create('observationRecord', row.objectid, LABKEY.Filter.Types.EQUAL),
                LABKEY.Filter.create('qcstate/label', 'Delete Requested', LABKEY.Filter.Types.NEQ)
            ],
            columns: 'lsid,id,date,remark,feces',
            scope: this,
            success: function(data){
                Ext.each(data.rows, function(r){
                    distinctIds.push(r.Id);
                    //NOTE: we assume there should only be one child per ID
                    existingRecordMap[r.Id] = r;
                    existingRecords.push(r);
                }, this);

                distinctIds = distinctIds.unique();
            },
            failure: EHR.onFailure
        });

        //then we find records that should exist
        var sql = "SELECT Id, room, cage, lsid FROM study.housing h " +
        "WHERE h.room='"+row.room+"' AND " +
        "h.date <= '"+row.Date+"' AND " +
        "(h.enddate >= '"+row.Date+"' OR h.enddate IS NULL) AND " +
        "h.qcstate.publicdata = true ";

        if(row.cage)
            sql += " AND h.cage='"+row.cage+"'";
        //console.log(sql);
        var toInsert = [];
        var toUpdate = [];
        var toDelete = [];
        var foundIds  = {};
        LABKEY.Query.executeSql({
            schemaName: 'study',
            sql: sql,
            success: function(data){
                if(data && data.rows && data.rows.length){
                    var obj;
                    Ext.each(data.rows, function(r){
                        foundIds[r.Id] = 1;

                        //only insert the row if it doesnt exist
                        if(!existingRecordMap[r.Id]){
                            obj = {Id: r.Id, QCStateLabel: row.QCStateLabel, RoomAtTime: r.room, date: new Date(row.date), observationRecord: row.objectid, housingRecord: r.lsid, remark: row.remark, taskid: row.taskid, performedby: row.performedby, feces: row.feces};

                            if(row.cage)
                                obj.CageAtTime = r.cage;

                            toInsert.push(obj);
                        }
                        else {
                            obj = {lsid: existingRecordMap[r.Id].lsid, Id: r.Id, QCStateLabel: row.QCStateLabel, RoomAtTime: r.room, date: new Date(row.date), observationRecord: row.objectid, housingRecord: r.lsid, remark: row.remark, taskid: row.taskid, performedby: row.performedby, feces: row.feces};
                            toUpdate.push(obj);
                        }
                    }, this);
                }
                else {
                    console.log('No animals found in this room/cage: '+row.room + '/'+row.cage)
                }
            },
            failure: EHR.onFailure
        });


        Ext.each(existingRecords, function(r){
            if(!foundIds[r.Id]){
                //NOTE: until delete performance is improved, we will change the QCstate instead of directly deleting
                //toDelete.push(r);

                delete r.QCState;
                r.QCStateLabel = 'Delete Requested';
                toUpdate.push(r);
            }
        }, this);

        if(toInsert.length){
            LABKEY.Query.insertRows({
                schemaName: 'study',
                queryName: 'Cage Observations',
                rows: toInsert,
                scope: this,
                success: function(data){
                    console.log('Success Cascade Inserting')
                },
                failure: function(error){
                    console.log(error.exceptionClass)
                }
            });
        }

        if(toUpdate.length){
            LABKEY.Query.insertRows({
                schemaName: 'study',
                queryName: 'Cage Observations',
                rows: toUpdate,
                scope: this,
                success: function(data){
                    console.log('Success Cascade Updating')
                },
                failure: function(error){
                    console.log(error.exceptionClass)
                }
            });
        }

        if(toDelete.length){
            LABKEY.Query.deleteRows({
                schemaName: 'study',
                queryName: 'Cage Observations',
                rows: toUpdate,
                scope: this,
                success: function(data){
                    console.log('Success Cascade Deleting')
                },
                failure: function(error){
                    console.log(error.exceptionClass)
                }
            });
        }
    }
}

//cascade delete
function onAfterDelete(scriptContext, errors, row, oldRow){
    if(scriptContext.extraContext.dataSource != 'etl'){
        var toDelete = [];
        if(row.objectid){
            LABKEY.Query.selectRows({
                schemaName: 'study',
                queryName: 'Cage Observations',
                filterArray: [
                    LABKEY.Filter.create('observationRecord', row.objectid, LABKEY.Filter.Types.EQUAL)
                ],
                scope: this,
                success: function(data){
                    Ext.each(data.rows, function(r){
                        toDelete.push({lsid: r.lsid});
                    }, this);
                },
                failure: EHR.onFailure
            });
        }
        //console.log(toDelete);
        if(toDelete.length){
            LABKEY.Query.deleteRows({
                schemaName: 'study',
                queryName: 'Cage Observations',
                rows: toDelete,
                scope: this,
                success: function(data){
                    console.log('Success Cascade Deleting');
                },
                failure: function(error){
                    console.log(error.exceptionClass)
                }
            });
        }
    }
}


function setDescription(row, errors){
    var description = ['Cage Observation'];

    if(row.feces)
        description.push('Feces: '+row.feces);

    return description;
}
