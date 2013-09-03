/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
EHR.model.DataModelManager.registerMetadata('Surgery', {
    allQueries: {
        performedby: {
            allowBlank: true
        },
        chargetype: {
            allowBlank: false
        }
    },
    byQuery: {
        'study.encounters': {
            type: {
                defaultValue: 'Surgery',
                hidden: true
            },
            title: {
                hidden: true
            },
            caseno: {
                hidden: true
            }
        }
    }
});