/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.panel.DataEntryPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ehr-dataentrypanel',

    storeCollection: null,

    initComponent: function(){
        this.storeCollection = Ext4.create(this.formConfig.storeCollectionClass || 'EHR.data.StoreCollection', {});
        this.storeCollection.on('load', this.onStoreCollectionLoad, this);
        this.storeCollection.on('commitcomplete', this.onStoreCollectionCommitComplete, this);
        this.storeCollection.on('beforecommit', this.onStoreCollectionBeforeCommit, this);
        this.storeCollection.on('commitexception', this.onStoreCollectionCommitException, this);
        this.storeCollection.on('serverdatachanged', this.onStoreCollectionServerDataChanged, this);


        this.createServerStores();

        //NOTE: this is done to instantiate the clientStores.  this isnt the best way to do this and should get reworked eventually
        this._cachedItems = this.getItems();

        Ext4.apply(this, {
            border: false,
            defaults: {
                border: false
            },
            items: [{
                html: 'Loading...'
            }],
            buttonAlign: 'left',
            buttons: this.getButtons()
        });

        this.callParent();

        this.addEvents('datachanged', 'serverdatachanged', 'clientdatachanged', 'animalselect');
    },

    onStoreCollectionCommitComplete: function(sc, extraContext){
        console.log('commit complete');
        Ext4.Msg.hide();

        if(extraContext && extraContext.successURL){
            window.onbeforeunload = Ext4.emptyFn;
            window.location = extraContext.successURL;
        }
    },

    onStoreCollectionBeforeCommit: function(sc, records, commands, extraContext){
        if (!commands || !commands.length){
            console.log('no commands');
        }

        Ext4.Msg.wait('Saving records...');
    },

    onStoreCollectionCommitException: function(sc){
        Ext4.Msg.hide();
    },

    onStoreCollectionServerDataChanged: function(sc, changed){
        console.log('server data has been changd');
        console.log(changed);
    },

    createServerStores: function(){
        var i, j;
        if (!this.formConfig || !this.formConfig.sections || !this.formConfig.sections.length)
            return;

        var fieldMap = {};
        for (i=0; i<this.formConfig.sections.length; i++){
            var section = this.formConfig.sections[i];
            if (!section.fieldConfigs)
                continue;

            for(j=0;j<section.fieldConfigs.length;j++){
                var field = section.fieldConfigs[j];
                var key = field.schemaName + '.' + field.queryName;
                if (!fieldMap[key])
                    fieldMap[key] = {
                        schemaName: field.schemaName,
                        queryName: field.queryName,
                        fields: {}
                    };

                //TODO: consider allowing aliasing server->client
                fieldMap[key].fields[field.name] = field.name;
            }
        }

        for(var storeId in fieldMap){
            var cfg = fieldMap[storeId];
            this.storeCollection.addServerStoreFromConfig(this.applyConfigToServerStore({
                schemaName: cfg.schemaName,
                queryName: cfg.queryName,
                columns: LABKEY.Utils.isEmptyObj(cfg.fields) ? null : Ext4.Object.getKeys(cfg.fields).join(',')
            }));
        }

        this.storeCollection.loadDataFromServer();
    },

    /**
     * Allows subclasses to modify the stores prior to creation, such as applying filters
     */
    applyConfigToServerStore: function(cfg){
        cfg.autoLoad = false;
        return cfg;
    },

    onStoreCollectionLoad: function(){
        //TODO: only want to do this once
        this.removeAll();
        this.add(this.getItems());
    },

    getItems: function(){
        if (this._cachedItems){
            var items = this._cachedItems;
            this._cachedItems = null;
            return items;
        }

        if (!this.formConfig || !this.formConfig.sections || !this.formConfig.sections.length){
            return [];
        }

        var items = [];
        for (var i=0; i<this.formConfig.sections.length; i++){
            var section = this.formConfig.sections[i];

            var sectionCfg = LABKEY.ExtAdapter.apply({
                xtype: section.xtype,
                border: true,
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
        var fields = EHR.model.DefaultClientModel.getFieldConfigs(section.fieldConfigs, section.configSources);
        if (!fields.length){
            return;
        }

        Ext4.define(modelName, {
            extend: section.clientModelClass,
            fields: fields,
            storeCollection: this.storeCollection,
            dataEntryPanel: this
        });

        var store = Ext4.create('EHR.data.DataEntryClientStore', {
            storeId: Ext4.id() + '-' + section.name,
            model: modelName,
            loaded: false
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
            text: 'Save',
            handler: function(btn){
                var panel = btn.up('ehr-dataentrypanel');
                panel.storeCollection.commitChanges(true);
            }
        });

        buttons.push({
            text: 'Validate All',
            handler: function(btn){
                var panel = btn.up('ehr-dataentrypanel');
                panel.storeCollection.validateAll();
            }
        });

        buttons.push({
            text: 'Show Store Counts',
            handler: function(btn){
                var panel = btn.up('ehr-dataentrypanel');

                console.log('client stores:');
                panel.storeCollection.clientStores.each(function(s){
                    console.log(s.storeId + ': ' + s.getCount());
                }, this);

                console.log('server stores:');
                panel.storeCollection.serverStores.each(function(s){
                    console.log(s.storeId + ': ' + s.getCount());
                }, this);
            }
        });

        return buttons;
    }
});
