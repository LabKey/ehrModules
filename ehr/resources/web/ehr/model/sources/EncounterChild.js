/*
 * Copyright (c) 2013-2026 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
EHR.model.DataModelManager.registerMetadata('EncounterChild', {
    allQueries: {
        Id: {
            editable: false,
            columnConfig: {
                editable: false
            }
        },
        date: {
            inheritDateFromParent: true,
            inheritDefaultDateFromParent: true
        },
        project: {
            inheritFromParent: true
        },
        chargetype: {
            inheritFromParent: true
        }
    },
    byQuery: {
        'study.treatment_order': {
            date: {
                inheritDateFromParent: false
            }
        },
        'study.blood': {
            project: {
                inheritFromParent: false
            }
        },
        'onprc_billing.miscCharges': {
            project: {
                inheritFromParent: false
            }
        }
    }
});