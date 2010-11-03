/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

Ext.namespace('EHR.ext.plugins');


//adapted from:
//http://www.sencha.com/forum/showthread.php?83770-Ext-Databinding&highlight=Ext-Databinding
EHR.ext.plugins.DataBind = Ext.extend(Ext.util.Observable, {
    init:function(o) {
        Ext.apply(o, {
            enableOnBind: true,
            getStore : function()
            {
                return this.store;
            },
            getDataboundFields : function()
            {
                var fields = [];
                this.cascade(function(f)
                    {
                        if (f instanceof Ext.form.Field && f.dataIndex)
                        {
                            fields.push(f);
                        }
                    }, this);
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

            },
            updateBound : function()
            {
                if (!this.internalUpdate)
                {
                    this.cascade(function(f)
                    {
                        if (f instanceof Ext.form.Field && f.dataIndex)
                        {
                            this.internalUpdate = true;

                            f.setValue((this.boundRecord != null ? this.boundRecord.get(f.dataIndex) : null));

                            this.internalUpdate = false;
                        }
                    }, this);
                }
            },
            updateStore : function()
            {
                if (!this.internalUpdate)
                {
                    this.boundRecord.beginEdit();
                    this.cascade(function(f)
                    {
                        if (f instanceof Ext.form.Field && f.dataIndex)
                        {
                            this.internalUpdate = true;
                            
                            this.boundRecord.set(f.dataIndex, f.getValue());
                            this.boundRecord.store.fireEvent('datachanged', this.boundRecord.store);
                            this.internalUpdate = false;
                        }
                    }, this);
                    this.boundRecord.endEdit();
                    this.boundRecord.store.fireEvent('datachanged', this.boundRecord.store);
                }
            },
            addFieldListeners : function()
            {
                if (!this.internalUpdate)
                {
                    this.cascade(function(f)
                    {
                        if (f instanceof Ext.form.Field && f.dataIndex)
                        {
                            this.internalUpdate = true;
                            f.on('change', this.fieldChange, this);

                            if(this.enableOnBind){
                                f.setDisabled(true);
                            }
                        }
                    }, this);
                }
            },
            showStore: function(c)
            {
                if (this.store)
                {
                    console.log(this.store);
                    console.log(this.store.totalLength);
                    this.store.each(function(rec)
                    {
                        console.log('record is new?: '+rec.isNew);
                        console.log('record is dirty?: '+rec.dirty);
                        console.log('record is phantom?: '+rec.phantom);
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
                    this.boundRecord.beginEdit();
                    this.boundRecord.set(field.dataIndex, val);
                    this.boundRecord.store.fireEvent('datachanged', this.boundRecord.store);
                    this.boundRecord.endEdit();
                }
            },
            storeOverride: function(){
                if (this.store)
                {
                    this.store = Ext.StoreMgr.lookup(this.store);
                    Ext.apply(this.store, {
                        boundPanel: this,
                        createFormRecord: function(){
                            var record = new this.recordType();
                            this.add(record);

                            if(this.boundPanel){
                                var fields = this.boundPanel.getDataboundFields();
                                record.beginEdit();
                                Ext.each(fields, function(f){
                                    record.set(f.dataIndex, f.getValue());
                                }, this);
                                record.endEdit();
                                this.boundPanel.onBind(this.getAt(0));
                                //this.boundPanel.updateBound();

                            }                          
                        }
                    });
                    
                    this.store.on({
                        scope: this,
                        //commitexception: EHR.UTILITIES.onError,
                        load : function(store, records, options)
                        {
                            // Can only contain one row of data.
                            if (records.length == 1)
                            {
                                console.log('record loaded');
                                this.onBind(records[0]);
                            }
                            else if (records.length == 0)
                            {
                                //TODO: only create record on save/submit maybe?
                                //or maybe on form dirty?
                                store.createFormRecord();
                            }
                            else
                            {
                                console.log('ERROR: Multiple records returned');
                            }
                        },
//                        beforecommit: function(records, rows){
//                            console.log('child store before commit');
//                        },
                        commitexception: function(m, e){
                            console.log('child store commit exception');
                            console.log(m);
                            console.log(e);
                        },
                        commitcomplete: function(){
                            console.log('child store commit complete');
                        }
                    });

                }
            }
        });

        o.storeOverride();
        o.addFieldListeners();

        o.addEvents('beforesubmit');

        o.on('beforesubmit', function(c){
            if (c.updateInherited)
                c.updateInherited();
            
            c.updateStore();
        });
    }
}); 
Ext.preg('databind', EHR.ext.plugins.DataBind);


// this class will serve to monitor multiple child stores.
// it will handle: changed records, commitChanges, decoding server response
// should delegate as much as reasonable to child stores
EHR.ext.ParentStore = Ext.extend(Ext.util.Observable, {
    constructor: function(config){

        EHR.ext.ParentStore.superclass.constructor.call(this, arguments);

        this.addEvents("beforecommit", "commitcomplete", "commitexception");

//        this.on('beforecommit', function(c){
//            console.log('parent store before commit')
//        });
        this.on('commitcomplete', function(c){
            console.log('parent store commit complete!')
        });
        this.on('commitexception', function(c, o){
            console.log('parent store commit exception');
            console.log(c);
            console.log(o);
        });

    },
    addStore: function(store){
        store = Ext.StoreMgr.lookup(store);

        if (!this.containerPath){
            this.containerPath = store.containerPath;
        }

        //check whether container path matches
        if (store.containerPath != this.containerPath){
            console.log('possible problem: container doesnt match');
        }

        if (!this.storeMap[store.storeId]){
            this.stores.push(store);
            this.storeMap[store.storeId] = store;
        }

        if (store.isParent) {
            this.parentStore = store;
            for (var i=0;i<this.stores.length;i++){
                var store = this.stores[i];
                this.updateInheritance(store);
            }
        }
        else {
            if(store.data.length)
                this.updateInheritance(store);
            else
                store.on('load', this.updateInheritance, this, store);
        }
    },
    removeStore: function(store){
        store = Ext.StoreMgr.lookup(store);
        if (!this.storeMap[store.storeId]){
            if(this.stores.indexOf(store) != -1)
                this.store.remove(store);

            delete this.storeMap[store.storeId];
        }

        if (this.parentStore == store) {
            delete this.parentStore;
        }
    },
    updateInheritance: function(store){
        if(!this.parentStore)
            return;

        if (store.isParent){
            return;
        }

        for (var j in store.fields.map){
            var field = store.fields.map[j];

            if(field.parentField){
                this.parentStore.on('datachanged', (function(childStore, field){return function(store){
                    var parentRecord = store.getAt(0);
                    var val = parentRecord.get(field.parentField.field);

                    childStore.each(function(rec){
                        rec.set(field.parentField.field, val);
                    }, this);

                    }
                })(store, field), this);
            }
        }
    },
    getStores: function(){
        return this.stores;    
    },
    getChanged: function(o){
        var allCommands = [];
        var allRecords = [];

        for (var i in this.storeMap){
            var store = this.storeMap[i];

            var records = store.getModifiedRecords();
            var commands = store.getChanges(records);

            if (!commands.length){
                continue;
            }

            allCommands = allCommands.concat(commands);
            allRecords = allRecords.concat(records);
        }

        return {
            commands: allCommands,
            records: allRecords
        }

    },
    commitChanges : function() {
        var changed = this.getChanged();

        if (!changed.commands.length){
            console.log('no changes.  nothing to do');            
            return;
        }
        
        this.fireEvent("beforecommit", changed.records, changed.commands);

        Ext.Ajax.request({
            url : LABKEY.ActionURL.buildURL("query", "saveRows", this.containerPath),
            method : 'POST',
            success: this.onCommitSuccess,
            failure: this.getOnCommitFailure(changed.records),
            scope: this,
            jsonData : {
                containerPath: this.containerPath,
                commands: changed.commands
            },
            headers : {
                'Content-Type' : 'application/json'
            }
        });
    },
    getOnCommitFailure : function(records) {
        return function(response, options) {
            console.log(response)
            console.log(options)
            //note: should not matter which child store they belong to
            for(var idx = 0; idx < records.length; ++idx)
                delete records[idx].saveOperationInProgress;

            var json = this.getJson(response);
            var message = (json && json.exception) ? json.exception : response.statusText;

//            for(var i in this.storeMap){
//                this.storeMap[i].fireEvent("commitexception", message);
//            }

            if(false !== this.fireEvent("commitexception", message))
                Ext.Msg.alert("Error During Save", "Could not save changes due to the following error:\n" + message);
        };
    },
    onCommitSuccess : function(response, options){
        var json = this.getJson(response);
        if(!json || !json.result)
            return;

        for (var i=0;i<json.result.length;i++){
            this.stores[i].processResponse(json.result[i].rows);
            this.stores[i].fireEvent("commitcomplete");
        }

        this.fireEvent("commitcomplete");
    },
    getJson : function(response) {
        return (response && undefined != response.getResponseHeader && undefined != response.getResponseHeader('Content-Type')
                && response.getResponseHeader('Content-Type').indexOf('application/json') >= 0)
                ? Ext.util.JSON.decode(response.responseText)
                : null;
    },
    deleteAllRecords: function(){
        var stores = this.getStores();
        var s;
        Ext.each(stores, function(s){
            s.each(function(r){
                s.deleteRecords([r]);
            }, this);
        }, this);
    },
    inheritField: function(config){
            
    },
    showStores: function(){
        for (var i in this.storeMap){
            console.log(this.storeMap[i].id);
            console.log(this.storeMap[i]);
        }
    },
    stores : [],
    storeMap : {}
});
