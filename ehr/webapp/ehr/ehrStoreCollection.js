/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

Ext.namespace('EHR.ext', 'EHR.ext.plugins');


// this class will serve to monitor multiple child stores.
// it will handle: preparing submission to server, commitChanges, decoding server response
// also provides some level of validation over records
// should delegate as much as reasonable to child stores
// primarily tries to listen for events from child stores and aggregate info

//events: 'beforecommit', 'commitcomplete', 'commitexception','update', 'validation'

EHR.ext.StoreCollection = Ext.extend(Ext.util.MixedCollection, {
    constructor: function(config){
        Ext.apply(this, config);

        //inheritance code separated for now
        Ext.apply(this, EHR.ext.StoreInheritance);

        EHR.ext.StoreCollection.superclass.constructor.call(this, false, function(item){return item.storeId;});
        this.addEvents('beforecommit', 'commitcomplete', 'commitexception', 'update', 'validation');
    },
    add: function(store){
        store = Ext.StoreMgr.lookup(store);
        if (this.contains(store)){
            //console.log('Store already added: '+store.queryName);
            return;
        }

        if (!this.containerPath)
            this.containerPath = store.containerPath;

        //check whether container path matches
        if (store.containerPath && store.containerPath != this.containerPath)
            console.log('possible problem: container doesnt match');

        EHR.ext.StoreCollection.superclass.add.call(this, store.storeId, store);

        Ext.apply(store, {
            parentStore: this,
            monitorValid: this.monitorValid
        });

        if(this.monitorValid){
            store.on('validation', this.onValidation, this, {buffer: 30});
            store.initMonitorValid();
        }

        this.initInheritance(store);

        this.relayEvents(store, ['update']);

    },

    initMonitorValid: function(){
        this.monitorValid = true;
        this.each(function(store){
            store.on('validation', this.onValidation, this, {buffer: 30});
        }, this);
    },

    stopMonitorValid: function(){
        this.each(function(store){
            this.store.un('validation', this.onValidation, this, {buffer: 30});
        }, this);
        this.monitorValid = false;
    },

    remove: function(store){
        //TODO: this is done to undo relayEvents() set above.
        if (store.hasListener('update')) {
            store.events['update'].clearListeners();
        }

        store.un('validation', this.onValidation, this);
        delete store.parentStore;

        EHR.ext.StoreCollection.superclass.remove.call(store);
    },

    getChanged: function(o){
        var allCommands = [];
        var allRecords = [];

        this.each(function(s){
            var records = s.getModifiedRecords();
            var commands = s.getChanges(records);

            if (commands.length){
                allCommands = allCommands.concat(commands);
                allRecords = allRecords.concat(records);
            }
            else if (commands.length && !records.length){
                console.log('there are modified records but no commands');
            }
        }, this);

        return {
            commands: allCommands,
            records: allRecords
        }
    },

    commitChanges : function() {
        var changed = this.getChanged();
        this.commit(changed.commands, changed.records);
    },

    commitRecord: function(record){
        record.store.commitRecords([record]);
    },

    commit: function(commands, records){
        if (!commands || !commands.length){
            console.log('no changes.  nothing to do');
            this.fireEvent('commitcomplete');
            return;
        }

        if(debug)
            console.log('commands to be sent: '+commands.length);
            console.log(commands);
            console.log(records);

        if(this.fireEvent('beforecommit', records, commands)===false)
            return;

        var request = Ext.Ajax.request({
            url : LABKEY.ActionURL.buildURL('query', 'saveRows', this.containerPath),
            method : 'POST',
            success: this.onCommitSuccess,
            failure: this.getOnCommitFailure(records),
            scope: this,
            jsonData : {
                containerPath: this.containerPath,
                commands: commands
            },
            headers : {
                'Content-Type' : 'application/json'
            }
        });

        Ext.each(records, function(rec){
            rec.lastTransactionId = request.tId;
        }, this);
    },

    isValid: function(){
        var valid = true;
        this.each(function(s){
            if(!s.isValid()){
                valid=false
            }
        }, this);
        return valid;
    },

    isDirty: function()
    {
        var dirty = false;
        this.each(function(s){
            if(s.getModifiedRecords().length)
                dirty=true;
        }, this);
        return dirty;
    },

    isLoading: function(){
        var isLoading = false;
        this.each(function(s){
            if(s.isLoading){
                isLoading = true;
                //console.log('store still loading: '+s.storeId);
            }
//            else {
//                console.log('store loaded: '+s.storeId);
//            }
        }, this);

        return isLoading;
    },

    onValidation: function(store, records){
        //check other stores
        var maxSeverity = '';
        this.each(function(store){
            maxSeverity = EHR.utils.maxError(maxSeverity, store.maxErrorSeverity());
        }, this);

        this.fireEvent('validation', this, maxSeverity);
    },

    getErrors: function(){
        var errors = [];
        this.each(function(store){
            store.errors.each(function(error){
                errors.push(error);
            }, this);
        }, this);

        return errors;
    },

    getOnCommitFailure : function(records) {
        return function(response, options) {
console.log(response)
            //note: should not matter which child store they belong to
            for(var idx = 0; idx < records.length; ++idx)
                delete records[idx].saveOperationInProgress;

            var serverError = this.getJson(response);

            //this is done because the structure of the error object differs depending on whether you sent a single row or multiple
            //this is an attempt to normalize, but should be removed when possible
            if(serverError.rowNumber!==undefined || !serverError.errors){
                //this means either we only submitted 1 row, or there was an exception
                serverError = {errors: [serverError], exception: serverError.exception};
            }

            var msg;
            Ext.each(serverError.errors, function(error){
                //handle validation script errors and exceptions differently
                if(error.errors && error.errors.length){
                    this.handleValidationErrors(records, error, response);
                    msg = "Could not save changes due to validation errors.";
                }
                else {
                    //if an exception was thrown, I believe we automatically only have one error returned
                    //this means this can only be called once
                    msg = 'Could not save changes due to the following error:\n' + (serverError && serverError.exception) ? serverError.exception : response.statusText;
                }
            }, this);

            //NOTE this should be keyed using the request context object
//            if(!serverError._validateOnly){
//                msg = '';
//            }

            if(false !== this.fireEvent("commitexception", msg) && msg){
                Ext.Msg.alert("Error", "Error During Save. "+msg);
            }
        };
    },

    handleValidationErrors: function(records, serverError, response){
        var record = records[serverError.rowNumber];
        if(record){
            record.store.handleValidationError(record, serverError, response);
        }
        else {
            console.log('ERROR: Record not found');
            console.log(serverError);
        }
    },

    onCommitSuccess : function(response, options){
        var json = this.getJson(response);
        if(!json || !json.result)
            return;

        for (var i=0;i<json.result.length;i++){
            var result = json.result[i];
            var store = this.find(function(s){
                return s.queryName==result.queryName && s.schemaName==result.schemaName;
            });
            store.processResponse(result.rows);
            store.fireEvent("commitcomplete");
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
        //TODO: verify whether these are really deleted on server or not
        this.each(function(s){
            var records = [];
            s.each(function(r){
                records.push(r)
            }, this);
            s.deleteRecords(records);
        }, this);
    },

    //NOTE: used for development.  should get removed eventually
    showStores: function(){
        this.each(function(s){
            if(s.getCount()){
                console.log(s.storeId);
                console.log(s);
                console.log('Num Records: '+s.getCount());
                console.log('Total Records: '+s.getTotalCount());
                console.log('Modified Records:');
                console.log(s.getModifiedRecords())
                s.each(function(rec)
                {
                    console.log('record ID: '+rec.id);
                    console.log('record is dirty?: '+rec.dirty);
                    console.log('record is phantom?: '+rec.phantom);
                    console.log('saveOperationInProgress? '+rec.saveOperationInProgress);
                    Ext.each(rec.fields.keys, function(f){
                        console.log(f + ': ' + rec.get(f));
                    }, s);
                }, s)
            }
        }, this);
    },
    showErrors: function(){
        console.log(this.getErrors());
    }
});


EHR.ext.StoreInheritance = {
    initInheritance: function(store) {
        //if the store is already loaded, we
        if(store.reader.meta.fields){
            this.addInheritanceListeners(store);
        }

        store.on('beforemetachange', this.addInheritanceListeners, this, {buffer: 20});
    },
    relationships: new Ext.util.MixedCollection(false, function(s){return s.key}),
    //NOTE: meta argument included b/c this gets called directly by the store's metachange event
    addInheritanceListeners: function(store, meta, field){
        if(!field){
            store.fields.each(function(f){
                this.handleField(store, meta, f);
            }, this);
        }
        else {
            this.handleField(store, meta, field);
        }
    },
    handleField: function(store, meta, field){
        if(field.parentConfig){
            if(!field.parentConfig.parent)
                this.findParent(store, meta, field);

            if(field.parentConfig.parent)
                this.addInheritanceListener(store, field);
        }
    },
    findParent: function(store, meta, field){
        var targetStore;
        if(Ext.isFunction(field.parentConfig.storeIdentifier)){
            targetStore = field.parentConfig.storeIdentifier();
        }
        else {
            targetStore = this.find(function(s){
                for (var i in field.parentConfig.storeIdentifier){
                    if(s[i] != field.parentConfig.storeIdentifier[i])
                        return false;
                }
                return true;
            });
        }
        if(!targetStore){
            console.log('target store not found');
            console.log(field.parentConfig)
            this.on('add', function(){
                this.addInheritanceListeners(store, meta, field)
            }, this, {single: true});
            return;
        }

        if(targetStore == store){
            //console.log('target store is parent, skipping')
            return;
        }

        //in this case the store has not loaded yet
        if(!targetStore.fields){
            targetStore.on('load', function(){
                this.addInheritanceListeners(store, meta, field);
            }, this, {single: true});
            return;
        }
        //the store is loaded, but has no records
        else if (!targetStore.getCount()){
            console.log('no records in store: '+targetStore.storeId);
            targetStore.on('add', function(){
                console.log('retrying store: '+targetStore.storeId+' for field :'+field.name);
                this.addInheritanceListeners(this, meta, field)
            }, this, {single: true});
            return;
        }

        //console.log('parent found: '+targetStore.storeId+" for table "+store.storeId+' for field '+field.name);
        //TODO: we always assume we want the 1st record.  possibly extend to allow more complex logic
        field.parentConfig.parent = targetStore.getAt(0);
    },
    addInheritanceListener: function(store, field){
        var key = [store.storeId, field.name].join(':');
        var config = {
            key: key,
            store: store,
            field: field,
            listeners: {},
            listenerTarget: null,
            parent: null
        };

        var initialVal;

        field.oldSetInitialValue = field.setInitialValue;
        var parent = field.parentConfig.parent;
        config.parent = parent;

        if (parent instanceof Ext.data.Record){
            config.listenerTarget = parent.store;
            //console.log('adding '+field.name+' from : '+parent.store.storeId + '/to: '+store.storeId);
            config.listeners.update = function(parent, childStore){return function(store, rec, idx){
                if(rec === parent){
                    childStore.each(function(rec){
//                        console.log('inheritance listener called on '+field.dataIndex+'/childStore: '+childStore.storeId+' /parentStore: '+store.storeId+'/rec: '+rec.id);
                        //console.log('setting value to: '+parent.get(field.parentConfig.dataIndex));
                        rec.set(field.dataIndex, parent.get(field.parentConfig.dataIndex));
                    }, config);
                }
//                else
//                    console.log('update, but not of the parent record')

            }}(parent, store);
            config.listeners.remove = function(store, rec){
                if(rec === field.parentConfig.parent){
                    this.removeInheritanceListeners(store);
                    this.addInheritanceListeners(store);
                }
            };

            initialVal = parent.get(field.parentConfig.dataIndex);
            field.setInitialValue = function(v, rec, f){
                //console.log('setting initial val for: '+f.name + ' to ' +f.parentConfig.parent.get(f.parentConfig.dataIndex));
                return f.parentConfig.parent.get(f.parentConfig.dataIndex);
            }
        }
//        else if (parent instanceof Ext.form.Field){
//            config.listenerTarget = parent;
//            config.listeners.change = function(field){
//                store.each(function(rec){
//                    rec.set(field.dataIndex,  field.parentConfig.parent.getValue());
//                }, this);
//            };
//
//            initialVal = parent.getValue();
//            field.setInitialValue = function(parent){
//                return function(v, rec){
//                    return parent.getValue();
//                }
//            }(parent);
//        }
        else {
            console.log('problem with parent');
            console.log(field.parentConfig.parent);
            return;
        }

        if(this.relationships.contains(key)){
            var oldConfig = this.relationships.get(key);
            console.log('key already exists: '+key);
            if(oldConfig.parent === config.parent){
                console.log('same parent - aborting');
                return;
            }
            else
                this.removeInheritanceListener(key);
        }

        this.relationships.add(config);
        for (var l in config.listeners){
            //console.log('adding  '+l+' listener from: '+config.store.storeId+' to: '+config.listenerTarget.storeId+'/'+config.field.name)
            config.listenerTarget.on(l, config.listeners[l], this);
        };

        //update any pre-existing records
        //if called before render the grid throws an error

        store.each(function(rec){
            rec.beginEdit();
            if(rec.get(field.dataIndex) != initialVal){
                rec.set(field.dataIndex, initialVal);
            }
            rec.endEdit();
        }, this);

    },
    removeInheritanceListeners: function(store){
        store.fields.each(function(f){
            this.removeInheritanceListener([store.storeId, f.name].join(':'));
        }, this);
    },
    removeInheritanceListener: function(key){
        var config = this.relationships.get(key);
        console.log('removing listener: '+key)
        Ext.each(config.listeners, function(l){
            config.listenerTarget.un(l, config.listeners[l], this);
        }, this);
    }
};
