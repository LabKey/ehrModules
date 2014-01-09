/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @param fieldConfigs
 */
Ext4.define('EHR.data.LabworkResultsStore', {
    extend: 'EHR.data.DataEntryClientStore',

    constructor: function(){
        this.callParent(arguments);

        this.on('add', this.onAddRecord, this);
    },

    onAddRecord: function(store, records){
        Ext4.each(records, function(record){
            this.updateUnits(record, ['testid'], true);
        }, this);
    },

    afterEdit: function(record, modifiedFieldNames){
        this.updateUnits(record, modifiedFieldNames);

        this.callParent(arguments);
    },

    updateUnits: function(record, modifiedFieldNames, silent){
        if (record.fields.get('testid') && record.get('testid')){
            modifiedFieldNames = modifiedFieldNames || [];
            if (record.get('units') && modifiedFieldNames.indexOf('testid') == -1){
                return;
            }

            var field = this.getFields().get('testid');
            if (!field && !field.lookup)
                return;

            var storeId = LABKEY.ext4.Util.getLookupStoreId({
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
                record.beginEdit();
                record.set(params);
                record.endEdit(silent);
            }
        }
    }
});
