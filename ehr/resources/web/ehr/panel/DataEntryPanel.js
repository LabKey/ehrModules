/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.panel.DataEntryPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ehr-dataentrypanel',

    storeCollection: Ext4.create('EHR.data.StoreCollection', {}),

    initComponent: function(){
        this.createServerStores();

        Ext4.apply(this, {
            defaults: {
                border: false
            },
            items: this.getItems(),
            buttons: this.getButtons()
        });

        this.callParent();

        this.addEvents('datachanged', 'serverdatachanged', 'clientdatachanged');
    },

    createServerStores: function(){
        if (!this.formConfig || !this.formConfig.sections || !this.formConfig.sections.length)
            return;

        var storeConfigs = [];
        for (var i=0; i<this.formConfig.sections.length; i++){
            var section = this.formConfig.sections[i];
            if (!section.storeConfigs)
                continue;

            for(var j=0;j<section.storeConfigs.length;j++){
                this.storeCollection.addServerStoreFromConfig(this.applyConfigToServerStore(section.storeConfigs[j]));
            }
        }

        return storeConfigs;
    },

    /**
     * Allows subclasses to modify the stores prior to creation, such as applying filters
     */
    applyConfigToServerStore: function(cfg){
        return cfg;
    },

    getItems: function(){
        if (!this.formConfig || !this.formConfig.sections || !this.formConfig.sections.length){
            return [];
        }

        var items = [];
        for (var i=0; i<this.formConfig.sections.length; i++){
            var section = this.formConfig.sections[i];

            var sectionCfg = LABKEY.ExtAdapter.apply({
                xtype: section.xtype,
                style: 'margin-bottom: 10px;',
                collapsible: true,
                title: section.label,
                formConfig: section,
                dataEntryPanel: this,
                store: this.getClientStoreForSection(section)
            }, section.formConfig);

            items.push(sectionCfg);
        }

        return items;
    },

    getClientStoreForSection: function(section){
        var modelName = 'EHR.model.model-' + Ext4.id();
        Ext4.define(modelName, {
            extend: section.clientModelClass,
            fields: EHR.model.DefaultClientModel.getFieldConfigs(section.fieldConfigs, section.configSources),
            dataEntryPanel: this
        });

        //TODO: storeId?
        var store = Ext4.create('EHR.data.DataEntryClientStore', {
            model: modelName
        });

        this.storeCollection.addClientStore(store);

        return store;
    },

    getButtons: function(){
        var buttons = [];

        if (this.formConfig && this.formConfig.buttons){
            Ext4.Array.forEach(this.formConfig.buttons, function(cfg){
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
