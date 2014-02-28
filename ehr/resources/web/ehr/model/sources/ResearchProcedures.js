/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
EHR.model.DataModelManager.registerMetadata('ResearchProcedures', {
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
            instructions: {
                hidden: true
            },
            chargetype: {
                header: 'Charge Type',
                label: 'Charge Type',
                defaultValue: 'Research Staff'
            },
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
                columnConfig: {
                    width: 400
                }
            },
            procedureid: {
                lookup: {
                    filterArray: [
                        LABKEY.Filter.create('category', 'Surgery', LABKEY.Filter.Types.NEQ),
                        LABKEY.Filter.create('active', true, LABKEY.Filter.Types.EQUAL)
                    ]
                }
            }
        },
        'study.blood': {
            chargetype: {
                header: 'Charge Type',
                label: 'Charge Type',
                defaultValue: 'Research Staff'
            },
            instructions: {
                hidden: true
            },
            reason: {
                defaultValue: 'Research'
            }
        },
        'study.drug': {
            project: {
                allowBlank: false
            },
            code: {
                editorConfig: {
                    defaultSubset: 'Drugs and Procedures'
                }
            }
        },
        'study.treatment_order': {
            category: {
                defaultValue: 'Research',
                editable: false
            },
            code: {
                editorConfig: {
                    defaultSubset: 'Drugs and Procedures'
                }
            }
        }
    }
});