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
            width: 800,
            title: 'Add Sedations',
            items: [{
                html: 'This helper allows you to fill out sedation drugs for each animal in the blood draws section.  Choose which IDs and type of sedation to use from the list below.' +
                    '<br><br>NOTE: This will choose the most recent weight for the animal, preferentially using any weights from this form.',
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

        ids = Ext4.Object.getKeys(ids);

        EHR.DataEntryUtils.getWeights(this.targetGrid.store.storeCollection, ids, this.onLoad, this);
    },

    onLoad: function(weightMap){
        this.weights = weightMap;

        var target = this.down('#animalIds');
        target.removeAll();

        var toAdd = this.getFinalItems();
        if (toAdd.length)
            target.add(toAdd);
        else
            target.add({
                html: 'No animals found'
            })
    },

    getInitialItems: function(){
        return [{
            html: 'Loading...'
        }]
    },

    getFinalItems: function(){
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
                        var target = field.up('panel').down("numberfield[key='" + field.key + "]");
                        LDK.Assert.assertNotEmpty('Unable to find target field in SedationWindow', target);
                        target.setValue(dose);
                    }
                }
            });

            items.push({
                xtype: 'displayfield',
                fieldName: 'weight',
                key: key,
                value: this.weights[o.Id]
            });

            items.push({
                xtype: 'numberfield',
                fieldName: 'dosage',
                key: key,
                value: 10
            });

            items.push({
                xtype: 'checkbox',
                fieldName: 'exclude',
                key: key,
                checked: existingIds[key]
            });
        }, this);

        return [{
            border: false,
            itemId: 'theTable',
            layout: {
                type: 'table',
                columns: 7
            },
            defaults: {
                border: false,
                style: 'margin: 5px;'
            },
            items: items
        }];
    },

    onSubmit: function(btn){
        var toAdd = [];
        Ext4.Array.forEach(this.getRows(), function(data){
            if (!data.dosage || data.exclude)
                return;

            if (data.weight){
                data.amount = Ext4.util.Format.round(data.dosage * data.weight, 2);
                delete data.weight;
            }

            Ext4.apply(data, {
                dosage_units: 'mg/kg',
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
