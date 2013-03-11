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
                    title: 'Population Size',
                    bodyStyle: 'padding 5px;',
                    xtype: 'ehr-populationpanel',
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

Ext4.define('EHR.panel.PopulationPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ehr-populationpanel',
    initComponent: function(){
        Ext4.apply(this, {
            style: 'padding: 5px',
            border: false,
            defaults: {
                border: false
            },
            items: [{
                html: 'Loading...'
            }]
        });

        this.callParent();
        this.loadData();
    },

    loadData: function(){
        var multi = new LABKEY.MultiRequest();
        multi.add(LABKEY.Query.selectRows, {
            requiredVersion: 9.1,
            schemaName: 'study',
            queryName: 'colonyPopulationByAgeClass',
            failure: LDK.Utils.getErrorCallback(),
            scope: this,
            success: function(results){
                this.colonyPopulationSummary = {
                    total: 0,
                    bySpecies: {},
                    species: []
                };

                Ext4.each(results.rows, function(row){
                    var species = row.species.value;
                    var ageClass = row.ageClass.value;
                    var gender = row.gender.value;
                    if (!this.genders[row.gender.value]){
                        this.genders[row.gender.value] = row.gender.displayValue;
                    }

                    if (species){
                        if (this.colonyPopulationSummary.species.indexOf(species) == -1){
                            this.colonyPopulationSummary.species.push(species);
                            this.colonyPopulationSummary.bySpecies[species] = {
                                total: 0,
                                byAge: {},
                                byGender: {}
                            };
                        }
                        this.colonyPopulationSummary.bySpecies[species].total += row.animalCount.value;
                        this.colonyPopulationSummary.total += row.animalCount.value;

                        if (!this.colonyPopulationSummary.bySpecies[species].byAge[ageClass])
                            this.colonyPopulationSummary.bySpecies[species].byAge[ageClass] = {};

                        if (!this.colonyPopulationSummary.bySpecies[species].byAge[ageClass][gender])
                            this.colonyPopulationSummary.bySpecies[species].byAge[ageClass][gender] = 0;

                        this.colonyPopulationSummary.bySpecies[species].byAge[ageClass][gender] += row.animalCount.value;
                    }
                }, this);
            }
        });

        multi.send(this.onLoad, this);
    },

    ageClass: ['Infant', 'Juvenile', 'Adult', 'Senior'],
    genders: {},

    onLoad: function(){
        var toAdd = [];

        var populationSummary = {
            border: false,
            defaults: {
                border: false
            },
            items: [{
                html: '<b>Current Population:</b>'
            },{
                html: '<hr>'
            }]
        };

        //header rows
        var speciesRows = [];
        speciesRows.push({html: ''});
        speciesRows.push({
            html: 'Total',
            style: 'border-bottom: solid 1px;text-align: center;margin-right: 3px;margin-left: 3px;'
        });
        var genders = Ext4.Object.getKeys(this.genders);
        Ext4.each(this.ageClass, function(ageClass){
            speciesRows.push({
                html: ageClass,
                style: 'border-bottom: solid 1px;text-align: center;margin-right: 3px;margin-left: 3px;',
                colspan: genders.length
            });
        }, this);

        speciesRows.push({html: ''});
        speciesRows.push({html: ''});
        Ext4.each(this.ageClass, function(ageClass){
            Ext4.each(genders, function(gender){
                speciesRows.push({
                    html: this.genders[gender]
                });
            }, this);
        }, this);

        Ext4.each(this.colonyPopulationSummary.species, function(s){
            if (Ext4.isDefined(this.colonyPopulationSummary.bySpecies[s])){
                speciesRows.push({
                    html: s + ':',
                    style: 'padding-left: 10px;padding-bottom:3px;padding-right: 5px;'
                });

                //total count
                var url = LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {schemaName: 'study', 'query.queryName': 'Demographics', 'query.viewName': 'Alive, at Center', 'query.species~eq': s});
                speciesRows.push({
                    html: '<a href="' + url + '">' + this.colonyPopulationSummary.bySpecies[s].total + '</a>'
                });

                Ext4.each(this.ageClass, function(ageClass){
                    Ext4.each(genders, function(gender){
                        var data = 0;
                        if (this.colonyPopulationSummary.bySpecies[s].byAge[ageClass])
                            data = this.colonyPopulationSummary.bySpecies[s].byAge[ageClass][gender] || 0;

                        var url = LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {schemaName: 'study', 'query.queryName': 'Demographics', 'query.viewName': 'Alive, at Center', 'query.species~eq': s, 'query.Id/ageclass/label~eq': ageClass, 'query.gender~eq': gender});
                        speciesRows.push({
                            html: '<a href="' + url + '">' + data + '</a>',
                            width: 60
                        });
                    }, this);
                }, this);
            }
        }, this);

        speciesRows.push({
            html: 'Population Total:',
            style: 'padding-left: 10px;'
        });

        var url = LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {schemaName: 'study', 'query.queryName': 'Demographics', 'query.viewName': 'Alive, at Center'});
        speciesRows.push({
            html: '<a href="' + url + '">' + this.colonyPopulationSummary.total + '</a>'
        });

        populationSummary.items.push({
            layout: {
                type: 'table',
                columns: 2 + (this.ageClass.length * genders.length)
            },
            defaults: {
                border: false,
                style: 'text-align: center;padding: 4px'
            },
            items: speciesRows
        });
        toAdd.push(populationSummary);


        var populationTrends = {
            style: 'padding-top: 20px;',
            border: false,
            defaults: {
                border: false
            },
            items: [{
                html: '<b>Population Trends By Year:</b>'
            },{
                html: '<hr>'
            },{
                xtype: 'container',
                defaults: {
                    border: false
                },
                items: [{
                    xtype: 'numberfield',
                    itemId: 'minYear',
                    fieldLabel: 'Min Year'
                },{
                    xtype: 'numberfield',
                    itemId: 'maxYear',
                    fieldLabel: 'Max Year'
                },{
                    xtype: 'radiogroup',
                    itemId: 'grouping',
                    fieldLabel: 'Grouping',
                    columns: 1,
                    items: [{
                        boxLabel: 'Group By Species and Age',
                        inputValue: 'speciesAndAge'
                    },{
                        boxLabel: 'Group By Species Only',
                        inputValue: 'species',
                        checked: true
                    }]
                },{
                    xtype: 'button',
                    text: 'Reload',
                    border: true,
                    scope: this,
                    handler: function(btn){

                    }
                }]
            }]
        };

        toAdd.push(populationTrends);

        this.removeAll();
        this.add(toAdd);

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
//                    dataIndex: 'room/area',
//                    header: 'Area',
//                    width: 100
//                },{
                    dataIndex: 'room',
                    header: 'Room',
                    width: 200
                },{
                    dataIndex: 'AvailableCages',
                    text: 'Cages',
                    width: 200
                },{
                    dataIndex: 'CagesEmpty',
                    text: 'Empty Cages',
                    width: 200
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
                    ftype:'groupingsummary'
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
