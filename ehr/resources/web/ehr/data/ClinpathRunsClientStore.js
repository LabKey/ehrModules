/**
 * @param fieldConfigs
 */
Ext4.define('EHR.data.ClinpathRunsClientStore', {
    extend: 'EHR.data.DataEntryClientStore',

    afterEdit: function(record, modifiedFieldNames){
        this.onRecordUpdate(record);

        this.callParent(arguments);
    },

    onRecordUpdate: function(record){
        if (record.get('servicerequested')){
            var storeId = LABKEY.ext.Ext4Helper.getLookupStoreId({
                lookup: {
                    schemaName: 'ehr_lookups',
                    queryName: 'labwork_services',
                    keyColumn: 'servicename',
                    displayColumn: 'servicename'
                }
            });

            var store = Ext4.StoreMgr.get(storeId);
            if (!store){
                LDK.Utils.logToServer({
                    message: 'Unable to find lookup store in ClinpathRunsClientStore'
                });

                return;
            }

            var lookupRecIdx = store.find('servicename', record.get('servicerequested'));
            if (lookupRecIdx == -1){
                LDK.Utils.logToServer({
                    message: 'Unable to find lookup record in ClinpathRunsClientStore'
                });

                return;
            }

            var lookupRec = store.getAt(lookupRecIdx);
            var params = {};
            if (lookupRec.get('dataset'))
                params.type = lookupRec.get('dataset');

            if (lookupRec.get('chargetype'))
                params.chargetype = lookupRec.get('chargetype');

            if (lookupRec.get('sampletype'))
                params.sampletype = lookupRec.get('sampletype');

            if (!LABKEY.Utils.isEmptyObj(params)){
                record.beginEdit();
                record.set(params);
                record.endEdit(true);
            }
        }
    }
});
