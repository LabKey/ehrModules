/**
 *  This section is primarily used for single-query editing (like the [update] link).
 *  It will inherit EHR's metadata, and also apply the UserEditableCombo plugin to any combo field,
 *  similar to LDK's simple form panel.
 */
Ext4.define('EHR.panel.SimpleDataEntryFormPanel', {
    extend: 'EHR.form.Panel',
    alias: 'widget.ehr-simpledataentryformpanel',

    initComponent: function(){
        this.callParent(arguments);
    },

    getRawFieldConfigs: function(){
        var cfgs = this.callParent(arguments);
        Ext4.Array.forEach(cfgs, function(item){
            if (item.cfg && (item.cfg.xtype == 'combo' || item.cfg.xtype == 'labkey-combo')){
                if (!item.cfg.plugins){
                    item.cfg.plugins = [];
                    item.cfg.plugins.push(Ext4.create('LDK.plugin.UserEditableCombo', {
                        allowChooseOther: false
                    }));
                }
            }
        }, this);

        return cfgs;
    }
});