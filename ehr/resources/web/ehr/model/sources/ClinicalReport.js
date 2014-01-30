/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
EHR.model.DataModelManager.registerMetadata('ClinicalReport', {
    byQuery: {
        'study.clinremarks': {
            project: {
                hidden: false,
                allowBlank: false
            },
            hx: {
                hidden: false
            }
        }
    }
});