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
                    this.getPicker().getSelectionModel().deselectAll(true); //note: we need to clear selection in case other is clicked twice in a row
                    this.userEditablePlugin.onClickOther();
                    this.collapse();
                }
                else
                {
                    this.callOverridden(arguments);
                }
            },

            ensureValueInStore: function(){
                this.addValueIfNeeded(this.getValue());
            },

            addValueIfNeeded: function(val){
                if (Ext4.isEmpty(val))
                    return;

                if (val instanceof Ext4.data.Model){
                    return;  //if setting value using a record, it is probably in the store
                }

                if (Ext4.isObject(val)){
                    console.log(val);
                    return;
                }

                if (this.valueField != this.displayField)
                    return;

                if (!this.store){
                    LDK.Utils.logToServer({
                        message: 'Unable to find store in usereditable combo'
                    });
                    return;
                }

                var recIdx = this.store.find(this.valueField, val);
                if (recIdx != -1)
                    return;

                var rec = this.store.createModel({});
                rec.set(this.valueField, val);
                this.store.add(rec);
            },

            setValue: function(val){
                //TODO: need to allow for setting of custom value prior to load
                this.addValueIfNeeded(val);

                this.callOverridden(arguments);
            }
        });

        combo.store.on('add', this.onStoreAdd, this);
        combo.store.on('load', combo.ensureValueInStore, combo);
        combo.store.on('beforerender', combo.ensureValueInStore, combo);

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

    customRecords: {},

    onStoreAdd: function(store, recs){
        Ext4.Array.forEach(recs, function(r){
            var pk = r.get(this.combo.valueField);
            if (!this.customRecords[pk]){
                this.customRecords[pk] = r;
            }
        }, this);
    },

    addOtherRecord: function(){
        var rec = this.combo.findRecord(this.combo.displayField, 'Other');
        if (rec){
            return;
        }

        var data = {};
        data[this.combo.valueField] = 'Other';
        data[this.combo.displayField] = 'Other';
        this.addRecord(data, this.combo.store.getCount());
    },

    onClickOther: function(){
        this.windowIsVisible = true;
        this.addEditorListeners();

        this.window = this.createWindow();

        if (this.window){
            this.mon(this.window, 'close', function(win){
                this.windowIsVisible = false;
                this.window = null;
                this.endEdit();
            }, this, {single: true});
        }
    },

    endEdit: function(){
        var editor = this.combo.up('editor');
        if (editor){
            editor.completeEdit();
        }
        else {
            this.combo.fireEvent('blur', this.combo);
        }
    },

    createWindow: function(){
        return Ext4.MessageBox.prompt('Enter Value', 'Enter value:', function(btn, val){
            this.onWindowClose(val);
        }, this);
    },

    onWindowClose: function(val){
        this.windowIsVisible = false;
        this.window = null;
        this.addNewValue(val);

        this.endEdit();
    },

    addEditorListeners: function(){
        var editor = this.combo.up('editor');
        if (editor){
            var plugin = this;
            Ext4.override(editor, {
                completeEdit : function(remainVisible) {
                    if (plugin && plugin.isWindowIsVisible()){
                        return false;
                    }

                    this.callOverridden(arguments);
                }
            });
        }
    },

    isWindowIsVisible: function(){
        return this.windowIsVisible;
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
        var oldVal = this.combo.getValue();
        this.combo.setValue(data[this.combo.valueField]);
        this.combo.fireEvent('change', this.combo, data[this.combo.valueField], oldVal);
    },

    addRecord: function(data, idx){
        if(!data || LABKEY.Utils.isEmptyObj(data))
            return;

        if (!this.combo.store || !LABKEY.ext.Ext4Helper.hasStoreLoaded(this.combo.store)){
            this.combo.store.on('load', function(store){
                this.addRecord(data, idx);
            }, this, {single: true});

            console.error('unable to add record: ' + this.combo.store.storeId);
            console.log(data);

            return;
        }

        idx = idx || this.combo.store.getCount() - 1;
        this.combo.store.insert(idx, this.combo.store.createModel(data));
    }
});