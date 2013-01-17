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
            reportNamespace: EHR.reports
        });

        this.reportStore = Ext4.create('LABKEY.ext4.Store', {
            schemaName: 'ehr',
            queryName: 'reports',
            filterArray: [LABKEY.Filter.create('visible', true, LABKEY.Filter.Types.EQUAL)],
            sort: 'category,sort_order,reporttitle',
            autoLoad: true,
            listeners: {
                scope: this,
                load: this.onStoreLoad
            },
            failure: LDK.Utils.getErrorCallback()
        });

        this.callParent();
    },

    onStoreLoad: function(store){
        this.reports = [];

        store.each(function(rec){
            var report = {
                id: rec.get('reportname'),
                name: rec.get('reportname'),
                label: rec.get('reporttitle'),
                category: rec.get('category'),
                reportType: rec.get('reporttype'),
                subjectFieldName: 'Id',
                containerPath: rec.get('containerpath'),
                schemaName: rec.get('schemaname'),
                queryName: rec.get('queryname'),
                viewName: rec.get('viewname'),
                reportId: rec.get("report"),
                dateFieldName: rec.get("datefieldname"),
                areaFieldName: rec.get("queryhaslocation") ? 'room/area' : 'Id/curLocation/area',
                roomFieldName: rec.get("queryhaslocation") ? 'room' : 'Id/curLocation/room',
                cageFieldName: rec.get("queryhaslocation") ? 'cage' : 'Id/curLocation/cage',
                todayOnly: false
            }

            if (rec.get('jsonconfig')){
                console.log(rec.get('jsonconfig'));
                var json = Ext4.decode(rec.get('jsonconfig'));
                console.log(json);
                Ext4.apply(report, json);
            }

            this.reports.push(report);
            this.reportMap[report.id] = report;
        }, this);


        this.createTabPanel();
    },

    //override
    getFilterArray: function(tab){
        var report = tab.report;
        var filterArray = this.callParent(arguments);

        //we handle date
        if (report.dateFieldName && report.todayOnly){
            filterArray.removable.push(LABKEY.Filter.create(report.dateFieldName, (new Date()).format('Y-m-d'), LABKEY.Filter.Types.DATE_EQUAL));
        }

        tab.filterArray = filterArray;
        return filterArray;
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