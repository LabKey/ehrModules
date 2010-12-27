/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

Ext.namespace('EHR.ext', 'EHR.ext.plugins');




// this class will serve to monitor multiple child stores.
// it will handle: preparing submission to server, commitChanges, decoding server response
// also provides some level of validation over records
// should delegate as much as reasonable to child stores
// primarily tries to listen for events from child stores and aggregate info

//events: 'beforecommit', 'commitcomplete', 'commitexception','update', 'valid', 'invalid'

EHR.ext.StoreCollection = Ext.extend(Ext.util.MixedCollection, {
    constructor: function(config){
        Ext.apply(this, EHR.ext.StoreInheritance);

        EHR.ext.StoreCollection.superclass.constructor.call(this, arguments);

        this.addEvents('beforecommit', 'commitcomplete', 'commitexception','update', 'valid', 'invalid');

//NOTE: for development only
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
        this.on('update', function(store, rec){
            console.log('store collection updated: '+store.storeId);
        });
//        this.on('invalid', function(store, recs){
//            console.log('store collection invalid: '+store.storeId);
//        });
//        this.on('valid', function(store){
//            console.log('store collection valid event: '+this.isValid());
//        });
    },
    add: function(store){
        store = Ext.StoreMgr.lookup(store);
        if (this.contains(store)){
            console.log('Store already added: '+store.queryName);
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

        EHR.ext.StoreInheritance.initInheritance(store);

        this.relayEvents(store, ['invalid', 'valid', 'update']);
    },

    remove: function(store){
        delete store.parentStore;
        EHR.ext.StoreCollection.superclass.remove.call(store);
    },

    getChanged: function(o){
        var allCommands = [];
        var allRecords = [];

        this.each(function(s){
            var records = s.getModifiedRecords();
            var commands = s.getChanges(records);

            if (!commands.length){
                return;
            }

            allCommands = allCommands.concat(commands);
            allRecords = allRecords.concat(records);
        }, this);

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

        if(this.fireEvent('beforecommit', changed.records, changed.commands)===false)
            return;

        Ext.Ajax.request({
            url : LABKEY.ActionURL.buildURL('query', 'saveRows', this.containerPath),
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

    isValid: function(){
        var valid = true;
        this.each(function(s){
            if(!s.isValid())
                valid=false
        }, this);
console.log('Valid: '+valid);
        return valid;
    },

    getOnCommitFailure : function(records) {
        return function(response, options) {
            //note: should not matter which child store they belong to
            for(var idx = 0; idx < records.length; ++idx)
                delete records[idx].saveOperationInProgress;

            var json = this.getJson(response);
            var message = (json && json.exception) ? json.exception : response.statusText;

            if(false !== this.fireEvent("commitexception", message))
                Ext.Msg.alert("Error During Save", "Could not save changes due to the following error:\n" + message);
        };
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
            console.log(s.storeId);
            console.log(s);
            console.log('Num Records: '+s.getCount());
            console.log('Total Records: '+s.getTotalCount());
            s.each(function(rec)
            {
                console.log('record is dirty?: '+rec.dirty);
                console.log('record is phantom?: '+rec.phantom);
                console.log('saveOperationInProgress? '+rec.saveOperationInProgress);
                Ext.each(rec.fields.keys, function(f){
                    console.log(f + ': ' + rec.get(f));
                }, s);
            }, s)
        }, this);
    }
});






EHR.ext.StoreInheritance = {
    initInheritance: function(store) {
        Ext.apply(store, {
            addInheritanceListeners: function(store, meta){
                Ext.each(meta.fields, function(f){
                    if(f.parentConfig){
                        if(!f.parentConfig.parent)
                            this.findParent(f, meta);

                        if(f.parentConfig.parent)
                            this.addInheritanceListener(f);
                    }
                }, this);
            },
            findParent: function(field, meta){
                var targetStore;
                if(Ext.isFunction(field.parentConfig.storeIdentifier)){
                    targetStore = field.parentConfig.storeIdentifier();
                }
                else {
                    targetStore = this.parentStore.find(function(s){
                        for (var i in field.parentConfig.storeIdentifier){
                            if(s[i] != field.parentConfig.storeIdentifier[i])
                                return false;
                        }
                        return true;
                    });
                }
                if(!targetStore){
                    this.parentStore.on('add', function(){this.addInheritanceListeners(this, meta)}, this, {single: true});
                    return;
                }
                if(targetStore == store){
                    return;
                }
                if(!targetStore.getCount()){
                    targetStore.on('load', function(){this.addInheritanceListeners(this, meta)}, this, {single: true});
                    return;
                }
                field.parentConfig.parent = targetStore.getAt(0);
            },
            addInheritanceListener: function(field){
                var listener;
                var event;
                var target;
                var val;

                field.oldSetInitialValue = field.setInitialValue;
                var parent = field.parentConfig.parent;

                if (parent instanceof Ext.form.Field){
                    listener = function(field){
                        this.each(function(rec){
                            rec.set(field.dataIndex,  field.parentConfig.parent.getValue());
                        }, this);
                    };
                    target = parent;
                    event = 'change';
                    val = parent.getValue();
                    field.setInitialValue = function(parent){
                        return function(v, rec){
                            return parent.getValue();
                        }
                    }(parent);
                }
                else if (parent instanceof Ext.data.Record){
                    listener = function(store, recs, idx){
                        Ext.each(recs, function(record){
                            if(record === parent){
                                this.each(function(rec){
                                    rec.set(field.dataIndex, parent.get(field.parentConfig.dataIndex));
                                }, this);
                            }
                        }, this);
                    };
                    target = parent.store;
                    event = 'update';
                    val = parent.get(field.parentConfig.dataIndex);
                    field.setInitialValue = function(v, rec){
                        //console.log(field.name + '/' +field.parentConfig.parent.id);
                        return field.parentConfig.parent.get(field.parentConfig.dataIndex);
                    }

                }

                target.on(event, listener, this);
                field.removeInheritanceListener = function(field, target, event, listener, scope){
                    return function(){
                        target.un(event, listener, scope);
                        field.setInitialValue = field.oldSetInitialValue;
                    }(field, target, event, listener, this);
                };

                //update any pre-existing records
                this.each(function(rec){
                    rec.set(field.dataIndex,  val);
                }, this);
            },
            removeInheritanceListeners: function(){
                this.fields.each(function(f){
                    f.removeInheritanceListener();
                }, this);
            }
        });

        store.on('beforemetachange', store.addInheritanceListeners, store);

        //will cause metadata to refresh
        if(store.reader.meta.fields)
            store.onProxyLoad();
    }
};
