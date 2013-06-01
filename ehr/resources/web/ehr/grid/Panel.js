/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.grid.Panel', {
    extend: 'LDK.grid.Panel',
    alias: 'widget.ehr-gridpanel',

    initComponent: function(){
        if (!this.stores){
            alert('Must provide a storeConfig');
            return;
        }

        this.store = this.stores.getForQuery(this.formConfig.schemaName, this.formConfig.queryName);
        this.store.on('load', function(store){
            console.log('loaded');
//            this.getView().refresh();
//            store.fireEvent('datachanged', store);
        }, this);

        this.configureColumns();

        LABKEY.ExtAdapter.apply(this, {
            selType: 'rowmodel',
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

    getEditingPlugin: function(){
        return Ext4.create('EHR.plugin.RowEditor', {})
    },

    configureColumns: function(){
        if (this.columns)
            return;

        this.columns = [];
        LABKEY.ExtAdapter.each(this.formConfig.fieldConfigs, function(field){
            if(field.shownInGrid === false)
                return;

            var cfg = EHR.DataEntryUtils.getColumnConfigFromMetadata(field, this);
            if (cfg)
                this.columns.push(cfg);
        }, this);
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
console.log(buttons)
        return buttons;
    }
});
