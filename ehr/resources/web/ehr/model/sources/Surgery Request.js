/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
EHR.model.DataModelManager.registerMetadata('Surgery Request', {
    byQuery: {
        'study.encounters': {
            type: {
                defaultValue: 'Surgery',
                hidden: true
            },
            enddate: {
                hidden: true
            },
            procedureid: {
                lookup: {
                    filterArray: [LABKEY.Filter.create('active', true, LABKEY.Filter.Types.EQUAL)]
                }
            }
        }
    }
});