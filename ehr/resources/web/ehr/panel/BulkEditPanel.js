/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg sectionConfig
 * @cfg targetStore
 * @cfg records
 * @cfg suppressConfirmMsg
 */
Ext4.define('EHR.panel.BulkEditPanel', {
    extend: 'EHR.form.Panel',
    alias: 'widget.ehr-bulkeditpanel',

    statics: {
        getButtonCfg: function(scope){
            return [{
                text: 'Submit',
                scope: scope,
                handler: function(){
                    this.down('ehr-bulkeditpanel').onSubmit();
                }
            }]
        }
    },

    title: 'Bulk Edit',

    initComponent: function(){
        LABKEY.ExtAdapter.apply(this, {
            itemId: 'formPanel',
            border: false,
            maxFieldHeight: 100,
            maxItemsPerCol: 8,
            bodyStyle: 'padding: 5px;',
            formConfig: this.formConfig,
            store: this.getStoreCopy(),
            bindConfig: {
                createRecordOnLoad: true
            }
        });

        this.callParent(arguments);

        this.addEvents('bulkeditcomplete');
    },

    getStoreCopy: function(){
        var valMap = this.setFieldDefaults(this.targetStore.model);
        var model = Ext4.define('bulkEditModel-' + Ext4.id(), {
            extend: this.targetStore.model,
            setFieldDefaults: function(){
                this.fields.each(function(field){
                    if (Ext4.isDefined(valMap[field.name])){
                        this.data[field.name] = valMap[field.name];
                    }
                }, this);
            }
        });

        return Ext4.create(this.targetStore.$className, {
            model: model
        });
    },

    setFieldDefaults: function(model){
        var valMap = {};
        if (this.records){
            model.prototype.fields.each(function(field){
                var values = {};
                Ext4.Array.forEach(this.records, function(r){
                    var val = r.get(field.name);
                    if (Ext4.isDefined(val)){
                        values[val] = val;
                    }
                }, this);

                var keys = Ext4.Object.getKeys(values);
                if (keys.length == 1){
                    valMap[field.name] = values[keys[0]];
                }
            }, this);
        }

        return valMap;
    },

    getRawFieldConfigs: function(){
        var items = this.callParent(arguments);
        Ext4.Array.forEach(items, function(item){
            item.cfg.allowBlank = true;
        }, this);

        return items;
    },

    getFieldConfigs: function(){
        var fields = this.callParent(arguments);
        var newItems = [];
        Ext4.Array.forEach(fields, function(item){
            item.originalDisabled = item.disabled;
            item.disabled = true;
            item = Ext4.widget(item);

            item.on('render', function(field){
                if (field.labelEl){
                    Ext4.QuickTips.register({
                        target: field.labelEl,
                        text: 'Click to toggle'
                    });

                    field.labelEl.on('click', function(){
                        if (field.originalDisabled){
                            Ext4.Msg.alert('Error', 'This field cannot be enabled');
                            return;
                        }

                        field.setDisabled(!field.isDisabled());
                    }, this);
                }
                else {
                    console.log(field);
                }
            }, this);

            newItems.push(item);
        }, this);

        return newItems;
    },

    onSubmit: function(){
        if (!this.suppressConfirmMsg){
            var values = this.getForm().getFieldValues();
            Ext4.Msg.confirm('Set Values', 'You are about to set values for ' + Ext4.Object.getKeys(values).length + ' fields on ' + this.records.length + ' records.  Do you want to do this?', function(val){
                if (val == 'yes'){
                    this.doBulkEdit();
                }
            }, this);
        }
        else {
            this.doBulkEdit();
        }
    },

    doBulkEdit: function(){
        var values = this.getForm().getFieldValues();

        this.targetStore.suspendEvents(true);
        var toAdd = [];
        Ext4.Array.forEach(this.records, function(r){
            r.set(values);

            if (!r.store){
                toAdd.push(r);
            }
        }, this);

        if (toAdd.length){
            this.targetStore.add(toAdd);
        }

        this.targetStore.resumeEvents();

        this.fireEvent('bulkeditcomplete');
    }
});