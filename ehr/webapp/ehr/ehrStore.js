/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

Ext.namespace("EHR", "EHR.ext");

LABKEY.requiresScript("/ehr/utilities.js");

/**
 * @memberOf LABKEY.ext.Store#
 * @name beforemetachange
 * @event
 * @description Fires before the HTTP proxy's load method's callback is called.
 * @param {Object} this The store object
 * @param {Object} meta The metadata object that will be applied to the store
 */

EHR.ext.AdvancedStore = Ext.extend(LABKEY.ext.Store, {
    constructor: function(config){
        Ext.apply(this, EHR.ext.metaHelper);

        EHR.ext.AdvancedStore.superclass.constructor.apply(this, arguments);

        this.addEvents('beforemetachange');
        this.proxy.on("load", this.onProxyLoad, this);

        this.invalidRecords = new Ext.util.MixedCollection(false, function(rec){return rec.id});
        this.addEvents('valid', 'invalid');

        this.monitorValid = true;
        if(this.monitorValid){
            this.on('update', this.validateRecord, this);

            this.on('remove', function(store, r){
                if(this.invalidRecords.contains(r)){
                    this.invalidRecords.remove(r);
                }
            }, this);

            this.on('add', function(store, recs){
                Ext.each(recs, function(r){
                    store.validateRecord(store, r);
                }, this);
            }, this);

            this.on('load', function(store, recs){
                Ext.each(recs, function(r){
                    store.validateRecord(store, r);
                }, this);
            }, this);
        }

        this.invalidRecords.on('add', this.onInvalidRecordsChange, this);
        this.invalidRecords.on('remove', this.onInvalidRecordsChange, this);

    },

    onInvalidRecordsChange: function(){
        if(!this.invalidRecords.getCount()){
            this.fireEvent('valid', this, this);
        }
        else
            this.fireEvent('invalid', this, this);
    },

    onProxyLoad: function(proxy, response, options){
        if(this.metadata)
        {
            var meta = this.reader.meta;
            Ext.each(meta.fields, function(f){
                //provide a standardized translation
                this.translateMetaData(f);

                //allow defaults for all fields
                //NOTE: perhaps move to this.fieldDefaults?
                if(this.metadata['fieldDefaults']){
                    EHR.UTILITIES.rApply(f, this.metadata['fieldDefaults']);
                }
                //allow more complex metadata, per field
                if(this.metadata[f.name]){
                    EHR.UTILITIES.rApply(f, this.metadata[f.name]);
                }

                //maybe fire an event like colmodelcustomize?  perhaps excessive

            }, this);

            if(this.colModel){
                var colModel = this.reader.jsonData.columnModel;
                Ext.each(colModel, function(col){
                    if(this.colModel[col.dataIndex]){
                        EHR.UTILITIES.rApply(col, this.colModel[col.dataIndex]);
                    }
                }, this);
            }

            this.fireEvent('beforemetachange', this, meta);

            //TODO: do we need both?
            this.reader.onMetaChange(meta);
            this.onMetaChange(meta);

//            this.recordType = this.recordType.createInterceptor(function(data){
//                data = data || {};
//                this.fields.each(function(f) {
//                    data[f.name] = data[f.name] || f.defaultValue || null;
//                    if(Ext.isFunction(f.setInitialValue)){
//                        data[f.name] = f.setInitialValue.call(this, f.defaultValue, data, f);
//                    }
//                }, this);
//            }, this);
        }
    },

    translateMetaData: function(field){
        var h = Ext.util.Format.htmlEncode;
        var lc = function(s){return !s?s:Ext.util.Format.lowercase(s);};

        //field.type = lc(field.jsonType) || lc(field.type) || lc(field.typeName) || 'string';
        field.fieldLabel = h(field.label) || h(field.caption) || h(field.header) || h(field.name);
        field.dataIndex = field.dataIndex || field.name;
        field.editable = field.userEditable && !field.readOnly;

        if(field.lookup){

        }

    },

    //TODO: would be better to just override this.recordType
    newRecord: function(data){
        var rec;
        if(data instanceof Ext.data.Record)
            rec = data;
        else
            rec = new this.recordType(data);

        this.fields.each(function(f) {
            rec.data[f.name] = rec.data[f.name] || f.defaultValue || null;
            if(Ext.isFunction(f.setInitialValue)){
                rec.data[f.name] = f.setInitialValue.call(this, f.defaultValue, rec, f);
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

    validateRecord: function(store, r){
        var errors = {};
        r.fields.each(function(f) {
            //NOTE: we use LABKEY's nullable here.  This allows fields to be set to 'allowBlank: false'
            //which gives client-side errors, but allows form submission
            if(f.nullable === false && Ext.isEmpty(r.data[f.name]))
                errors[f.name] = 'Field Is Required';
        },store);

        r.errors = errors;

        if(!EHR.UTILITIES.isEmptyObj(errors)){
            if(!store.invalidRecords.contains(r)){
                store.invalidRecords.add(r);
            }
        }
        else {
            if(store.invalidRecords.contains(r)){
                store.invalidRecords.remove(r);
            }
        }
    },

    isValid: function(){
        if(!this.monitorValid){
            this.each(function(rec){
                this.validateRecord(this, rec);
            }, this);
        }
        return this.invalidRecords.getCount()==0;
    },

    getFormEditorConfig: function(fieldName, config){
        var meta = this.findFieldMeta(fieldName);
        return EHR.ext.metaHelper.getFormEditorConfig(meta, config);
    },

    getGridEditorConfig: function(fieldName, config){
        var meta = this.findFieldMeta(fieldName);
        return EHR.ext.metaHelper.getGridEditorConfig(meta, config);
    }



});

Ext.reg('ehr-store', EHR.ext.AdvancedStore);

/*
LABKEY metadata:  asterisk indicated is used in getDefaultEditorConfig
autoIncrement
caption *
description
excelFormat
format *
friendlyType
hidden *
importAliases
inputType *
jsonType *
keyField
lookup *
myEnabled
name *
nullable *
queryName *
readOnly
shownInDetailView
shownInInsertView
shownInUpdateView
tsvFormat
userEditable
versionField
*/

/*
Ext Params configured from lakey metadata and corresponding labkey param:
dataIndex -> name
editable -> userEditable && readOnly
editor -> getFormEditor()
header -> caption
renderer -> getDefaultRenderer()
tooltip -> description?
xtype -> set using getDefaultEditorConfig()

*/

/*

Suggested other params:

formEditorConfig = {}
gridEditorConfig = {}

compare to the existing 'ext' param.  they will be applied to the form or grid editors respectively

 */

EHR.ext.metaHelper = {
    getFormEditor: function(meta, config){
        var editorConfig = EHR.ext.metaHelper.getFormEditorConfig(meta, config);
        return Ext.ComponentMgr.create(editorConfig);
    },

    getGridEditor: function(meta, config){
        var editorConfig = EHR.ext.metaHelper.getGridEditorConfig(meta, config);
        return Ext.ComponentMgr.create(editorConfig);
    },

    getGridEditorConfig: function(meta, config){
        //this produces a generic editor
        var editor = EHR.ext.metaHelper.getDefaultEditorConfig(meta);

        //now we allow overrides of default behavior, in order of precedence
        if(meta.gridEditorConfig)
            EHR.UTILITIES.rApply(editor, meta.gridEditorConfig);
        if(config)
            EHR.UTILITIES.rApply(editor, config);

        return editor;
    },

    getFormEditorConfig: function(meta, config){
        var editor = EHR.ext.metaHelper.getDefaultEditorConfig(meta);

        //now we allow overrides of default behavior, in order of precedence
        if(meta.formEditorConfig)
            EHR.UTILITIES.rApply(editor, meta.formEditorConfig);
        if(config)
            EHR.UTILITIES.rApply(editor, config);

        return editor;
    },

    //this is designed to be called through either .getFormEditorConfig or .getGridEditorConfig
    getDefaultEditorConfig: function(meta){
        var h = Ext.util.Format.htmlEncode;
        var lc = function(s){return !s?s:Ext.util.Format.lowercase(s);};

        var field =
        {
            //added 'caption' for assay support
            fieldLabel: h(meta.label || meta.caption || meta.header || meta.name),
            originalConfig: meta,
            //we assume the store's translateMeta() will handle this
            allowBlank: meta.allowBlank,
            disabled: meta.editable===false
        };

        //used by LABKEY.ext.FormPanel
        if (meta.tooltip && !meta.helpPopup)
            field.helpPopup = { html: meta.tooltip };

        if (meta.hidden)
        {
            field.xtype = 'hidden';
        }
        else if (meta.lookup && false !== meta.lookups)
        {
            var l = meta.lookup;

            if (Ext.isObject(meta.store) && meta.store.events)
                field.store = meta.store;
            else if (field.store && meta.lazyCreateStore === false)
                field.store = LABKEY.ext.FormHelper.getLookupStoreConfig(meta);
            else
                field.store = LABKEY.ext.FormHelper.getLookupStore(meta);

            Ext.apply(field, {
                //this purpose of this is to allow other editors like multiselect, checkboxGroup, etc.
                xtype: (meta.xtype || 'combo'),
                forceSelection: true,
                typeAhead: false,
                hiddenName: meta.name,
                //NOTE: maybe just use Ext.id()?
                hiddenId : (new Ext.Component()).getId(),
                triggerAction: 'all',
                //NOTE: perhaps we do translation of the following names in store's translateMeta() method
                displayField: l.displayColumn,
                valueField: l.keyColumn,
                tpl : '<tpl for="."><div class="x-combo-list-item">{[values["' + l.displayColumn + '"]]}</div></tpl>', //FIX: 5860
                listClass: 'labkey-grid-editor'
            });
        }
        else
        {
            switch (meta.jsonType)
            {
                case "boolean":
                    field.xtype = 'checkbox';
                    break;
                case "int":
                    field.xtype = 'numberfield';
                    field.allowDecimals = false;
                    break;
                case "float":
                    field.xtype = 'numberfield';
                    field.allowDecimals = true;
                    break;
                case "date":
                    field.xtype = 'datefield';
                    field.format = meta.format || Date.patterns.ISO8601Long;
                    field.altFormats = Date.patterns.ISO8601Short +
                            'n/j/y g:i:s a|n/j/Y g:i:s a|n/j/y G:i:s|n/j/Y G:i:s|' +
                            'n-j-y g:i:s a|n-j-Y g:i:s a|n-j-y G:i:s|n-j-Y G:i:s|' +
                            'n/j/y g:i a|n/j/Y g:i a|n/j/y G:i|n/j/Y G:i|' +
                            'n-j-y g:i a|n-j-Y g:i a|n-j-y G:i|n-j-Y G:i|' +
                            'j-M-y g:i a|j-M-Y g:i a|j-M-y G:i|j-M-Y G:i|' +
                            'n/j/y|n/j/Y|' +
                            'n-j-y|n-j-Y|' +
                            'j-M-y|j-M-Y|' +
                            'Y-n-d H:i:s|Y-n-d|' +
                            'j M Y G:i:s O|' + // 10 Sep 2009 11:24:12 -0700
                            'j M Y H:i:s';     // 10 Sep 2009 01:24:12
                    break;
                case "string":
                    if (meta.inputType=='textarea')
                    {
                        field.xtype = 'textarea';
                        field.width = 500;
                        field.height = 60;
                        if (!this._textMeasure)
                        {
                            this._textMeasure = {};
                            var ta = Ext.DomHelper.append(document.body,{tag:'textarea', rows:10, cols:80, id:'_hiddenTextArea', style:{display:'none'}});
                            this._textMeasure.height = Math.ceil(Ext.util.TextMetrics.measure(ta,"GgYyJjZ==").height * 1.2);
                            this._textMeasure.width  = Math.ceil(Ext.util.TextMetrics.measure(ta,"ABCXYZ").width / 6.0);
                        }
                        if (meta.rows)
                        {
                            if (meta.rows == 1)
                                field.height = undefined;
                            else
                            {
                                // estimate at best!
                                var textHeight =  this._textMeasure.height * meta.rows;
                                if (textHeight)
                                    field.height = textHeight;
                            }
                        }
                        if (meta.cols)
                        {
                            var textWidth = this._textMeasure.width * meta.cols;
                            if (textWidth)
                                field.width = textWidth;
                        }

                    }
                    else
                        field.xtype = 'textfield';
                    break;
                default:

            }
        }

        return field;
    },

    getLookupStore: LABKEY.ext.FormHelper.getLookupStore,
    getLookupStoreId: LABKEY.ext.FormHelper.getLookupStoreId,
    getLookupStoreConfig: LABKEY.ext.FormHelper.getLookupStoreConfig

};