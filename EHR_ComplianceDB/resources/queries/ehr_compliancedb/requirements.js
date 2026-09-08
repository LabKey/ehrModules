/*
* Copyright (c) 2013-2019 LabKey Corporation
*
* Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
*/

var console = require("console");
var LABKEY = require("labkey");
var ldkUtils = require("ldk/Utils").LDK.Server.Utils;

var helper = org.labkey.ldk.query.LookupValidationHelper.create(LABKEY.Security.currentContainer.id, LABKEY.Security.currentUser.id, 'ehr_compliancedb', 'requirements');

console.log("** evaluating: " + this['javax.script.filename']);

function beforeInsert(row, errors){
    beforeUpsert(row, errors);
}

function beforeUpdate(row, oldRow, errors){
    //NOTE: this is designed to merge the old row into the new one.
    for (var prop in oldRow){
        if(!row.hasOwnProperty(prop) && LABKEY.ExtAdapter.isDefined(oldRow[prop])){
            row[prop] = oldRow[prop];
        }
    }

    beforeUpsert(row, errors);
}

function beforeUpsert(row, errors){
    ldkUtils.normalizeLookupFields(helper, row, errors, ['type']);
}

function afterUpdate(row, oldRow, errors){
    var fields = ['requirementname'], fieldName;
    for (var i=0;i<fields.length;i++){
        fieldName = fields[i];
        if (row[fieldName] && oldRow[fieldName] && row[fieldName] != oldRow[fieldName]){
            helper.cascadeUpdate('ehr_compliancedb', 'requirementspercategory', 'requirementname', row[fieldName], oldRow[fieldName]);
            helper.cascadeUpdate('ehr_compliancedb', 'requirementsperemployee', 'requirementname', row[fieldName], oldRow[fieldName]);
            helper.cascadeUpdate('ehr_compliancedb', 'completiondates', 'requirementname', row[fieldName], oldRow[fieldName]);
            helper.cascadeUpdate('ehr_compliancedb', 'employeerequirementexemptions', 'requirementname', row[fieldName], oldRow[fieldName]);

        }
    }
}

function beforeDelete(row, errors){
    var queries = ['requirementspercategory', 'requirementsperemployee', 'completiondates', 'employeerequirementexemptions'], query;
    var fields = ['requirementname'], fieldName;
    for (var j=0;j<queries.length;j++){
        query = queries[j];
        for (var i=0;i<fields.length;i++){
            fieldName = fields[i];
            if (helper.verifyNotUsed('ehr_compliancedb', query, 'requirementname', row[fieldName], 'requirements')){
                addError(errors, fieldName, 'Cannot delete row with value: ' + row[fieldName] + ' because it is referenced by the table ' + query);
            }
        }
    }
}

function addError(errors, fieldName, msg){
    if (!errors[fieldName])
        errors[fieldName] = [];

    errors[fieldName].push(msg);
}