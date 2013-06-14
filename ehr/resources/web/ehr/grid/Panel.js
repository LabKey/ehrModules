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
    },

    configureColumns: function(){
        if (this.columns)
            return;

        this.columns = [{
            xtype: 'actioncolumn',
            width: 40,
            icon: LABKEY.ActionURL.getContextPath() + '/_images/editprops.png',
            tooltip: 'Edit',
            rowEditorPlugin: this.getRowEditorPlugin(),
            handler: function(view, rowIndex, colIndex, item, e, rec) {
                this.rowEditorPlugin.editRecord(rec);
            }
        }];

        LABKEY.ExtAdapter.each(this.formConfig.fieldConfigs, function(field){
            var tableConfig = EHR.model.ViewConfigManager.getTableMetadata(field.schemaName, field.queryName, this.formConfig.sources);
            var cfg = LABKEY.ExtAdapter.apply({}, field);
            LABKEY.Utils.merge(cfg, tableConfig[field.name]);

            if(cfg.shownInGrid === false)
                return;

            var colCfg = EHR.DataEntryUtils.getColumnConfigFromMetadata(cfg, this);
            if (colCfg)
                this.columns.push(colCfg);
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
                buttons.push(LABKEY.ext4.GRIDBUTTONS.getButton(btn));
            }
            else {
                buttons.push(btn);
            }
        }, this);

        buttons.push(LABKEY.ext4.GRIDBUTTONS.getButton('ADDRECORD'));
        buttons.push(LABKEY.ext4.GRIDBUTTONS.getButton('DELETERECORD'));

        return buttons;
    }
});
