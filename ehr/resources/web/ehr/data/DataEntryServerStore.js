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
    extend: 'LABKEY.ext4.Store',
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
            recMap.delete = this.getRemovedRecordsToSync();
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

            //TODO: handle deletes
            //recMap.delete = this.getRemovedRecordsToSync();
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
        var toDelete = [];
        Ext4.Array.forEach(records, function(r){
            if (!r.phantom)
                toDelete.push(r);
        }, this);

        return toDelete;
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

    handleServerErrors: function(errors, records){
        Ext4.Array.forEach(errors, function(error, idx){
            //console.log(error);
            //TODO: match record??
            var record = records[0];
            record.serverErrors = record.serverErrors || Ext4.create('Ext.data.Errors');
            record.serverErrors.clear();

            LDK.Assert.assertNotEmpty('Unable to find matching record after validation', record);

            var severity = 'ERROR';
            var msg = error.message;
            if (msg.match(': ')){
                severity = msg.split(': ').shift();
            }

            record.serverErrors.add({
                msg: msg,
                message: msg,
                severity: severity,
                fromServer: true,
                field: error.field,
                serverRecord: record,
                id: LABKEY.Utils.generateUUID()
            });
        }, this);

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

