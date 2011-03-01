/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


var console = require("console");
var LABKEY = require("labkey");
var Ext = require("Ext").Ext;
var EHR = require("/ehr/validation");

//include("/ehr/validation");



// called once before insert/update/delete
//function init(event, errors){
//
//}
var init = EHR.init;


function beforeInsert(row, errors) {
    console.log('beforeInsert');
    //beforeBoth(row, errors);
    EHR.rowInit(row, errors);

    //do some specific stuff

    EHR.rowEnd(row, errors);

}

function afterInsert(row, errors) {
    console.log('afterInsert');
}

function beforeUpdate(row, oldRow, errors) {
    console.log('beforeUpdate');
    beforeBoth(row, errors);

}

function afterUpdate(row, oldRow, errors) {
    console.log('afterUpdate');
}

function beforeDelete(row, errors) {
    console.log('beforeDelete');
}

function afterDelete(row, errors) {
    console.log('afterDelete');
}

function complete(event, errors) {
    console.log('complete');
}


//will be called on data import through ETL
function onETL(row, errors){

}

function setDescription(row, errors){

}






