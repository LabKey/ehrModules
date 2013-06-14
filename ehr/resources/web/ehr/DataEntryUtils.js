/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
LABKEY.ExtAdapter.ns('EHR.DataEntryUtils');

EHR.DataEntryUtils = new function(){


    return {
        getFormEditorConfig: function(columnInfo){
            var cfg = LABKEY.ext.Ext4Helper.getFormEditorConfig(columnInfo);

            if (cfg.xtype == 'numberfield'){
                cfg.hideTrigger = true;
            }

            return cfg;
        },

        getColumnConfigFromMetadata: function(meta, grid){
            var col = {};
            col.dataIndex = meta.dataIndex || meta.name;
            col.header = meta.header || meta.caption || meta.label || meta.name;

            col.customized = true;

            col.hidden = meta.hidden;
            col.format = meta.extFormat;

            //this.updatable can override col.editable
            col.editable = meta.userEditable;

            if(col.editable && !col.editor)
                col.editor = LABKEY.ext.Ext4Helper.getGridEditorConfig(meta);

            col.renderer = LABKEY.ext.Ext4Helper.getDefaultRenderer(col, meta, grid);

            //HTML-encode the column header
            col.text = Ext4.util.Format.htmlEncode(meta.label || meta.name || col.header);

            if(meta.ignoreColWidths)
                delete col.width;

            //allow override of defaults
            if(meta.columnConfig){
                col = Ext4.Object.merge(col, meta.columnConfig);
            }

            return col;
        }
    }
};