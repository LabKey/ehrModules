/*
 * Copyright (c) 2010-2011 LabKey Corporation
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
            bindConfig: {
                disableUnlessBound: true,
                bindOnChange: false,
                showDeleteBtn: false,
                autoBindRecord: false
            },
            getStore : function()
            {
                return this.store;
            },
            removeStore: function(){
                if(!this.store) return;

                delete this.store.boundPanel;
                delete this.store;
            },
            getFieldsToBind : function(){
                var fields = [];
                this.getForm().items.each(function(f){
                    if (f instanceof Ext.form.Field && f.dataIndex)
                        fields.push(f);
                }, this);
                return fields;
            },
            bindRecord: function(record){
                if (!record || (this.boundRecord === record)){
                    return;
                }

                //commit the old record before loading a new one
                if(this.boundRecord)
                    this.unbindRecord();

                this.boundRecord = record;
                this.boundRecord.store.boundPanel = this;

                Ext.each(this.getFieldsToBind(), function(f){
                    if (this.bindConfig.disableUnlessBound){
                        if(f.editable!==false)
                            f.setDisabled(false);
                    }

                    f.setValue(record.get(f.dataIndex));
                }, this);
//                this.updateRecord();

                //allow changes in the record to update the form
                record.store.on('update', this.updateForm, this, {buffer: 40});

                this.fireEvent('recordchange', this, record);
            },
            unbindRecord: function(config)
            {
                //console.log('unbinding record: '+this.boundRecord.id);
                var rec = this.boundRecord;
                this.updateRecord();

                rec.store.un('update', this.updateForm, this);
                this.boundRecord = undefined;

                Ext.each(this.getFieldsToBind(), function(f){
                    if (this.bindConfig.disableUnlessBound){
                        f.setDisabled(true);
                    }
                }, this);

                this.form.reset();

                if(config && config.deleteRecord){
                    rec.store.deleteRecords([rec]);
                }

                this.fireEvent('recordchange', this);
            },
            updateRecord : function()
            {
                var fields = this.getFieldsToBind();
                var values = {};
                for (var i=0;i<fields.length;i++){
                    var f = fields[i];
                    var val = this.getBoundFieldValue(f);
                    if(this.boundRecord){
                        var oldVal = this.boundRecord.get(f.dataIndex);
                        //TODO: better logic??
                        if(!(val===oldVal || String(val) == String(oldVal))){
                            values[f.dataIndex] = val;
                        }
                    }
                };

                //we only fire the update event if we actually made changes
                if(!EHR.UTILITIES.isEmptyObj(values)){
                    //console.log('updating record');
                    //console.log(values);
                    this.boundRecord.beginEdit();
                    for (var i in values){
                        this.boundRecord.set(i, values[i]);
                    }
                    this.boundRecord.endEdit();
                }

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
                if(!this.boundRecord && this.bindConfig.bindOnChange && this.store){
                    var values = {};
                    values[field.name] = this.getBoundFieldValue(field);
                    var record = this.store.addRecord(values);
                    record.markDirty();
                    this.bindRecord(record);
                }

                if(this.boundRecord) {
                    var val = this.getBoundFieldValue(field);
                    this.boundRecord.beginEdit();
                    this.boundRecord.set(field.dataIndex, val);
                    this.boundRecord.endEdit();
                }
                else {
                    console.log('field is unbound: '+field.name);
                }
            },
            getBoundFieldValue: function(f){
                if (f instanceof Ext.form.RadioGroup){
                    //QUESTION: safe to make the assumption we only allow 1 checked at once?
                    return (f.getValue() ? f.getValue().inputValue : null);
                }
                else if (f instanceof Ext.form.Radio){
                    if(f.checked)
                        return f.getValue();
                    else
                        return false;
                }
                else if (f instanceof Ext.form.CheckboxGroup){
                    return f.getValueAsString();
                }
                else
                    return f.getValue();
            },
            focusFirstField: function(){
                var firstFieldItem = this.getForm().items.first();
                if(firstFieldItem && firstFieldItem.focus){
                    //delay the focus for 500ms to make sure the field is visible
                    firstFieldItem.focus(false,500);
                }
            },
            addFieldListener: function(f){
                if(f instanceof Ext.form.Checkbox){
                    f.on('check', this.fieldChange, this, {buffer: 40});
                }
                else {
                    //NOTE: use buffer so groups like checkboxgroup dont fire repeated events
                    f.on('change', this.fieldChange, this, {buffer: 40});
                }

                if(this.bindConfig.disableUnlessBound && !this.boundRecord && !this.bindConfig.bindOnChange){
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
                    
                    this.store.on('load', function(store, records, options)
                        {
                            // Can only contain one row of data.
                            if (records.length == 0){
                                if(this.bindConfig.autoBindRecord){
                                    var values = {};
                                    Ext.each(this.getFieldsToBind(), function(item){
                                        values[item.name] = this.getBoundFieldValue(item);
                                    }, this);
                                    var rec = new this.store.recordType(values);
                                    rec.markDirty();

                                    this.store.addRecord(rec);

                                    //called to force record to store's modified list
                                    this.store.afterEdit(rec);

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
                                //console.log('Multiple records returned');
                            }
                        }, this);

                    this.store.on('beforecommit', this.updateRecord, this);
                }
            }
        });

        o.configureStore();
        o.addFieldListeners();
        o.addEvents('beforesubmit', 'recordchange', 'formchange');

        if(o.bindConfig.showDeleteBtn !== false){
            o.getBottomToolbar().insert(0, {
                xtype: 'button',
                text: 'Clear Section',
                ref: 'recordDeleteBtn',
                scope: o,
                disabled: true,
                handler: function(){
                    if(this.boundRecord){
                        Ext.MessageBox.confirm(
                            'Confirm',
                            'You are about to clear this section.  This will permanently delete these values.  Are you sure you want to do this?',
                            function(val){
                                if(val=='yes')
                                    this.unbindRecord({deleteRecord: true});
                            },
                            this
                        );
                    }
                }
            });
            o.on('recordchange', function(form, record){
                this.getBottomToolbar().recordDeleteBtn.setDisabled(record===undefined)
            }, o);
        }

        o.on('beforesubmit', function(c){
            console.log('updating record before submit');
            c.updateRecord();
        });

        o.on('add', function(o, c, idx){
            if (c instanceof Ext.form.Field && c.dataIndex){
                this.addFieldListener(c);
            }
            if(Ext.isFunction(c.cascade)){
                c.cascade(function(cmp){
                    if (cmp instanceof Ext.form.Field && cmp.dataIndex){
                        this.addFieldListener(cmp);
                    }
                }, this);
            }
        }, o);
    }
}); 
Ext.preg('databind', EHR.ext.plugins.DataBind);






