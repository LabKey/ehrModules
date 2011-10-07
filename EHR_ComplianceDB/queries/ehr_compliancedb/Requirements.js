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

    if(oldRow.RequirementName != row.RequirementName){
        shared.updateTable(row, oldRow, schemaName, 'CompletionDates', 'rowid', 'RequirementName', 'RequirementName');
        shared.updateTable(row, oldRow, schemaName, 'RequirementsPerEmployee', 'rowid', 'RequirementName', 'RequirementName');
        shared.updateTable(row, oldRow, schemaName, 'EmployeeRequirementExemptions', 'rowid', 'RequirementName', 'RequirementName');
        shared.updateTable(row, oldRow, schemaName, 'RequirementsPerCategory', 'rowid', 'RequirementName', 'RequirementName');
    }
};
