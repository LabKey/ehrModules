/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
//adapted from:
//http://www.sencha.com/forum/showthread.php?83770-Ext-Databinding&highlight=Ext-Databinding


Ext.override(Ext.Component, {
    initRef: function(r)
    {
        if (this.ref && !this.refOwner)
        {
            var levels = this.ref.split('/'),
                    last = levels.length - 1,
                    i = 0,
                    t = this.ownerCt || this;

            while (t && i < last)
            {
                if (levels[i] == '..')
                    t = t.ownerCt;
                else
                {
                    //TODO: test if is ext container?
                    if (!this.refOwner)
                        this.refOwner = t;

                    if (!t[levels[i]])
                    {
                        t[levels[i]] = {};
                    }

                    t = t[levels[i]];
                }
                ++i;
            }

            if (t)
            {
                t[this.refName = levels[i]] = this;

                /**
                 * @type Ext.Container
                 * @property refOwner
                 * The ancestor Container into which the {@link #ref} reference was inserted if this Component
                 * is a child of a Container, and has been configured with a ref.
                 */
                if (!this.refOwner)
                    this.refOwner = t;
            }
        }
    }
});


EHR.ext.DataPanel = {
    storeOverride: function(){
        //  createOverrides();
        if (this.store)
        {
            this.store = Ext.StoreMgr.lookup(this.store);
            this.store.on({
                scope: this,
                //commitexception: EHR.UTILITIES.onError,
                load : function(store, records, options)
                {
                    // Can only contain one row of data.
                    if (records.length == 1)
                    {
                        this.onBind(records[0]);
                    }
                    else if (records.length == 0)
                    {
                        //TODO: only create record on save/submit maybe?
                        store.addRecord(new store.recordType());
                        this.onBind(store.getAt(0));
                    }
                    else
                    {
                        console.log('ERROR: Multiple records returned');
                    }
                },
                beforecommit: function(records, rows)
                {
                    console.log(rows);
                },
                commitexception: function(m){
                    console.log(m);
                }
            });
        }
    },
    enableOnBind: false,
    useFieldValues: false,
    getStore : function()
    {
        return this.store;
    },
    getDataboundFields : function()
    {
        var fields = [];
        if (this.items)
        {
            var j = 0;
            for (; j < this.items.getCount(); j++)
            {
                var item = this.items.itemAt(j);
                if (item.dataIndex)
                {
                    fields.push(item);
                }
                if (item.getDataboundFields)
                {
                    var i = 0;
                    var other = item.getDataboundFields();
                    for (; i < other.length; i++)
                    {
                        fields.push(other[i]);
                    }
                }
            }
        }
        return fields;
    },
    onBind:function(record)
    {
        if (record && (this.boundRecord !== record))
        {
            this.internalUpdate = false;
            this.boundRecord = record;
            this.updateBound();

            if (this.enableOnBind)
            {
                Ext.each(this.getDataboundFields(), function(f)
                {
                    f.setDisabled(false);
                }, this);
            }
        }
    },
    onUnbind:function()
    {
        this.internalUpdate = false;
        this.boundRecord = null;
        Ext.each(this.getDataboundFields(), function(f)
        {
            if (this.enableOnBind)
            {
                f.setDisabled(true);
            }
            f.setValue(null);
        }, this);
        //    this.updateBound();
    },
    walkChildren : function(comp, fn)
    {
        if (comp.items)
        {
            comp.items.each(function(f)
            {
                if (f instanceof Ext.form.Field)
                {
                    fn.call(this, f);
                }
                else if (f instanceof Ext.form.FieldSet)
                {
                    fn.call(this, f);
                    this.walkChildren(f, fn);
                }
                else if (f instanceof Ext.Panel)
                {
                    this.walkChildren(f, fn);
                }
            }, this);
        }
    },
    updateBound : function()
    {
        if (!this.internalUpdate)
        {
            this.walkChildren(this, function(f)
            {
                if (f.dataIndex)
                {
                    this.internalUpdate = true;

                    //onLoad, if the field has a value that differs from the store, we choose which to use
                    if (this.useFieldValues==true && f.getValue())
                        this.boundRecord.set(f.dataIndex, f.getValue());
                    else
                        f.setValue((this.boundRecord != null ? this.boundRecord.get(f.dataIndex) : null));
                    
                    this.internalUpdate = false;
                }
            }, this);
        }
    },
    showStore: function(c)
    {
        if (this.store)
        {
            this.store.each(function(rec)
            {
                //console.log(rec.fields.keys);
                Ext.each(rec.fields.keys, function(f)
                {
                    console.log(f + ': ' + rec.get(f));
                }, this);
            }, this)
        }
    },
    fieldChange: function(field){
        if(this.boundRecord) {
            var val = (field instanceof Ext.form.RadioGroup ? field.getValue().inputValue : field.getValue());
            this.boundRecord.set(field.dataIndex, val);
            //this.updateBound();
        }
    }
};