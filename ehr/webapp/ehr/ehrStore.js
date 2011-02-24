/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

Ext.namespace("EHR", "EHR.ext");

LABKEY.requiresScript("/ehr/utilities.js");
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
 * @param {Boolean} valid The validation status of the store
 */

EHR.ext.AdvancedStore = Ext.extend(LABKEY.ext.Store, {
    constructor: function(config){
        Ext.apply(this, {
            pruneModifiedRecords: true
        });


        EHR.ext.AdvancedStore.superclass.constructor.apply(this, arguments);

        this.addEvents('beforemetachange', 'validation', 'commitvalidationfailure');
        this.proxy.on("load", this.onProxyLoad, this);

        if(config.maxRows !== undefined){
            this.baseParams['query.maxRows'] = config.maxRows;
        }

        if(this.monitorValid)
            this.initMonitorValid();

//        this.on('beforeload', function(){
//            console.log('beforeload: '+this.storeId)
//        }, this)
//        this.on('load', function(){
//            console.log('load: '+this.storeId)
//        }, this)
    },

    initMonitorValid: function(){
        this.on('update', this.validateRecord, this);
        this.on('add', this.validateRecords, this);
        this.on('load', this.validateRecords, this);
        this.on('remove', this.onRemoveValidation, this);

        this.validateRecords(this);
    },

    stopMonitorValid: function(){
        this.un('update', this.validateRecord, this);
        this.un('add', this.validateRecords, this);
        this.un('load', this.validateRecords, this);
        this.on('remove', this.onRemoveValidation, this);
    },

    onRemoveValidation: function(store, recs){
        //validate all remaining records
        this.validateRecords(store);
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
                    EHR.UTILITIES.rApply(f, this.metadata['fieldDefaults']);
                }

                //allow more complex metadata, per field
                if(this.metadata[f.name]){
                    EHR.UTILITIES.rApply(f, this.metadata[f.name]);
                }
            }
        }, this);

        if(this.colModel){
            var colModel = this.reader.jsonData.columnModel;
            Ext.each(colModel, function(col){
                if(this.colModel[col.dataIndex]){
                    EHR.UTILITIES.rApply(col, this.colModel[col.dataIndex]);
                }
            }, this);
        }

        if(false===this.fireEvent('beforemetachange', this, meta))
            return;

    for(var i in meta.fields){
        if(meta.fields[i].lookup && meta.fields[i].lookup.queryName == 'snomed' && meta.fields[i].lookups!==false && !meta.fields[i].xtype){
            console.log('lookup to snomed: '+this.storeId+'/'+meta.fields[i].name)
            meta.fields[i].lookups = false;
        }
    }

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
        return records
    },

    addRecord: function(r, idx){
        if(undefined === idx)
            idx = this.getCount();

        r = this.newRecord(r);
        this.insert(idx, r);
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

    validateRecords: function(store, recs, fireEvent){
        if(recs)
            Ext.each(recs, function(r){
                var storeErrors = this.validateRecord(this, r, false);
            }, this);
        else
            this.each(function(r){
                var storeErrors = this.validateRecord(this, r, false);
            }, this);

        var errors = [];
        this.each(function(r){
            if(r.errors && r.errors.length)
                errors = errors.concat(r.errors);
        }, this);

        if(fireEvent !== false){
            this.errors = errors;
            this.fireEvent('validation', this, errors);
        }

        return errors;
    },

    validateRecord: function(store, r, fireEvent){
        r.errors = r.errors || [];

        //remove other client-side errors
        for(var i = r.errors.length-1; i >= 0; i--){
            if(!r.errors[i].fromServer)
                r.errors.splice(i, 1);
        };

        r.fields.each(function(f) {
            //NOTE: we use LABKEY's nullable here.  This allows fields to be set to 'allowBlank: false'
            //which gives client-side errors, but allows form submission
            //if the field is not userEditable, it will be set server-side
            if(f.userEditable!==false && Ext.isEmpty(r.data[f.name])){
                if(f.nullable === false || f.allowBlank === false){
                    r.errors.push({
                        field: f.name,
                        message: 'Field Is Required',
                        record: r,
                        //meta: f,
                        severity: (f.nullable === false ? 'ERROR' : 'WARN'),
                        fromServer: false
                    });
                }
            }
        },store);

        //this is designed such that validateRecords() can call validateRecord() multiple times without events firing
        if(fireEvent!==false){
            this.errors = [];
            this.each(function(r){
                if(r.errors && r.errors.length)
                    this.errors = this.errors.concat(r.errors);
            }, this);
            this.fireEvent('validation', this, this.errors);
        }

        return r.errors;
    },

    validateRecordOnServer: function(record){
        r.serverValidationInProgress = true;
        var commands = this.getChanges([record]);

        if (!commands.length){
            console.log('No changes, nothing to do');
            return;
        }

        //add a flag per command to make sure this record fails
        record._validateOnly = true;
        record._validateStart = new Date();
        Ext.each(commands, function(c){
            console.log('need to add context flag');
            console.log(c);
        }, this);

        Ext.Ajax.request({
            url : LABKEY.ActionURL.buildURL("query", "saveRows", this.containerPath),
            method : 'POST',
            success: function(){
                console.log('this should not happen.  something went very wrong');
            },
            //this is actually the 'success'
            failure: this.getOnCommitFailure([record]),
            scope: this,
            jsonData : {
                containerPath: this.containerPath,
                commands: commands
            },
            headers : {
                'Content-Type' : 'application/json'
            }
        });
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
            console.log('No changes, nothing to do');
            return;
        }

        Ext.Ajax.request({
            url : LABKEY.ActionURL.buildURL("query", "saveRows", this.containerPath),
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
    },

    //NOTE: overridden support different processing of exceptions and validation errors
    getOnCommitFailure : function(records) {
        return function(response, options) {

            for(var idx = 0; idx < records.length; ++idx)
                delete records[idx].saveOperationInProgress;

            var json = this.getJson(response);

            //handle validation script errors and exceptions differently
            if(json.errors && json.errors.length){
                this.handleValidationErrors(records, json);
            }
            else {
                if(false !== this.fireEvent("commitexception", message)){
                    var message = (json && json.exception) ? json.exception : response.statusText;
                    Ext.Msg.alert("Error During Save. Could not save changes due to the following error:\n" + message);
                }
            }
        };
    },

    handleValidationErrors: function(records, serverError){
        if(serverError.rowNumber!==undefined)
            serverError = {errors: [serverError], exception: serverError.exception};

        Ext.each(serverError.errors, function(error){
            var record = records[error.rowNumber];
            record.store.handleError(record, error);
        }, this);
    },

    handleValidationError: function(record, serverError){
        //remove old errors
        record.errors = [];

        //run client-side validation first
        this.validateRecord(this, record, false);

        Ext.each(serverError.errors, function(e){
            record.errors.push({
                field: e.field.name,
                //meta: e.field,
                message: e.message,
                record: record,
                severity: (e.message.match(/^WARNING:/) ? 'WARN' : 'ERROR'),
                fromServer: true
            });
        }, this);

        if(!record._validateOnly){
            Ext.Msg.alert("Error During Save", "Could not save changes due to validation errors. \n" );
        }

        record.store.fireEvent('validation', this, record.errors);
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
console.log(this.getCount());
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

