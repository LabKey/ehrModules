/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.grid.Panel', {
    extend: 'LDK.grid.Panel',
    alias: 'widget.ehr-gridpanel',

    initComponent: function(){
        if (!this.store){
            alert('Must provide a storeConfig');
            return;
        }

        this.configureColumns();

        LABKEY.ExtAdapter.apply(this, {
            cls: 'ldk-grid',
            clicksToEdit: 1,
            selModel: {
                mode: 'MULTI'
            },
            defaults: {
                border: false
            },
            dockedItems: [{
                xtype: 'toolbar',
                dock: 'top',
                items: this.getTbarButtons()
            }]
        });

        this.callParent();
        this.addEvents('animalchange');
        this.enableBubble('animalchange');

        this.getSelectionModel().on('selectionchange', function(sm, models){
            if (models.length != 1)
                return;

            var id = models[0].get('Id');
            this.fireEvent('animalchange', id);
        }, this);

        this.store.on('datachanged', this.onStoreValidationComplete, this, {buffer: 100, delay: 20});
        this.store.on('validation', this.onStoreValidation, this);
        this.store.on('validation', this.onStoreValidationComplete, this, {buffer: 100, delay: 20});

        var width = 20;
        Ext4.Array.forEach(this.columns, function(col){
            if (col.width){
                if (!col.hidden)
                    width += col.width;
            }
            else {
                console.log('no width');
            }
        }, this);

        this.minWidth = width;
        if (this.dataEntryPanel){
            this.dataEntryPanel.updateMinWidth(this.minWidth);
        }

    },

    pendingChanges: {},

    onStoreValidation: function(store, record){
        var key = store.storeId + '||' + record.internalId;

        this.pendingChanges[key] = {
            store: store,
            record: record
        };
    },

    onStoreValidationComplete: function(){
        if (this.editingPlugin.editing){
            //console.log('defer grid refresh: ' + this.store.storeId);
            this.editingPlugin.on('edit', this.onStoreValidationComplete, this, {single: true, delay: 100});
            return;
        }

        var keys = Ext4.Object.getKeys(this.pendingChanges);
        if (keys.length > 5){
            //console.log('grid refresh: ' + this.store.storeId);
            this.getView().refresh();
        }
        else {
            Ext4.Array.forEach(keys, function(key){
                var obj = this.pendingChanges[key];

                //console.log('updating row: ' + key);
                this.getView().onUpdate(obj.store, obj.record);
            }, this);
        }

        this.pendingChanges = {};
    },

    configureColumns: function(){
        if (this.columns)
            return;

        this.columns = [{
            xtype: 'actioncolumn',
            editable: false,
            width: 40,
            icon: LABKEY.ActionURL.getContextPath() + '/_images/editprops.png',
            tooltip: 'Edit',
            renderer: function(value, cellMetaData, record, rowIndex, colIndex, store){
                var errors = record.validate();
                if (errors && !errors.isValid()){
                    cellMetaData.tdCls = 'labkey-grid-cell-invalid';

                    var messages = [];
                    errors.each(function(m){
                        var meta = store.getFields().get(m.field) || {};
                        messages.push((meta.caption || m.field) + ': ' + m.message);
                    }, this);

                    messages = Ext4.Array.unique(messages);
                    if (messages.length){
                        messages.unshift('Errors:');
                        cellMetaData.tdAttr = " data-qtip=\"" + Ext4.util.Format.htmlEncode(messages.join('<br>')) + "\"";
                    }
                }
                return value;
            },
            rowEditorPlugin: this.getRowEditorPlugin(),
            handler: function(view, rowIndex, colIndex, item, e, rec) {
                var sm = view.getSelectionModel();

                if (sm instanceof Ext4.selection.CellModel){
                    sm.setCurrentPosition({
                        view: view,
                        row: rowIndex,
                        column: colIndex
                    });
                }

                this.rowEditorPlugin.editRecord(rec);
            }
        }];

        var firstEditableColumn = -1;
        LABKEY.ExtAdapter.each(this.formConfig.fieldConfigs, function(field, idx){
            var tableConfig = EHR.model.DataModelManager.getTableMetadata(field.schemaName, field.queryName, this.formConfig.configSources);
            var cfg = LABKEY.ExtAdapter.apply({}, field);
            cfg = EHR.model.DefaultClientModel.getFieldConfig(cfg, this.formConfig.configSources);

            if(cfg.shownInGrid === false){
                return;
            }

            var colCfg = EHR.DataEntryUtils.getColumnConfigFromMetadata(cfg, this);
            if (colCfg){
                if (cfg.jsonType == 'date' && cfg.extFormat){
                    if (Ext4.Date.formatContainsHourInfo(cfg.extFormat)){
                        colCfg.editor.xtype = 'xdatetime';
                    }
                }

                if (!colCfg.hidden)
                    colCfg.tdCls = 'ldk-wrap-text';

                if (firstEditableColumn == -1 && colCfg.editable !== false){
                    firstEditableColumn = 1 + idx;
                }
                this.columns.push(colCfg);
            }
        }, this);

        if (firstEditableColumn != -1){
            this.firstEditableColumn = firstEditableColumn;
        }
    },

    getRowEditorPlugin: function(){
        if (this.rowEditorPlugin)
            return this.rowEditorPlugin;

        this.rowEditorPlugin = Ext4.create('EHR.plugin.RowEditor', {
            cmp: this
        });

        return this.rowEditorPlugin;
    },

    getFilterArray: function(){
        return [LABKEY.Filter.create('taskid', this.taskId, LABKEY.Filter.Types.EQUAL)]
    },

    getTbarButtons: function(){
        var buttons = [];

        if (this.formConfig.tbarButtons){
            LABKEY.ExtAdapter.each(this.formConfig.tbarButtons, function(btn){
                if (LABKEY.ExtAdapter.isString(btn)){
                    buttons.push(EHR.DataEntryUtils.getGridButton(btn));
                }
                else {
                    buttons.push(btn);
                }
            }, this);
        }

        if (this.formConfig.tbarMoreActionButtons){
            var moreActions = [];
            LABKEY.ExtAdapter.each(this.formConfig.tbarMoreActionButtons, function(btn){
                if (LABKEY.ExtAdapter.isString(btn)){
                    moreActions.push(EHR.DataEntryUtils.getGridButton(btn));
                }
                else {
                    moreActions.push(btn);
                }
            }, this);

            if (moreActions.length){
                buttons.push({
                    text: 'More Actions',
                    menu: moreActions
                });
            }
        }

        return buttons;
    }
});