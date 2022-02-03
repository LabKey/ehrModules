/*
 * Copyright (c) 2011-2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var console = require("console");
var triggers = require("ehr/triggers");
triggers.initScript(this);
var EHR = triggers.EHR;
var LABKEY = require("labkey");

EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.BEFORE_UPSERT, 'ehr_lookups', 'cage', function(helper, scriptErrors, row, oldRow){
    row.location = row.room;
    if (row.cage)
        row.location += '-' + row.cage;

    if (row.location.length > 100) {
        console.log("Location is longer than allowed length: ", row.location);
    }

    //remove whitespace, normalize punctuation and pad digits
    if (row.joinToCage){
        row.joinToCage = row.joinToCage.replace(/\s/g, '');
        row.joinToCage = row.joinToCage.replace(/[;,]+/g, ',');
        row.joinToCage = row.joinToCage.split(',');
        var newArray = [];
        for (var i=0;i<row.joinToCage.length;i++){
            var item = row.joinToCage[i] ;
            if(item){
                if(!isNaN(item))
                    newArray.push(EHR.Server.Utils.padDigits(item, 4));
                else
                    newArray.push(item);
            }
        };
        row.joinToCage = newArray.join(',');
    }
});

function onUpdate(helper, scriptErrors, row, oldRow) {
    row.cage = row.cage || oldRow.cage;
    row.room = row.room || oldRow.room;
}

var pendingChanges = [];

//reset the array with each batch
function onInit(){
    pendingChanges = [];
}

function onAfterInsert(row){
    //trigger recache of housing data, since this could result in pairing differences
    if (row.room && row.cage){
        var key = row.room + '<>' + row.cage;
        if (pendingChanges.indexOf(key) == -1){
            pendingChanges.push(key);
        }
    }
}

function onAfterUpdate(helper, errors, row, oldRow){
    //trigger recache of housing data, since this could result in pairing differences
    if (row.room && row.cage){
        var key = row.room + '<>' + row.cage;
        if (pendingChanges.indexOf(key) == -1){
            pendingChanges.push(key);
        }

        //if the divider changed, also report potential change for cage higher as this change might impact pairing
        if (oldRow && oldRow.divider != row.divider){
            var cageRow = row.cage.substring(0,1);
            var cageCol = row.cage.substring(1);
            if (!isNaN(cageCol)){
                cageCol = Number(cageCol) + 1;
                if (cageCol > 0) {
                    var key2 = row.room + '<>' + cageRow + cageCol;
                    if (pendingChanges.indexOf(key2) == -1) {
                        pendingChanges.push(key2);
                    }
                }
            }
        }
    }

    if (oldRow && oldRow.room && oldRow.cage){
        var key = oldRow.room + '<>' + oldRow.cage;
        if (pendingChanges.indexOf(key) == -1){
            pendingChanges.push(key);
        }
    }
}

function onComplete(event, errors, helper){
    if (!helper.isValidateOnly() && pendingChanges.length){
        helper.getJavaHelper().reportCageChange(pendingChanges);
    }
}