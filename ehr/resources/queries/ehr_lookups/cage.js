/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
// ================================================

var console = require("console");

console.log("** evaluating: " + this['javax.script.filename']);



function beforeBoth(row, errors) {
    //remove whitespace
    row.roomcage = row.room;
    if(row.cage)
        row.roomcage += '-' + row.cage;
}


function beforeInsert(row, errors) {
    beforeBoth(row, errors);

}

function beforeUpdate(row, oldRow, errors) {
    beforeBoth(row, errors);

}


