/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

Ext.namespace('EHR.ext.plugins');


//adapted from:
//http://www.sencha.com/forum/showthread.php?83770-Ext-Databinding&highlight=Ext-Databinding

//this plugin will allow an EHR.ext.FormPanel to become bound to an Ext.data.Record
//this sets up listeners to automatically update the record or form based on changes in the other

EHR.ext.plugins.DataBind = Ext.extend(Ext.util.Observable, {
    init:function(o) {
        Ext.applyIf(o, {
            //disableUnlessBound: true,
            //bindOnChange: o.bindOnChange || false,
            //autoBindRecord: o.autoBindRecord || false,
            getStore : function()
            {
                return this.store;
            },
            removeStore: function(){
                if(!this.store) return;

                delete this.store.boundPanel;
                delete this.store;
            },
            getFieldsToBind : function()
            {
                var fields = [];
                this.cascade(function(f){
                    if (f instanceof Ext.form.Field && f.dataIndex){
                        fields.push(f);
                    }

                }, this);
                return fields;
            },
            bindRecord: function(record)
            {
                if (record && (this.boundRecord !== record))
                {
                    //commit the old record before loading a new one
                    if(this.boundRecord){
                        this.updateRecord();
                        this.form.reset();
                    }

                    this.boundRecord = record;
                    record.errors = record.errors || {};

                    this.boundRecord.store.boundPanel = this;

                    if (this.disableUnlessBound)
                    {
                        Ext.each(this.getFieldsToBind(), function(f)
                        {
                            if(f.editable!==false)
                                f.setDisabled(false);
                        }, this);
                    }                    
                    this.getForm().loadRecord(record);

                    Ext.each(this.getFieldsToBind(), function(f)
                    {
                       this.storeValidationStatus(f, this.boundRecord);
                    }, this);

                    //allow changes in the record to update the form
                    record.store.on('update', this.updateForm, this);
                    this.fireEvent('recordbind', this, record);
                }
            },
            unbindRecord: function(config)
            {
                var rec = this.boundRecord;
                rec.store.un('update', this.updateForm);

                delete this.boundRecord;

                Ext.each(this.getFieldsToBind(), function(f)
                {
                    f.suspendEvents();
                    if (this.disableUnlessBound)
                    {
                        f.setDisabled(true);
                    }
                    f.reset();
                    //TODO: seems hacky, but change event is fired otherwise
                    f.resumeEvents.defer(20);
                }, this);

                if(config && config.deleteRecord){
                    rec.store.deleteRecords([rec]);
                    delete rec;
                }
                this.fireEvent('recordunbind', this);
            },
            updateRecord : function()
            {
                this.boundRecord.beginEdit();
                var fields = this.getFieldsToBind();
                for (var i=0;i<fields.length;i++)
                {
                    var f = fields[i];
                    this.boundRecord.set(f.dataIndex, f.getValue());
                    this.storeValidationStatus(f, this.boundRecord);
                }
                
                this.boundRecord.endEdit();
                return this.boundRecord;
            },
            storeValidationStatus : function(f, rec){
                //TODO: reconsider how this works
                if(f.isValid())
                    delete rec.errors[f.dataIndex];
                else
                    rec.errors[f.dataIndex] = f.getErrors();
            },
            updateForm: function(s, recs, idx)
            {
                Ext.each(recs, function(r){
                    if(r === this.boundRecord){
                        this.getForm().loadRecord(r);
                    }
                }, this);
            },
            addFieldListeners: function()
            {
                Ext.each(this.getFieldsToBind(), function(f){
                    this.addFieldListener(f);
                }, this);
            },
            fieldChange: function(field){         
                //create a record onChange if selected
                if(!this.boundRecord && this.bindOnChange && this.store){
                    var values = {};
                    this.getForm().items.each(function(item){
                            values[item.name] = this.getBoundFieldValue(item);
                    }, this);
                    var record = this.store.addRecord(values);
                    this.bindRecord(record);
                }

                if(this.boundRecord) {
                    var val = this.getBoundFieldValue(field);
                    this.boundRecord.set(field.dataIndex, val);
                    this.storeValidationStatus(field, this.boundRecord);
                }
                else {
                    console.log('field is unbound');
                    console.log(field);
                }
            },
            getBoundFieldValue: function(f){
                if (f instanceof Ext.form.RadioGroup){
                    //QUESTION: safe to make the assumption we only allow 1 checked at once?
                    return f.getValue();
                }
                else if (f instanceof Ext.form.CheckboxGroup){
                    return f.getStringValue();
                }
                else
                    return f.getValue();
            },
            focusFirstField: function(){
                var firstFieldItem = this.getForm().items.first();
                if(firstFieldItem){
                    //delay the focus for 500ms to make sure the field is visible
                    firstFieldItem.focus(true,500);
                }
            },
            addFieldListener: function(f){
                f.on('change', this.fieldChange, this);
                if(f instanceof Ext.form.Checkbox){
                    f.on('check', this.fieldChange, this);
                }

                if(this.disableUnlessBound && !this.boundRecord && !this.bindOnChange){
                    f.setDisabled(true);
                }
            },
            configureStore: function(){
                if (this.store)
                {
                    this.store = Ext.StoreMgr.lookup(this.store);
                    Ext.apply(this.store, {
                        boundPanel: this
                    });
                    
                    this.store.on({
                        scope: this,
                        load : function(store, records, options)
                        {
                            // Can only contain one row of data.
                            if (records.length == 0){
                                if(this.autoBindRecord){
                                    var vals = this.getForm().getFieldValues();
                                    var rec = this.store.addRecord(vals);
                                    this.bindRecord(rec);
                                }
                            }
                            else if (records.length == 1)
                            {
                                this.bindRecord(records[0]);
                            }
                            else
                            {
                                this.bindRecord(records[0]);
                                console.log('Multiple records returned');
                            }
                        }
                    });

                }
            }
        });

        o.configureStore();
        o.addFieldListeners();
        o.addEvents('beforesubmit', 'recordbind', 'recordunbind', 'recordchange', 'formchange');

        if(o.showDeleteBtn !== false){
            o.recordDeleteBtn = o.addButton({
                xtype: 'button',
                text: 'Delete Record',
                ref: 'recordDeleteBtn',
                scope: o,
                disabled: true,
                handler: function(){
                    if(this.boundRecord){
                        this.unbindRecord({deleteRecord: true});
                    }
                }
            });
            o.on('recordbind', function(b){
                this.recordDeleteBtn.setDisabled(false)
            }, o);
            o.on('recordunbind', function(b){
                this.recordDeleteBtn.setDisabled(true)
            }, o);
        }

        o.form.on('beforeaction', function(c){
            c.updateRecord();
        });

        o.on('add', function(o, c, idx){
            this.addFieldListener(c);
            if(Ext.isFunction(c.cascade)){
                c.cascade(function(cmp){
                    this.addFieldListener(cmp);
                }, this);
            }
        }, o);
    }
}); 
Ext.preg('databind', EHR.ext.plugins.DataBind);






