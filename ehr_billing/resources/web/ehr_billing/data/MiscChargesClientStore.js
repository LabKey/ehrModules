/*
 * Copyright (c) 2018-2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @param fieldConfigs
 */
Ext4.define('EHR_Billing.data.MiscChargesClientStore', {
    extend: 'EHR.data.DataEntryClientStore',

    constructor: function(){
        this.callParent(arguments);

        this.on('add', this.onAddRecord, this);

        this.chargeRateStore = Ext4.create('LABKEY.ext4.Store', {
            type: 'labkey-store',
            schemaName: 'ehr_billing',
            queryName: 'chargeRates',
            columns: 'chargeId,unitCost,startDate,endDate',
            filterArray: [LABKEY.Filter.create('endDate', '+0d', LABKEY.Filter.Types.DATE_GREATER_THAN_OR_EQUAL)],
            autoLoad: true
        });

        this.chargeRateExemptionStore = Ext4.create('LABKEY.ext4.Store', {
            type: 'labkey-store',
            schemaName: 'ehr_billing',
            queryName: 'chargeRateExemptions',
            columns: 'chargeId,project,unitCost,startDate,endDate',
            filterArray: [LABKEY.Filter.create('endDate', '+0d', LABKEY.Filter.Types.DATE_GREATER_THAN_OR_EQUAL)],
            autoLoad: true
        });

        //force store to load
        EHR_Billing.DataEntryUtils.getChargeableItemsStore();
    },

    onAddRecord: function(store, records){
        Ext4.each(records, function(record){
            var modified = ['chargeId'];

            this.onRecordUpdate(record, modified);
        }, this);
    },

    afterEdit: function(record, modifiedFieldNames){
        this.onRecordUpdate(record, modifiedFieldNames);

        this.callParent(arguments);
    },

    onRecordUpdate: function(record, modifiedFieldNames){
        var params = {};

        if (record.get('chargeId')){
            modifiedFieldNames = modifiedFieldNames || [];

            var unitCost = null;

            //first look for exemptions
            if (record.get('project')){
                this.chargeRateExemptionStore.each(function(er){
                    if (er.get('project') === record.get('project') && er.get('chargeId') === record.get('chargeId')){
                        unitCost = er.get('unitCost');
                        return false;
                    }
                }, this);
            }

            if (unitCost === null){
                this.chargeRateStore.each(function(er){
                    if (er.get('chargeId') === record.get('chargeId')){
                        unitCost = er.get('unitCost');
                        return false;
                    }
                }, this);
            }

            if (unitCost !== null){
                params.unitCost = unitCost;
            }
        }
        else {
            params.unitCost = null;
        }
    }
});
