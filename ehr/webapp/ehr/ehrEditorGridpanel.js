/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

LABKEY.requiresScript("/ehr/Utils.js");
LABKEY.requiresScript("/ehr/ehrMetaHelper.js");

EHR.ext.EditorGridPanel = Ext.extend(LABKEY.ext.EditorGridPanel,
{
    initComponent: function(){
        
        var sm = this.sm || new Ext.grid.CheckboxSelectionModel();

        Ext.applyIf(this, {
            viewConfig: {
                forceFit: true,
//                autoFill: true,
                scrollOffset: 0,
                getRowClass : function(record, rowIndex, rowParams, store){
                    if(record.errors && record.errors.length){
                        return 'x-grid3-row-invalid';
                    }
                    return '';
                }
            },
            autoHeight: true,
            autoWidth: true,
            pageSize: 200,
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
                    name: 'add-record-button',
                    handler: this.onAddRecord,
                    scope: this
                },
                    "-"
                ,{
                    text: 'Delete Selected',
                    tooltip: 'Click to delete selected row(s)',
                    name: 'delete-records-button',
                    handler: this.onDeleteRecords,
                    scope: this
                }
            ]
        });

        EHR.ext.EditorGridPanel.superclass.initComponent.apply(this, arguments);

        this.store.on('validation', this.onStoreValidate, this, {delay: 100});
    }

    ,onStoreValidate: function(store, records){
        if(records && !Ext.isArray(records))
            records = [records];

        Ext.each(records, function(rec){
            if(this.rendered)
                this.getView().refreshRow(rec);
        }, this);

    }

    ,populateMetaMap : function() {
        //not longer needed
    }
    ,getDefaultEditor: function(){
        //moved to EHR.ext.metaHelper
    }
    ,getLookupEditor: function(){
        //moved to EHR.ext.metaHelper
    }
    ,setLongTextRenderers : function() {
        //moved to EHR.ext.metaHelper
    }
    ,onLookupStoreError: function(){
        //moved to EHR.ext.metaHelper
    }
    ,onLookupStoreLoad: function(){
        //moved to EHR.ext.metaHelper
    }
    ,getLookupRenderer: function(){
        //moved to EHR.ext.metaHelper
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

        //fire the "columnmodelcustomize" event to allow clients
        //to modify our default configuration of the column model
        //NOTE: I dont think this will be permissible b/c it's a public API,
        // but I would suggest changing the arguments on this event
        // might make more sense to pass 'this' and 'columns'.  can use getColumnById() method
        this.fireEvent("columnmodelcustomize", columns);

        //reset the column model
        this.reconfigure(this.store, new Ext.grid.ColumnModel(columns));

    }
    ,getColumnModelConfig: function(){
        var config = {
            editable: this.editable,
            defaults: {
                sortable: false
            }
        };

        var columns = EHR.ext.metaHelper.getColumnModelConfig(this.store, config, this);

        Ext.each(columns, function(col, idx){
            var meta = this.store.findFieldMeta(col.dataIndex);

            //remember the first editable column (used during add record)
            if(!this.firstEditableColumn && col.editable)
                this.firstEditableColumn = idx;

            if(meta.isAutoExpandColumn && !col.hidden){
                this.autoExpandColumn = idx;
            }

        }, this);

        return columns;
    }
    ,getColumnById: function(colName){
        return this.getColumnModel().getColumnById(colName);
    }
});
Ext.reg('ehr-editorgrid', EHR.ext.EditorGridPanel);

