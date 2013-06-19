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
        Ext4.override(combo, {
            onSelect: function(cmp, idx){
                var val;
                if(idx)
                    val = this.store.getAt(idx).get(this.valueField);

                if(val == 'Other'){
                    Ext4.MessageBox.prompt('Enter Value', 'Enter value:', this.addNewValue, this);
                }

                this.callOverridden(arguments);
            },

            setValue: function(v){
                var r = this.findRecord(this.valueField, v);
                if(!r){
                    this.addRecord(v, v);
                }
                this.callOverridden(arguments);
            },

            addNewValue: function(btn, val){
                this.addRecord(val);
                this.setValue(val);
                this.fireEvent('change', this, val, 'Other');
            },

            addRecord: function(value){
                if(!value)
                    return;

                var data = {};
                data[this.valueField] = value;
                if(this.displayField!=this.valueField){
                    data[this.displayField] = value;
                }

                if(!this.store || !this.store.model.getFields()){
                    this.store.on('load', function(store){
                        this.addRecord(value);
                    }, this, {single: true});
                    console.log('unable to add record: '+this.store.storeId+'/'+value);
                    return;
                }
                this.store.add(this.store.model.create(data));

                if(this.view){
                    this.view.setStore(this.store);
                    this.view.refresh()
                }
            }
        });

        if(combo.store.model.getFields()){
            combo.addRecord('Other');
        }
        else {
            if (!combo.store.on)
                combo.store = Ext4.ComponentMgr.create(combo.store);

            combo.store.on('load', function(){
                combo.addRecord('Other');
            }, this, {single: true});
        }
    }
});