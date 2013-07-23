/**
 * @cfg dataRegionName
 */
Ext4.define('EHR.window.GetDistinctWindow', {
    extend: 'Ext.window.Window',

    initComponent: function(){
        var dataRegion = LABKEY.DataRegions[this.dataRegionName];

        //NOTE: this allows queries to redirect to a query other than themselves (ie. if a query is a derivative of a dataset)
        this.queryName = this.queryName || dataRegion.queryName;
        this.schemaName = this.schemaName || dataRegion.schemaName;

        Ext4.apply(this, {
            defaults: {
                border: false
            },
            width: 280,
            height: 130,
            modal: true,
            bodyStyle: 'padding:5px',
            closeAction: 'destroy',
            title: 'Return Distinct Values',
            items: [{
                emptyText: '',
                fieldLabel: 'Select Field',
                itemId: 'field',
                xtype: 'combo',
                displayField:'name',
                valueField: 'value',
                queryMode: 'local',
                width: 260,
                editable: true,
                value: 'id',
                required: true,
                store: {
                    type: 'array',
                    fields: ['name', 'value'],
                    data: [['Animal Id','id'], ['Project','project'], ['Date','date']]
                }
            }],
            buttons: [{
                text: 'Submit',
                disabled: false,
                scope: this,
                handler: this.runSQL
            },{
                text: 'Close',
                scope: this,
                handler: function(btn){
                    btn.up('window').destroy();
                }
            }]
        });

        this.callParent();
    },

    runSQL: function (){
        var dataRegion = LABKEY.DataRegions[this.dataRegionName];
        var checked = dataRegion.getChecked();
        var field = this.down('#field').getValue();

        var pkCols = dataRegion.pkCols || ['lsid'];
        var colExpr = '(s.' + pkCols.join(" || ',' || s.") + ')';
        var sql = "SELECT DISTINCT s."+field+" as field FROM " + this.schemaName + ".\"" + this.queryName + "\" s WHERE " + colExpr + " IN ('" + checked.join("', '") + "')";

        this.close();

        LABKEY.Query.executeSql({
            schemaName: 'study',
            sql: sql,
            failure: LDK.Utils.getErrorCallback(),
            success: function(data){
                var ids = {};
                for (var i = 0; i < data.rows.length; i++){
                    if (!data.rows[i].field)
                        continue;

                    if (data.rows[i].field && !ids[data.rows[i].field])
                        ids[data.rows[i].field] = 0;

                    ids[data.rows[i].field] += 1;

                }

                var result = '';
                var total = 0;
                for(var j in ids){
                    result += j + "\n";
                    total++;
                }

                Ext4.create('Ext.window.Window', {
                    width: 280,
                    modal: true,
                    bodyStyle: 'padding:5px',
                    closeAction: 'destroy',
                    title: 'Distinct Values',
                    defaults: {
                        border: false
                    },
                    items: [{
                        html: 'Total: ' + total
                    },{
                        xtype: 'textarea',
                        name: 'distinctValues',
                        width: 260,
                        height: 350,
                        value: result
                    }],
                    buttons: [{
                        text: 'Close',
                        scope: this,
                        handler: function(btn){
                            btn.up('window').close();
                        }
                    }]
                }).show();
            }
        });
    }

});