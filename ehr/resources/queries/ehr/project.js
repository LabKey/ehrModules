/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

require("ehr/triggers").initScript(this);

EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.AFTER_UPSERT, 'ehr', 'project', function(helper, errors, row, oldRow){
    console.log('called')
    if (row.project && !helper.isValidateOnly()){
        helper.getJavaHelper().updateCachedProtocol(row.project, row.protocol);
    }
});