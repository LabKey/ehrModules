/*
 * Copyright (c) 2014-2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var console = require("console");
var LABKEY = require("labkey");
var triggers = require("ehr/triggers");
triggers.initScript(this);
var EHR = triggers.EHR;

var lookupValidationHelper = org.labkey.ldk.query.LookupValidationHelper.create(LABKEY.Security.currentContainer.id, LABKEY.Security.currentUser.id, 'ehr_lookups', 'procedures');

EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.BEFORE_DELETE, 'ehr_lookups', 'procedures', function(helper, scriptErrors, row, oldRow){
    if (lookupValidationHelper.verifyNotUsed('study', 'encounters', 'procedureid', row['rowid'], 'procedures')) {
        addError(errors, 'name', 'Cannot delete row with ID: ' + row['rowid'] + ' because it is referenced by the table encounters.  You should inactivate this item instead.');
    }
});

function addError(errors, fieldName, msg){
    if (!errors[fieldName])
        errors[fieldName] = [];

    errors[fieldName].push(msg);
}
