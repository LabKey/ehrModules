/*
 * Copyright (c) 2013-2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.panel.ColonyOverviewPanel', {
    extend: 'Ext.container.Container',

    border: false,
    defaults: {
        border: false
    },

    initComponent: function(){
        this.filterArray = [
            LABKEY.Filter.create('calculated_status', 'Alive', LABKEY.Filter.Types.EQUAL),
            LABKEY.Filter.create('gender/meaning', 'Unknown', LABKEY.Filter.Types.NEQ)
        ];
        this.childFilterArray = [
            LABKEY.Filter.create('Id/demographics/calculated_status', 'Alive', LABKEY.Filter.Types.EQUAL),
            LABKEY.Filter.create('Id/demographics/gender/meaning', 'Unknown', LABKEY.Filter.Types.NEQ)
        ];

        this.items = [{
            xtype: 'labkey-bootstraptabpanel',
            description: 'This page is designed to give an overview of the colony.',
            items: this.getItems()
        }];

        this.callParent();
    },

    getItems: function(){
        return [{
            title: 'Population Composition',
            itemId: 'population',
            items: [{
                xtype: 'ehr-populationpanel',
                filterArray: this.filterArray,
                rowField: EHR.panel.PopulationPanel.FIELDS.species,
                colFields: [EHR.panel.PopulationPanel.FIELDS.ageclass, EHR.panel.PopulationPanel.FIELDS.gender]
            }]
        },{
            title: 'SPF Colony',
            itemId: 'spf',
            items: [{
                xtype: 'ehr-populationpanel',
                titleText: 'SPF 4 (SPF)',
                filterArray: [LABKEY.Filter.create('Id/viral_status/viralStatus', 'SPF 4', LABKEY.Filter.Types.EQUALS)].concat(this.filterArray),
                rowField: EHR.panel.PopulationPanel.FIELDS.species,
                colFields: [EHR.panel.PopulationPanel.FIELDS.ageclass, EHR.panel.PopulationPanel.FIELDS.gender]
            },{
                xtype: 'ehr-populationpanel',
                titleText: 'SPF 9 (ESPF)',
                filterArray: [LABKEY.Filter.create('Id/viral_status/viralStatus', 'SPF 9', LABKEY.Filter.Types.EQUALS)].concat(this.filterArray),
                rowField: EHR.panel.PopulationPanel.FIELDS.species,
                colFields: [EHR.panel.PopulationPanel.FIELDS.ageclass, EHR.panel.PopulationPanel.FIELDS.gender]
            }]
        },{
            title: 'Housing Summary',
            itemId: 'housingSummary',
            items: [{
                xtype: 'ehr-housingsummarypanel'
            }]
        },{
            title: 'Utilization Summary',
            itemId: 'utilizationSummary',
            items: [{
                xtype: 'ehr-utilizationsummarypanel',
                filterArray: this.filterArray
            }]
        },{
            title: 'Clinical Case Summary',
            itemId: 'clinicalSummary',
            items: [{
                xtype: 'ehr-clinicalsummarypanel',
                demographicsFilterArray: this.filterArray,
                filterArray: this.childFilterArray
            }]
        }];
    }
});