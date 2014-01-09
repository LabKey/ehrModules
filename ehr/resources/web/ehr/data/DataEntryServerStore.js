/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * The primary feature of this store is that it will validate records, which is essentially mock-saving the
 * records in order to run server-side validation and identify errors.  For this to work correctly, the tables
 * being used must also support validation.
 */
Ext4.define('EHR.data.DataEntryServerStore', {
    extend: 'LDK.data.LabKeyStore',
    alias: 'store.ehr-dataentryserverstore',

    constructor: function(){
        Ext4.apply(this, {
            pruneModifiedRecords: true,
            errors: new Ext4.util.MixedCollection(),
            doServerValidation: true
        });

        this.callParent(arguments);
    },

    ensureServerErrors: function(record){
        record.serverErrors = record.serverErrors || Ext4.create('EHR.data.Errors', {
            record: record.serverErrors
        });
    },

    onLoad : function(store, records, success) {
        if (records){
            for (var i=0;i<records.length;i++){
                this.ensureServerErrors(records[i]);
            }
        }

        this.callParent(arguments);
    },

    generateBaseParams: function(config){
        var baseParams = this.callParent(arguments);
        baseParams.apiVersion = 13.2;

        return baseParams;
    },

    findRecord: function(fieldName, value){
        var idx = this.find(fieldName, value);
        if (idx != -1){
            return this.getAt(idx);
        }
    },

    onUpdate: function(store, record, operation){
        this.callParent(arguments);
    },

    getCommands: function(records, forceUpdate){
        var commands = [];
        var recordsPerCommand = [];

        //batch records into CRUD operations
        var recMap = {
            create: [],
            update: [],
            destroy: []
        };

        //only commit changed records
        if (!records){
            recMap.create = this.getNewRecords();
            recMap.update = this.getUpdatedRecords();

            var removed = this.getRemovedRecordsToSync();
            if (removed.destroy.length)
                recMap.destroy = removed.destroy;
            if (removed.update.length)
                recMap.update = recMap.update.concat(removed.update);
        }
        else {
            var r;
            for (var i=0; i<records.length;i++){
                r = records[i];
                if (r.phantom)
                    recMap.create.push(r);
                else if (forceUpdate || !LABKEY.Utils.isEmptyObj(r.modified))
                    recMap.update.push(r);
            }

            var removed = this.getRemovedRecordsToSync();
            if (removed.destroy.length)
                recMap.destroy = removed.destroy;
            if (removed.update.length)
                recMap.update = recMap.update.concat(removed.update);
        }

        for (var action in recMap){
            if (!recMap[action].length)
                continue;

            var operation = Ext4.create('Ext.data.Operation', {
                action: action,
                records: recMap[action]
            });

            commands.push(this.proxy.buildCommand(operation));
            recordsPerCommand.push(operation.records);
        }

        return {
            commands: commands,
            records: recordsPerCommand
        };
    },

    getRemovedRecordsToSync: function(){
        var records = this.getRemovedRecords();
        var ret = {
            destroy: [],
            update: []
        };
        Ext4.Array.forEach(records, function(r){
            if (!r.phantom){
                if (r.isRemovedRequest)
                    ret.update.push(r);
                else
                    ret.destroy.push(r);
            }
        }, this);

        return ret;
    },

    removePhantomRecords: function(){
        this.each(function(r){
            if (r.phantom){
                this.remove(r);
            }
        }, this);
    },

    validateRecord: function(record, validateOnServer){
        this.validateRecords([record], validateOnServer);
    },

    //private
    //this method performs simple checks client-side then will submit the record for server-validation if selected
    validateRecords: function(records, validateOnServer){
        Ext4.Array.forEach(records, function(r){
            r.validate();
        }, this);

        if(validateOnServer){
            this.validateRecordsOnServer(records);
        }
        else {
            this.fireEvent('validation', this, records);
        }
    },

    //private
    validateRecordsOnServer: function(records){
        if(!records || !records.length)
            return;

        var commands = [];
        var recordArr = [];
        Ext4.Array.forEach(records, function(record){
            //NOTE: we remove saveOperationInProgress b/c this transaction is going to fail
            //therefore we do not want this flag to block a legitimate future save attempt.
            delete record.saveOperationInProgress;
            record.serverValidationInProgress = true;

            //build one command per record so failures on one dont block subsequent records
            var result = this.getCommands([record], true);
            commands = commands.concat(result.commands);
            recordArr = recordArr.concat(result.records);

        }, this);

        if (!commands.length){
            return false;
        }

        //add a flag per command to make sure this record fails
        this.storeCollection.sendRequest(recordArr, commands, {
            silent: true,
            targetQCState: null
        }, true);
    },

    processResponse: function(records, command){
        //clear server errors
        //TODO: fire event?
        Ext4.Array.forEach(records, function(record){
            this.ensureServerErrors(record);
            record.serverErrors.clear();
        }, this);

        this.callParent(arguments);
    },


    handleServerErrors: function(errors, records, requestId){
        //clear all server errors
        Ext4.Array.forEach(records, function(record){
            this.ensureServerErrors(record);
            record.serverErrors.clear();
        }, this);

        if (errors.errors){
            Ext4.Array.forEach(errors.errors, function(rowError, idx){
                var record = records[rowError.rowNumber];
                if (rowError.row){
                    var found;
                    if (this.model.prototype.idProperty && rowError.row[this.model.prototype.idProperty]){
                        found = this.findRecord(this.model.prototype.idProperty, rowError.row[this.model.prototype.idProperty]);
                    }
                    else if (this.model.prototype.fields.get('objectid')){
                        found = this.findRecord('objectid', rowError.row['objectid']);
                    }

                    if (found && record && found != record){
                        LDK.Assert.assertEquality('Record PK and rowNumber do not match', found, record);
                        console.error('records dont match');
                        console.log(record);
                        console.log(found);
                    }
                    else {
                        record = found;
                    }
                }
                else {
                    //TODO: there is some sort of inconsistency on the server when assigning rowNumber
                    record = records[rowError.rowNumber - 1];
                }

                if (!record){
                    LDK.Utils.logToServer({
                        level: 'ERROR',
                        message: 'Unable to find matching record after validation.  Row # was: ' + rowError.rowNumber + '.\n' +
                                'storeId: ' + this.storeId + '\n' +
                                'Total records in store: ' + this.getCount() + '\n' +
                                'Total records received: ' + records.length + '\n' +
                                'exception: ' + rowError.exception + '\n' +
                                'Row Data: ' + Ext4.encode(rowError.row) + '\n'
                    });

                    return;
                }

                if (record.lastRequestId && record.lastRequestId > requestId){
                    return;
                }

                if (rowError.errors){
                    //now iterate field errors
                    var serverErrorMap = {};
                    Ext4.Array.forEach(rowError.errors, function(fieldError, idx){
                        //this is a flag used by server-side validation scripts
                        if (fieldError.field == '_validateOnly') {
                            return;
                        }

                        var severity = 'ERROR';
                        var msg = fieldError.message;

                        //translate the default server errors
                        if (msg.match('Missing value for required property: ')){
                            msg = 'ERROR: This field is required';
                        }

                        if (msg.match(': ')){
                            severity = msg.split(': ').shift();
                        }

                        serverErrorMap[fieldError.field] = serverErrorMap[fieldError.field] || [];
                        serverErrorMap[fieldError.field].push({
                            msg: msg,
                            message: msg,
                            severity: severity,
                            fromServer: true,
                            field: fieldError.field,
                            serverRecord: record,
                            id: LABKEY.Utils.generateUUID()
                        });
                    }, this);

                    Ext4.Array.forEach(Ext4.Object.getKeys(serverErrorMap), function(field){
                        record.serverErrors.replaceErrorsForField(field, serverErrorMap[field]);
                    }, this);
                }
                else {
                    console.error('unhandled error');
                    console.log(rowError);
                }
            }, this);
        }
        else {
            console.error('unhandled error');
            console.log(errors);
        }

        this.fireEvent('validation', this, records);
    },

    getKeyField: function(){
        if (this.keyFieldName)
            return this.keyFieldName;

        var keyFields = [];
        this.getFields().each(function(f){
            if (f.isKeyField){
                //hack
                if (f.name == 'lsid')
                    keyFields.push('objectid');
                else
                    keyFields.push(f.name);
            }
        }, this);

        LDK.Assert.assertEquality('Incorrect number of key fields: ' + this.storeId + ' / ' + keyFields.join(';'), 1, keyFields.length);

        if (keyFields.length == 1){
            this.keyFieldName = keyFields[0];
            return this.keyFieldName;
        }
    },

    getMaxErrorSeverity: function(){
        var maxSeverity;
        this.each(function(r){
            r.validate().each(function(e){
                maxSeverity = EHR.Utils.maxError(maxSeverity, (e.severity));
            }, this);
        }, this);

        return maxSeverity;
    },

    transformRecordsToClient: function(sc,targetChildStores, changedStoreIDs, syncErrorsOnly){
        var fieldMap, clientStore, serverFieldName, clientKeyField, toRemove = [], toFireValidation = [];
        this.each(function(serverModel){
            var found = false;

            for (var clientStoreId in targetChildStores){
                clientStore = sc.clientStores.get(clientStoreId);
                LDK.Assert.assertNotEmpty('Unable to find client store with Id: ' + clientStoreId, clientStore);
                clientKeyField = clientStore.getKeyField();

                var clientModel = clientStore.findRecord(clientKeyField, serverModel.get(clientKeyField));
                if (!clientModel && !syncErrorsOnly){
                    //first look for this model in deleted records
                    if (clientStore.getRemovedRecords().length){
                        var foundRecord;
                        Ext4.each(clientStore.getRemovedRecords(), function(rr){
                            if (rr.get(clientKeyField) === serverModel.get(clientKeyField)){
                                foundRecord = rr;
                                return false;
                            }
                        }, this);

                        if (foundRecord){
                            console.log('have server record for a removed client record, removing');
                            toRemove.push(foundRecord);
                            return;
                        }
                    }

                    if (serverModel._clientModelId){
                        var clientModelIdx = clientStore.findBy(function(record){
                            return record.internalId === serverModel._clientModelId;
                        });
                        if (clientModelIdx != -1){
                            clientModel = clientStore.getAt(clientModelIdx);
                            console.log('found by internal id')
                        }
                    }
                    else {
                        clientModel = clientStore.addClientModel({});
                    }
                }

                if (clientModel){
                    found = true;
                    clientModel.phantom = serverModel.phantom;

                    fieldMap = targetChildStores[clientStoreId];
                    clientModel.suspendEvents();

                    var changedData = false;
                    for (var clientFieldName in fieldMap){
                        serverFieldName = fieldMap[clientFieldName];
                        LDK.Assert.assertNotEmpty('Unable to find serverField to match clientField: ' + clientFieldName, serverFieldName);

                        if (!syncErrorsOnly){
                            //transfer values
                            var clientVal = Ext4.isEmpty(clientModel.get(clientFieldName)) ? null : clientModel.get(clientFieldName);
                            var serverVal = Ext4.isEmpty(serverModel.get(serverFieldName)) ? null : serverModel.get(serverFieldName);
                            if (serverVal != clientVal){
                                changedData = true;
                                clientModel.set(clientFieldName, serverVal);
                                changedStoreIDs[clientStore.storeId] = true;
                            }
                        }

                        //also sync server errors
                        LDK.Assert.assertNotEmpty('Server errors is null', serverModel.serverErrors);
                        var se = serverModel.serverErrors.getByField(serverFieldName) || [];
                        clientModel.serverErrors.replaceErrorsForField(clientFieldName, se);
                        changedStoreIDs[clientStore.storeId] = true;
                    }

                    clientModel.resumeEvents();
                }
            }

            if (!found && !syncErrorsOnly){
                if (serverModel.phantom){
                    //ignore
                    console.log('phantom servermodel is unable to find client record.  this probably indicates the client record it was removed');
                    this.remove(serverModel);
                }
                else {
                    console.error('unable to find client model for record');
                    console.log(serverModel);
                }
            }
        }, this);

        if (toRemove.length){
            Ext4.Array.forEach(toRemove, function(r){
                this.remove(r);
            }, this);
        }
    },

    //creates and adds a model to the provided server store, handling any dependencies within other stores in the collection
    addServerModel: function(data){
        if (EHR.debug)
            console.log('creating server model');
        var model = this.createModel({});
        model.serverErrors = Ext4.create('EHR.data.Errors', {
            record: model
        });

        this.add(model);

        return model;
    }
});

