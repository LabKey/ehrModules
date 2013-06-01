/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.panel.DataEntryPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ehr-dataentrypanel',

    stores: Ext4.create('EHR.data.StoreCollection', {}),

    initComponent: function(){
        this.configureStores();

        Ext4.apply(this, {
            defaults: {
                border: false
            },
            items: this.getItems(),
            buttons: this.getButtons()
        });

        this.callParent();
    },

    configureStores: function(){
        var configs = this.getStoreConfigs();
        LABKEY.ExtAdapter.each(configs, function(cfg){
            this.stores.addFromConfig(cfg);
        }, this);
    },

    getStoreConfigs: function(){
        if (!this.formConfig || !this.formConfig.sections || !this.formConfig.sections.length)
            return;

        var storeConfigs = [];
        for (var i=0; i<this.formConfig.sections.length; i++){
            var section = this.formConfig.sections[i];
            if (!section.storeConfigs)
                continue;

            for(var j=0;j<section.storeConfigs.length;j++){
                storeConfigs.push(this.configureStore(section.storeConfigs[j]));
            }
        }

        return storeConfigs;
    },

    /**
     * Allows subclasses to modify the stores prior to creation, such as applying filters
     */
    configureStore: function(cfg){
        return cfg;
    },

    getItems: function(){
        if (!this.formConfig || !this.formConfig.sections || !this.formConfig.sections.length){
            return [];
        }

        var items = [];
        for (var i=0; i<this.formConfig.sections.length; i++){
            var section = this.formConfig.sections[i];

            items.push({
                xtype: section.xtype,
                style: 'margin-bottom: 10px;',
                collapsible: true,
                title: section.label,
                formConfig: section,
                dataEntryPanel: this,
                stores: this.stores
            });
        }

        return items;
    },

    getButtons: function(){
        var buttons = [];

        if (this.formConfig && !this.formConfig.buttons){
            LABKEY.ExtAdapter.each(this.formConfig.buttons, function(cfg){
                buttons.push(cfg);
            }, this);
        }

        //TODO: remove this
        buttons.push({
            text: 'Submit',
            handler: function(btn){
                var panel = btn.up('ehr-dataentrypanel');
                console.log(panel);
                //panel.stores.commit();
            }
        });

        return buttons;
    }
});
