/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var console = require("console");
var EHR = require("ehr/triggers").EHR;

console.log("** evaluating: " + this['javax.script.filename']);

function beforeBoth(row, errors) {
    //pad cage to 4 digits if numeric
    if(row.cage && !isNaN(row.cage)){
        row.cage = EHR.Server.Validation.padDigits(row.cage, 4);
    }

    if(row.room)
        row.room = row.room.toLowerCase();

    row.location = row.room;
    if(row.cage)
        row.location += '-' + row.cage;

    //remove whitespace, normalize punctuation and pad digits
    if(row.joinToCage){
        row.joinToCage = row.joinToCage.replace(/\s/g, '');
        row.joinToCage = row.joinToCage.replace(/[;,]+/g, ',');
        row.joinToCage = row.joinToCage.split(',');
        var newArray = [];
        for(var i=0;i<row.joinToCage.length;i++){
            var item = row.joinToCage[i] ;
            if(item){
                if(!isNaN(item))
                    newArray.push(EHR.Server.Validation.padDigits(item, 4));
                else
                    newArray.push(item);
            }
        };
        row.joinToCage = newArray.join(',');
    }
}

function beforeInsert(row, errors) {
    beforeBoth(row, errors);

}

function beforeUpdate(row, oldRow, errors) {
    beforeBoth(row, errors);

}