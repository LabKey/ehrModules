Ext4.define('EHR.panel.SimpleDataEntryFormPanel', {
    extend: 'EHR.form.Panel',
    alias: 'widget.ehr-simpledataentryformpanel',

    initComponent: function(){
        this.callParent(arguments);

        Ext4.apply(this.bindConfig, {

        });
    }
});