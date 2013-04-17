/**
 * @cfg filterArray
 */
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
                html: '<b>Clinical Summary:</b>'
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

        this.callParent(arguments);

        this.loadData();
    },

    loadData: function(){
        var multi = new LABKEY.MultiRequest();
        multi.add(LABKEY.Query.selectRows, {
            requiredVersion: 9.1,
            schemaName: 'study',
            queryName: 'Problem List',
            viewName: 'Unresolved Problems',
            filterArray: this.filterArray,
            columns: ['Id', 'date', 'category'].join(','),
            failure: LDK.Utils.getErrorCallback(),
            scope: this,
            success: function(results){
                this.problemData = this.aggregateResults(results, 'category');
            }
        });

        multi.add(LABKEY.Query.selectRows, {
            requiredVersion: 9.1,
            schemaName: 'study',
            queryName: 'cases',
            filterArray: [LABKEY.Filter.create('enddateCoalesced', '+0d', LABKEY.Filter.Types.DATE_GREATER_THAN_OR_EQUAL)].concat(this.filterArray),
            columns: ['Id', 'date', 'category'].join(','),
            failure: LDK.Utils.getErrorCallback(),
            scope: this,
            success: function(results){
                this.caseData = this.aggregateResults(results, 'category');
            }
        });

        multi.send(this.onLoad, this);
    },

    aggregateResults: function(results, fieldName){
        if (!results || !results.rows || !results.rows.length)
            return;

        var object = {
            total: results.rows.length,
            aggregated: {}
        };

        Ext4.each(results.rows, function(row){
            var rs = new LDK.SelectRowsRow(row);
            var val = rs.getDisplayValue(fieldName);
            if (!object.aggregated[val])
                object.aggregated[val] = 0;

            object.aggregated[val]++;
        }, this);

        return object;
    },

    onLoad: function(){
        var target = this.down('#childPanel');
        target.removeAll();

        var problemKeys = Ext4.Object.getKeys(this.problemData.aggregated).sort();
        var caseKeys = Ext4.Object.getKeys(this.caseData.aggregated).sort();
        var colCount = problemKeys.length + caseKeys.length;

        var cfg = {
            defaults: {
                border: false
            },
            layout: {
                type: 'table',
                columns: colCount
            },
            items: [{
                html: 'Active Cases',
                style: 'border-bottom: solid 1px;text-align: center;margin-right: 3px;margin-left: 3px;margin-bottom:3px;',
                colspan: caseKeys.length
            },{
                html: 'Open Problems',
                style: 'border-bottom: solid 1px;text-align: center;margin-right: 3px;margin-left: 3px;margin-bottom:3px;',
                colspan: problemKeys.length
            }]
        };

        Ext4.each(caseKeys, function(key){
            cfg.items.push({
                html: key,
                style: 'text-align: center;margin-right: 3px;margin-left: 3px;margin-bottom:3px;'
            });
        }, this);

        Ext4.each(problemKeys, function(key){
            cfg.items.push({
                html: key,
                style: 'text-align: center;margin-right: 3px;margin-left: 3px;margin-bottom:3px;'
            });
        }, this);

        Ext4.each(caseKeys, function(key){
            var val = this.caseData.aggregated[key];
            cfg.items.push({
                html:  Ext4.isDefined(val) ? val.toString() : '',
                style: 'text-align: center;'
            });
        }, this);

        Ext4.each(problemKeys, function(key){
            var val = this.problemData.aggregated[key];
            cfg.items.push({
                html:  Ext4.isDefined(val) ? val.toString() : '',
                style: 'text-align: center;'
            });
        }, this);

        target.add(cfg);
    }
});