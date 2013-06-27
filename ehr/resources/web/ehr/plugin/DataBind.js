/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * This plugin is used in FormPanel to facilitate binding to an Ext4 record.
 * @param {boolean} disableUnlessBound: Defaults to false
 * @param {boolean} autoCreateRecordOnChange: Defaults to true
 * @param {boolean} autoBindFirstRecord: Defaults to false
 * @param {boolean} createRecordOnLoad: Defaults to false
 */
Ext4.define('EHR.plugin.Databind', {
    extend: 'Ext.AbstractPlugin',
    pluginId: 'ehr-databind',
    mixins: {
        observable: 'Ext.util.Observable'
    },
    init: function(panel){
        this.panel = panel;

        LABKEY.ExtAdapter.apply(panel, {
            bindRecord: function(rec){
                var plugin = this.getPlugin('labkey-databind');
                plugin.bindRecord.call(plugin, rec);
            },
            unbindRecord: function(){
                var plugin = this.getPlugin('labkey-databind');
                plugin.unbindRecord.call(plugin);
            }
        });

        //set defaults
        panel.bindConfig = panel.bindConfig || {};
        panel.bindConfig = Ext4.Object.merge({
            disableUnlessBound: false,
            autoCreateRecordOnChange: true,
            autoBindFirstRecord: false,
            createRecordOnLoad: false
        }, panel.bindConfig);

        panel.addEvents('recordchange', 'fieldvaluechange');

        this.configureStore(panel.store);
        this.addFieldListeners();

        //we queue changes from all fields into a single event using buffer
        //this way batch updates of the form only trigger one record update/validation
        this.mon(panel, 'fieldvaluechange', this.onFieldValueChange, this, {buffer: 50, delay: 10});
        this.mon(panel, 'add', function(o, c, idx){
            var findMatchingField = function(f) {
                if (f.isFormField) {
                    if (f.dataIndex) {
                        this.addFieldListener(c);
                    } else if (f.isComposite) {
                        f.items.each(findMatchingField, this);
                    }
                }
            };
            findMatchingField.call(this, c);
        }, this);

        if(panel.boundRecord)
            panel.bindRecord(panel.boundRecord);

        this.callParent(arguments);
    },

    configureStore: function(store){
        store = Ext4.StoreMgr.lookup(store);

        if(!store)
            return;

        if (store.hasLoaded())
            this.onStoreLoad(store);
        else
            this.mon(store, 'load', this.onStoreLoad, this);

        this.mon(store, 'remove', this.onRecordRemove, this);
        this.mon(this.panel.store, 'update', this.onRecordUpdate, this);
    },

    onStoreLoad: function(store){
        if (store.getCount() == 0){
            if(this.panel.bindConfig.createRecordOnLoad){
                this.createAndBindRecord();
            }
        }
        else {
            if(this.panel.bindConfig.autoBindFirstRecord){
                this.bindRecord(store.getAt(0));
            }
        }
    },

    onRecordRemove: function(store, rec, idx){
        var boundRecord = this.panel.getForm().getRecord();
        if(boundRecord && rec == boundRecord){
            this.unbindRecord();
        }
    },

    //this is the listener for record update events.  it should update the values of the form, without firing change events on those fields
    onRecordUpdate: function(store, record, operation){
        var form = this.panel.getForm();
        if(form.getRecord() && record == form.getRecord()){
            //this flag is used to skip the record update events caused by this plugin
            if (this.ignoreNextUpdateEvent){
                this.ignoreNextUpdateEvent = null;
                return;
            }

            form.suspendEvents();
            this.setFormValuesFromRecord(record);
            form.resumeEvents();

            form.isValid();
        }
    },

    bindRecord: function(record){
        var form = this.panel.getForm();
        this.ignoreNextUpdateEvent = null;

        if(form.getRecord())
            this.unbindRecord();

        form.suspendEvents();
        form.loadRecord(record);
        form.resumeEvents();
        form.isValid();
    },

    unbindRecord: function(){
        var form = this.panel.getForm();
        this.ignoreNextUpdateEvent = null;

        if(form.getRecord()){
            form.updateRecord(form.getRecord());
        }

        form._record = null;
        form.reset();
    },

    //this is called after the a field's change event is called
    //it should update the values in the record, cause an update event to fire on that record, but not re-trigger change events on the fields
    onFieldValueChange: function(){
        var form = this.panel.getForm();
        var record = form.getRecord();
        if(record){
            this.updateRecordFromForm();
        }
        else if (this.panel.bindConfig.autoCreateRecordOnChange){
            this.createAndBindRecord();
        }
    },

    createAndBindRecord: function(){
        var form = this.panel.getForm();
        var values = form.getFieldValues();
        var record = this.panel.store.model.create();

        if (EHR.debug)
            console.log('creating: ' + this.panel.store.storeId);

        //remove empty values or we risk overriding defaults
        for (var field in values){
            if (Ext4.isEmpty(values[field]))
                delete values[field];
        }

        record.set(values); //otherwise record will not be dirty
        record.phantom = true;
        this.panel.store.add(record);
        this.bindRecord(record);
    },

    addFieldListeners: function(){
        this.panel.getForm().getFields().each(this.addFieldListener, this);
    },

    addFieldListener: function(f){
        if(f.hasDatabindListener){
            console.warn('field already has listener');
            return;
        }

        //this.mon(f, 'check', this.onFieldChange, this); //in Ext4, checkboxes should fire change events
        this.mon(f, 'change', this.onFieldChange, this);

        var form = f.up('form');
        if(form.getRecord() && this.panel.bindConfig.disableUnlessBound && !this.panel.bindConfig.autoCreateRecordOnChange)
            f.setDisabled(true);

        Ext4.override(f, {
            getErrors: function(value){
                var errors = this.callOverridden(arguments);
                var record = this.up('form').getForm().getRecord();

                if(record){
                    record.validate().each(function(e){
                        if(e.field == this.name)
                            errors.push(e.message);
                    }, this);
                }

                errors = Ext4.Array.unique(errors);

                return errors;
            }
        });

        f.hasDatabindListener = true;
    },

    //this is separated so that events from multiple fields in a single form are buffered into one event per panel
    onFieldChange: function(field){
        this.panel.fireEvent('fieldvaluechange', field);
    },

    //this is used instead of BasicForm's setValues in order to minimize event firing.  updating a field during editing has the
    //unfortunate consequence of moving the cursor to the end of the text, so we want to avoid this
    setFormValuesFromRecord: function(record) {
        var values = record.data;
        var form = this.panel.getForm();

        function setVal(fieldId, val) {
            var field = form.findField(fieldId);
            if (field && field.getValue() !== val) {
                //TODO: combos and other multi-valued fields represent data differently in the store vs the field.  need to reconcile here
                field.suspendEvents();
                field.setValue(val);
                field.resumeEvents();
                if (form.trackResetOnLoad) {
                    field.resetOriginalValue();
                }
                //field.isValid();
            }
        }

        if (Ext4.isArray(values)) {
            // array of objects
            Ext4.Array.forEach(values, function(val) {
                setVal(val.id, val.value);
            });
        } else {
            // object hash
            Ext4.iterate(values, setVal);
        }
        return this;
    },

    // updates the values in the record based on the current state of the form.
    //TODO: combos and other multi-valued fields represent data differently in the store vs the field.
    // if we need to converts objects to delimited strings or massage radiogroup values, we could do so here
    updateRecordFromForm: function(){
        var form = this.panel.getForm();
        var record = form.getRecord();
        if (record){
            this.ignoreNextUpdateEvent = true;
            form.updateRecord(record);
        }
    }
});