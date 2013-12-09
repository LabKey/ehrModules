Ext4.define('EHR.data.ClinicalObservationsClientStore', {
    extend: 'EHR.data.DataEntryClientStore',

    constructor: function(){
        this.callParent(arguments);

        this.observationTypesStore = Ext4.create('LABKEY.ext4.Store', {
            type: 'labkey-store',
            schemaName: 'ehr_lookups',
            queryName: 'observation_types',
            columns: 'value,description',
            autoLoad: true
        });
    }
});
