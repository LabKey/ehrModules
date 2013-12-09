/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
EHR.model.DataModelManager.registerMetadata('ClinicalProcedure', {
    allQueries: {
        performedby: {
            allowBlank: true
        },
        chargetype: {
            allowBlank: false
        }
    },
    byQuery: {
        'ehr.snomed_tags': {
            code: {
                editorConfig: {
                    xtype: 'ehr-snomedcombo',
                    defaultSubset: 'Diagnostic Codes'
                }
            }
        },
        'study.drug': {
            reason: {
                defaultValue: 'Procedure'
            }
        },
        'study.encounters': {
            performedby: {
                defaultValue: LABKEY.Security.currentUser.displayName
            },
            type: {
                defaultValue: 'Procedure',
                hidden: true
            },
            title: {
                hidden: true
            },
            caseno: {
                hidden: true
            },
            remark: {
                header: 'Narrative',
                label: 'Narrative',
                columnConfig: {
                    width: 400
                }
            },
            procedureid: {

            },
            chargetype: {
                defaultValue: 'Center Staff'
            },
            instructions: {
                hidden: true
            }
        },
        'study.clinremarks': {
            category: {
                defaultValue: 'Clinical',
                hidden: true
            },
            hx: {
                hidden: true
            },
            p2: {
                hidden: true
            }
        },
        'study.blood': {
            reason: {
                defaultValue: 'Clinical'
            },
            instructions: {
                hidden: true
            }
        }
    }
});