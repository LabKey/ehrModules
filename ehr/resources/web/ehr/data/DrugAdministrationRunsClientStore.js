/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @param fieldConfigs
 */
Ext4.define('EHR.data.DrugAdministrationRunsClientStore', {
    extend: 'EHR.data.DataEntryClientStore',

    constructor: function(){
        this.callParent(arguments);

        this.formularyStore = EHR.DataEntryUtils.getFormularyStore();
        if (this.formularyStore.getCount()){
            this.getFormularyMap();
        }
        else {
            this.mon(this.formularyStore, 'load', this.getFormularyMap, this);
        }

        this.on('add', this.onAddRecord, this);
    },

    getFormularyMap: function(){
        if (this.formularyMap){
            return this.formularyMap;
        }

        var map = {};
        this.formularyStore.each(function(r){
            var code = r.get('code');
            if (!code){
                return;
            }

            //TODO: allow config to filter on category

            if (!map[code]){
                map[code] = [];
            }

            map[code].push(r);
        }, this);

        this.formularyMap = map;

        return this.formularyMap;
    },

    getFormularyRecords: function(code){
        var ret = this.getFormularyMap() ? this.getFormularyMap()[code] : null;

        return ret || [];
    },

    onAddRecord: function(store, records){
        Ext4.each(records, function(record){
            var modified = ['code'];
            for (var field in this.fieldMap){
                if (record.fields.get(field) && !Ext4.isEmpty(record.get(field))){
                    modified.push(field);
                }
            }

            this.onRecordUpdate(record, modified);
        }, this);
    },

    afterEdit: function(record, modifiedFieldNames){
        this.onRecordUpdate(record, modifiedFieldNames);

        this.callParent(arguments);
    },

    fieldMap: {
        concentration: 'concentration',
        conc_units: 'conc_units',
        dosage: 'dosage',
        dosage_units: 'dosage_units',
        volume: 'volume',
        vol_units: 'vol_units',
        amount: 'amount',
        amount_units: 'amount_units',
        frequency: 'frequency',
        route: 'route'
    },

    onRecordUpdate: function(record, modifiedFieldNames){
        if (record.get('code')){
            modifiedFieldNames = modifiedFieldNames || [];

            if (modifiedFieldNames.indexOf('code') == -1){
                return;
            }

            if (!this.formularyStore){
                LDK.Utils.logToServer({
                    message: 'Unable to find formulary store in DrugAdministrationRunsClientStore'
                });
                console.error('Unable to find formulary store in DrugAdministrationRunsClientStore');

                return;
            }

            var records = this.getFormularyRecords(record.get('code'));
            if (records.length == 1){
                var params = {};

                for (var fieldName in this.fieldMap){
                    if (modifiedFieldNames.indexOf(this.fieldMap[fieldName]) != -1){
                        console.log('field already set: ' + fieldName);
                        continue;
                    }

                    var def = records[0].get(fieldName);
                    if (def){
                        params[this.fieldMap[fieldName]] = def;
                    }
                }

                if (!LABKEY.Utils.isEmptyObj(params)){
                    record.beginEdit();
                    record.set(params);
                    record.endEdit(true);
                }
            }
        }
    }
});
