/*
 * Copyright (c) 2018 LabKey Corporation
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