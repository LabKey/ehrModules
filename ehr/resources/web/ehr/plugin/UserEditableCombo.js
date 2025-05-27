Ext4.define('EHR.plugin.UserEditableCombo', {
    extend: 'LDK.plugin.UserEditableCombo',
    pluginId: 'ehr-usereditablecombo',

    useBracketsForUnknownValues: true,

    initComponent: function(){
        this.callParent(arguments);
    }
});