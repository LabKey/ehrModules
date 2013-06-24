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

    getCommands: function(records){
        var commands = [];

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
                else if (!LABKEY.Utils.isEmptyObj(r.modified))
                    recMap.update.push(r);
            }

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
        }

        return commands;
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
            r.errors = r.errors || [];

            //remove other client-side errors for this record
            for(var i = r.errors.length-1; i >= 0; i--){
                if(!r.errors[i].fromServer){
                    this.errors.remove(r.errors[i]);
                    r.errors.splice(i, 1);
                }
            }

            r.fields.each(function(f) {
                //apparently the store's metadata can be updated w/o changing the record's, so we defer to the store
                var meta = this.getFields().get(f.name);
                LDK.Assert.assertNotEmpty('Missing metadata for field: ' + f.name, meta);

                //NOTE: we're drawing a distinction between LABKEY's nullable and ext's allowBlank.
                // This allows fields to be set to 'allowBlank: false', which throws a warning
                // nullable:false will throw an error when null.
                // also, if userEditable==false, we assume will be set server-side so we ignore it here
                if(meta.userEditable!==false && Ext4.isEmpty(r.data[f.name])){
                    if(meta.nullable === false || meta.allowBlank === false){
                        r.errors.push({
                            id: LABKEY.Utils.generateUUID(),
                            field: f.name,
                            message: 'This field is required',
                            record: r,
                            errorValue: r.get(f.dataIndex),
                            severity: (f.nullable === false ? 'ERROR' : 'WARN'),
                            fromServer: false
                        });
                    }
                }

                //NOTE: consider using model / datatype to validate
            }, this);

            this.errors.addAll(r.errors);

            //this is designed such that validateRecords() can call validateRecord() multiple times without events firing
            if(validateOnServer){
                this.validateRecordsOnServer([r]);
            }
            else {
                this.fireEvent('validation', this, [r]);
            }
        }, this);
    },

    //private
    validateRecordsOnServer: function(records){
        if(!records || !records.length)
            return;

        var commands = [];
        Ext4.Array.forEach(records, function(record){
            //NOTE: we remove saveOperationInProgress b/c this transaction is going to fail
            //therefore we do not want this flag to block a legitimate future save attempt.
            delete record.saveOperationInProgress;
            record.serverValidationInProgress = true;

            //build one command per record so failures on one dont block subsequent records
            commands = commands.concat(this.getCommands([record]));
        }, this);

        if (!commands.length){
            return false;
        }

        //add a flag per command to make sure this record fails
        this.storeCollection.sendRequest(records, commands, {
            validateOnly: true,
            silent: true,
            targetQCState: null
        });
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
        this.errors.each(function(e){
            maxSeverity = EHR.Utils.maxError(maxSeverity, e.severity);
        }, this);

        return maxSeverity;
    }
});

