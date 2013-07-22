/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.plugin.UserEditableCombo', {
    extend: 'Ext.AbstractPlugin',
    pluginId: 'ehr-usereditablecombo',
    mixins: {
        observable: 'Ext.util.Observable'
    },

    alias: 'plugin.ehr-usereditablecombo',

    init: function(combo) {
        this.combo = combo;
        combo.userEditablePlugin = this;

        Ext4.override(combo, {
            onListSelectionChange: function(list, selectedRecords) {
                var val;
                if(selectedRecords && selectedRecords.length && selectedRecords.length == 1)
                    val = selectedRecords[0].get(this.displayField);

                if(val == 'Other'){
                    this.userEditablePlugin.onClickOther();
                    this.collapse();
                }
                else
                {
                    this.callOverridden(arguments);
                }
            }
        });

        if(LABKEY.ext.Ext4Helper.hasStoreLoaded(combo.store)){
            this.addOtherRecord();
        }
        else {
            if (!combo.store.on)
                combo.store = Ext4.ComponentMgr.create(combo.store);
        }

        combo.store.on('load', function(){
            this.addOtherRecord();
        }, this);
    },

    addOtherRecord: function(){
        var rec = this.combo.findRecord(this.combo.displayField, 'Other');
        if (rec){
            console.log('other record exists')
            return;
        }

        var data = {};
        data[this.combo.valueField] = 'Other';
        data[this.combo.displayField] = 'Other';
        this.addRecord(data, this.combo.store.getCount());
    },

    onClickOther: function(){
        Ext4.MessageBox.prompt('Enter Value', 'Enter value:', function(btn, val){
            this.addNewValue(val);
        }, this);
    },

    addNewValue: function(val){
        var data = {};
        if (Ext4.isObject(val)){
            data = val;
        }
        else {
            data[this.combo.valueField] = val;
            data[this.combo.displayField] = val;
        }

        this.addRecord(data);
        this.combo.setValue(data[this.combo.valueField]);
        this.combo.fireEvent('change', this.combo, data[this.combo.valueField], 'Other');
    },

    addRecord: function(data, idx){
        if(!data || LABKEY.Utils.isEmptyObj(data))
            return;

        if (!this.combo.store || !LABKEY.ext.Ext4Helper.hasStoreLoaded(this.combo.store)){
            this.combo.store.on('load', function(store){
                this.addRecord(data);
            }, this, {single: true});

            console.error('unable to add record: '+this.combo.store.storeId);
            console.log(data);

            return;
        }

        idx = idx || this.combo.store.getCount() - 1;
        this.combo.store.insert(idx, this.combo.store.createModel(data));
    }
});