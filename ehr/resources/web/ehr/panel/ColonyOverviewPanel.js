Ext4.define('EHR.panel.ColonyOverviewPanel', {
    extend: 'Ext.panel.Panel',

    initComponent: function(){
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
                    bodyStyle: 'padding 5px;',
                    xtype: 'ehr-populationpanel',
                    filterArray: [LABKEY.Filter.create('calculated_status', 'Alive', LABKEY.Filter.Types.EQUAL)],
                    rowField: EHR.panel.PopulationPanel.FIELDS.species,
                    colFields: [EHR.panel.PopulationPanel.FIELDS.ageclass, EHR.panel.PopulationPanel.FIELDS.gender],
                    itemId: 'population'
                },{
                    title: 'Room Utilization',
                    xtype: 'ehr-roomutilizationpanel',
                    itemId: 'roomUtilization'
                },{
                    title: 'Assignment',
                    xtype: 'ehr-assignmentsummarypanel',
                    itemId: 'assignmentSummary'
                },{
                    title: 'Clinical',
                    xtype: 'ehr-clinicalsummarypanel',
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
                    text: 'Cages',
                    width: 200,
                    summaryType: 'sum'
                },{
                    dataIndex: 'CagesEmpty',
                    text: 'Empty Cages',
                    width: 200,
                    summaryType: 'sum'
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
                    columns: 'room/area,room,TotalAnimals,CagesEmpty,TotalCages,AvailableCages,CagesUsed',
                    autoLoad: true,
                    groupers: [{
                        property: 'room/area'
                    }]
                },
                features: [{
                    ftype:'groupingsummary',
                    startCollapsed: true,
                    groupHeaderTpl: '{name}'
                }]
            }]
        });

        this.callParent();
    }
});


Ext4.define('EHR.panel.ClinicalSummaryPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ehr-clinicalsummarypanel',
    initComponent: function(){
        Ext4.apply(this, {
            style: 'padding: 5px',
            border: false,
            defaults: {
                border: false
            },
            items: [{
                html: 'This will display a summary of clinical information including total active cases, procedure counts, etc.'
            }]
        });

        this.callParent();
    }
});

Ext4.define('EHR.panel.AssignmentSummaryPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ehr-assignmentsummarypanel',
    initComponent: function(){
        Ext4.apply(this, {
            style: 'padding: 5px',
            border: false,
            defaults: {
                border: false
            },
            items: [{
                html: 'This will display a summary of animal utilization and trends.'
            }]
        });

        this.callParent();
    }
});
