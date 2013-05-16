/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.ns('EHR.permission');

EHR.permission = new function(){
    var prefix = 'org.labkey.ehr.security';

    return {
        DATA_ENTRY: prefix + '.EHRDataEntryPermission'
    }
};