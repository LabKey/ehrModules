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
            bodyStyle: 'padding: 5px;',
            items: [{
                xtype: 'ehr-managetreatmentspanel',
                animalId: this.animalId,
                dataRegionName: this.dataRegionName
            }]
        });

        this.callParent(arguments);
    }
});
