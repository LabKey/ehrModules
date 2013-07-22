Ext4.define('EHR.panel.SimpleDataEntryPanel', {
    extend: 'EHR.panel.DataEntryPanel',
    alias: 'widget.ehr-simpledataentrypanel',

    taskId: null,

    initComponent: function(){
        this.pkCol = this.pkCol || LABKEY.ActionURL.getParameter('pkCol');
        this.pkValue = this.pkValue || LABKEY.ActionURL.getParameter('key');
        this.callParent();
    },

    applyConfigToServerStore: function(cfg){
        cfg = this.callParent(arguments);
        cfg.filterArray = cfg.filterArray || [];
        cfg.filterArray.push(LABKEY.Filter.create(this.pkCol, this.pkValue, LABKEY.Filter.Types.EQUAL));
        return cfg;
    }
});