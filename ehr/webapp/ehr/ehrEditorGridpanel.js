/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


EHR.ext.EditorGridPanel = Ext.extend(LABKEY.ext.EditorGridPanel,
{
    initComponent: function(){
        
        var sm = new Ext.grid.CheckboxSelectionModel();
        Ext.apply(this, {
            addRecord:function() {
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
            }
            ,deleteRecords:function() {

            }
        });

        Ext.apply(this, {
            width: '100%',
//            viewConfig: {
//                forceFit: true,
//                autoFill : true,
//                scrollOffset: 0
//            },
            autoHeight: true,
            autoWidth: true,
            plugins: ['autosizecolumns'],
            autoSave: false,
            editable: true,
            stripeRows: true,
            enableHdMenu: false,
            listeners: {
                scope: this
                ,columnmodelcustomize: function(colModel, index){
                    Ext.each(colModel, function(c){
                        var meta = this.metaMap[c.dataIndex];
                        delete c.scale;
                        delete c.width;

                        if(!meta.shownInInsertView)//|| meta.parentField
                            c.hidden = true;
                    }, this);
                }
            },
            bodyCls: 'ehr-panel',
            tbar: [
                {
                    text: 'Add Record',
                    tooltip: 'Click to add a blank record',
                    id: 'add-record-button',
                    handler: this.onAddRecord, //this.addRecord,
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

        if(this.parent){
            this.parent.addEvents('animalvalid', 'animalinvalid');
            this.parent.relayEvents(this, ['animalvalid', 'animalinvalid']);    
            this.parent.store.addStore(this.store);
        }

        this.store.on('load', this.storeLoad, this);
    },
    storeLoad: function(){
        Ext.each(this.store.fields.items, function(c){
//            EHR.UTILITIES.rApply(c, {
//                fieldLabel: c.label,
//                queryName: this.queryName,
//                schemaName: this.schemaName,
//                ext: {
//                    name: this.queryName+'.'+c.name,
//                    fieldLabelTip: 'Type: '+c.type+'<br>'+c.name,
//                    dataIndex: c.name
//                }
//            });

            if(this.metadata && this.metadata[c.name])
                EHR.UTILITIES.rApply(c, this.metadata[c.name]);
            var x;
        }, this);
    },
//    onStoreLoad : function(store, records, options) {
//        this.store.un("load", this.onStoreLoad, this);
//
//        this.populateMetaMap();
//        this.setupColumnModel();
//    },
    populateMetaMap : function() {
        //the metaMap is a map from field name to meta data about the field
        //the meta data contains the following properties:
        // id, totalProperty, root, fields[]
        // fields[] is an array of objects with the following properties
        // name, type, lookup
        // lookup is a nested object with the following properties
        // schema, table, keyColumn, displayColumn
        this.metaMap = {};
        var fields = this.store.reader.jsonData.metaData.fields;
        for(var idx = 0; idx < fields.length; ++idx)
        {
            var field = fields[idx];
            delete field.scale;

            //allow additional metadata
            if(this.metadata && this.metadata[field.name])
                EHR.UTILITIES.rApply(field, this.metadata[field.name]);

            this.metaMap[field.name] = field;
        }
    }
//    getDefaultEditorConfig: LABKEY.ext.FormHelper.getFieldEditorConfig,
//    getDefaultEditor : function(col, meta) {
//        Ext.apply(col, meta);
//        console.log(col);
//        var s = LABKEY.ext.FormHelper.getFieldEditorConfig(col);
//        console.log(s);
//        return s;
//    }
});
Ext.reg('ehr-editorgrid', EHR.ext.EditorGridPanel);




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


