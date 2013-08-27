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
            EHR.Server.Utils.addError(scriptErrors, 'Id', 'There are ' + existingIds + ' animals already in this location', 'INFO');
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
            var msg = helper.getJavaHelper().onHousingBecomePublic(row.id, row.date, enddate, objectid, housingRecords);
            if (msg){
                EHR.Server.Utils.addError(scriptErrors, 'Id', msg, 'ERROR');
            }
        }
    }
}

//function onComplete(event, errors, helper){
    //NOTE: if 2 open-ended housing records were inserted during the same transaction, we might need to close one of them
//}