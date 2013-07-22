/**
 * @cfg {String} animalId
 */
Ext4.define('EHR.panel.ManageTreatmentsPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ehr-managetreatmentspanel',

    initComponent: function(){
        Ext4.apply(this, {
            border: false,
            defaults: {
                border: false
            },
            items: [{
                html: 'Loading...'
            }]
        });

        this.callParent();

        this.loadData();
    },

    loadData: function(){
        this.store = Ext4.create('LABKEY.ext4.Store', {
            schemaName: 'study',
            queryName: 'Treatment Orders',
            columns: 'Id,date,enddate,category,remark,performedby,code,dose,dose_units,amount,amount_units,concentration,conc_units',
            filterArray: [
                LABKEY.Filter.create('Id', this.subjectId, LABKEY.Filter.Types.EQUAL),
                LABKEY.Filter.create('isActive', true, LABKEY.Filter.Types.EQUAL)
            ],
            scope: this,
            listeners: {
                scope: this,
                load: this.onStoreLoad
            },
            autoLoad: true
        });
    },

    onStoreLoad: function(store){
        console.log(store);
    }
});