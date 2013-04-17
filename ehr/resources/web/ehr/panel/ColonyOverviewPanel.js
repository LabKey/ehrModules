/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.panel.ColonyOverviewPanel', {
    extend: 'Ext.panel.Panel',

    initComponent: function(){
        this.filterArray = [LABKEY.Filter.create('calculated_status', 'Alive', LABKEY.Filter.Types.EQUAL)];
        Ext4.apply(this, {
            border: false,
            defaults: {
                border: false
            },
            items: [{
                html: 'This page is designed to give an overview of the colony',
                style: 'padding-bottom: 20px;'
            },{
                xtype: 'tabpanel',
                border: true,
                defaults: {
                    border: false,
                    listeners: {
                        scope: this,
                        activate: function(tab){
                            Ext4.History.add('tab=' + tab.itemId);
                        }
                    }
                },
                items: [{
                    title: 'Population Composition',
                    style: 'padding 5px;',
                    items: [{
                        xtype: 'ehr-populationpanel',
                        filterArray: this.filterArray,
                        rowField: EHR.panel.PopulationPanel.FIELDS.species,
                        colFields: [EHR.panel.PopulationPanel.FIELDS.ageclass, EHR.panel.PopulationPanel.FIELDS.gender]
                    },{
                        xtype: 'ehr-populationtrendspanel',
                        style: 'padding-top: 20px;'
                    }],
                    itemId: 'population'
                },{
                    title: 'SPF Colony',
                    style: 'padding 5px;',
                    items: [{
                        xtype: 'ehr-populationpanel',
                        titleText: 'SPF',
                        filterArray: [LABKEY.Filter.create('Id/viral_status/viralStatus', 'SPF', LABKEY.Filter.Types.EQUALS)].concat(this.filterArray),
                        rowField: EHR.panel.PopulationPanel.FIELDS.species,
                        colFields: [EHR.panel.PopulationPanel.FIELDS.ageclass, EHR.panel.PopulationPanel.FIELDS.gender]
                    },{
                        xtype: 'ehr-populationpanel',
                        titleText: 'SPF 3',
                        filterArray: [LABKEY.Filter.create('Id/viral_status/viralStatus', 'SPF 3', LABKEY.Filter.Types.EQUALS)].concat(this.filterArray),
                        rowField: EHR.panel.PopulationPanel.FIELDS.species,
                        colFields: [EHR.panel.PopulationPanel.FIELDS.ageclass, EHR.panel.PopulationPanel.FIELDS.gender]
                    },{
                        xtype: 'ehr-populationpanel',
                        titleText: 'SPF 4',
                        filterArray: [LABKEY.Filter.create('Id/viral_status/viralStatus', 'SPF 4', LABKEY.Filter.Types.EQUALS)].concat(this.filterArray),
                        rowField: EHR.panel.PopulationPanel.FIELDS.species,
                        colFields: [EHR.panel.PopulationPanel.FIELDS.ageclass, EHR.panel.PopulationPanel.FIELDS.gender]
                    },{
                        xtype: 'ehr-populationpanel',
                        titleText: 'SPF 9',
                        filterArray: [LABKEY.Filter.create('Id/viral_status/viralStatus', 'SPF 9', LABKEY.Filter.Types.EQUALS)].concat(this.filterArray),
                        rowField: EHR.panel.PopulationPanel.FIELDS.species,
                        colFields: [EHR.panel.PopulationPanel.FIELDS.ageclass, EHR.panel.PopulationPanel.FIELDS.gender]
                    }],
                    itemId: 'spf'
                },{
                    title: 'Room Utilization',
                    xtype: 'ehr-roomutilizationpanel',
                    itemId: 'roomUtilization'
                },{
                    title: 'Utilization',
                    xtype: 'ehr-utilizationsummarypanel',
                    filterArray: this.filterArray,
                    itemId: 'utilizationSummary'
                },{
                    title: 'Clinical',
                    xtype: 'ehr-clinicalsummarypanel',
                    filterArray: this.filterArray,
                    itemId: 'clinicalSummary'
                }]
            }]
        });

        this.activeTab = 1;

        var tokens = document.location.hash.split('#');
        if (tokens && tokens.length > 1){
            tokens = tokens[1].split('&');
            for (var i=0;i<tokens.length;i++){
                var t = tokens[i].split('=');
                if (t.length == 2 && t[0] == 'tab'){
                    //this.activeTab = t[0];
                }
            }
        }

        this.callParent();
    }
});



Ext4.define('EHR.panel.RoomUtilizationPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ehr-roomutilizationpanel',
    initComponent: function(){
        Ext4.apply(this, {
            style: 'padding: 5px',
            border: false,
            defaults: {
                border: false
            },
            items: [{
                xtype: 'grid',
                columns: [{
                    dataIndex: 'room',
                    header: 'Room',
                    width: 200
                },{
                    dataIndex: 'AvailableCages',
                    id: 'availCagesCol',
                    text: 'Total Cages',
                    width: 200,
                    summaryType: 'sum'
                },{
                    dataIndex: 'CagesEmpty',
                    id: 'cagesEmptyCol',
                    text: 'Empty Cages',
                    width: 200,
                    summaryType: 'sum'
                },{
                    dataIndex: 'pctUsed',
                    id: 'pctCol',
                    text: '% Used',
                    width: 200,
                    summaryType: 'sum',
                    summaryRenderer: function(val){
                        if (val){
                            val = Ext4.util.Format.round(val, 1);
                        }
                        return val;
                    }
                },{
                    dataIndex: 'TotalAnimals',
                    text: 'Total Animals',
                    width: 200,
                    renderer: function(value, attrs, rec){
                        var url = LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {schemaName: 'study', 'query.queryName': 'demographics', 'query.viewName': 'Alive, at Center', 'query.Id/curLocation/room~eq': rec.get('room')});
                        return '<a href="' + url + '">' + value + '</a>';
                    },
                    summaryType: 'sum'
                }],
                store: {
                    type: 'labkey-store',
                    schemaName: 'ehr_lookups',
                    queryName: 'roomUtilization',
                    columns: 'room/area,room,TotalAnimals,CagesEmpty,TotalCages,AvailableCages,CagesUsed,pctUsed',
                    filterArray: [LABKEY.Filter.create('TotalCages', 0, LABKEY.Filter.Types.GT)],
                    autoLoad: true,
                    groupers: [{
                        property: 'room/area'
                    }]
                },
                features: [{
                    ftype:'groupingsummary',
                    startCollapsed: true,
                    groupHeaderTpl: '{name}',
                    generateSummaryData: function(){
                        var data = Ext4.grid.feature.GroupingSummary.prototype.generateSummaryData.call(this, arguments);
                        for (var group in data){
                            var pct = 1 - (data[group].cagesEmptyCol / data[group].availCagesCol);
                            pct = pct * 100;
                            data[group].pctCol = pct;
                        }

                        return data;
                    }
                }]
            }]
        });

        this.callParent();
    }
});