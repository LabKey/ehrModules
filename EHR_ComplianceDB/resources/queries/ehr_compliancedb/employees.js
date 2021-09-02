/*
* Copyright (c) 2013-2019 LabKey Corporation
*
* Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
*/

var console = require("console");
var LABKEY = require("labkey");

var helper = org.labkey.ldk.query.LookupValidationHelper.create(LABKEY.Security.currentContainer.id, LABKEY.Security.currentUser.id, 'ehr_compliancedb', 'employees');

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
    var lookupFields = ['type', 'title', 'unit', 'location'];
    for (var i=0;i<lookupFields.length;i++){
        var f = lookupFields[i];
        var val = row[f];
        if (!LABKEY.ExtAdapter.isEmpty(val)){
            var normalizedVal = helper.getLookupValue(val, f);

            if (LABKEY.ExtAdapter.isEmpty(normalizedVal))
                errors[f] = 'Unknown value for field: ' + f + '. Value was: ' + val;
            else
                row[f] = normalizedVal;  //cache value for purpose of normalizing case
        }
    }
    var categories = row['category'];
    if (categories) {
        var catdata = categories.split(",");
        var normalizedCategories = [];
        for (var j = 0; j < catdata.length; ++j) {
            if (!LABKEY.ExtAdapter.isEmpty(catdata[j])) {
                var normalizedCategory = helper.getLookupValue(catdata[j], 'category');
                if (LABKEY.ExtAdapter.isEmpty(normalizedCategory))
                    errors['category'] = 'Unknown value for category. Value was: ' + catdata[j];
                else
                    normalizedCategories.push(normalizedCategory);
            }
        }
        if (normalizedCategories.length > 0) {
            row['category'] = normalizedCategories.join(','); //cache value for purpose of normalizing case
        }
    }

}

function afterUpdate(row, oldRow, errors){
    var fields = ['employeeid'], fieldName;
    for (var i=0;i<fields.length;i++){
        fieldName = fields[i];
        if (row[fieldName] && oldRow[fieldName] && row[fieldName] != oldRow[fieldName]){
            helper.cascadeUpdate('ehr_compliancedb', 'employeerequirementexemptions', 'employeeid', row[fieldName], oldRow[fieldName]);
            helper.cascadeUpdate('ehr_compliancedb', 'requirementsperemployee', 'employeeid', row[fieldName], oldRow[fieldName]);
            helper.cascadeUpdate('ehr_compliancedb', 'sopdates', 'employeeid', row[fieldName], oldRow[fieldName]);
            helper.cascadeUpdate('ehr_compliancedb', 'completiondates', 'employeeid', row[fieldName], oldRow[fieldName]);
            helper.cascadeUpdate('ehr_compliancedb', 'completiondates', 'trainer', row[fieldName], oldRow[fieldName]);
        }
    }
}

function beforeDelete(row, errors){
    var queries = ['employeerequirementexemptions', 'requirementsperemployee', 'sopdates', 'completiondates'], query;
    var fields = ['employeeid'], fieldName;
    for (var j=0;j<queries.length;j++){
        query = queries[j];
        for (var i=0;i<fields.length;i++){
            fieldName = fields[i];
            if (helper.verifyNotUsed('ehr_compliancedb', query, 'employeeid', row[fieldName])){
                addError(errors, fieldName, 'Cannot delete row with value: ' + row[fieldName] + ' because it is referenced by the table ' + query);
            }
        }
    }

    //also check trainer
    if (helper.verifyNotUsed('ehr_compliancedb', 'completiondates', 'trainer', row[fieldName])){
        addError(errors, fieldName, 'Cannot delete row with value: ' + row[fieldName] + ' because it is referenced by the table completiondates');
    }
}

function addError(errors, fieldName, msg){
    if (!errors[fieldName])
        errors[fieldName] = [];

    errors[fieldName].push(msg);
}