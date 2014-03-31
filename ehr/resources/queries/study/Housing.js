/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

require("ehr/triggers").initScript(this);

function onInit(event, helper){
    helper.setScriptOptions({
        skipHousingCheck: true
    });

    helper.decodeExtraContextProperty('housingInTransaction');

    helper.registerRowProcessor(function(helper, row){
        if (!row.row)
            return;

        row = row.row;

        if (!row.Id || !row.room){
            return;
        }

        var housingInTransaction = helper.getProperty('housingInTransaction');
        housingInTransaction = housingInTransaction || {};
        housingInTransaction[row.Id] = housingInTransaction[row.Id] || [];

        // this is a failsafe in case the client did not provide housing JSON.  it ensures
        // the current row is part of housingInTransaction
        var shouldAdd = true;
        if (row.objectid){
            LABKEY.ExtAdapter.each(housingInTransaction[row.Id], function(r){
                if (r.objectid == row.objectid){
                    shouldAdd = false;
                    return false;
                }
            }, this);
        }

        if (shouldAdd){
            housingInTransaction[row.Id].push({
                objectid: row.objectid,
                date: row.date,
                enddate: row.enddate,
                qcstate: row.QCState,
                room: row.room,
                cage: row.cage
            });
        }

        helper.setProperty('housingInTransaction', housingInTransaction);
    });    
}

function onUpsert(helper, scriptErrors, row, oldRow){
    //check for existing animals in this room/cage
    if (!helper.isETL() && !helper.isQuickValidation() && row.room && row.cage && !row.enddate){
        var existingIds = helper.getJavaHelper().findExistingAnimalsInCage(row.Id, row.room, row.cage);
        if (existingIds > 0){
            EHR.Server.Utils.addError(scriptErrors, 'Id', 'There are ' + existingIds + ' animal(s) already in this location', 'INFO');
        }
    }

    //verify we dont have 2 opened records for the same ID
    if (!helper.isETL() && !row.enddate && row.Id){
        var map = helper.getProperty('housingInTransaction');
        if (map && map[row.Id]){
            var housingRecords = map[row.Id];
            for (var i=0;i<housingRecords.length;i++){
                if (row.objectid == housingRecords[i].objectid){
                    continue;
                }

                if (!housingRecords[i].enddate){
                    EHR.Server.Utils.addError(scriptErrors, 'enddate', 'Cannot enter multiple open-ended housing records for the same animal', 'INFO');
                }
            }
        }
    }
}

function onBecomePublic(scriptErrors, helper, row, oldRow){
    helper.registerHousingChange(row.id, row);

    //if this record is active and public, deactivate any old housing records
    if (!helper.isETL()){
        var map = helper.getProperty('housingInTransaction');
        var housingRecords = [];
        if (map && map[row.Id]){
            housingRecords = map[row.Id];
        }

        if (row.Id && row.date && !row.enddate){
            var enddate = row.enddate || null;
            var objectid = row.objectid || null;
            var msg = helper.getJavaHelper().onHousingBecomePublic(row.id, row.date, enddate, objectid, housingRecords, helper.getTargetQCStateLabel());
            if (msg){
                EHR.Server.Utils.addError(scriptErrors, 'Id', msg, 'ERROR');
            }
        }
    }
}

function onComplete(event, errors, helper){
    if (!helper.isETL()){
        var housingMap = helper.getProperty('housingInTransaction');
        var idsToClose = [];
        if (housingMap){
            for (var id in housingMap){
                var housingRecords = housingMap[id];
                for (var i=0;i<housingRecords.length;i++){
                    if (!housingRecords[i].enddate){
                        idsToClose.push({
                            Id: id,
                            date: housingRecords[i].date,
                            objectid: housingRecords[i].objectid
                        });
                    }
                }
            }
        }

        if (idsToClose.length){
            //NOTE: this list should be limited to 1 row per animalId
            helper.getJavaHelper().closeHousingRecords(idsToClose);
        }
    }
}