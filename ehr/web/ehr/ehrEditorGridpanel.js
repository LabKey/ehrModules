/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


EHR.ext.formGrid = Ext.extend(LABKEY.ext.EditorGridPanel,
{
    initComponent: function(){
        
        var sm = new Ext.grid.CheckboxSelectionModel();

        Ext.apply(this, {
            width: 'auto',
            viewConfig: {
                forceFit: true,
                autoFill: true,
//                autoExpandColumn: 'remark',
                frame: true
//                autoFill : true,
//                autoExpand : function(preventUpdate){
//                       var g = this.grid, cm = this.cm;
//                       if(g.autoExpandColumn){
//                            var tw = cm.getTotalWidth(false);
//                            var aw = this.grid.getGridEl().getWidth(true)-this.scrollOffset;
//                            if(tw != aw){
//                                var ci = cm.getIndexById(g.autoExpandColumn);
//                                var currentWidth = cm.getColumnWidth(ci);
//                                var cw = Math.min(Math.max(((aw-tw)+currentWidth), g.autoExpandMin), g.autoExpandMax);
//                                if(cw != currentWidth){
//                                    cm.setColumnWidth(ci, cw, true);
//                                    if(preventUpdate !== true){
//                                        this.updateColumnWidth(ci, cw);
//                                    }
//                                }
//                            }
//                        }
//                    }
            },
            autoHeight: true,
            autoWidth: true,
//            plugins: ['autosizecolumns'],
//            border: true,
//            bodyBorder: true,
            autoSave: true,
            editable: true,
            stripeRows: true,
            enableHdMenu: false,
            listeners: {
                scope: this
                ,columnmodelcustomize: function(colModel, index){
                    //apparently cannot do this prior to render
                    Ext.each(colModel, function(c){
                        delete c.width;
                    }, this);
                }
            },
            bodyCls: 'ehr-panel',
            tbar: [
                {
                    text: 'Add Record',
                    tooltip: 'Click to add a row',
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
            ,addRecord:function() {
                var store = this.store;
                if(store.recordType) {
                    var rec = new store.recordType({newRecord:true});
                    rec.fields.each(function(f) {
                        rec.data[f.name] = f.defaultValue || null;
                    });
                    rec.commit();
                    store.add(rec);
                    return rec;
                }
                return false;
            } // eo function addRecord
            // }}}
            // {{{
            ,onRowAction:function(grid, record, action, row, col) {
                switch(action) {
                    case 'icon-minus':
                        this.deleteRecord(record);
                    break;

                    case 'icon-edit-record':
                        this.recordForm.show(record, grid.getView().getCell(row, col));
                    break;
                }
            } // eo onRowAction
        });

        EHR.ext.formGrid.superclass.initComponent.apply(this, arguments);
    },
    getDefaultEditor : LABKEY.ext.FormHelper.getFieldEditorConfig
});
Ext.reg('ehr-formgrid', EHR.ext.formGrid);




Ext.ns('Ext.ux.grid');
(function () {
    var cursorRe = /^(?:col|e|w)-resize$/;
    Ext.ux.grid.AutoSizeColumns = Ext.extend(Object, {
        cellPadding: 8,
        constructor: function (config) {
            Ext.apply(this, config);
        },
        init: function (grid) {
            var view = grid.getView();
            view.onHeaderClick = view.onHeaderClick.createInterceptor(this.onHeaderClick);
            grid.on('headerdblclick', this.onHeaderDblClick.createDelegate(view, [this.cellPadding], 3));
        },
        onHeaderClick: function (grid, colIndex) {
            var el = this.getHeaderCell(colIndex);
            if (cursorRe.test(el.style.cursor)) {
                return false;
            }
        },
        onHeaderDblClick: function (grid, colIndex, e, cellPadding) {
            var el = this.getHeaderCell(colIndex), width, rowIndex, count;
            if (!cursorRe.test(el.style.cursor)) {
                return;
            }
            if (e.getXY()[0] - Ext.lib.Dom.getXY(el)[0] <= 5) {
                colIndex--;
                el = this.getHeaderCell(colIndex);
            }
            if (this.cm.isFixed(colIndex) || this.cm.isHidden(colIndex)) {
                return;
            }
            el = el.firstChild;
            el.style.width = '0px';
            width = el.scrollWidth;
            el.style.width = 'auto';
            for (rowIndex = 0, count = this.ds.getCount(); rowIndex < count; rowIndex++) {
                el = this.getCell(rowIndex, colIndex).firstChild;
                el.style.width = '0px';
                width = Math.max(width, el.scrollWidth);
                el.style.width = 'auto';
            }
            this.onColumnSplitterMoved(colIndex, width + cellPadding);
        }
    });
})();
Ext.preg('autosizecolumns', Ext.ux.grid.AutoSizeColumns);