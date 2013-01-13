/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

/**
 * Constructs a new EHR AnimalHistoryPanel
 * @class
 * An EHR class that provides a data-driven tabbed report panel.  It is used on the AnimalHistory page, and a subclass defined in ParticipantDetailsPanel.js is used as the participant details page.
 * The set of reports is determined by the records in ehr.reports.  Each record supplies a schema/query and report type, along with other options.
 * @cfg filterTypes
 * @cfg reports
 *
 */
Ext4.define('EHR.panel.AnimalHistoryPanel', {
    extend: 'LDK.panel.TabbedReportPanel',
    alias: 'widget.ehr-animalhistorypanel',

    initComponent: function(){
        Ext4.apply(this, {
            defaultReport: 'notes'
        });

        this.reportStore = Ext4.create('LABKEY.ext4.Store', {
            schemaName: 'ehr',
            queryName: 'reports',
            filterArray: [LABKEY.Filter.create('visible', true, LABKEY.Filter.Types.EQUAL)],
            sort: 'category,sort_order,reporttitle',
            autoLoad: true,
            listeners: {
                scope: this,
                load: this.createTabPanel
            },
            failure: LDK.Utils.getErrorCallback()
        });

        this.callParent();
    },

    filterTypes: [{
        xtype: 'ldk-singlesubjectfiltertype',
        inputValue: LDK.panel.SingleSubjectFilterType.filterName,
        label: LDK.panel.SingleSubjectFilterType.label
    },{
        xtype: 'ehr-multianimalfiltertype',
        inputValue: EHR.panel.MultiAnimalFilterType.filterName,
        label: EHR.panel.MultiAnimalFilterType.label
    },{
        xtype: 'ehr-locationfiltertype',
        inputValue: EHR.panel.LocationFilterType.filterName,
        label: EHR.panel.LocationFilterType.label
    },{
        xtype: 'ldk-nofiltersfiltertype',
        inputValue: LDK.panel.NoFiltersFilterType.filterName,
        label: LDK.panel.NoFiltersFilterType.label
    }]
});