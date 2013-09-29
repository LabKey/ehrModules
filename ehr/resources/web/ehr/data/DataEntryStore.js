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
Ext4.define('EHR.data.DataEntryStore', {
    extend: 'LABKEY.ext4.data.Store',
    alias: 'store.ehr-dataentrystore',

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
        baseParams.apiVersion = 13.1;

        return baseParams;

    },

    onUpdate: function(store, record, operation){
        this.callParent(arguments);


    },

    //private
    //this method performs simple checks client-side then will submit the record for server-validation if selected
    validateRecord: function(r, validateOnServer){
        r.errors = r.errors || [];

        //remove other client-side errors for this record
        for(var i = r.errors.length-1; i >= 0; i--){
            if(!r.errors[i].fromServer){
                this.errors.remove(r.errors[i]);
                r.errors.splice(i, 1);
            }
        }

        var store = this;
        r.fields.each(function(f) {
            //apparently the store's metadata can be updated w/o changing the record's, so we defer to the store
            var meta = store.getFields().get(f.name);
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

            //NOTE: if we had a reference to the field editor, i could hook into getErrors() to find other validation errors
            //should revisit in Ext 4 when validation is moved to dataModel
        }, store);

        this.errors.addAll(r.errors);

        //this is designed such that validateRecords() can call validateRecord() multiple times without events firing
        if(validateOnServer){
            this.validateRecordOnServer([r]);
        }
        else {
            this.fireEvent('validation', this, [r]);
        }
    },

    //private
    validateRecordOnServer: function(records){
        if(!records || !records.length)
            return;

        var commands = this.getChanges(records);
        if (!commands.length){
            return false;
        }

        Ext4.each(records, function(record){
            //NOTE: we remove saveOperationInProgress b/c this transaction is going to fail
            //therefore we do not want this flag to block a legitimate future save attempt.
            delete record.saveOperationInProgress;
            record.serverValidationInProgress = true;
        }, this);

        //add a flag per command to make sure this record fails
        this.sendRequest(records, commands, {validateOnly: true, silent: true, targetQCState: null});
    },

});

