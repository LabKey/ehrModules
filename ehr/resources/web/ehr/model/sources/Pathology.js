/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
EHR.model.DataModelManager.registerMetadata('Pathology', {
    allQueries: {
        performedby: {
            allowBlank: true
        },
        chargetype: {
            allowBlank: false
        },
        codesRaw: {
            hidden: false,
            xtype: 'ehr-snomedcodeseditor',
            columnConfig: {
                xtype: 'ehr-snomedcolumn',
                editable: true,
                width: 600
            }
        }
    },
    byQuery: {
        'study.encounters': {
            title: {
                hidden: true
            },
            procedureid: {
                hidden: false,
                lookup: {
                    filterArray: [
                        LABKEY.Filter.create('category', 'Pathology', LABKEY.Filter.Types.EQUAL),
                        LABKEY.Filter.create('active', true, LABKEY.Filter.Types.EQUAL)
                    ]
                }
            },
            instructions: {
                hidden: true
            },
            chargetype: {
                defaultValue: 'Center Staff'
            },
            performedby: {
                hidden: true
            },
            remark: {
                header: 'Summary Comments',
                label: 'Summary Comments',
                height: 300,
                editorConfig: {
                    width: 1000
                }
            }
        },
        'ehr.encounter_summaries': {
            Id: {
                hidden: true
            },
            date: {
                hidden: true
            },
            category: {
                defaultValue: 'Gross Findings',
                hidden: true
            },
            remark: {
                height: 300,
                editorConfig: {
                    fieldLabel: 'Gross Findings',
                    width: 1000
                }
            }
        },
        'study.drug': {
            project: {
                allowBlank: true,
                hidden: true
            }
        }
    }
});