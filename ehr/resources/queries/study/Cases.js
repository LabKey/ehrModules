/*
 * Copyright (c) 2012-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

require("ehr/triggers").initScript(this);

EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.AFTER_UPSERT, 'study', 'Cases', function(helper, errors, row, oldRow){
    if (!helper.isValidateOnly() && !helper.isETL() && row.enddate && row.objectid){
        //we want to capture newly inserted records that are ended, or updates that set an enddate
        if (!oldRow || !oldRow.enddate){
            helper.getJavaHelper().closeActiveProblemsForCase(row.id, row.enddate, row.objectid);
        }

    }
});

