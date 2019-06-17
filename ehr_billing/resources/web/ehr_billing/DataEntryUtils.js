/*
 * Copyright (c) 2018-2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.ns('EHR_Billing.DataEntryUtils');

EHR_Billing.DataEntryUtils = new function(){
    return {

        getChargeableItemsStore: function(){
            if (EHR._chargeableItemsStore)
                return EHR._chargeableItemsStore;

            var storeId = ['ehr_billing', 'chargeableItems', 'rowid', 'name', 'ref'].join('||');

            EHR._chargeableItemsStore = Ext4.StoreMgr.get(storeId) || Ext4.create('LABKEY.ext4.Store', {
                type: 'labkey-store',
                schemaName: 'ehr_billing',
                queryName: 'chargeableItems',
                columns: 'rowid,name,category,allowscustomunitcost',
                sort: 'category,name',
                storeId: storeId,
                autoLoad: true
            });

            return EHR._chargeableItemsStore;
        },
        getProjectStore: function(){
            if (EHR._projectStore)
                return EHR._projectStore;

            var storeId = ['ehr', 'project', 'project', 'displayName'].join('||');

            var ctx = EHR.Utils.getEHRContext();

            EHR._projectStore = Ext4.StoreMgr.get(storeId) || new LABKEY.ext4.data.Store({
                type: 'labkey-store',
                containerPath: ctx ? ctx['EHRStudyContainer'] : null,
                schemaName: 'ehr',
                queryName: 'project',
                columns: 'project,displayName,account,name,protocol,protocol/displayName,title,inves',
                sort: 'displayName',
                storeId: storeId,
                autoLoad: true
            });

            return EHR._projectStore;
        }
    }

};