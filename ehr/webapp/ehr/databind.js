/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

Ext.namespace('EHR.ext.plugins');


//adapted from:
//http://www.sencha.com/forum/showthread.php?83770-Ext-Databinding&highlight=Ext-Databinding
EHR.ext.plugins.DataBind = function(config) {
    Ext.apply(this, config);
};

// plugin code
Ext.extend(EHR.ext.plugins.DataBind, Ext.util.Observable, {
    init:function(o) {
        Ext.apply(o, {
            enableOnBind: false,
            useFieldValues: false,
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

                            this.internalUpdate = false;
                        }
                    }, this);
                    this.boundRecord.endEdit();
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
                        }
                    }, this);
                }
            },
            showStore: function(c)
            {
                if (this.store)
                {
                    console.log(this.store);
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
                            var r = new this.recordType();
                            //var record = this.addRecord(r);
                            var record = this.add(r);

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
                                store.createFormRecord();
                            }
                            else
                            {
                                console.log('ERROR: Multiple records returned');
                            }
                        },
                        beforecommit: function(records, rows){
                            console.log('child store before commit');
                            //console.log(rows);
                        },
                        commitexception: function(m){
                            console.log('child store commit exception');
                            console.log(m);
                        },
                        commitcomplete: function(e){
                            console.log('child store commit complete');
                            console.log(e);    
                        }
                    });

                }
            }
        });

        o.storeOverride();
        o.addFieldListeners();
    }
}); 

// this class will serve to monitor multiple child stores.
// it will handle: changed records, commitChanges
// should delegate as much as reasonable to child stores
EHR.ext.ParentStore = Ext.extend(Ext.util.Observable, {
    constructor: function(config){

        EHR.ext.ParentStore.superclass.constructor.call(this, arguments);

        this.addEvents("beforecommit", "commitcomplete", "commitexception");

        this.on('beforecommit', function(c){console.log('parent store before commit')});
        this.on('commitcomplete', function(c){console.log('parent store commit complete!')});

    },
    addStore: function(store){
        var store = Ext.StoreMgr.lookup(store);

        if (!this.containerPath){
            this.containerPath = store.containerPath;
        }

        //check whether container path matches
        if (store.containerPath != this.containerPath){
            console.log('possible problem: container dont match')
        }

        if (!this.storeMap[store.storeId]){
            this.stores.push(store);
            this.storeMap[store.storeId] = store;
        }

    },
    removeStore: function(store){
        var store = Ext.StoreMgr.lookup(store);
        if (!this.storeMap[store.storeId]){
            if(this.stores.indexOf(store) != -1)
                this.store.remove(store);

            delete this.storeMap[store.storeId];
        }

    },
    getChanged: function(o){
        var allCommands = [];
        var allRecords = [];

        for (var i in this.storeMap){
            var store = this.storeMap[i];
//todo: doesnt really belong here.  maybe a form beforesubmit event?
if(store.boundPanel.updateInherited)
    store.boundPanel.updateInherited();
store.boundPanel.updateStore();

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
            return;
        }
        
        this.fireEvent("beforecommit", changed.records, changed.commands.rows);

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
            //note: should not matter which child store they belong to
            for(var idx = 0; idx < records.length; ++idx)
                delete records[idx].saveOperationInProgress;

            var json = this.getJson(response);
            var message = (json && json.exception) ? json.exception : response.statusText;

            for(var i in this.storeMap){
                this.storeMap[i].fireEvent("commitexception", message);
            }

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
        }

        this.fireEvent("commitcomplete");
    },
    getJson : function(response) {
        return (response && undefined != response.getResponseHeader && undefined != response.getResponseHeader('Content-Type')
                && response.getResponseHeader('Content-Type').indexOf('application/json') >= 0)
                ? Ext.util.JSON.decode(response.responseText)
                : null;
    },
    stores : [],
    storeMap : {}
});