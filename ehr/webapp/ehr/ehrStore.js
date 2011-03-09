/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

Ext.namespace("EHR", "EHR.ext");

LABKEY.requiresScript("/ehr/Utils.js");
LABKEY.requiresScript("/ehr/ehrMetaHelper.js");

/**
 * @memberOf LABKEY.ext.Store#
 * @name beforemetachange
 * @event
 * @description Fires after the HTTP proxy loads metadata from the server, but before it is applied to the store
 * @param {Object} this The store object
 * @param {Object} meta The metadata object that will be applied to the store
 */
/**
 * @memberOf LABKEY.ext.Store#
 * @name validation
 * @event
 * @description This will fire whenever the store's records are validated.
 * @param {Object} this The store object
 * @param {Array} records Array of the records that were validated
 */

//doServerValidation: boolean

EHR.ext.AdvancedStore = Ext.extend(LABKEY.ext.Store, {
    constructor: function(config){
        Ext.apply(this, {
            pruneModifiedRecords: true,
            errors: new Ext.util.MixedCollection(),
            doServerValidation: true
        });


        EHR.ext.AdvancedStore.superclass.constructor.apply(this, arguments);

        this.addEvents('beforemetachange', 'validation');
        this.proxy.on("load", this.onProxyLoad, this);

        if(config.maxRows !== undefined){
            this.baseParams['query.maxRows'] = config.maxRows;
        }

        if(this.monitorValid)
            this.initMonitorValid();
    },

    initMonitorValid: function(){
        this.on('update', this.validateRecord, this);
        this.on('add', this.validateRecords, this);
        this.on('load', this.validateRecords, this);
        this.on('remove', this.validationOnRemove, this);

        this.on('save', function(store, batch, data){
            console.log('on save')
            console.log(arguments)
        }, this);

//        if(this.doServerValidation)
//            this.on('update', this.validateRecordOnServer, this, {buffer: 500, delay: 500});

        this.validateRecords(this);
    },

    stopMonitorValid: function(){
        this.un('update', this.validateRecord, this);
        this.un('add', this.validateRecords, this);
        this.un('load', this.validateRecords, this);
        this.on('remove', this.validationOnRemove, this);

//        this.un('update', this.validateRecordOnServer, this);
    },

    validationOnRemove: function(store, rec){
        //we need to remove all errors from this record
        this.errors.each(function(error){
            if(error.record==rec){
                this.errors.remove(error);
            }
        }, this);
        this.fireEvent('validation', this);
    },
    onProxyLoad: function(proxy, response, options){
        var meta = this.reader.meta;

        //provide a standardized translation
        this.translateMetaData(meta);

        Ext.each(meta.fields, function(f){
            //allow defaults for all fields
            //NOTE: perhaps move to this.fieldDefaults?
            if(this.metadata){
                if(this.metadata['fieldDefaults']){
                    EHR.utils.rApply(f, this.metadata['fieldDefaults']);
                }

                //allow more complex metadata, per field
                if(this.metadata[f.name]){
                    EHR.utils.rApply(f, this.metadata[f.name]);
                }
            }

if(f.lookup && f.lookup.queryName=='snomed' && f.lookups!=false && f.xtype!='ehr-snomedcombo'){
    console.log('lookup to snomed');
    console.log(f)
}
        }, this);

        if(this.colModel){
            var colModel = this.reader.jsonData.columnModel;
            Ext.each(colModel, function(col){
                if(this.colModel[col.dataIndex]){
                    EHR.utils.rApply(col, this.colModel[col.dataIndex]);
                }
            }, this);
        }

        if(false===this.fireEvent('beforemetachange', this, meta))
            return;

        this.reader.onMetaChange(meta);
    },

    //NOTE: the intention of tihs method was to provide a standard, low-level way to translating Labkey metadata names into ext ones.
    //I am less convinced that this is really the way to go; however, there's a handlful of params where translation makes sense
    translateMetaData: function(meta){
        Ext.each(meta.fields, function(field){
            var h = Ext.util.Format.htmlEncode;
            var lc = function(s){return !s?s:Ext.util.Format.lowercase(s);};

            //field.type = lc(field.jsonType) || lc(field.type) || lc(field.typeName) || 'string';
            field.fieldLabel = h(field.label) || h(field.caption) || h(field.header) || h(field.name);
            field.dataIndex = field.dataIndex || field.name;
            field.editable = field.userEditable && !field.readOnly;

            field.allowBlank = field.nullable;

        }, this);
    },

    //TODO: would be better to just override this.recordType
    //the primary purpose of this method is to improve handling of default values and allow a setInitialValue() function
    //holding off on improving until I see ext 4
    newRecord: function(data, dirty){
        var rec;
        if(data instanceof Ext.data.Record)
            rec = data;
        else
            rec = new this.recordType(data);

        this.fields.each(function(f) {
            rec.data[f.name] = rec.data[f.name] || f.defaultValue || null;
            if(Ext.isFunction(f.setInitialValue)){
                rec.data[f.name] = f.setInitialValue.call(this, rec.data[f.name], rec, f);
            }
        }, this);

        return rec;
    },

    addRecords: function(records, idx){
        if(undefined === idx)
            idx = this.getCount();

        if(!Ext.isArray(records))
            records = [records];

        Ext.each(records, function(r, idx){
            records[idx] = this.newRecord(r);
        }, this);

        this.insert(idx, records);
        this.validateRecords(this, records);

        return records
    },

    addRecord: function(r, idx){
        if(undefined === idx)
            idx = this.getCount();

        r = this.newRecord(r);
        this.insert(idx, r);
        this.validateRecords(this, [r]);
        return r;
    },

    duplicateRecord: function(record, defaults){
        defaults  = defaults || {};
        //NOTE: this is deliberate such that defaults is applied first.  if you want to null a value, this should work
        var newData = Ext.apply({}, r.data);
        Ext.apply(newData, defaults);
        this.store.addRecord(newData);
    },

    duplicateRecords: function(records, defaults){
        Ext.each(records, function(r){
            this.duplicateRecord(r, defaults);
        }, this);

    },

    maxErrorSeverity: function(){
        var maxSeverity;
//console.log('errors:')
//console.log(this.errors)
        this.errors.each(function(e){
            maxSeverity = EHR.utils.maxError(maxSeverity, e.severity);
        }, this);

        return maxSeverity;
    },

    validateRecords: function(store, recs, fireEvent){
        if(recs)
            Ext.each(recs, function(r){
                this.validateRecord(this, r, null, {fireEvent: false});
            }, this);
        else
            this.each(function(r){
                this.validateRecord(this, r, null, {fireEvent: false});
            }, this);

        if(fireEvent !== false){
            this.fireEvent('validation', this, recs);
        }
    },

    validateRecord: function(store, r, operation, config){
        config = config || {};
        if(debug){
//            console.log('Validating Record: '+r.id);
//            console.log('Operation: '+operation);
        }

        r.errors = r.errors || [];

        //remove other client-side errors for this record
        for(var i = r.errors.length-1; i >= 0; i--){
            if(!r.errors[i].fromServer){
                this.errors.remove(r.errors[i]);
                r.errors.splice(i, 1);
            }
        }

        r.fields.each(function(f) {
            //NOTE: we're drawing a distinction between LABKEY's nullable and ext's allowBlank.
            // This allows fields to be set to 'allowBlank: false', which throws a warning
            // nullable:false will throw an error when null.
            // also, if userEditable==false, we assume will be set server-side so we ignore it here
            if(f.userEditable!==false && Ext.isEmpty(r.data[f.name])){
                if(f.nullable === false || f.allowBlank === false){
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

            //NOTE: if I could find the field editor, i could hook into getErrors() to find other validation errors
            //should revisit in Ext 4 when validation is moved to dataModel
        },store);

        this.errors.addAll(r.errors);

        //this is designed such that validateRecords() can call validateRecord() multiple times without events firing
        if(config.fireEvent!==false){
            this.fireEvent('validation', this, [r], config);
        }

        if(operation=='edit' && this.doServerValidation!==false){
            this.validateRecordOnServer.defer(500, this, [this, [r], config]);
        }
    },

    validateRecordOnServer: function(store, records, config){
        if(!records || !records.length)
            return;

        if(config && config.noServerValidation){
            console.log('skipping server validation');
            return;
        }

        console.log('starting server validation on: '+records.length);

        var commands = this.getChanges(records);

        if (!commands.length){
            console.log('No changes, not going to validate on server');
            return false;
        }

        //add a flag per command to make sure this record fails
        Ext.each(commands, function(command){
            Ext.each(command.rows, function(row){
                row.values._validateOnly = true;
            }, this);

            command.extraContext = {hello: 1};
        }, this);

        Ext.each(records, function(record){
            record.serverValidationInProgress = true;
        }, this);

        var extraContext = {validateOnly: true};

        //TODO: send context to server to prevent commit
//        Ext.each(commands, function(c){
//        }, this);

        this.sendRequest(records, commands, extraContext);
    },

//    isValid: function(){
//        var errors = this.validateRecords();
//        Ext.each(errors, function(e){
//            if(!e.warning){
//                return false;
//            }
//        }, this);
//        return true;
//    },

    getFormEditorConfig: function(fieldName, config){
        var meta = this.findFieldMeta(fieldName);
        return EHR.ext.metaHelper.getFormEditorConfig(meta, config);
    },

    getGridEditorConfig: function(fieldName, config){
        var meta = this.findFieldMeta(fieldName);
        return EHR.ext.metaHelper.getGridEditorConfig(meta, config);
    },

    getAllRecords: function(){
        var recs = [];
        this.each(function(r){
            recs.push(r);
        }, this);
        return recs;
    },

    //NOTE: removed unwanted checking from LABKEY store
    readyForSave: function(){
        return true;
    },

    //the only reason this method is overridden is to delete record.phantom near the bottom.  see note
    //second change: we also delete lastTransactionId
    processResponse : function(rows){
        var idCol = this.reader.jsonData.metaData.id;
        var row;
        var record;
        for(var idx = 0; idx < rows.length; ++idx)
        {
            row = rows[idx];

            if(!row || !row.values)
                return;

            //find the record using the id sent to the server
            record = this.getById(row.oldKeys[this.reader.meta.id]);
            if(!record)
                return;

            //apply values from the result row to the sent record
            for(var col in record.data)
            {
                //since the sent record might contain columns form a related table,
                //ensure that a value was actually returned for that column before trying to set it
                if(undefined !== row.values[col]){
                    if(!record.fields.get(col)){
                        console.log('ERROR: column not found: '+col);
                        console.log(record.fields);
                        continue;
                    }

                    var x = record.fields.get(col);
                    record.set(col, record.fields.get(col).convert(row.values[col], row.values));
                }

                //clear any displayValue there might be in the extended info
                if(record.json && record.json[col])
                    delete record.json[col].displayValue;
            }

            //if the id changed, fixup the keys and map of the store's base collection
            //HACK: this is using private data members of the base Store class. Unfortunately
            //Ext Store does not have a public API for updating the key value of a record
            //after it has been added to the store. This might break in future versions of Ext.
            if(record.id != row.values[idCol])
            {
                record.id = row.values[idCol];
                this.data.keys[this.data.indexOf(record)] = row.values[idCol];

                delete this.data.map[record.id];
                this.data.map[row.values[idCol]] = record;
            }

            //reset transitory flags and commit the record to let
            //bound controls know that it's now clean
            delete record.saveOperationInProgress;
            delete record.lastTransactionId;

            //NOTE: this could probably be removed in favor of the Ext param
            //phantom is the built-in Ext version of labkey's isNew.  I delete here so we know the record exists on the server
            delete record.isNew;
            delete record.phantom;
            record.commit();
        }

    },

    getLookupStore: function(){
        //not needed .  used in editorgridpanel.  should be shifted to metaHelper.
    },

    //only overriden to remove setting a default nullCaption.  this is moved to the combo tpl
    onLoad : function(store, records, options) {
        this.isLoading = false;

        //remeber the name of the id column
        this.idName = this.reader.meta.id;

        if(this.nullRecord)
        {
            //create an extra record with a blank id column
            //and the null caption in the display column
            var data = {};
            data[this.reader.meta.id] = "";
            data[this.nullRecord.displayColumn] = this.nullRecord.nullCaption || this.nullCaption || null;

            var recordConstructor = Ext.data.Record.create(this.reader.meta.fields);
            var record = new recordConstructor(data, -1);
            this.insert(0, record);
        }
    },

    //NOTE: split this method in two so they can be called independently
    commitChanges : function(){
        var records = this.getModifiedRecords();
        this.commitRecords(records);
    },

    //see above
    commitRecords : function(records){
        var commands = this.getChanges(records);

        if (!commands.length){
            console.log('No changes, nothing to do (from commitRecords)');
            return;
        }

        this.sendRequest(records, commands);
    },

    //NOTE: split this into a separate method so validateOnServer() can call it separately
    sendRequest: function(records, commands, extraContext){
        var request = Ext.Ajax.request({
            url : LABKEY.ActionURL.buildURL("query", "saveRows", this.containerPath),
            method : 'POST',
            success: this.onCommitSuccess,
            failure: this.getOnCommitFailure(records),
            scope: this,
            jsonData : {
                containerPath: this.containerPath,
                commands: commands,
                extraContext: extraContext || {}
            },
            headers : {
                'Content-Type' : 'application/json'
            }
        });

        Ext.each(records, function(rec){
            rec.lastTransactionId = request.tId;
        }, this);
    },

    //NOTE: overridden support different processing of exceptions and validation errors
    getOnCommitFailure : function(records) {
        return function(response, options) {

            for(var idx = 0; idx < records.length; ++idx)
                delete records[idx].saveOperationInProgress;

            var serverError = this.getJson(response);

            //this is done because the structure of the error object differs depending on whether you sent a single row or multiple
            //this is an attempt to normalize, but should be removed when possible
            if(serverError.rowNumber!==undefined || !serverError.errors){
                //this means either we only submitted 1 row, or there was an exception
                serverError = {errors: [serverError], exception: serverError.exception};
            }
console.log(options);
            var msg;
            Ext.each(serverError.errors, function(error){
                //handle validation script errors and exceptions differently
                if(error.errors && error.errors.length){
                    this.handleValidationErrors(records, error, response);
                    msg = "Could not save changes due to errors. Please check the form for fields marked in red.";
                }
                else {
                    //if an exception was thrown, I believe we automatically only have one error returned
                    //this means this can only be called once
                    msg = 'Could not save changes due to the following error:\n' + (serverError && serverError.exception) ? serverError.exception : response.statusText;
                }
            }, this);

            //NOTE this should be keyed using the request context object
            if(options.jsonData.extraContext.validateOnly)
                msg = '';

            if(false !== this.fireEvent("commitexception", msg) && msg){
                Ext.Msg.alert("Error", "Error During Save. "+msg);
            }
        };
    },

    handleValidationErrors: function(records, serverError, response){
        var record = records[serverError.rowNumber];
        if(record){
            this.handleValidationError(record, serverError, response, response);
        }
        else {
            console.log('ERROR: Record not found');
            console.log(serverError);
        }
    },

    //this will process the errors associated with 1 record.
    // this might be more than 1 error
    handleValidationError: function(record, serverError, response){
        //TODO: verify transaction Id matches the most recent attmept.
        if(record.lastTransactionId != response.tId){
            console.log('There has been a more recent transaction for this record');
            return;
        }

        //remove all old errors
        record.errors = [];
        this.errors.each(function(error){
            if(error.record==record){
                this.errors.remove(error);
            }
        }, this);

        Ext.each(serverError.errors, function(e){
            //this is a flag used by server-side validation scripts
            if(e.field=='_validateOnly')
                return;

            var newError = {
                id: LABKEY.Utils.generateUUID(),
                field: e.field,
                //meta: e.field,
                message: e.message,
                record: record,
                severity: 'ERROR',
                errorValue: record.get(e.field),
                fromServer: true
            }

            var msg = e.message.split(': ');
            if(msg.length>1){
                newError.severity = msg.shift();
                newError.message = msg.join('');
            }

            record.errors.push(newError);
        }, this);

        //re-run client-side validation.
        this.validateRecord(this, record, null, {fireEvent: false, noServerValidation: true});
    },

    //the following 2 methods are overriden because the old approach causes uncommitted client-side records to get destroyed
    deleteRecords : function(records) {
        if (!this.updatable)
            throw "this LABKEY.ext.Store is not updatable!";

        if(!records || records.length == 0)
            return;

        var deleteRowsKeys = [];
        var key;
        for(var idx = 0; idx < records.length; ++idx)
        {
            //server delete not required for phantom records
            if(records[idx].phantom){
                this.remove(records[idx]);
                delete records[idx];
            }
            else {
                key = {};
                key[this.idName] = records[idx].id;
                deleteRowsKeys[idx] = key;
            }
        }

        if(deleteRowsKeys.length){
            //send the delete
            LABKEY.Query.deleteRows({
                schemaName: this.schemaName,
                queryName: this.queryName,
                containerPath: this.containerPath,
                rowDataArray: deleteRowsKeys,
                scope: this,
                successCallback: this.getDeleteSuccessHandler(records),
                action: "deleteRows" //hack for Query.js bug
            });
        }
        else {
            //NOTE: should it really count as commitcomplete since we never hit the server?
            this.fireEvent("commitcomplete");
        }
    },

    getDeleteSuccessHandler : function(records) {
        var store = this;
        return function(results) {
            store.fireEvent("commitcomplete");
            this.remove(records);
            Ext.each(records, function(rec){
                delete rec;
            }, this);
        };
    }

});

Ext.reg('ehr-store', EHR.ext.AdvancedStore);

