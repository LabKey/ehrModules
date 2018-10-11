/*
 * Copyright (c) 2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * The default metadata applied to all queries when using getTableMetadata().
 * This is the default metadata applied to all queries when using getTableMetadata().  If adding attributes designed to be applied
 * to a given query in all contexts, they should be added here
 */
EHR.model.DataModelManager.registerMetadata('Default', {
    allQueries: {
        chargeId: {
            allowBlank: true, //TODO: true for now, need to find out whether chargeId is commonly used among centers.
            xtype: 'ehr_billingRowObserverEntryField',

            columnConfig: {
                width: 100
            },
            editorConfig: {
                caseSensitive: false,
                id: 'ehr_billing-Misc-charges-chargeId',
                valueField: 'rowId',
                displayField: 'name',
                observedField: 'chargetype',
                observerLookupField: 'departmentCode'
            },
            lookup: {
                columns: 'rowId, name, chargeCategoryId, departmentCode',
                sort: 'name, chargeCategoryId'
            }
        },
        project: {
            xtype: 'ehr_billingprojectentryfield',
            editorConfig: {},
            shownInGrid: true,
            isAutoExpandColumn: true,
            useNull: true,
            lookup: {
                columns: 'project'
            }
        },
        chargetype: {
            shownInGrid: true,
            isAutoExpandColumn: true,
            useNull: true
        }
    }
});