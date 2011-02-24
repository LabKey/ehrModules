/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var console = require("console");
var LABKEY = require("labkey");
var Ext = require("Ext").Ext;

var rows = [];

function beforeBoth(row, errors) {
    rowInit(row, errors);
    rowEnd(row, errors);
}



console.log("** evaluating: " + this['javax.script.filename']);

//var errorQC = 4;
var errorQC = 'Review Required';
var verbosity = 0;

//NOTES:
//set account based on project.  do different depending on insert/update.  maybe a flag?
//is the row has id/currentroom, then populate using housing


function rowInit(){

}


function rowEnd(){

}