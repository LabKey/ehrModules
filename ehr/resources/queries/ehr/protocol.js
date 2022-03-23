/*
 * Copyright (c) 2011-2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 * 2022-03-22 jonesga added script to insert object Id unique identifier
 * 2022-03-23 reload to deterime if there is an issue
 */

require("ehr/triggers").initScript(this);

function onInsert(helper, scriptErrors, row){
    row.objectid = row.objectid || LABKEY.Utils.generateUUID().toUpperCase()
}