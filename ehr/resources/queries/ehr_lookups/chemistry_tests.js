/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
// ================================================

var console = require("console");

console.log("** evaluating: " + this['javax.script.filename']);



function beforeBoth(row, errors) {
    if(row.aliases){
        //remove whitespace
        row.aliases = row.aliases.replace(/\s/g, '');

        //normalize punctutation
        row.aliases = row.aliases.replace(/;/g, ',');
        row.aliases = row.aliases.replace(/(,)+/g, ',');
    }

    //NOTE: might be considered, but not currently enforced
    //row.testid = row.name.testid(/\s+/g, '_');
    //row.testid = row.testid.toUpperCase();
}


function beforeInsert(row, errors) {
    beforeBoth(row, errors);

}

function beforeUpdate(row, oldRow, errors) {
    beforeBoth(row, errors);

}


