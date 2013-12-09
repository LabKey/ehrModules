/*
 * Copyright (c) 2011-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

require("ehr/triggers").initScript(this);

function onUpsert(helper, scriptErrors, row, oldRow){
    if (!row.observation && !row.remark){
        EHR.Server.Utils.addError(scriptErrors, 'observation', 'Must enter an observation or remark', 'WARN');
        EHR.Server.Utils.addError(scriptErrors, 'remark', 'Must enter an observation or remark', 'WARN');
    }
}