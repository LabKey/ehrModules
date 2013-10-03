/*
* Copyright (c) 2011-2013 LabKey Corporation
*
* Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
*/

var console = require("console");
var LABKEY = require("labkey");
var helper = org.labkey.ldk.query.LookupValidationHelper.create(LABKEY.Security.currentContainer.id, LABKEY.Security.currentUser.id, 'ehr_compliancedb', 'employeecategory');

function afterUpdate(row, oldRow, errors){
    var fields = ['categoryname'], fieldName;
    for (var i=0;i<fields.length;i++){
        fieldName = fields[i];
        if (row[fieldName] && oldRow[fieldName] && row[fieldName] != oldRow[fieldName]){
            helper.cascadeUpdate('ehr_compliancedb', 'employees', 'category', row[fieldName], oldRow[fieldName]);
            helper.cascadeUpdate('ehr_compliancedb', 'requirementspercategory', 'category', row[fieldName], oldRow[fieldName]);
            helper.cascadeUpdate('ehr_compliancedb', 'sopbycategory', 'category', row[fieldName], oldRow[fieldName]);
        }
    }
}

function beforeDelete(row, errors){
    var fields = ['categoryname'], fieldName;
    for (var i=0;i<fields.length;i++){
        fieldName = fields[i];
        if (helper.verifyNotUsed('ehr_compliancedb', 'employees', 'category', row[fieldName])){
            addError(errors, fieldName, 'Cannot delete row with value: ' + row[fieldName] + ' because it is referenced by the employees table');
        }

        if (helper.verifyNotUsed('ehr_compliancedb', 'requirementspercategory', 'category', row[fieldName])){
            addError(errors, fieldName, 'Cannot delete row with value: ' + row[fieldName] + ' because it is referenced by the requirementspercategory table');
        }

        if (helper.verifyNotUsed('ehr_compliancedb', 'sopbycategory', 'category', row[fieldName])){
            addError(errors, fieldName, 'Cannot delete row with value: ' + row[fieldName] + ' because it is referenced by the sopbycategory table');
        }
    }
}

function addError(errors, fieldName, msg){
    if (!errors[fieldName])
        errors[fieldName] = [];

    errors[fieldName].push(msg);
}