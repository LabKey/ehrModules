Ext4.define('EHR.form.field.PathologyCaseNoField', {
    extend: 'Ext.form.field.Trigger',
    alias: 'widget.ehr-pathologycasenofield',

    triggerCls: 'x4-form-search-trigger',
    triggerToolTip: 'Click to calculate the case number',

    initComponent: function(){
        this.callParent(arguments);
    },

    onTriggerClick: function(){
        var record = EHR.DataEntryUtils.getBoundRecord(this);
        if (record){
            Ext4.create('EHR.window.CaseNumberWindow', {
                targetRecord: record
            }).show();
        }
    }
});