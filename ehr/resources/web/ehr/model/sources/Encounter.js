/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * This is the default metadata applied any record when displayed in the context of an encounter.  An encounter is the special situation in which
 * a task only refers to one ID.  In these cases, there is a single study.Clinical Encounters record, and Id/Date/Project are inherited from this record to children.
 */
EHR.model.DataModelManager.registerMetadata('Encounter', {
    allQueries: {
        Id: {
            inheritance: {
                storeIdentifier: {queryName: 'Clinical Encounters', schemaName: 'study'},
                sourceField: 'objectid',
                recordSelector: {
                    parentid: 'objectid',
                    Id: 'Id'
                }
            },
            hidden: true,
            shownInGrid: false
        },
        date: {
            inheritance: {
                storeIdentifier: {queryName: 'Clinical Encounters', schemaName: 'study'},
                sourceField: 'date',
                recordSelector: {
                    parentid: 'objectid'
                }
            },
            hidden: true,
            shownInGrid: false
        },
        parentid: {
            inheritance: {
                storeIdentifier: {queryName: 'Clinical Encounters', schemaName: 'study'},
                sourceField: 'objectid',
                recordSelector: {
                    parentid: 'objectid'
                }
            },
            hidden: false,
            shownInGrid: false,
            allowBlank: false
        },
        project: {
            inheritance: {
                storeIdentifier: {queryName: 'Clinical Encounters', schemaName: 'study'},
                sourceField: 'project',
                recordSelector: {
                    parentid: 'objectid'
                }
            },
            hidden: true,
            shownInGrid: false
        }
    }
});