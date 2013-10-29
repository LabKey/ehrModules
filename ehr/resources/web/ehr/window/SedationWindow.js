/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg targetGrid
 * @cfg parentStore
 * @cfg label
 */
Ext4.define('EHR.window.SedationWindow', {
    extend: 'EHR.window.CopyFromBloodWindow',

    initComponent: function(){
        this.getParentRecords();

        LABKEY.ExtAdapter.apply(this, {
            width: 860,
            title: 'Add Sedations',
            items: [{
                html: 'This helper allows you to fill out sedation drugs for each animal in the blood draws section.  Choose which IDs and type of sedation to use from the list below.  Note: this will default to the most recent weight for the animal; however, the weight can be adjusted below.',
                style: 'margin-bottom: 10px;'
            },{
                itemId: 'animalIds',
                items: this.getInitialItems()
            }]
        });

        this.callParent();

        this.getWeights();
    },

    getWeights: function(){
        var ids = {};
        Ext4.Array.forEach(this.parentRecords, function(r){
            ids[r.get('Id')] = true;
        }, this);

        this.animalIds = Ext4.Object.getKeys(ids);

        EHR.DataEntryUtils.getWeights(this.targetGrid.store.storeCollection, this.animalIds, this.onLoad, this, true);
    },

    onLoad: function(weightMap){
        this.weights = weightMap;

        EHR.DemographicsCache.getDemographics(this.animalIds, this.onDemographicsLoad, this);
    },

    onDemographicsLoad: function(ids, animalRecordMap){
        var target = this.down('#animalIds');
        target.removeAll();

        this.animalRecordMap = animalRecordMap;

        var toAdd = this.getFinalItems();
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

    getFinalItems: function(){
        var numCols = 8;
        var items = [{
            html: '<b>Animal</b>'
        },{
            html: '' //placeholder for project
        },{
            html: '<b>Date</b>'
        },{
            html: '<b>Drug</b>'
        },{
            html: '<b>Weight (kg)</b>'
        },{
            html: '<b>Dosage (mg/kg)</b>'
        },{
            html: '<b>Amount (mg)</b>'
        },{
            html: '<b>Skip?</b>'
        }];

        var keys = {}, key;
        Ext4.Array.forEach(this.parentRecords, function(record){
            key = record.get('Id');

            keys[key] = keys[key] || {
                Id: record.get('Id'),
                project: record.get('project'),
                dates: [],
                total: 0
            };

            keys[key].total++;
            keys[key].dates.push(record.get('date'))
        }, this);

        var existingIds = this.getExistingIds();
        Ext4.Array.forEach(Ext4.Object.getKeys(keys), function(key){
            var o = keys[key];
            var ar = this.animalRecordMap[key];
            var flags = ar.getActiveFlags();
            var msgs = [];
            if (flags){
                Ext4.Array.forEach(flags, function(f){
                    if ((f.category == 'Alert' || f.category == 'Flag') && f.value && (f.value.match(/Ketamine/i) || f.value.match(/Telazol/i))){
                        msgs.push(f.value);
                    }
                }, this);
            }

            items.push({
                xtype: 'displayfield',
                value: o.Id,
                key: key,
                fieldName: 'Id'
            });

            items.push({
                xtype: 'hidden',
                value: o.project,
                key: key,
                fieldName: 'project'
            });

            var dates = [];
            var minDate;

            Ext4.Array.forEach(o.dates, function(date){
                if (!minDate || date < minDate)
                    minDate = date;

                dates.push(date.format('Y-m-d H:i'));
            }, this);

            items.push({
                xtype: 'xdatetime',
                width: 250,
                format: 'Y-m-d H:i',
                timeFormat: 'H:i',
                fieldName: 'date',
                key: key,
                value: minDate
            });

            items.push({
                xtype: 'combo',
                key: key,
                fieldName: 'code',
                valueField: 'code',
                displayField: 'displayField',
                value: 'E-70590',
                store: {
                    type: 'store',
                    fields: ['code', 'displayField', 'dosage'],
                    data: [
                        {code: 'E-70590', displayField: 'Ketamine', dosage: 10},
                        {code: 'E-YY928', displayField: 'Telazol', dosage: 3},
                        {code: 'none', displayField: 'None', dosage: null}
                    ]
                },
                listeners: {
                    select: function(field, recs){
                        if (!recs || recs.length != 1)
                            return;

                        var dose = recs[0].get('dosage');
                        var weightField = field.up('panel').down("field[key='" + field.key + "][fieldName='weight']");
                        var dosageField = field.up('panel').down("numberfield[key='" + field.key + "][fieldName='dosage']");
                        var amountField = field.up('panel').down("numberfield[key='" + field.key + "][fieldName='amount']");
                        LDK.Assert.assertNotEmpty('Unable to find target field in SedationWindow', dosageField);

                        var amount = weightField.getValue() ? Ext4.util.Format.round(weightField.getValue() * dose, 1) : null;

                        dosageField.setValue(dose);

                        amountField.suspendEvents();
                        amountField.setValue(amount);
                        amountField.resumeEvents();
                    }
                }
            });

            items.push({
                xtype: 'displayfield',
                hideTrigger: true,
                width: 70,
                fieldName: 'weight',
                key: key,
                value: this.weights[o.Id]
            });

            items.push({
                xtype: 'numberfield',
                hideTrigger: true,
                fieldName: 'dosage',
                width: 80,
                key: key,
                value: 10
            });

            items.push({
                xtype: 'numberfield',
                hideTrigger: true,
                fieldName: 'amount',
                width: 80,
                key: key,
                value: this.weights[o.Id] ? Ext4.util.Format.round(this.weights[o.Id] * 10, 1) : null,
                listeners: {
                    change: function(field, value){
                        var dosageField = field.up('panel').down("numberfield[key='" + field.key + "][fieldName='dosage']");
                        LDK.Assert.assertNotEmpty('Unable to find target field in SedationWindow', dosageField);
                        dosageField.setValue(null);
                    }
                }
            });

            items.push({
                xtype: 'checkbox',
                fieldName: 'exclude',
                key: key,
                checked: existingIds[key]
            });

            items.push({
                colspan: numCols,
                bodyStyle: 'padding-bottom: 5px;',
                html: (msgs.length ? '<span style="background-color: yellow">**' + msgs.join('<br>**') + '</span>' : '')
            });
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

    onSubmit: function(btn){
        var toAdd = [];
        Ext4.Array.forEach(this.getRows(), function(data){
            if (!data.amount || data.exclude)
                return;

            delete data.weight;

            Ext4.apply(data, {
                route: 'IM',
                dosage_units: data.dosage ? 'mg/kg' : null,
                amount_units: 'mg',
                performedby: LABKEY.Security.currentUser.displayName
            });

            toAdd.push(this.targetGrid.store.createModel(data));
        }, this);

        if (toAdd.length)
            this.targetGrid.store.add(toAdd);

        this.close();
    }
});

EHR.DataEntryUtils.registerGridButton('COPYSEDATIONFROMBLOOD', function(config){
    return Ext4.Object.merge({
        text: 'Add Sedation(s)',
        xtype: 'button',
        tooltip: 'Click to add sedation records based on the animals in the blood draws section',
        handler: function(btn){
            var grid = btn.up('grid');
            LDK.Assert.assertNotEmpty('Unable to find grid in COPYWEIGHTFROMBLOOD button', grid);

            var panel = grid.up('ehr-dataentrypanel');
            LDK.Assert.assertNotEmpty('Unable to find dataEntryPanel in COPYWEIGHTFROMBLOOD button', panel);

            var store = panel.storeCollection.getClientStoreByName('Blood Draws');
            LDK.Assert.assertNotEmpty('Unable to find blood draw store in COPYWEIGHTFROMBLOOD button', store);

            if (store){
                Ext4.create('EHR.window.SedationWindow', {
                    targetGrid: grid,
                    parentStore: store
                }).show();
            }
        }
    });
});
