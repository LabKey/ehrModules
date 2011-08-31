/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
// ================================================

var console = require("console");
var {EHR} = require("ehr/validation");

console.log("** evaluating: " + this['javax.script.filename']);



function beforeBoth(row, errors) {
    //pad cage to 4 digits if numeric
    if(row.cage && !isNaN(row.cage)){
        row.cage = EHR.validation.padDigits(row.cage, 4);
    }

    row.roomcage = row.room;
    if(row.cage)
        row.roomcage += '-' + row.cage;

    //remove whitespace
    if(row.joinToCage)
        row.joinToCage = row.joinToCage.replace(/\s/g, '');
}


function beforeInsert(row, errors) {
    beforeBoth(row, errors);

}

function beforeUpdate(row, oldRow, errors) {
    beforeBoth(row, errors);

}


