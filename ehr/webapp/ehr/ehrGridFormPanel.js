/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

Ext.namespace('EHR.ext');

LABKEY.requiresScript("/ehr/ehrFormPanel.js");



EHR.ext.GridFormPanel = Ext.extend(Ext.Panel,
{
    initComponent: function()
    {
        this.storeConfig = this.storeConfig || {};
        this.store = this.store || new EHR.ext.AdvancedStore(Ext.applyIf(this.storeConfig, {
            //xtype: 'ehr-store',
            containerPath: this.containerPath,
            schemaName: this.schemaName,
            queryName: this.queryName,
            viewName: this.viewName,
            columns: this.columns || EHR.ext.FormColumns[this.queryName] || '',
            storeId: [this.schemaName,this.queryName,this.viewName].join('||'),
            filterArray: this.filterArray || [],
            metadata: this.metadata
            //autoLoad: true
        }));

        //set buttons
        var tbar = [];
        this.tbarBtns = this.tbarBtns || ['add', 'delete', 'apply_template', 'save_template', 'duplicate', 'bulk_edit'];
        for (var i=0;i<this.tbarBtns.length;i++){
            var btnCfg = this.gridBtns[this.tbarBtns[i]];
            btnCfg.scope = this;
            tbar.push(btnCfg);
            if(i != this.tbarBtns.length-1){
                tbar.push('-');
            }
        };

        if(this.showStatus){
            this.bbar = {
                xtype: 'statusbar',
                defaultText: 'Default text',
                text: 'No records',
                statusAlign: 'left',
                iconCls: 'x-status-valid'
            };
        }

        Ext.applyIf(this, {
            autoHeight: true
            ,autoWidth: true
            //,forceLayout: true
            ,layout: 'table'
            ,columns: 2
            ,style: 'margin-bottom: 15px;'
            ,tbar: tbar
            ,defaults: {
                border: false,
                bodyBorder: false
            }
            ,items: [{
                xtype: 'ehr-formpanel',
                cellCls: 'ehr-gridpanel-cell',
                width: 330,
                name: this.queryName,
                schemaName: this.schemaName,
                queryName: this.queryName,
                viewName: this.viewName,
                //forceLayout: true,
                bindConfig: {
                    disableUnlessBound: true,
                    bindOnChange: false,
                    showDeleteBtn: false
                },
                ref: 'theForm',
                metadata: this.metadata,
                store: this.store,
                importPanel: this.importPanel || this,
                border: false,
                bodyBorder: false,
                readOnly: this.readOnly,
                items: {xtype: 'displayfield', value: 'Loading...'}
            },{
                xtype: 'ehr-editorgrid',
                style: 'margin-top: 5px;margin-left:15px',
                //NOTE: this is done to make sure the grid aligns vertically
                //TODO: might be better to just set style on cell directly
                //style is: "vertical-align: top;"
                cellCls: 'ehr-gridpanel-cell',
                //cellStyle: 'vertical-align: top;',
                title: 'Records',
                editable: false, //this.editable!==false ? true : false,
                width: this.gridWidth || 700,
                maxHeight: 500,
                autoHeight: true,
                store: this.store,
                ref: 'theGrid',
                importPanel: this.importPanel || this,
                readOnly: this.readOnly,
                tbar: [],
                sm: new Ext.grid.RowSelectionModel({
                    //singleSelect: true,
                    listeners: {
                        scope: this,
                        rowselect: function(sm, row, rec)
                        {
                            //NOTE: this allows any changes to values of select menus to commit before bindRecord() runs
                            this.theForm.bindRecord.defer(200, this.theForm, [rec]);
                        },
                        selectionchange: function(sm)
                        {
                            var rec = sm.getSelected();
                            if (rec != this.theForm.boundRecord)
                            {
                                this.theForm.focusFirstField();
                            }
                        }
                    }
                })
            }]
        });

        EHR.ext.GridFormPanel.superclass.initComponent.call(this);

        if(this.showStatus){
            this.mon(this.theForm, 'recordchange', this.onRecordChange, this, {buffer: 100});
            this.mon(this.store, 'validation', this.onStoreValidate, this);
        }

        this.addEvents('beforesubmit');
    },

    onRecordChange: function(){
        if(!this.theForm.boundRecord)
            this.getBottomToolbar().setStatus({text: 'No Records'})
    },
    onStoreValidate: function(store, records){
        if(store.errors.getCount())
            this.getBottomToolbar().setStatus({text: 'ERRORS', iconCls: 'x-status-error'});
        else
            this.getBottomToolbar().setStatus({text: 'Section OK', iconCls: 'x-status-valid'});

        this.theForm.markInvalid();
    },

    gridBtns: {
        'add': {
            text: 'Add Record',
            xtype: 'button',
            tooltip: 'Click to add a blank record',
            name: 'add-record-button',
            handler: function ()
            {
                var store = this.theGrid.store;
                if (store.recordType)
                {
                    store.addRecord();
                    this.theGrid.getSelectionModel().selectLastRow();
                    this.theForm.focusFirstField();
                }
            }
        },
        'delete': {
            text: 'Delete Selected',
            xtype: 'button',
            tooltip: 'Click to delete selected row(s)',
            name: 'delete-records-button',
            handler: function()
            {
                if(!this.theGrid.getSelectionModel().getSelections().length){
                    Ext.Msg.alert('Error', 'No rows selected');
                    return;
                }

                Ext.MessageBox.confirm(
                    'Confirm',
                    'You are about to permanently delete these records.  It cannot be undone.  Are you sure you want to do this?',
                    function(val){
                        if(val=='yes'){
                            this.theGrid.stopEditing();
                            var recs = this.theGrid.getSelectionModel().getSelections();
                            this.theForm.unbindRecord();

                            this.store.deleteRecords(recs);
                        }
                    },
                    this);
            }
        },
        'next': {
                text: 'Select Next',
                xtype: 'button',
                tooltip: 'Click to move one record forward',
                name: 'select-next-button',
                handler: function()
                {
                    this.theGrid.getSelectionModel().selectNext();
                    this.theForm.focusFirstField();
                },
                scope: this
        },
        'previous': {
                text: 'Select Previous',
                xtype: 'button',
                tooltip: 'Click to move one record backward',
                name: 'select-previous-button',
                handler: function()
                {
                    this.theGrid.getSelectionModel().selectPrevious();
                    this.theForm.focusFirstField();
                },
                scope: this
        },
        'duplicate': {
            text: 'Duplicate Selected',
            xtype: 'button',
            tooltip: 'Duplicate Selected Record',
            name: 'duplicate-button',
            handler: function()
            {
                var records = this.theGrid.getSelectionModel().getSelections();
                if(!records || !records.length){
                    Ext.Msg.alert('Error', 'No rows selected');
                    return;
                }

                var theWindow = new Ext.Window({
                    closeAction:'hide',
                    title: 'Duplicate Records',
                    items: [{
//                        layout: 'form',
                        width: 350,
                        xtype: 'ehr-recordduplicator',
                        ref: 'recordduplicator',
                        targetStore: this.store,
                        records: records
                    }]
                });

                theWindow.show();
            }
        },
        'addbatch': {
                text: 'Add Batch',
                xtype: 'button',
                scope: this,
                tooltip: 'Click to add a group of animals',
                name: 'add-batch-button',
                handler: function()
                {
                    this.animalSelectorWin = new Ext.Window({
                        closeAction:'hide',
                        width: 350,
                        items: [{
                            xtype: 'ehr-animalselector',
                            ref: 'animalselector',
                            targetStore: this.store,
                            title: ''
                        }]
                    });

                    this.animalSelectorWin.show();
                }
            },
            'order_clinpath': {
                text: 'Order Multiple Tests',
                xtype: 'button',
                scope: this,
                tooltip: 'Order Multiple Tests',
                title: 'Order Multiple Tests',
                name: 'order_clinpath-button',
                handler: function()
                {
                    this.clinPath = new Ext.Window({
                        closeAction:'hide',
                        width: 350,
                        items: [{
                            xtype: 'ehr-clinpathorderpanel',
                            ref: 'theForm'
                        }]
                    });

                    this.clinPath.show();
                }
            },
            'apply_template': {
                text: 'Apply Template',
                xtype: 'button',
                scope: this,
                tooltip: 'Add records to this grid based on a saved template',
                title: 'Apply Template',
                name: 'apply-template-button',
                handler: function()
                {
                    var theWindow = new Ext.Window({
                        closeAction:'hide',
                        width: 350,
                        items: [{
                            xtype: 'ehr-applytemplatepanel',
                            formType: this.store.storeId,
                            ref: 'theForm'
                        }]
                    });

                    theWindow.show();
                }
            },
            'save_template': {
                text: 'Save As Template',
                xtype: 'button',
                scope: this,
                tooltip: 'Save selected records as a template',
                title: 'Save Template',
                name: 'save-template-button',
                handler: function()
                {
                    var theWindow = new Ext.Window({
                        closeAction:'hide',
                        width: 800,
                        minWidth: 300,
                        maxWidth: 800,
                        items: [{
                            xtype: 'ehr-savetemplatepanel',
                            importPanel: this,
                            grid: this.theGrid,
                            formType: this.store.storeId,
                            ref: 'theForm'
                        }]
                    });

                    theWindow.show();
                }
            },
            bulk_edit: {
                text: 'Bulk Edit',
                disabled: true,
                tooltip: 'Click this to change values on all checked rows in bulk',
                scope: this,
                handler : function(c){
                    var batchEditWin = new Ext.Window({
                        width: 280,
                        height: 130,
                        bodyStyle:'padding:5px',
                        closeAction:'hide',
                        scope: this,
                        plain: true,
                        keys: [
                            {
                                key: Ext.EventObject.ENTER,
                                handler: this.onEdit,
                                scope: this
                            }
                        ],
                        title: 'Batch Edit',
                        layout: 'form',
                        items: [{
                            emptyText:''
                            ,fieldLabel: 'Select Field'
                            ,ref: 'fieldName'
                            ,xtype: 'combo'
                            ,displayField:'name'
                            ,valueField: 'value'
                            ,typeAhead: true
                            ,triggerAction: 'all'
                            ,mode: 'local'
                            ,width: 150
                            ,editable: false
                            ,required: true
                            ,store: new Ext.data.ArrayStore({
                                fields: ['value', 'name'],
                                data: (function(){
                                    var values = [];
                                    this.store.fields.each(function(c){
                                        if(!c.hidden && c.editor)
                                            values.push([c.dataIndex, c.header])
                                    }, this);
                                    return values;
                                })()
                            })
                        },{
                            xtype: 'textfield',
                            ref: 'fieldVal',
                            fieldLabel: 'Enter Value'
                        }],
                        buttons: [{
                            text:'Submit',
                            disabled:false,
                            formBind: true,
                            ref: '../submit',
                            scope: this,
                            handler: onEdit
                        },{
                            text: 'Close',
                            ref: '../close',
                            scope: this,
                            handler: function(c){
                                batchEditWin.hide();
                            }
                        }]
                    });

                    batchEditWin.show();

                    function onEdit(){
                        batchEditWin.hide();
                        if(!batchEditWin.fieldName)
                            return;
                        var f = batchEditWin.fieldName.getValue();
                        var v = batchEditWin.fieldVal.getValue();
                        var s = this.getSelectionModel().getSelections();
                        if(!s.length){
                            Ext.Msg.alert('Error', 'No rows selected');
                        }
                        for (var i = 0, r; r = s[i]; i++){
                            r.set(f, v);
                        }
                        batchEditWin.fieldName.reset();
                        batchEditWin.fieldVal.reset();
                    }
                }
        },
        order_treatment: {

        }
    }
});

Ext.reg('ehr-gridformpanel', EHR.ext.GridFormPanel);
