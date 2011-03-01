/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var console = require("console");
var LABKEY = require("labkey");
var Ext = require("Ext").Ext;
var EHR = require("ehr/validation");

function repairRow(row, errors){

}

function setTitle(row, errors){
    row.title = row.title || '';

}


function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();
    return description.join(',\n');
}

function beforeBoth(row, errors) {
    console.log('**evaluating tasks');
    console.log(row);
    setTitle(row, errors);
    setDescription(row, errors);
}


function beforeInsert(row, errors) {
    beforeBoth(row, errors);

}

function beforeUpdate(row, oldRow, errors) {
    beforeBoth(row, errors);

}

function afterDelete(event, errors){
    //cascade delete to all datasets??
}




// ================================================

//==includeStart


//==includeEnd

// ================================================


