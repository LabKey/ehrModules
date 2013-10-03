/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.window.CopyFromBloodWindow', {
    extend: 'Ext.window.Window',

    initComponent: function(){
        this.getParentRecords();

        LABKEY.ExtAdapter.applyIf(this, {
            modal: true,
            width: 750,
            closeAction: 'destroy',
            title: 'Copy From Above',
            bodyStyle: 'padding: 5px;',
            defaults: {
                border: false
            },
            items: [{
                html: 'This helper allows you to populate 1 row for each animal in the blood draws section.  Choose which IDs to add from the list below.',
                style: 'margin-bottom: 10px;'
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
            if (!this.parentRecords.length){
                Ext4.Msg.alert('No Records', 'There are no records to copy.  Note: only records with an Id/Date can be copied.');
                return false;
            }
        }, this);
    },

    getParentRecords: function(){
        var records = [];
        this.parentStore.each(function(r){
            if (r.get('Id') && r.get('date')){
                records.push(r);
            }
        }, this);

        this.parentRecords = records;

        return records;
    },

    getExistingIds: function(){
        var map = {};
        this.targetGrid.store.each(function(r){
            if (r.get('Id'))
                map[r.get('Id')] = true;
        }, this);

        return map;
    },

    getInitialItems: function(){
        var items = [{
            html: '<b>Animal</b>'
        },{
            html: '<b>Date</b>'
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
                key: key,
                value: o.Id,
                fieldName: 'Id'
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
                width: 300,
                format: 'Y-m-d H:i',
                timeFormat: 'H:i',
                fieldName: 'date',
                key: key,
                value: minDate
            });

            items.push({
                xtype: 'checkbox',
                key: key,
                fieldName: 'exclude',
                checked: existingIds[key]
            });
        }, this);

        return [{
            itemId: 'theTable',
            border: false,
            layout: {
                type: 'table',
                columns: 3
            },
            defaults: {
                border: false,
                style: 'margin: 5px;'
            },
            items: items
        }]
    },

    getRows: function(){
        var table = this.down('#theTable');
        var rowMap = {};
        table.items.each(function(item){
            if (item.fieldName){
                rowMap[item.key] = rowMap[item.key] || {};
                rowMap[item.key][item.fieldName] = item.getValue ? item.getValue() : item.value;
            }
        }, this);

        return Ext4.Object.getValues(rowMap);
    },

    onSubmit: function(btn){
        var toAdd = [];
        Ext4.Array.forEach(this.getRows(), function(data){
            if (!data.exclude){
                toAdd.push(this.targetGrid.store.createModel(data));
            }
        }, this);

        if (toAdd.length)
            this.targetGrid.store.add(toAdd);

        this.close();
    }
});


EHR.DataEntryUtils.registerGridButton('COPYFROMBLOOD', function(config){
    return Ext4.Object.merge({
        text: 'Copy From Blood',
        xtype: 'button',
        tooltip: 'Click to copy records from the blood draws section',
        handler: function(btn){
            var grid = btn.up('grid');
            LDK.Assert.assertNotEmpty('Unable to find grid in COPYFROMBLOOD button', grid);

            var panel = grid.up('ehr-dataentrypanel');
            LDK.Assert.assertNotEmpty('Unable to find dataEntryPanel in COPYFROMBLOOD button', panel);

            var store = panel.storeCollection.getClientStoreByName('Blood Draws');
            LDK.Assert.assertNotEmpty('Unable to find blood draw store in COPYFROMBLOOD button', store);

            if (store){
                Ext4.create('EHR.window.CopyFromBloodWindow', {
                    targetGrid: grid,
                    parentStore: store
                }).show();
            }
        }
    });
});