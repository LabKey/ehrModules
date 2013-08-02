/**
 * @cfg {String} animalId
 * @cfg {String} dataRegionName
 */
Ext4.define('EHR.window.ManageTreatmentsWindow', {
    extend: 'Ext.window.Window',

    initComponent: function(){
        LABKEY.ExtAdapter.apply(this, {
            title: 'Manage Treatments: ' + this.animalId,
            modal: true,
            items: [{
                xtype: 'ehr-managetreatmentspanel',
                animalId: this.animalId,
                hideButtons: true
            }],
            buttons: this.getButtonConfig()
        });

        this.callParent(arguments);
    },

    getButtonConfig: function(){
        var buttons = EHR.panel.ManageTreatmentsPanel.getButtonConfig();
        buttons.push({
            text: 'Close',
            handler: function(btn){
                btn.up('window').close();
            }
        });

        return buttons;
    }
});
