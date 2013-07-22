/*
 * Copyright (c) 2013 LabKey Corporation
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
            selType: 'cellmodel',
            defaults: {
                border: false
            },
            dockedItems: [{
                xtype: 'pagingtoolbar',
                store: this.store,   // same store GridPanel is using
                dock: 'bottom',
                displayInfo: true
            },{
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
            if (id)
                this.fireEvent('animalchange', id);
        }, this);

        this.mon(this.store, 'datachanged', this.onStoreDataChanged, this);
    },

    onStoreDataChanged: function(store){
        this.getView().refresh();
    },

    configureColumns: function(){
        if (this.columns)
            return;

        this.columns = [{
            xtype: 'actioncolumn',
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
                view.getSelectionModel().setCurrentPosition({
                    view: view,
                    row: rowIndex,
                    column: colIndex
                });

                this.rowEditorPlugin.editRecord(rec);
            }
        }];

        LABKEY.ExtAdapter.each(this.formConfig.fieldConfigs, function(field){
            var tableConfig = EHR.model.DataModelManager.getTableMetadata(field.schemaName, field.queryName, this.formConfig.sources);
            var cfg = LABKEY.ExtAdapter.apply({}, field);
            LABKEY.Utils.merge(cfg, tableConfig[field.name]);

            if(cfg.shownInGrid === false)
                return;

            var colCfg = EHR.DataEntryUtils.getColumnConfigFromMetadata(cfg, this);
            if (colCfg){
                if (cfg.jsonType == 'date' && cfg.extFormat){
                    if (Ext4.Date.formatContainsHourInfo(cfg.extFormat)){
                        colCfg.editor = 'xdatetime';
                    }
                }

                this.columns.push(colCfg);
            }
        }, this);
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
        LABKEY.ExtAdapter.each(this.formConfig.tbarButtons, function(btn){
            if (LABKEY.ExtAdapter.isString(btn)){
                buttons.push(EHR.DataEntryUtils.getGridButton(btn));
            }
            else {
                buttons.push(btn);
            }
        }, this);

        return buttons;
    }
});
