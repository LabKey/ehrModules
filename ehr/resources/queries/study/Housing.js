/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");



function onUpsert(context, errors, row, oldRow){
    if(row.dataSource != 'etl' && row.room && row.cage){
        var cageRow;
        LABKEY.Query.executeSql({
            schemaName: 'study',
            scope: this,
            sql: "SELECT * from ehr_lookups.cage c WHERE c.room='"+row.room+"' AND c.cage='"+row.cage+"'",
            success: function(data){
                if(data.rows && data.rows.length){
                    cageRow = data.rows[0];
                }
            },
            failure: EHR.onFailure
        });

        if(cageRow){
            LABKEY.Query.executeSql({
                schemaName: 'study',
                scope: this,
                sql: "SELECT * from study.demographicsCageClass c WHERE c.id='"+row.Id+"'",
                success: function(data){
                    if(data.rows && data.rows.length){
                        var r = data.rows[0];
                        if(cageRow.length*cageRow.width < r.ReqSqFt){
                            EHR.addError(errors, 'room', 'Animal too large for this cage. Required SqFt: '+r.ReqSqFt, 'INFO');
                        }
                        if(cageRow.height < r.ReqHeight){
                            EHR.addError(errors, 'room', 'Animal too large for this cage. Required Height: '+r.ReqHeight, 'INFO');
                        }

                    }
                },
                failure: EHR.onFailure
            });
        }
    }


}


function onComplete(event, errors, scriptContext){
    //NOTE: we assume that onBecomePublic() enforces only 1 active housing record per animal
    if(scriptContext.publicParticipantsModified.length){
        var toUpdate = [];
        var idsFound = [];
        var totalIds = {};
        LABKEY.Query.executeSql({
            schemaName: 'study',
            scope: this,
            sql: 'SELECT a.Id, a.room, a.cage, a.cond FROM study.housing a WHERE a.id IN (\''+scriptContext.publicParticipantsModified.join(',')+'\') ' +
                'AND a.enddate IS NULL AND a.qcstate.publicdata = true',
            success: function(data){
                if(data.rows && data.rows.length){
                    var row;
                    for (var i=0;i<data.rows.length;i++){
                        row = data.rows[i];
                        idsFound.push(row.Id);

                        if(totalIds[row.Id]){
                            //raise alert for duplicate active rooms
                            //throw "ERROR: there are two active housing records for: "+row.Id;
                        }

                        totalIds[row.Id] = 1;
                        EHR.findDemographics({
                            participant: row.Id,
                            forceRefresh: true,
                            scope: this,
                            callback: function(data){
                                if(data){
                                    if(row.room != data.room || row.cage != data.cage || row.cond != data.cond)
                                        toUpdate.push({room: row.room, cage: row.cage, cond: row.cond, Id: row.Id, lsid: data.lsid});
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
                                toUpdate.push({room: null, cage: null, cond: null, Id: data.Id, lsid: data.lsid});
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
                failure: EHR.onFailure
            });
        }
    }
};

function onBecomePublic(errors, scriptContext, row, oldRow){
    //if this record is active and public, deactivate any old housing records
    if(row.dataSource != 'etl' && !row.enddate){
        var toUpdate = [];
        LABKEY.Query.selectRows({
            schemaName: 'study',
            queryName: 'housing',
            columns: 'lsid,id,date',
            filterArray: [
                LABKEY.Filter.create('Id', row.Id, LABKEY.Filter.Types.EQUAL),
                LABKEY.Filter.create('enddate', null, LABKEY.Filter.Types.ISBLANK),
                LABKEY.Filter.create('date', row.Date, LABKEY.Filter.Types.LESS_THAN),
                LABKEY.Filter.create('lsid', row.lsid, LABKEY.Filter.Types.NEQ),
                LABKEY.Filter.create('qcstate/publicdata', true, LABKEY.Filter.Types.EQUAL)
            ],
            scope: this,
            success: function(data){
                if(data && data.rows && data.rows.length){
                    Ext.each(data.rows, function(r){
                        //TODO: verify date is working
                        //might try: new Date(row.date.toGMTString())
                        toUpdate.push({lsid: r.lsid, enddate: new Date(row.Date)})
                    }, this);

                }
            },
            failure: EHR.onFailure
        });
        console.log('to update')
        console.log(toUpdate);
        if(toUpdate.length){
            LABKEY.Query.updateRows({
                schemaName: 'study',
                queryName: 'Housing',
                rows: toUpdate,
                success: function(data){
                    console.log('Success deactivating old housing records')
                },
                failure: EHR.onFailure
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
    description.push('Out Time: '+ EHR.validation.nullToString(row.enddate));

    return description;
}
