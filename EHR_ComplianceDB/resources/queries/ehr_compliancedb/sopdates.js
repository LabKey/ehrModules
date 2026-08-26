/*
* Copyright (c) 2026 LabKey Corporation
*
* Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
*/

var LABKEY = require("labkey");

var helper = org.labkey.ldk.query.LookupValidationHelper.create(LABKEY.Security.currentContainer.id, LABKEY.Security.currentUser.id, 'ehr_compliancedb', 'sopdates');

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
    //sopid is omitted deliberately: its fk to sops is commented out in ehr_compliancedb.xml, so getLookupValue would return null and reject every row
    var lookupFields = ['employeeid'];
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
}
