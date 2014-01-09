/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @param fieldConfigs
 */
Ext4.define('EHR.data.ClinpathRunsClientStore', {
    extend: 'EHR.data.DataEntryClientStore',

    constructor: function(){
        this.callParent(arguments);

        this.on('add', this.onAddRecord, this);
    },

    onAddRecord: function(store, records){
        Ext4.each(records, function(record){
            var modified = ['servicerequested'];
            if (record.get('chargetype')){
                modified.push('chargetype');
            }
            this.onRecordUpdate(record, modified);
        }, this);
    },

    afterEdit: function(record, modifiedFieldNames){
        this.onRecordUpdate(record, modifiedFieldNames);

        this.callParent(arguments);
    },

    onRecordUpdate: function(record, modifiedFieldNames){
        if (record.get('servicerequested')){
            modifiedFieldNames = modifiedFieldNames || [];

            var storeId = LABKEY.ext4.Util.getLookupStoreId({
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
                console.error('Unable to find lookup store in ClinpathRunsClientStore');

                return;
            }

            var lookupRecIdx = store.find('servicename', record.get('servicerequested'));
            if (lookupRecIdx == -1){
                LDK.Utils.logToServer({
                    message: 'Unable to find lookup record in ClinpathRunsClientStore'
                });
                console.error('Unable to find lookup record in ClinpathRunsClientStore');

                return;
            }

            var lookupRec = store.getAt(lookupRecIdx);
            var params = {};
            if (lookupRec.get('dataset'))
                params.type = lookupRec.get('dataset');

            //NOTE: if setting both service and chargetype simultaneously, do not override that selection
            if (modifiedFieldNames.indexOf('servicerequested') > -1 && modifiedFieldNames.indexOf('chargetype') == -1 && lookupRec.get('chargetype'))
                params.chargetype = lookupRec.get('chargetype');

            if (modifiedFieldNames.indexOf('servicerequested') > -1 && lookupRec.get('tissue')){
                params.tissue = lookupRec.get('tissue');
            }

            if (!LABKEY.Utils.isEmptyObj(params)){
                record.beginEdit();
                record.set(params);
                record.endEdit(true);
            }
        }
    }
});
