/*
 * Copyright (c) 2013 LabKey Corporation
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
            if (r.phantom)
                this.remove(r);
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
        Ext4.Array.forEach(records, function(record){
            record.serverErrors = record.serverErrors || Ext4.create('Ext.data.Errors');
            record.serverErrors.clear();
        }, this);

        this.callParent(arguments);
    },


    handleServerErrors: function(errors, records){
        //clear all server errors
        Ext4.Array.forEach(records, function(record){
            record.serverErrors = record.serverErrors || Ext4.create('Ext.data.Errors');
            record.serverErrors.clear();
        }, this);

        if (errors.errors){
            Ext4.Array.forEach(errors.errors, function(rowError, idx){
                var record = records[rowError.rowNumber - 1];
                LDK.Assert.assertNotEmpty('Unable to find matching record after validation', record);

                if (rowError.errors){
                    //now iterate field errors
                    Ext4.Array.forEach(rowError.errors, function(fieldError, idx){
                        var severity = 'ERROR';
                        var msg = fieldError.message;

                        //translate the default server errors
                        if (msg.match('Missing value for required property: ')){
                            msg = 'ERROR: This field is required';
                        }

                        if (msg.match(': ')){
                            severity = msg.split(': ').shift();
                        }

                        record.serverErrors.add({
                            msg: msg,
                            message: msg,
                            severity: severity,
                            fromServer: true,
                            field: fieldError.field,
                            serverRecord: record,
                            id: LABKEY.Utils.generateUUID()
                        });
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
    }
});

