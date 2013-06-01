/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.form.Panel', {
    extend: 'Ext.form.Panel',
    alias: 'widget.ehr-formpanel',

    fieldConfigs: [],
    boundRecords: [],

    initComponent: function(){
        Ext4.QuickTips.init();

        if (!this.stores || !this.stores.getCount()){
            alert('No stores configured for FormPanel');
            return;
        }

        Ext4.apply(this, {
            items: this.getItems(),
            bodyStyle: 'padding: 5px;',
            defaults: {
                border: false
            }
        });

        this.callParent();
    },

    getItems: function(){
        var items = [];

        LABKEY.ExtAdapter.each(this.formConfig.fieldConfigs, function(cfg){
            var cfg = EHR.DataEntryUtils.getFormEditorConfig(cfg);
            LABKEY.ExtAdapter.apply(cfg, {
                labelWidth: 150,
                width: 400
            });

            items.push(cfg);

        });

        return items;
    },

    //databind
    _boundRecordMap: {},

    bindRecord: function(record){
        var store = record.store;
        this.getForm().getFields().each(function(field){
            if (store.schemaName == field.schemaName && store.queryName == field.queryName){
                field.boundRecord = record;
            }
        }, this);
    },

    attemptFieldBind: function(record, field){

    },

    unbindRecord: function(){
        var form = this.panel.getForm();
        this.ignoreNextUpdateEvent = null;

        if(form.getRecord()){
            form.updateRecord(form.getRecord());
        }

        form._record = null;
        form.reset();
    },

});


