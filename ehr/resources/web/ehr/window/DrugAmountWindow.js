/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg targetGrid
 * @cfg label
 */
Ext4.define('EHR.window.DrugAmountWindow', {
    extend: 'Ext.window.Window',
    alias: 'widget.ehr-drugamountwindow',

    initComponent: function(){
        LABKEY.ExtAdapter.apply(this, {
            modal: true,
            closeAction: 'destroy',
            width: 1100,
            title: 'Set Drug Amounts',
            bodyStyle: 'padding: 5px;',
            defaults: {
                border: false
            },
            items: [{
                html: 'This helper is designed to help calculate drug amounts.  Below is each drug entered, along with the most recent weight and estimated amount.  All values can be changed.',
                style: 'margin-bottom: 10px;'
            },{
                layout: 'hbox',
                style: 'margin-bottom: 10px;',
                defaults: {
                    border: false
                },
                items: [{
                    itemId: 'lotField',
                    labelWidth: 120,
                    style: 'margin-right: 10px;',
                    fieldLabel: 'Lot # (optional)',
                    xtype: 'textfield'
                },{
                    itemId: 'weightType',
                    fieldLabel: 'Weight Type',
                    style: 'margin-right: 10px;',
                    width: 300,
                    labelWidth: 90,
                    xtype: 'combo',
                    displayField: 'value',
                    valueField: 'value',
                    value: 'Prefer Weight From Form',
                    store: {
                        type: 'array',
                        fields: ['value'],
                        data: [
                            ['Prefer Weight From Form'], 
                            ['Use Latest Saved Weight']
                        ]
                    }
                }]
            },{
                itemId: 'animalIds',
                items: this.getInitialItems()
            }],
            buttons: [{
                text: 'Submit',
                itemId: 'submitBtn',
                scope: this,
                handler: this.onSubmit
            },{
                text: 'Close',
                handler: function(btn){
                    btn.up('window').close();
                }
            }]
        });

        this.callParent();

        this.on('beforeshow', function(window){
            if (!this.targetGrid.store.getCount()){
                Ext4.Msg.alert('No Records', 'There are no records to in the grid, nothing to do.');
                return false;
            }
        }, this);

        this.loadDemographics();
    },

    loadDemographics: function(){
        var ids = {};
        this.targetGrid.store.each(function(r){
            ids[r.get('Id')] = true;
        }, this);

        this.animalIds = Ext4.Object.getKeys(ids);

        EHR.DemographicsCache.getDemographics(this.animalIds, this.onDemographicsLoad, this, -1);        
    },

    onDemographicsLoad: function(ids, animalRecordMap){
        this.animalRecordMap = animalRecordMap;
        console.log('demographics loaded');
        
        EHR.DataEntryUtils.getWeights(this.targetGrid.store.storeCollection, this.animalIds, this.onWeightsLoad, this, true);
    },

    onWeightsLoad: function(weightMap){
        this.weights = weightMap;
        console.log('weights loaded');
        
        var target = this.down('#animalIds');
        target.removeAll();

        var toAdd = this.getDrugRows();
        if (toAdd.length)
            target.add(toAdd);
        else
            target.add({
                html: 'No animals found'
            });
    },

    getInitialItems: function(){
        return [{
            border: false,
            html: 'Loading...'
        }]
    },

    getDrugRows: function(){
        var numCols = 12;
        var items = [{
            html: '<b>Animal</b>'
        },{
            html: '<b>Drug</b>'
        },{
            html: '<b>Weight (kg)</b>'
        },{
            html: '<b>Rounding</b>'
        },{
            html: '<b>Conc</b>'
        },{
            html: '<b>Units</b>'
        },{
            html: '<b>Dosage</b>'
        },{
            html: '<b>Units</b>'
        },{
            html: '<b>Vol</b>'
        },{
            html: '<b>Units</b>'
        },{
            html: '<b>Amount</b>'
        },{
            html: '<b>Units</b>'
        }];

        var fields = [{
            name: 'concentration',
            width: 100
        },{
            name: 'conc_units',
            width: 70
        },{
            name: 'dosage',
            width: 100
        },{
            name: 'dosage_units',
            width: 70
        },{
            name: 'volume',
            width: 100
        },{
            name: 'vol_units',
            width: 70
        },{
            name: 'amount',
            width: 100
        },{
            name: 'amount_units',
            width: 70
        }];

        this.targetGrid.store.each(function(record, recordIdx){
            if (!record.get('Id')){
                return;
            }

            var ar = this.animalRecordMap[record.get('Id')];

            items.push({
                xtype: 'displayfield',
                value: record.get('Id'),
                record: record,
                recordIdx: recordIdx,
                fieldName: 'Id'
            });

            items.push({
                xtype: 'displayfield',
                recordIdx: recordIdx,
                fieldName: 'code',
                value: record.get('code')
            });

            items.push({
                xtype: 'numberfield',
                hideTrigger: true,
                width: 70,
                fieldName: 'weight',
                recordIdx: recordIdx,
                value: this.weights[record.get('Id')],
                listeners: {
                    scope: this,
                    change: function(field, val){
                        var round = field.up('ehr-drugamountwindow').down('#roundField').getValue();
                        var dosageField = field.up('panel').down("numberfield[key='" + field.key + "][fieldName='dosage']");
                        var amountField = field.up('panel').down("numberfield[key='" + field.key + "][fieldName='amount']");
                        var weightField = field;
                        LDK.Assert.assertNotEmpty('Unable to find target field in DrugAmountWindow after weight change', dosageField);

                        var amount = weightField.getValue() ? Ext4.util.Format.round(weightField.getValue() * dosageField.getValue(), 1) : null;

                        amountField.suspendEvents();
                        amountField.setValue(EHR.Utils.roundToNearest(amount, round));
                        amountField.resumeEvents();
                    }
                }
            });

            items.push({
                xtype: 'numberfield',
                hideTrigger: true,
                width: 70,
                //fieldName: 'rounding',
                recordIdx: recordIdx,
                value: this.weights[record.get('Id')]
            });

            Ext4.Array.forEach(fields, function(fieldObj){
                var fieldName = fieldObj.name;
                var editor, found = false;
                LABKEY.ExtAdapter.each(this.targetGrid.formConfig.fieldConfigs, function(field, idx){
                    if (fieldName == field.name){
                        var cfg = LABKEY.ExtAdapter.apply({}, field);
                        cfg = EHR.model.DefaultClientModel.getFieldConfig(cfg, this.targetGrid.formConfig.configSources);

                        editor = LABKEY.ext4.Util.getGridEditorConfig(cfg);
                        found = true;

                        return false;
                    }
                }, this);

                LDK.Assert.assertTrue('Unable to find target field in DrugAmountWindow: ' + fieldName, found);

                if (editor){
                    editor.width = fieldObj.width;
                    editor.value = record.get(fieldName);
                    if (editor.xtype == 'numberfield'){
                        editor.hideTrigger = true;
                    }

                    items.push(editor);
                }
                else {
                    items.push({
                        html: ''
                    });
                }

            }, this);
        }, this);

        return [{
            border: false,
            itemId: 'theTable',
            layout: {
                type: 'table',
                columns: numCols
            },
            defaults: {
                border: false,
                style: 'margin-left: 5px;margin-right: 5px;'
            },
            items: items
        }];
    },

    getColumnByName: function(grid, name) {
        var columns = grid.columns,
                len = columns.length,
                i, header;

        for (i = 0; i < len; ++i) {
            header = columns[i];

            if (header.name === name) {
                return header;
            }
        }
        return null;
    },

    onSubmit: function(btn){
        var toAdd = [];
        var lot = this.down('#lotField').getValue();

        Ext4.Array.forEach(this.getRows(), function(data){
            if (!data.amount || data.exclude)
                return;

            delete data.weight;

            Ext4.apply(data, {
                route: 'IM',
                dosage_units: data.dosage ? 'mg/kg' : null,
                amount_units: 'mg',
                performedby: LABKEY.Security.currentUser.displayName,
                lot: lot
            });

            toAdd.push(this.targetGrid.store.createModel(data));
        }, this);

        if (toAdd.length)
            this.targetGrid.store.add(toAdd);

        this.close();
    }
});

EHR.DataEntryUtils.registerGridButton('DRUGAMOUNTHELPER', function(config){
    return Ext4.Object.merge({
        text: 'Set Amount(s)',
        xtype: 'button',
        tooltip: 'Click to set the drug amounts',
        handler: function(btn){
            var grid = btn.up('gridpanel');

            Ext4.create('EHR.window.DrugAmountWindow', {
                targetGrid: grid,
                formConfig: grid.formConfig
            }).show();
        }
    });
});
