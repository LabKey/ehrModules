/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.form.Panel', {
    extend: 'Ext.form.Panel',
    alias: 'widget.ehr-formpanel',

    initComponent: function(){
        Ext4.QuickTips.init();

        LABKEY.ExtAdapter.apply(this, {
            items: this.getItemsConfig(),
            bodyStyle: 'padding: 5px;',
            defaults: {
                border: false
            },
            buttonAlign: 'left'
        });

        this.bindConfig = this.bindConfig || {};
        LABKEY.Utils.mergeIf(this.bindConfig, {
            autoCreateRecordOnChange: true,
            autoBindFirstRecord: true
        });

        this.plugins = this.plugins || [];
        this.plugins.push(Ext4.create('EHR.plugin.Databind'));

        this.callParent();

        this.addEvents('recordchange', 'fieldvaluechange');
    },

    getItemsConfig: function(){
        var items = [];

        var fields = EHR.model.DefaultClientModel.getFieldConfigs(this.formConfig.fieldConfigs, this.formConfig.configSources);
        Ext4.Array.forEach(fields, function(field){
            if (field.jsonType == 'date' && field.extFormat){
                if (Ext4.Date.formatContainsHourInfo(field.extFormat)){
                    field.xtype = 'xdatetime';
                }
            }

            var cfg = EHR.DataEntryUtils.getFormEditorConfig(field);
            LABKEY.ExtAdapter.apply(cfg, {
                labelWidth: 150,
                width: 400
            });

            items.push(cfg);
        });

        return items;
    }
});


