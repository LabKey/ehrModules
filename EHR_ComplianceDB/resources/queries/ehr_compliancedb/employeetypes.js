/*
 * Copyright (c) 2012-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var console = require("console");
var LABKEY = require("labkey");
var helper = org.labkey.ldk.query.LookupValidationHelper.create(LABKEY.Security.currentContainer.id, LABKEY.Security.currentUser.id, 'ehr_compliancedb', 'employeetypes');

function afterUpdate(row, oldRow, errors){
    var fields = ['type'], fieldName;
    for (var i=0;i<fields.length;i++){
        fieldName = fields[i];
        if (row[fieldName] && oldRow[fieldName] && row[fieldName] != oldRow[fieldName]){
            helper.cascadeUpdate('ehr_compliancedb', 'employees', fieldName, row[fieldName], oldRow[fieldName]);
        }
    }
}

function beforeDelete(row, errors){
    var fields = ['type'], fieldName;
    for (var i=0;i<fields.length;i++){
        fieldName = fields[i];
        if (helper.verifyNotUsed('ehr_compliancedb', 'employees', fieldName, row[fieldName])){
            errors[fieldName] = ['Cannot delete row with value: ' + row[fieldName] + ' because it is referenced by the employees table'];
        }
    }
}