/*
* Copyright (c) 2011 LabKey Corporation
*
* Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
*/


var console = require("console");
var LABKEY = require("labkey");
//var Ext = require("Ext").Ext;
var shared = require("ehr_compliancedb/updateTable");

console.log("** evaluating: " + this['javax.script.filename']);


function afterUpdate(row, oldRow, errors){
    var fileParse = (this['javax.script.filename']).split('/');
    var schemaName = fileParse[1];
    var queryName = fileParse[2].replace(/\.js$/, '');

    if(oldRow.type != row.type){
        //NOTE: if there is an error with any of these API calls, it will close the connection, so we need to abort
        var status = shared.updateTable(errors, row, oldRow, schemaName, 'Requirements', 'requirementname', 'type', 'type');
    }
};
