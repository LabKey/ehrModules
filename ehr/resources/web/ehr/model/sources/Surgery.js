/*
 * Copyright (c) 2013-2014 LabKey Corporation
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
        'onprc_billing.miscCharges': {
            chargeId: {
                lookup: {
                    filterArray: [
                        LABKEY.Filter.create('active', true, LABKEY.Filter.Types.EQUAL),
                        LABKEY.Filter.create('category', 'Lease Fee', LABKEY.Filter.Types.NEQ),
                        LABKEY.Filter.create('category', 'Animal Per Diem', LABKEY.Filter.Types.NEQ),
                        LABKEY.Filter.create('category', 'Small Animal Per Diem', LABKEY.Filter.Types.NEQ),
                        LABKEY.Filter.create('category', 'Timed Mated Breeders', LABKEY.Filter.Types.NEQ)
                    ]
                }
            },
            chargetype: {
                allowBlank: true
            }
        },
        'study.treatment_order': {
            category: {
                defaultValue: 'Surgical'
            }
        },
        'study.drug': {
            reason: {
                defaultValue: 'Procedure'
            }
        },
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
            },
            procedureid: {
                lookup: {
                    filterArray: [
                        LABKEY.Filter.create('category', 'Surgery', LABKEY.Filter.Types.EQUAL),
                        LABKEY.Filter.create('active', true, LABKEY.Filter.Types.EQUAL)
                    ]
                }
            },
            performedby: {
                hidden: true
            },
            remark: {
                hidden: true
            }
        },
        'ehr.snomed_tags': {
            code: {
                editorConfig: {
                    xtype: 'ehr-snomedcombo',
                    defaultSubset: 'Diagnostic Codes'
                }
            },
            set_number: {
                hidden: true
            },
            sort: {
                hidden: true
            }
        },
        'ehr.encounter_summaries': {
            category: {
                defaultValue: 'Narrative'
            }
        }
    }
});