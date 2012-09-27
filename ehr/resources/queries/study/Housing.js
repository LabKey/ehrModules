/*
 * Copyright (c) 2010-2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/triggers");

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

function onBecomePublic(errors, scriptContext, row, oldRow){
    //if this record is active and public, deactivate any old housing records
    if(scriptContext.extraContext.dataSource != 'etl' && !row.enddate){
        if (!scriptContext.housingRecords){
            scriptContext.housingRecords = {};
        }

        LABKEY.Query.selectRows({
            schemaName: 'study',
            queryName: 'housing',
            columns: 'lsid,id,date',
            ignoreFilter: 1,
            filterArray: [
                LABKEY.Filter.create('Id', row.Id, LABKEY.Filter.Types.EQUAL),
                LABKEY.Filter.create('enddate', null, LABKEY.Filter.Types.ISBLANK),
                //LABKEY.Filter.create('date', row.Date, LABKEY.Filter.Types.LESS_THAN),
                LABKEY.Filter.create('lsid', row.lsid, LABKEY.Filter.Types.NEQ),
                LABKEY.Filter.create('qcstate/publicdata', true, LABKEY.Filter.Types.EQUAL)
            ],
            scope: this,
            success: function(data){
                if(data && data.rows && data.rows.length){
                    var r;
                    if (!scriptContext.housingRecords[row.Id]){
                        scriptContext.housingRecords[row.Id] = [];
                    }

                    var houseRecords = [];
                    for(var i=0;i<data.rows.length;i++){
                        r = data.rows[i];
                        houseRecords.push({lsid: r.lsid, enddate: new Date(row.date.toGMTString())});

                        //if there's an existing public active housing record
                        if(Date.parse(row.date.toGMTString()) < Date.parse(r.date)){
                            EHR.Server.Validation.addError(errors, 'Id', 'You cannot enter an open ended housing while there is another record starting on: '+r.date);
                            houseRecords = [];
                            continue;
                        }
                    }
                    scriptContext.housingRecords[row.Id].push({date: row.date, records: houseRecords});
                }
            },
            failure: EHR.Server.Utils.onFailure
        });
    }
}

function onAfterUpsert(scriptContext, errors, row, oldRow){
    if (scriptContext.housingRecords && scriptContext.housingRecords[row.Id]){
        this.scriptContext.rows[scriptContext.rows.length -1].row.housingRecords = scriptContext.housingRecords[row.Id];
    }
}

function onComplete(event, errors, scriptContext){
    var toUpdate = [];
    var lsids = {};

    if (!errors.length && scriptContext.housingRecords){
        var allRecords = scriptContext.rows;
        allRecords = allRecords.sort(function(a, b){
            return a.row.Id < b.row.Id ? -1 :
                a.row.Id > b.row.Id ? 1 :
                a.row.date < b.row.date ? -1 :
                a.row.date > b.row.date ? 1 :
                0
        });

        var previousRow;
        for(var i=0;i<allRecords.length;i++){
            var currentRow = scriptContext.rows[i].row;
            var records = currentRow.housingRecords;
            if(!records || !records.length){
                continue;
            }

            records = records.sort(function(a, b){
                return a.date < b.date ? -1 :
                    a.date > b.date ? 1 :
                    0
            });

            //a previous row in this transaction may also need to get closed
            if(previousRow){
                if (previousRow.Id == currentRow.Id){
                    toUpdate.push({lsid: previousRow.lsid, enddate: new Date(currentRow.date.getTime())});
                    lsids[previousRow.lsid] = true;
                }
            }

            for (var j=0;j<records.length;j++){
                var current = records[j];
                for (var k=0;k<current.records.length;k++){
                    var housingRecord = current.records[k];
                    if(lsids[housingRecord.lsid])
                        continue;

                    toUpdate.push({lsid: housingRecord.lsid, enddate: EHR.Server.Utils.normalizeDate(housingRecord.enddate)});
                    lsids[housingRecord.lsid] = true;
                }
            }

            previousRow = currentRow;
        }

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
