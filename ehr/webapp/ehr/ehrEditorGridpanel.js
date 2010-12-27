/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

LABKEY.requiresScript("/ehr/utilities.js");

EHR.ext.EditorGridPanel = Ext.extend(LABKEY.ext.EditorGridPanel,
{
    initComponent: function(){
        
        var sm = this.sm || new Ext.grid.CheckboxSelectionModel();

        Ext.applyIf(this, {
            viewConfig: {
                forceFit: true,
//                autoFill : true,
                scrollOffset: 0
            },
            autoHeight: true,
            autoWidth: true,
//            plugins: ['autosizecolumns'],
            autoSave: false,
            deferRowRender : true,
            editable: true,
            stripeRows: true,
            enableHdMenu: false,
            tbar: [
                {
                    text: 'Add Record',
                    tooltip: 'Click to add a blank record',
                    id: 'add-record-button',
                    handler: this.onAddRecord,
                    scope: this
                },
                    "-"
                ,{
                    text: 'Delete Selected',
                    tooltip: 'Click to delete selected row(s)',
                    id: 'delete-records-button',
                    handler: this.onDeleteRecords,
                    scope: this
                }
            ]
        });

        EHR.ext.EditorGridPanel.superclass.initComponent.apply(this, arguments);

    }

    ,populateMetaMap : function() {
    }

    ,setupColumnModel : function() {
        var columns = this.getColumnModelConfig();

        //if a sel model has been set, and if it needs to be added as a column,
        //add it to the front of the list.
        //CheckBoxSelectionModel needs to be added to the column model for
        //the check boxes to show up.
        //(not sure why its constructor doesn't do this automatically).
        if(this.getSelectionModel() && this.getSelectionModel().renderer)
            columns = [this.getSelectionModel()].concat(columns);

        //register for the rowdeselect event if the selmodel supports events
        //and if autoSave is on
        if(this.getSelectionModel().on && this.autoSave)
            this.getSelectionModel().on("rowselect", this.onRowSelect, this);

        //add custom renderers for multiline/long-text columns
        this.setLongTextRenderers(columns);

        //fire the "columnmodelcustomize" event to allow clients
        //to modify our default configuration of the column model
//NOTE: I dont think this will be permissible b/c it's a public API,
// but I would suggest changing the arguments on this event
// might make more sense to pass 'this' and 'columns'.  can use getColumnById() method
        this.fireEvent("columnmodelcustomize", columns);

        //reset the column model
        this.reconfigure(this.store, new Ext.grid.ColumnModel(columns));
    },
    getColumnById: function(colName){
        return this.getColumnModel().getColumnById(colName);
    },
    getColumnModelConfig: function(config){
        var columns = this.store.reader.jsonData.columnModel;
        var cols = new Array();
        var meta;

        Ext.each(columns, function(col, idx){
            meta = this.store.findFieldMeta(col.dataIndex);

            //this.updatable can override col.editable
            col.editable = this.editable && col.editable && meta.userEditable;

            if(meta.hidden || meta.shownInGrid===false)
                col.hidden = true;

            //if column type is boolean, substitute an Ext.grid.CheckColumn
            switch(meta.jsonType){
                case "boolean":
                    if(col.editable){
                        col.xtype = 'booleancolumn';
                        //NOTE: I don't understand why this was included
//                        if(col.editable)
//                            col.init(this);
//                        col.editable = false; //check columns apply edits immediately, so we don't want to go into edit mode
                    }
                    break;
                case "int":
                case "float":
                    col.xtype = 'numbercolumn';
                    break;
                case "date":
                    col.xtype = 'datecolumn';
                    col.format = meta.format || Date.patterns.ISO8601Long;
            }

            if(meta.colWidth)
                col.width = meta.colWidth;

            if(col.editable && !col.editor)
                col.editor = EHR.ext.metaHelper.getGridEditorConfig(meta);

            if(!col.renderer)
                col.renderer = this.getDefaultRenderer(col, meta);

            //remember the first editable column (used during add record)
            //TODO: check how editorGridpanel uses this
            if(!this.firstEditableColumn && col.editable)
                this.firstEditableColumn = idx;

            //HTML-encode the column header
            if(col.header)
                col.header = Ext.util.Format.htmlEncode(col.header);

            //allow override of defaults
            if(config && config[col.dataIndex])
                EHR.UTILITIES.rApply(col, config[col.dataIndex]);

            cols.push(col)

        }, this);

        return cols;
    },

    setLongTextRenderers : function(columns) {
        var col;
        for(var idx = 0; idx < columns.length; ++idx)
        {
            col = columns[idx];
            if(col.multiline || (undefined === col.multiline && col.scale > 255 && this.store.findFieldMeta(col.dataIndex).jsonType === "string"))
            {
                col.renderer = function(data, metadata, record, rowIndex, colIndex, store)
                {
                    //set quick-tip attributes and let Ext QuickTips do the work
                    metadata.attr = "ext:qtip=\"" + Ext.util.Format.htmlEncode(data || '') + "\"";
                    return data;
                };

                if(col.editable)
                    col.editor = new LABKEY.ext.LongTextField({
                        columnName: col.dataIndex
                    });
            }
        }
    }


});
Ext.reg('ehr-editorgrid', EHR.ext.EditorGridPanel);




//Ext.ns('Ext.ux.grid');
//(function () {
//    var cursorRe = /^(?:col|e|w)-resize$/;
//    Ext.ux.grid.AutoSizeColumns = Ext.extend(Object, {
//        cellPadding: 8,
//        constructor: function (config) {
//            Ext.apply(this, config);
//        },
//        init: function (grid) {
//            var view = grid.getView();
//            view.onHeaderClick = view.onHeaderClick.createInterceptor(this.onHeaderClick);
//            grid.on('headerdblclick', this.onHeaderDblClick.createDelegate(view, [this.cellPadding], 3));
//        },
//        onHeaderClick: function (grid, colIndex) {
//            var el = this.getHeaderCell(colIndex);
//            if (cursorRe.test(el.style.cursor)) {
//                return false;
//            }
//        },
//        onHeaderDblClick: function (grid, colIndex, e, cellPadding) {
//            var el = this.getHeaderCell(colIndex), width, rowIndex, count;
//            if (!cursorRe.test(el.style.cursor)) {
//                return;
//            }
//            if (e.getXY()[0] - Ext.lib.Dom.getXY(el)[0] <= 5) {
//                colIndex--;
//                el = this.getHeaderCell(colIndex);
//            }
//            if (this.cm.isFixed(colIndex) || this.cm.isHidden(colIndex)) {
//                return;
//            }
//            el = el.firstChild;
//            el.style.width = '0px';
//            width = el.scrollWidth;
//            el.style.width = 'auto';
//            for (rowIndex = 0, count = this.ds.getCount(); rowIndex < count; rowIndex++) {
//                el = this.getCell(rowIndex, colIndex).firstChild;
//                el.style.width = '0px';
//                width = Math.max(width, el.scrollWidth);
//                el.style.width = 'auto';
//            }
//            this.onColumnSplitterMoved(colIndex, width + cellPadding);
//        }
//    });
//})();
//Ext.preg('autosizecolumns', Ext.ux.grid.AutoSizeColumns);


