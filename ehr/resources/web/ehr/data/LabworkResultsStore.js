/**
 * @param fieldConfigs
 */
Ext4.define('EHR.data.LabworkResultsStore', {
    extend: 'EHR.data.DataEntryClientStore',

    afterEdit: function(record, modifiedFieldNames){
        this.updateUnits(record, modifiedFieldNames);

        this.callParent(arguments);
    },

    updateUnits: function(record, modifiedFieldNames){
        if (record.get('testid')){
            modifiedFieldNames = modifiedFieldNames || [];
            if (record.get('units') && modifiedFieldNames.indexOf('testid') == -1){
                return;
            }

            var field = this.getFields().get('testid');
            if (!field && !field.lookup)
                return;

            var storeId = LABKEY.ext.Ext4Helper.getLookupStoreId({
                lookup: {
                    schemaName: field.lookup.schemaName,
                    queryName: field.lookup.queryName,
                    keyColumn: 'testid',
                    displayColumn: 'testid'
                }
            });

            var store = Ext4.StoreMgr.get(storeId);
            if (!store){
                LDK.Utils.logToServer({
                    message: 'Unable to find lookup store in LabworkResultsStore'
                });

                return;
            }

            var lookupRecIdx = store.find(field.lookup.keyColumn, record.get('testid'));
            if (lookupRecIdx == -1){
                LDK.Utils.logToServer({
                    message: 'Unable to find lookup record in ClinpathRunsClientStore'
                });

                return;
            }

            var lookupRec = store.getAt(lookupRecIdx);
            var params = {};
            if (lookupRec.get('units'))
                params.units = lookupRec.get('units');

            if (!LABKEY.Utils.isEmptyObj(params)){
                record.set(params);
            }
        }
    }
});
