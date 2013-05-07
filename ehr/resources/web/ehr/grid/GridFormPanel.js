Ext4.define('EHR.grid.GridFormPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ehr-gridformpanel',

    initComponent: function(){
        this.store = {
            autoLoad: true,
            schemaName: this.formConfig.schemaName,
            queryName: this.formConfig.queryName,
            filterArray: this.getFilterArray()
        };

        Ext4.apply(this, {
            defaults: {
                border: false
            }
        });

        this.callParent();
    },

    getFilterArray: function(){
        return [LABKEY.Filter.create('taskid', this.taskId, LABKEY.Filter.Types.EQUAL)]
    }

});
