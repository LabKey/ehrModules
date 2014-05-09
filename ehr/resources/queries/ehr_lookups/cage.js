/*
 * Copyright (c) 2010-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var console = require("console");
var EHR = require("ehr/triggers").EHR;
var LABKEY = require("labkey");

var triggerHelper = org.labkey.ehr.utils.TriggerScriptHelper.create(LABKEY.Security.currentUser.id, LABKEY.Security.currentContainer.id);

console.log("** evaluating: " + this['javax.script.filename']);

function beforeBoth(row, errors) {
    row.location = row.room;
    if (row.cage)
        row.location += '-' + row.cage;

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

    //run registered scripts
    var handlers = EHR.Server.TriggerManager.getHandlersForQuery(EHR.Server.TriggerManager.Events.BEFORE_UPSERT, 'ehr', 'cage', true) || [];
    if (handlers.length){
        for (var i=0;i<handlers.length;i++){
            handlers[i].call(this, {}, errors, row);
        }
    }
}

function beforeInsert(row, errors) {
    beforeBoth(row, errors);

}

function beforeUpdate(row, oldRow, errors) {
    row.cage = row.cage || oldRow.cage;
    row.room = row.room || oldRow.room;

    beforeBoth(row, errors);

}

var pendingChanges = [];

function afterInsert(row){
    //trigger recache of housing data, since this could result in pairing differences
    if (row.room && row.cage){
        var key = row.room + '<>' + row.cage;
        if (pendingChanges.indexOf(key) == -1){
            pendingChanges.push(key);
        }
    }
}

function afterUpdate(row){
    //trigger recache of housing data, since this could result in pairing differences
    if (row.room && row.cage){
        var key = row.room + '<>' + row.cage;
        if (pendingChanges.indexOf(key) == -1){
            pendingChanges.push(key);
        }
    }
}

function complete(){
    if (pendingChanges.length){
        console.log('reporting cage changes: ');
        console.log(pendingChanges);
        triggerHelper.reportCageChange(pendingChanges);
    }
}