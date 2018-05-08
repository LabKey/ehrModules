/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @param filterArray
 */
Ext4.define('EHR.panel.UtilizationSummaryPanel', {
    extend: 'EHR.panel.BasicAggregationPanel',
    alias: 'widget.ehr-utilizationsummarypanel',

    aggregateData: {},

    border: false,
    defaults: {
        border: false,
        bodyStyle: 'background-color: transparent;'
    },

    initComponent: function(){

        this.items = [
            Ext4.create('LDK.panel.WebpartPanel', {
                title: 'Colony Utilization',
                useDefaultPanel: true,
                items: [{
                    itemId: 'childPanel',
                    border: false,
                    defaults: {
                        border: false,
                        bodyStyle: 'background-color: transparent;'
                    },
                    items: [{
                        html: '<i class="fa fa-spinner fa-pulse"></i> loading...'
                    }]
                }]
            })
        ];

        this.callParent();

        this.loadData();
    },

    getCategories: function() {
        return [
            {label: 'By Category', column: 'Id/utilization/usageCategories'},
            {label: 'By Funding Source', column: 'Id/utilization/fundingCategories'}
        ];
    },

    loadData: function(){
        var multi = new LABKEY.MultiRequest();
        var colNames = Ext4.Array.pluck(this.getCategories(), 'column');

        //find animal count
        multi.add(LABKEY.Query.selectRows, {
            requiredVersion: 9.1,
            schemaName: 'study',
            queryName: 'Demographics',
            filterArray: this.filterArray,
            columns: ['Id', 'species', 'Id/age/ageInYears', 'Id/ageclass/label'].concat(colNames).join(','),
            failure: LDK.Utils.getErrorCallback(),
            scope: this,
            success: function(results){
                this.demographicsData = results;
                Ext4.each(colNames, function(colName) {
                    this.aggregateData[colName] = this.aggregateResults(results, colName);
                }, this);
            }
        });

        multi.send(this.onLoad, this);
    },

    onLoad: function(){
        var target = this.down('#childPanel');
        target.removeAll();

        var cfg = {
            defaults: {
                border: false,
                bodyStyle: 'background-color: transparent;'
            },
            items: []
        };

        Ext4.each(this.getCategories(), function(category) {
            var item = this.appendSection(category.label, this.aggregateData[category.column], category.column, 'eq');
            if (item) {
                cfg.items.push(item);
            }
        }, this);

        if (!cfg.items.length){
            cfg.items.push({
                html: 'No records found'
            });
        }

        target.add(cfg);
    },

    getKeys: function(data){
        return Ext4.Object.getKeys(data.aggregated).sort(function(a, b){
            return data.aggregated[b] - data.aggregated[a];
        });
    }
});
