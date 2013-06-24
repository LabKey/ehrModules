/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.data.StoreCollection', {
    extend: 'Ext.util.Observable',

    clientStores: null,
    serverStores: null,

    constructor: function(){
        this.collectionId = Ext4.id();
        this.clientStores = Ext4.create('Ext.util.MixedCollection', false, this.getKey);
        this.serverStores = Ext4.create('Ext.util.MixedCollection', false, this.getKey);

        this.callParent(arguments);
        this.addEvents('commitcomplete', 'commitexception', 'validation', 'load', 'clientdatachanged', 'serverdatachanged');

        this.on('clientdatachanged', this.onClientDataChanged, this, {buffer: 30});
    },

    getKey: function(o){
        return o.storeId;
    },

    getServerStoreForQuery: function(schemaName, queryName){
        var store;

        this.serverStores.each(function(s){
            if (LABKEY.Utils.caseInsensitiveEquals(s.schemaName, schemaName) && LABKEY.Utils.caseInsensitiveEquals(s.queryName, queryName)){
                store = s;
                return false;
            }
        }, this);

        return store;
    },

    loadDataFromServer: function(){
        if (this.serverStoresLoading)
            return;

        this.serverStoresLoading = {};
        this.serverStores.each(function(s){
            this.serverStoresLoading[s.storeId] = true;
            s.load();
        }, this);
    },

    getServerStoreByName: function(title){
        var parts = title.split('.');
        var queryName = parts.pop();
        var schemaName = parts.join('.');

        return this.getServerStoreForQuery(schemaName, queryName);
    },

    addServerStoreFromConfig: function(config){
        var storeConfig = Ext4.apply({}, config);
        LABKEY.ExtAdapter.apply(storeConfig, {
            type: 'ehr-dataentryserverstore',
            autoLoad: false,
            storeId: this.collectionId + '||' + LABKEY.ext.Ext4Helper.getLookupStoreId({lookup: config})
        });

        var store = this.serverStores.get(storeConfig.storeId);
        if (store){
            console.log('Store already defined: ' + store.storeId);
            return store;
        }

        store = Ext4.create('EHR.data.DataEntryServerStore', storeConfig);

        this.addServerStore(store);

        return store;
    },

    //add an instantiated server-side store to the collection
    addServerStore: function(store){
        this.mon(store, 'load', this.onServerStoreLoad, this);
        this.mon(store, 'exception', this.onServerStoreException, this);
        this.mon(store, 'validation', this.onServerStoreValidation, this);
        store.storeCollection = this;

        this.serverStores.add(store);
    },

    onServerStoreLoad: function(store){
        if (this.serverStoresLoading && this.serverStoresLoading[store.storeId]){
            delete this.serverStoresLoading[store.storeId];
            if (LABKEY.Utils.isEmptyObj(this.serverStoresLoading)){
                delete this.serverStoresLoading;
                this.transformServerToClient();
                this.fireEvent('load', this);
            }
        }
    },

    onClientStoreAdd: function(store){
        this.fireEvent('clientdatachanged', 'add');
    },

    onClientStoreRemove: function(store){
        this.fireEvent('clientdatachanged', 'remove');
    },

    onClientStoreUpdate: function(store){
        this.fireEvent('clientdatachanged', 'update');
    },

    onClientStoreDataChanged: function(store){
        this.fireEvent('clientdatachanged', 'datachanged');
    },

    //used to allow buffering so clientdatachange events from many sources only trigger 1 recalculation
    onClientDataChanged: function(){
        this.transformClientToServer()
    },

    onServerStoreException: function(store){
        console.log('exception');
    },

    transformClientToServer: function(){
        console.log('transformClientToServer');

        var changed = [];
        var changedRecords = {};
        this.clientStores.each(function(clientStore){
            var map = clientStore.getClientToServerRecordMap();
            var clientKeyField = clientStore.getKeyField();

            for (var table in map){
                var serverStore = this.getServerStoreByName(table);
                LDK.Assert.assertNotEmpty('Unable to find server store: ' + table, serverStore);

                var fieldMap = map[table];
                Ext4.Array.forEach(clientStore.getRange(), function(clientModel){
                    //find the corresponding server record
                    var key = clientModel.get(clientKeyField);
                    var serverModel = serverStore.findRecord(clientKeyField, key);

                    if (!serverModel){
                        //TODO: determine whether to auto-create the record
                        serverModel = this.addServerModel(serverStore, {});
                    }

                    if (serverModel){
                        var serverFieldName;
                        for (var clientFieldName in fieldMap){
                            serverFieldName = fieldMap[clientFieldName];

                            var clientVal = Ext4.isEmpty(clientModel.get(clientFieldName)) ? null : clientModel.get(clientFieldName);
                            var serverVal = Ext4.isEmpty(serverModel.get(serverFieldName)) ? null : serverModel.get(serverFieldName);
                            if (serverVal != clientVal){
                                serverModel.set(serverFieldName, clientVal);
                                serverModel.setDirty(true);
                                changed.push(serverFieldName + ': ' + clientVal);

                                if (!changedRecords[serverStore.storeId])
                                    changedRecords[serverStore.storeId] = {};

                                changedRecords[serverStore.storeId][serverModel.getId()] = serverModel;
                            }
                        }
                    }
                }, this);
            }
        }, this);

        if (changed.length > 0){
            this.validateRecords(changedRecords);
            this.fireEvent('serverdatachanged', this, changedRecords);
        }
    },

    validateAll: function(){
        console.log('validate all records');
        this.serverStores.each(function(serverStore){
            serverStore.validateRecords(serverStore.getRange(), true);
        }, this);
    },

    validateRecords: function(recordMap){
        console.log('validate records');
        for (var serverStoreId in recordMap){
            var serverStore = this.serverStores.get(serverStoreId);
            serverStore.validateRecords(Ext4.Object.getValues(recordMap[serverStoreId]), true);
        }
    },

    serverToClientDataMap: null,

    getServerToClientDataMap: function(){
        if (this.serverToClientDataMap){
            return this.serverToClientDataMap;
        }

        this.serverToClientDataMap = {};
        this.clientStores.each(function(cs){
            var map = cs.getClientToServerRecordMap();
            for (var serverStoreId in map){
                if (!this.serverToClientDataMap[serverStoreId])
                    this.serverToClientDataMap[serverStoreId] = {};

                this.serverToClientDataMap[serverStoreId][cs.storeId] = map[serverStoreId];
            }
        }, this);

        return this.serverToClientDataMap;
    },

    _sortedServerStores: null,

    getSortedServerStores: function(){
        if (this._sortedServerStores)
            return this._sortedServerStores;

        var dependencies = [];
        var arr;
        this.clientStores.each(function(s){
            arr = s.getDependencies();
            if (arr.length){
                dependencies = dependencies.concat(arr);
            }
        }, this);

        dependencies = LDK.Utils.tsort(dependencies);
        dependencies.reverse();
        this._sortedServerStores = dependencies;

        return dependencies;
    },

    setClientModelDefaults: function(model){
        //this method is designed to be overriden by subclasses

        //TODO: apply inheritance
    },

    //creates and adds a model to the provided client store, handling any dependencies within other stores in the collection
    addClientModel: function(store, data){
        if (EHR.debug)
            console.log('creating client model');

        var model = store.model.create(data);
        store.add(model);

        return model;
    },

    //creates and adds a model to the provided server store, handling any dependencies within other stores in the collection
    addServerModel: function(store, data){
        console.log('creating server model');
        var model = store.model.create({});
        store.add(model);

        return model;
    },

    updateClientModelInheritance: function(clientStore, clientModel){
        var map = clientStore.getInheritingFieldMap();
        var inheritance, serverStore, serverModel;
        Ext4.Array.forEach(Ext4.Object.getValues(map), function(field){
            inheritance = field.inheritance;
            serverStore = this.getServerStoreForQuery(inheritance.storeIdentifier.schemaName, inheritance.storeIdentifier.queryName);
            serverModel = this.getServerModelForInheritance(inheritance, serverStore, clientModel);
            if (!serverModel){

            }
            else {
                clientModel.set(field.name, serverModel.get(inheritance.sourceField))
            }

        }, this);
    },

    getServerModelForInheritance: function(inheritance, serverStore, clientModel){
        if (inheritance.recordSelector){
            var rs = inheritance.recordSelector;
            var idx = serverStore.findBy(function(serverModel){
                for (var clientFieldName in rs){
                    if (clientModel.get(clientFieldName) != serverModel.get(rs[clientFieldName])){
                        return false;
                    }
                }

                return true;
            });

            if (idx > -1)
                return serverStore.getAt(idx);
        }
        else if (inheritance.recordIdx){
            return serverStore.getAt(inheritance.recordIdx);
        }
    },

    transformServerToClient: function(){
        console.log('transformServerToClient');

        var map = this.getServerToClientDataMap();

        Ext4.Array.forEach(this.getSortedServerStores(), function(name){
            var serverStore = this.getServerStoreByName(name);
            LDK.Assert.assertNotEmpty('Unable to find store with name: ' + name, serverStore);

            var targetChildStores = map[name];
            var fieldMap, clientStore, serverFieldName, clientKeyField;
            serverStore.each(function(serverModel){
                for (var clientStoreId in targetChildStores){
                    clientStore = this.clientStores.get(clientStoreId);
                    LDK.Assert.assertNotEmpty('Unable to find client store with Id: ' + clientStoreId, clientStore);
                    clientKeyField = clientStore.getKeyField();

                    var clientModel = clientStore.findRecord(clientKeyField, serverModel.get(clientKeyField));
                    if (!clientModel){
                        clientModel = this.addClientModel(clientStore, {});
                    }

                    if (clientModel){
                        clientModel.phantom = serverModel.phantom;

                        fieldMap = targetChildStores[clientStoreId];
                        clientModel.suspendEvents();
                        for (var clientFieldName in fieldMap){
                            serverFieldName = fieldMap[clientFieldName];
                            clientModel.set(clientFieldName, serverModel.get(serverFieldName));
                        }
                        clientModel.resumeEvents();
                    }
                }
            }, this);
        }, this);

        this.clientStores.each(function(s){
            s.loaded = true;
        });
    },

    getSchemaQueryKey: function(store){
        return store.schemaName + '.' + store.queryName;
    },

    //add an instantiated client-side store to the collection
    addClientStore: function(store){
        //this.mon(store, 'load', this.onServerStoreLoad, this);
        this.mon(store, 'add', this.onClientStoreAdd, this);
        this.mon(store, 'remove', this.onClientStoreRemove, this);
        this.mon(store, 'update', this.onClientStoreUpdate, this);
        this.mon(store, 'datachanged', this.onClientStoreDataChanged, this);
        store.storeCollection = this;

        this.clientStores.add(store);
    },

    //private
    getCommands: function(commitAll){
        var allCommands = [];
        //var allRecords = [];

        this.serverStores.each(function(s){
            var commands = s.getCommands(commitAll);
            if (commands.length){
                allCommands = allCommands.concat(commands);
                //allRecords = allRecords.concat(records);
            }
        }, this);

        return {
            commands: allCommands,
            records: []
        }
    },

    getExtraContext: function(){
        return null;
    },

    commitChanges: function(commitAll) {
        var changed = this.getCommands(commitAll);
        this.commit(changed.commands, changed.records, this.getExtraContext());
    },

    //private
    commit: function(commands, records, extraContext){
        extraContext = extraContext || {};

        if(this.fireEvent('beforecommit', this, records, commands, extraContext)===false)
            return;

        if (!commands || !commands.length){
            this.onComplete(extraContext);
            return;
        }

        this.sendRequest(commands, records, extraContext);
    },

    sendRequest: function(records, commands, extraContext, validateOnly){
        var cfg = {
            url : LABKEY.ActionURL.buildURL('query', 'saveRows', this.containerPath),
            method : 'POST',
            success: this.getOnCommitSuccess(records),
            failure: this.getOnCommitFailure(records),
            scope: this,
            timeout: this.timeout || 0,
            jsonData : {
                apiVersion: 13.2,
                containerPath: this.containerPath,
                commands: commands,
                extraContext: extraContext || {}
            },
            headers : {
                'Content-Type' : 'application/json'
            }
        };

        if (validateOnly){
            cfg.jsonData.validateOnly = true;
        }

        var request = Ext4.Ajax.request(cfg);

        Ext4.each(records, function(rec){
            rec.lastTransactionId = request.tId;
        }, this);
    },

    /**
     * Will test whether all records in this store collection pass validation or not.
     * @returns {Boolean} True/false depending on whether all records in this StoreCollection pass validation
     */
    isValid: function(){
        var valid = true;
        this.serverStores.each(function(s){
            if(!s.isValid()){
                valid = false;
            }
        }, this);
        return valid;
    },

    /**
     * Tests whether any records in this store collection are dirty
     * @returns {boolean} True/false depending on whether any records in the collection are dirty.
     */
    isDirty: function(){
        var dirty = false;
        this.serverStores.each(function(s){
            if(s.getModifiedRecords().length)
                dirty = true;
        }, this);
        return dirty;
    },

    //private
    //tests whether any store are loading or not
    isLoading: function(){
        var isLoading = false;
        this.serverStores.each(function(s){
            if(s.isLoading){
                isLoading = true;
            }
        }, this);

        return isLoading;
    },

    //private
    onServerStoreValidation: function(store, records){
        //check all stores
        var maxSeverity = '';
        this.serverStores.each(function(store){
            maxSeverity = EHR.Utils.maxError(maxSeverity, store.getMaxErrorSeverity());
        }, this);

        this.fireEvent('validation', this, maxSeverity);
    },

    //private
    getErrors: function(){
        var errors = [];
        this.each(function(store){
            store.errors.each(function(error){
                errors.push(error);
            }, this);
        }, this);

        return errors;
    },

    //private
    getOnCommitFailure: function(records) {
        return function(response, options) {
            console.log('failure');

            //note: should not matter which child store they belong to
            for(var idx = 0; idx < records.length; ++idx)
                delete records[idx].saveOperationInProgress;

            //TODO: clean up how we parse the JSON errors
            var json = this.getJson(response);
            var msg = '';
            if(json && json.errors){
                //each error should represent 1 row.  there can be multiple errors per row
                Ext4.each(json.errors, function(rowError){
                    //handle validation script errors and exceptions differently
                    if(rowError.errors && rowError.errors.length && rowError.row){
                        this.handleValidationErrors(rowError, response, json.extraContext);
                        msg = rowError.exception || "Could not save changes due to errors.  Please check the form for fields marked in red.";
                    }
                    else {
                        //if an exception was thrown, I believe we automatically only have one error returned
                        //this means this can only be called once
                        msg = 'Could not save changes due to the following error:\n' + (json && json.exception) ? json.exception : response.statusText;
                    }
                }, this);

                if(!json.errors){
                    msg = 'Could not save changes due to the following error:\n' + json.exception;
                }
            }

            if(false !== this.fireEvent("commitexception", msg, json) && (options.jsonData.extraContext && !options.jsonData.extraContext.silent)){
                Ext4.Msg.alert("Error", "Error During Save. "+msg);
                console.error(json);
            }
        };
    },

    //private
    handleValidationErrors: function(json, response, extraContext){
        var store = this.serverStores.get(extraContext.storeId);
        LDK.Assert.assertNotEmpty('Unable to find server store to match id: ' + extraContext.storeId, store);
        var record = store.getById(json.row._recordid);
        if(record){
            store.handleValidationError(record, json, response, extraContext);
        }
        else {
            LDK.Utils.logToServer({
                includeContext: true,
                msg: 'Unable to find record to match validation error.  Id was: ' + extraContext.storeId + ' / ' + row._recordid
            });
            console.error(json);
        }
    },

    //private
    getOnCommitSuccess: function(records){
        return function(response, options){
            var json = this.getJson(response);

            if(!json || !json.result)
                return;

            if (json.errorCount > 0){
                console.log(json);
                var callback = this.getOnCommitFailure(records);
                callback.call(this, response, options);
                return;
            }

            for (var i=0;i<json.result.length;i++){
                var result = json.result[i];
                var store = this.getServerStoreForQuery(result.schemaName, result.queryName);
                LDK.Assert.assertNotEmpty('Unable to find matching store: ' + result.schemaName + '.' + result.queryName, store);

                if(!options.jsonData || !options.jsonData.extraContext || !options.jsonData.extraContext.successURL)
                    store.processResponse(result.rows);
            }

            this.onComplete((options.jsonData ? options.jsonData.extraContext : null));
        }
    },

    //private
    onComplete: function(extraContext){
        this.fireEvent("commitcomplete", this, extraContext);
    },

    //private
    getJson : function(response) {
        return (response && undefined != response.getResponseHeader && undefined != response.getResponseHeader('Content-Type')
                && response.getResponseHeader('Content-Type').indexOf('application/json') >= 0)
                ? LABKEY.ExtAdapter.decode(response.responseText)
                : null;
    },

    //private
    deleteAllRecords: function(extraContext){
        //NOTE: we delegate the deletion to each store, and track progress here so we can fire a single event
        var storesPerformingDeletes = [];
        var failures = 0;

        this.each(function(s){
            var records = [];
            s.each(function(r){
                records.push(r);
            }, this);

            function onComplete(response){
                s.un('commitcomplete', onComplete);
                s.un('commitexception', onComplete);

                if(storesPerformingDeletes.indexOf(s.storeId)!=-1){
                    storesPerformingDeletes.remove(s.storeId)
                }

                if(!storesPerformingDeletes.length){
                    if(failures == 0){
                        this.onComplete(extraContext);
                    }
                    else {
                        this.fireEvent('commitexception');
                    }
                }
            }

            s.on('commitcomplete', onComplete, this, {single: true});
            s.on('commitexception', onComplete, this, {single: true});

            storesPerformingDeletes.push(s.storeId);
            s.deleteRecords(records, extraContext);
        }, this);
    },

//    //private
//    //returns all records in all child stores
//    getAllRecords: function(){
//        var records = [];
//        this.each(function(s){
//            s.each(function(r){
//                records.push(r)
//            }, this);
//        }, this);
//        return records;
//    },

//    //private
//    //NOTE: used for development.  should get removed eventually
//    showStores: function(){
//        this.each(function(s){
//            if(s.getCount()){
//                console.log(s.storeId);
//                console.log(s);
//                console.log('Num Records: '+s.getCount());
//                console.log('Total Records: '+s.getTotalCount());
//                console.log('Modified Records:');
//                console.log(s.getModifiedRecords());
//                s.each(function(rec)
//                {
//                    console.log('record ID: '+rec.id);
//                    console.log('record is dirty?: '+rec.dirty);
//                    console.log('record is phantom?: '+rec.phantom);
//                    console.log('saveOperationInProgress? '+rec.saveOperationInProgress);
//                    Ext4.each(rec.fields.keys, function(f){
//                        console.log(f + ': ' + rec.get(f));
//                    }, s);
//                }, s)
//            }
//        }, this);
//    },
//
    //private
    //for debugging purposes
    showErrors: function(){
        console.log(this.getErrors());
    }
});