/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
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

editorConfig = {}
formEditorConfig = {}
gridEditorConfig = {}
compare to the existing 'ext' param.  they will be applied to the form or grid editors respectively

qtipRenderer = function()


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

        //for multiline fields:
        if(editor.editable && meta.inputType == 'textarea'){
            editor = new LABKEY.ext.LongTextField({
                columnName: editor.dataIndex
            });
        }

        //now we allow overrides of default behavior, in order of precedence
        if(meta.editorConfig)
            EHR.utils.rApply(editor, meta.editorConfig);
        if(meta.gridEditorConfig)
            EHR.utils.rApply(editor, meta.gridEditorConfig);
        if(config)
            EHR.utils.rApply(editor, config);

        return editor;
    },

    getFormEditorConfig: function(meta, config){
        var editor = EHR.ext.metaHelper.getDefaultEditorConfig(meta);

        //now we allow overrides of default behavior, in order of precedence
        if(meta.editorConfig)
            EHR.utils.rApply(editor, meta.editorConfig);
        if(meta.formEditorConfig)
            EHR.utils.rApply(editor, meta.formEditorConfig);
        if(config)
            EHR.utils.rApply(editor, config);

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
            disabled: meta.editable===false,
            name: meta.name,
            dataIndex: meta.dataIndex || meta.name,
            value: meta.value || meta.defaultValue,
            helpPopup: ['Type: ' + meta.friendlyType],
            width: meta.width,
            height: meta.height
        };

        if(field.description)
            field.helpPopup.push('Description: '+meta.description);

        field.helpPopup = field.helpPopup.join('<br>');

        if (meta.hidden)
        {
            field.xtype = 'hidden';
        }
        else if (meta.lookup && false !== meta.lookups)
        {
            var l = meta.lookup;

            if (Ext.isObject(meta.store) && meta.store.events)
                field.store = meta.store;
            else
                field.store = EHR.ext.metaHelper.getLookupStoreConfig(meta);

            if (field.store && meta.lazyCreateStore === false)
                field.store = EHR.ext.metaHelper.getLookupStore(field);

            Ext.apply(field, {
                //this purpose of this is to allow other editors like multiselect, checkboxGroup, etc.
                xtype: (meta.xtype || 'combo'),
                forceSelection: true,
                typeAhead: true,
                mode: 'local',
                hiddenName: meta.name,
                hiddenId : Ext.id(),
                triggerAction: 'all',
                lazyInit: false,
                //NOTE: perhaps we do translation of the following names in store's translateMeta() method
                displayField: l.displayColumn,
                valueField: l.keyColumn,
                //NOTE: supported for non-combo components
                initialValue: field.value,
                showValueInList: meta.showValueInList,
                listClass: 'labkey-grid-editor',
                //TODO: it would be better to put this in LABKEY.ext.Combo, so this tpl doesnt conflict with non-combo editors
                tpl: function(){var tpl = new Ext.XTemplate(
                    '<tpl for=".">' +
                    '<div class="x-combo-list-item">{[values["' + l.keyColumn + '"]!==null ? values["' + l.displayColumn + '"] : "'+ (meta.lookupNullCaption ? meta.lookupNullCaption : '[none]') +'"]}' +
                    //allow a flag to display both display and value fields
                    '<tpl if="'+meta.showValueInList+'">{[values["' + l.keyColumn + '"] ? " ("+values["' + l.keyColumn + '"]+")" : ""]}</tpl>'+
                    '&nbsp;</div></tpl>'
                    );return tpl.compile()}() //FIX: 5860
            });
        }
        else
        {
            switch (meta.jsonType)
            {
                case "boolean":
                    field.xtype = meta.xtype || 'checkbox';
                    break;
                case "int":
                    field.xtype = meta.xtype || 'numberfield';
                    field.allowDecimals = false;
                    break;
                case "float":
                    field.xtype = meta.xtype || 'numberfield';
                    field.allowDecimals = true;
                    break;
                //TODO: account for datetime vs date?
                case "date":
                    field.xtype = meta.xtype || 'datefield';
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
                        field.xtype = meta.xtype || 'textarea';
                        field.width = meta.width || 500;
                        field.height = meta.height || 60;
                        if (!this._textMeasure)
                        {
                            this._textMeasure = {};
                            var ta = Ext.DomHelper.append(document.body,{tag:'textarea', rows:10, cols:80, id:'_hiddenTextArea', style:{display:'none'}});
                            this._textMeasure.height = Math.ceil(Ext.util.TextMetrics.measure(ta,"GgYyJjZ==").height * 1.2);
                            this._textMeasure.width  = Math.ceil(Ext.util.TextMetrics.measure(ta,"ABCXYZ").width / 6.0);
                        }
                        if (meta.rows && !meta.height)
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
                        if (meta.cols && !meta.width)
                        {
                            var textWidth = this._textMeasure.width * meta.cols;
                            if (textWidth)
                                field.width = textWidth;
                        }

                    }
                    else
                        field.xtype = meta.xtype || 'textfield';
                    break;
                default:
            }
        }

        return field;
    },

    getLookupStore: LABKEY.ext.FormHelper.getLookupStore,
    getLookupStoreId: LABKEY.ext.FormHelper.getLookupStoreId,
    getLookupStoreConfig : function(c)
    {
        // UNDONE: avoid self-joins
        // UNDONE: core.UsersData
        // UNDONE: container column
        var l = c.lookup;
        // normalize lookup
        l.queryName = l.queryName || l.table;
        l.schemaName = l.schemaName || l.schema;

        if (l.schemaName == 'core' && l.queryName =='UsersData')
            l.queryName = 'Users';

        var config = {
            xtype: "labkey-store",
            storeId: LABKEY.ext.FormHelper.getLookupStoreId(c),
            schemaName: l.schemaName,
            queryName: l.queryName,
            containerPath: l.container || c.containerPath || LABKEY.container.path,
            autoLoad: true
        };

        if (l.viewName)
            config.viewName = l.viewName;

        if (l.columns)
            config.columns = l.columns;
        else
        {
            var columns = [];
            if (l.keyColumn)
                columns.push(l.keyColumn);
            if (l.displayColumn && l.displayColumn != l.keyColumn)
                columns.push(l.displayColumn);
            if (columns.length == 0)
                columns = ['*'];
            config.columns = columns;
        }

        if (l.sort)
            config.sort = l.sort;
        else if (l.sort !== false)
            config.sort = l.displayColumn;

        if (!c.required && c.includeNullRecord !== false)
        {
            if(c.lookupNullCaption===undefined && l.keyColumn==l.displayColumn)
                c.lookupNullCaption = '';

            config.nullRecord = c.nullRecord || {
                displayColumn: l.displayColumn,
                nullCaption: (l.displayColumn==l.keyColumn ? null : (c.lookupNullCaption!==undefined ? c.lookupNullCaption : '[none]'))
            };
        }

        return config;
    },

    setLongTextRenderer: function(col, meta){
        if(col.multiline || (undefined === col.multiline && col.scale > 255 && meta.jsonType === "string"))
        {
            col.renderer = function(data, metadata, record, rowIndex, colIndex, store)
            {
                //set quick-tip attributes and let Ext QuickTips do the work
                metadata.attr = "ext:qtip=\"" + Ext.util.Format.htmlEncode(data || '') + "\"";
                return data;
            };
        }
    },

    getColumnModelConfig: function(store, config){
        config = config || {};

        var columns = store.reader.jsonData.columnModel;
        var cols = new Array();

        Ext.each(columns, function(col, idx){
            cols.push(EHR.ext.metaHelper.getColumnConfig(store, col, config));
        }, this);

        return cols;
    },

    getColumnConfig: function(store, col, config){
        var meta = store.findFieldMeta(col.dataIndex);
        col.customized = true;

        //this.updatable can override col.editable
        col.editable = config.editable && col.editable && meta.userEditable;

        if((meta.hidden || meta.shownInGrid===false) && !meta.shownInGrid){
            col.hidden = true;
        }

        switch(meta.jsonType){
            case "boolean":
                if(col.editable){
                    col.xtype = 'booleancolumn';
                    //if column type is boolean, substitute an Ext.grid.CheckColumn
//                        if(col.editable)
//                            col.init(this);
//                        col.editable = false; //check columns apply edits immediately, so we don't want to go into edit mode
                    //NOTE: The original EditorGrid defines it's own Ext.grid.CheckColumn
                    //Ext 3.1 has a booleancolumn class.  we just use this instead
                }
                break;
            case "int":
                col.xtype = 'numbercolumn';
                col.format = '0';
                break;
            case "float":
                col.xtype = 'numbercolumn';
                break;
            case "date":
                col.xtype = 'datecolumn';
                col.format = meta.format || Date.patterns.ISO8601Long;
        }

        //will use custom renderer
        if(meta.lookup && meta.lookups!==false)
            delete col.xtype;

        if(col.editable && !col.editor)
            col.editor = EHR.ext.metaHelper.getGridEditorConfig(meta);

        if(!col.renderer)
            col.renderer = EHR.ext.metaHelper.getDefaultRenderer(col, meta);

        //HTML-encode the column header
        col.header = Ext.util.Format.htmlEncode(meta.header || col.header);

        if(meta.ignoreColWidths)
            delete col.width;

        if(meta.colModel) {
            EHR.utils.rApply(col, meta.colModel);
        }

        //allow override of defaults
        if(config && config[col.dataIndex])
            EHR.utils.rApply(col, config[col.dataIndex]);

        return col;

    },

    getDefaultRenderer : function(col, meta) {
        return function(data, cellMetaData, record, rowIndex, colIndex, store)
        {
            EHR.ext.metaHelper.buildQtip(data, cellMetaData, record, rowIndex, colIndex, store, col, meta);

            //NOTE: unsure what this is trying to do.  record.json might refer to record.data???
            if(record.json && record.json[meta.name] && record.json[meta.name].displayValue)
                return record.json[meta.name].displayValue;

            //NOTE: this is substantially changed over FormHelper
            if(meta.lookup && meta.lookups!==false){
                data = EHR.ext.metaHelper.lookupRenderer(meta, data);
            }

            if(null === data || undefined === data || data.toString().length == 0)
                return data;

            //format data into a string
            var displayValue;
            switch (meta.type)
            {
                case "date":
                    var date = new Date(data);
                    var format = meta.format;
                    if(!format){
                        if (date.getHours() == 0 && date.getMinutes() == 0 && date.getSeconds() == 0)
                            format = "Y-m-d";
                        else
                            format = "Y-m-d H:i:s";
                    }
                    displayValue = date.format(format);
                    break;
                case "int":
                case "string":
                case "boolean":
                case "float":
                default:
                    displayValue = data.toString();
            }

            //if meta.file is true, add an <img> for the file icon
            if(meta.file)
            {
                displayValue = "<img src=\"" + LABKEY.Utils.getFileIconUrl(data) + "\" alt=\"icon\" title=\"Click to download file\"/>&nbsp;" + displayValue;
                //since the icons are 16x16, cut the default padding down to just 1px
                cellMetaData.attr = "style=\"padding: 1px 1px 1px 1px\"";
            }

            //wrap in <a> if url is present in the record's original JSON
            if(col.showLink !== false && record.json && record.json[meta.name] && record.json[meta.name].url)
                return "<a href=\"" + record.json[meta.name].url + "\">" + displayValue + "</a>";
            else
                return displayValue;
        };
    },

    buildQtip: function(data, cellMetaData, record, rowIndex, colIndex, store, col, meta){
        var qtip = [];
        if(record.json && record.json[meta.name] && record.json[meta.name].qcValue)
        {
            var qcValue = record.json[meta.name].qcValue;

            //get corresponding message from qcInfo section of JSON and set up a qtip
            if(store.reader.jsonData.qcInfo && store.reader.jsonData.qcInfo[qcValue])
            {
                qtip.push(store.reader.jsonData.qcInfo[qcValue]);
                cellMetaData.css = "labkey-mv";
            }
            return qcValue;
        }

        if(record.errors && record.errors.length){
            Ext.each(record.errors, function(e){
                if(e.name==meta.name){
                    qtip.push((e.severity || 'ERROR') +': '+e.text);
                    cellMetaData.css += ' x-grid3-cell-invalid';
                }
            }, this);
        }

        if(meta.qtipRenderer)
            meta.qtipRenderer(qtip, data, cellMetaData, record, rowIndex, colIndex, store);

        if(qtip.length)
            cellMetaData.attr = "ext:qtip=\"" + Ext.util.Format.htmlEncode(qtip.join('<br>')) + "\"";
    },

    lookupRenderer : function(meta, data) {
        var lookupStore = EHR.ext.metaHelper.getLookupStore(meta);
        if(!lookupStore)
            return '';

        var lookupRecord = lookupStore.getById(data);
        if (lookupRecord)
            return lookupRecord.data[meta.lookup.displayColumn];
        else if (data)
            return "[" + data + "]";
        else
            return meta.lookupNullCaption || "[none]";
    }
};

//a shortcut for EHR.ext.metaHelper.getLookupStore that doesnt require as complex a config object
EHR.ext.simpleLookupStore = function(c)
{
    c.lookup = {
        containerPath: c.containerPath,
        schemaName: c.schemaName,
        queryName: c.queryName,
        viewName: c.viewName,
        sort: c.sort,
        displayColumn: c.displayColumn,
        keyColumn: c.keyColumn
    };

    return EHR.ext.metaHelper.getLookupStore(c);
}