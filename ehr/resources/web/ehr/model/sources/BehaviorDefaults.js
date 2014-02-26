/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
EHR.model.DataModelManager.registerMetadata('BehaviorDefaults', {
    allQueries: {

    },
    byQuery: {
        'study.clinremarks': {
            category: {
                defaultValue: 'Behavior',
                hidden: true
            },
            hx: {
                hidden: true
            },
            s: {
                hidden: true
            },
            o: {
                hidden: true
            },
            a: {
                hidden: true
            },
            p: {
                hidden: true
            },
            p2: {
                hidden: true
            },
            remark: {
                columnConfg: {
                    width: 350
                }
            }
        }
    }
});