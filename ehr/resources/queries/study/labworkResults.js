/*
 * Copyright (c) 2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

require("ehr/triggers").initScript(this);

function onInit(event, helper){
    helper.setScriptOptions({
        allowAnyId: true,
        allowDeadIds: true,
        skipIdFormatCheck: true,
        removeTimeFromDate: false,
        allowDatesInDistantPast: true

    });
}

function onUpsert(helper, scriptErrors, row, oldRow){
    //lookup test type if not supplied:
    if (row.servicerequested){
        if (!row.type)
            row.type = helper.getJavaHelper().lookupDatasetForService(row.servicerequested);

        if (!row.chargetype)
            row.chargetype = helper.getJavaHelper().lookupChargeTypeForService(row.servicerequested);
    }
}