//EHR.ext.EditorGridPanel.gridButtons = {
//    'add': {
//        text: 'Add Record',
//        xtype: 'button',
//        tooltip: 'Click to add a blank record',
//        name: 'add-record-button',
//        handler: function ()
//        {
//            var store = this.store;
//            if (store.recordType)
//            {
//                store.addRecord(undefined, 0);
//                this.getSelectionModel().selectFirstRow();
//            }
//        }
//    },
//    'delete': {
//        text: 'Delete Selected',
//        xtype: 'button',
//        tooltip: 'Click to delete selected row(s)',
//        name: 'delete-records-button',
//        handler: function()
//        {
//            Ext.MessageBox.confirm(
//                'Confirm',
//                'You are about to permanently delete these records.  It cannot be undone.  Are you sure you want to do this?',
//                function(val){
//                    if(val=='yes'){
//                        this.stopEditing();
//                        var recs = this.getSelectionModel().getSelections();
//                        //TODO
//                        //this.theForm.unbindRecord();
//
//                        this.store.deleteRecords(recs);
//                    }
//                },
//                this);
//        }
//    },
//    'next': {
//            text: 'Select Next',
//            xtype: 'button',
//            tooltip: 'Click to move one record forward',
//            name: 'select-next-button',
//            handler: function()
//            {
//                this.getSelectionModel().selectNext();
//                //this.theForm.focusFirstField();
//            },
//            scope: this
//    },
//    'previous': {
//            text: 'Select Previous',
//            xtype: 'button',
//            tooltip: 'Click to move one record backward',
//            name: 'select-previous-button',
//            handler: function()
//            {
//                this.getSelectionModel().selectPrevious();
//                //this.theForm.focusFirstField();
//            },
//            scope: this
//    },
//    'duplicate': {
//        text: 'Duplicate Selected',
//        xtype: 'button',
//        tooltip: 'Duplicate Selected Record',
//        name: 'duplicate-button',
//        handler: function()
//        {
//            var records = this.getSelectionModel().getSelections();
//            if(!records || !records.length){
//                return;
//            }
//
//            var theWindow = new Ext.Window({
//                closeAction:'hide',
//                title: 'Choose Fields To Copy',
//                width: 350,
//                items: [{
//                    xtype: 'ehr-recordduplicator',
//                    ref: 'recordduplicator',
//                    targetStore: this.store,
//                    records: records
//                }]
//            });
//
//            theWindow.show();
//        }
//    },
//    'addbatch': {
//            text: 'Add Batch',
//            xtype: 'button',
//            scope: this,
//            tooltip: 'Click to add a group of animals',
//            name: 'add-batch-button',
//            handler: function()
//            {
//                this.animalSelectorWin = new Ext.Window({
//                    closeAction:'hide',
//                    width: 350,
//                    items: [{
//                        xtype: 'ehr-animalselector',
//                        ref: 'animalselector',
//                        targetStore: this.store,
//                        title: ''
//                    }]
//                });
//
//                this.animalSelectorWin.show();
//            }
//        },
//        'order_clinpath': {
//            text: 'Order Multiple Tests',
//            xtype: 'button',
//            scope: this,
//            tooltip: 'Order Multiple Tests',
//            title: 'Order Multiple Tests',
//            name: 'order_clinpath-button',
//            handler: function()
//            {
//                this.clinPath = new Ext.Window({
//                    closeAction:'hide',
//                    width: 350,
//                    items: [{
//                        xtype: 'ehr-clinpathorderpanel',
//                        ref: 'theForm'
//                    }]
//                });
//
//                this.clinPath.show();
//            }
//        },
//        'apply_template': {
//            text: 'Apply Template',
//            xtype: 'button',
//            scope: this,
//            tooltip: 'Add records to this grid based on a saved template',
//            title: 'Apply Template',
//            name: 'apply-template-button',
//            handler: function()
//            {
//                var theWindow = new Ext.Window({
//                    closeAction:'hide',
//                    width: 350,
//                    items: [{
//                        xtype: 'ehr-applytemplatepanel',
//                        formType: this.store.storeId,
//                        ref: 'theForm'
//                    }]
//                });
//
//                theWindow.show();
//            }
//        },
//        'save_template': {
//            text: 'Save As Template',
//            xtype: 'button',
//            scope: this,
//            tooltip: 'Save selected records as a template',
//            title: 'Save Template',
//            name: 'save-template-button',
//            handler: function()
//            {
//                var theWindow = new Ext.Window({
//                    closeAction:'hide',
//                    width: 800,
//                    minWidth: 300,
//                    maxWidth: 800,
//                    items: [{
//                        xtype: 'ehr-savetemplatepanel',
//                        //TODO
//                        importPanel: this,
//                        grid: this,
//                        formType: this.store.storeId,
//                        ref: 'theForm'
//                    }]
//                });
//
//                theWindow.show();
//            }
//        }
//}
//
