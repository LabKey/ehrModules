/**
 * @param filterArray
 */
Ext4.define('EHR.panel.UtilizationSummaryPanel', {
    extend: 'EHR.panel.BasicAggregationPanel',
    alias: 'widget.ehr-utilizationsummarypanel',
    initComponent: function(){
        Ext4.apply(this, {
            style: 'padding: 5px',
            border: false,
            defaults: {
                border: false
            },
            items: [{
                html: '<b>Colony Utilization:</b>'
            },{
                html: '<hr>'
            },{
                itemId: 'childPanel',
                defaults: {
                    border: false
                },
                items: [{
                    html: 'Loading...'
                }]
            }]
        });

        this.callParent();

        this.loadData();
    },

    loadData: function(){
        var multi = new LABKEY.MultiRequest();

        //find animal count
        multi.add(LABKEY.Query.selectRows, {
            requiredVersion: 9.1,
            schemaName: 'study',
            queryName: 'Demographics',
            filterArray: this.filterArray,
            columns: ['Id', 'Id/utilization/usageCategories', 'species', 'Id/age/ageInYears', 'Id/ageclass/label'].join(','),
            failure: LDK.Utils.getErrorCallback(),
            scope: this,
            success: function(results){
                this.demographicsData = results;
                this.usageCategoryData = this.aggregateResults(results, 'Id/utilization/usageCategories');
            }
        });

        multi.send(this.onLoad, this);
    },

    onLoad: function(){
        var target = this.down('#childPanel');
        target.removeAll();

        var cfg = {
            defaults: {
                border: false
            },
            items: []
        };

        cfg.items.push(this.appendSection('By Category', this.usageCategoryData, 'Id/utilization/usageCategories', 'eq'));

        target.add(cfg);
    }
});
