/*
 * Copyright (c) 2011-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var console = require("console");
var LABKEY = require("labkey");
var helper = org.labkey.ldk.query.LookupValidationHelper.create(LABKEY.Security.currentContainer.id, LABKEY.Security.currentUser.id, 'ehr_compliancedb', 'unit_names');

function afterUpdate(row, oldRow, errors){
    var fields = ['unit'], fieldName;
    for (var i=0;i<fields.length;i++){
        fieldName = fields[i];
        if (row[fieldName] && oldRow[fieldName] && row[fieldName] != oldRow[fieldName]){
            helper.cascadeUpdate('ehr_compliancedb', 'requirementspercategory', 'unit', row[fieldName], oldRow[fieldName]);
            helper.cascadeUpdate('ehr_compliancedb', 'employees', 'unit', row[fieldName], oldRow[fieldName]);
        }
    }
}

function beforeDelete(row, errors){
    var queries = ['requirementspercategory', 'employees'], query;
    var fields = ['unit'], fieldName;
    for (var j=0;j<queries.length;j++){
        query = queries[j];
        for (var i=0;i<fields.length;i++){
            fieldName = fields[i];
            if (helper.verifyNotUsed('ehr_compliancedb', query, 'unit', row[fieldName])){
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