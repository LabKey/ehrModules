/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg schemaName
 * @cfg queryName
 * @cfg pkCol
 * @cfg pkValue
 */
Ext4.define('EHR.window.ManageRecordWindow', {
    extend: 'Ext.window.Window',

    initComponent: function(){
        LABKEY.ExtAdapter.apply(this, {
            modal: true,
            closeAction: 'destroy',
            minWidth: 600,
            minHeight: 200,
            items: [{
                border: false,
                html: 'Loading...'
            }],
            buttons: [{
                text: 'Submit',
                scope: this,
                requiredQC: 'Completed',
                targetQC: 'Completed',
                errorThreshold: 'INFO',
                disableOn: 'WARN',
                disabled: true,
                handler: this.onSubmit
            },{
                text: 'Cancel',
                handler: function(btn){
                    btn.up('window').close();
                }
            }]
        });

        this.callParent();
        this.addEvents('save');

        LABKEY.Ajax.request({
            url: LABKEY.ActionURL.buildURL('ehr', 'dataEntryFormJsonForQuery', null),
            params: {
                schemaName: this.schemaName,
                queryName: this.queryName
            },
            scope: this,
            failure: LDK.Utils.getErrorCallback(),
            success: LABKEY.Utils.getCallbackWrapper(this.onFormLoad, this)
        })
    },

    onSubmit: function(btn){
        var form = this.down('#formPanel');
        var rec = form.getRecord();
        if (!rec)
            return;

        this.down('#dataEntryPanel').onSubmit(btn);
    },

    onFormLoad: function(results){
        this.formResults = results;
        this.setTitle(this.formResults.formConfig.label);

        if (results.cssDependencies){
            LABKEY.requiresCss(results.cssDependencies);
        }

        if (results.jsDependencies){
            LABKEY.requiresScript(results.jsDependencies, true, this.onJsLoad, this, true);
        }
        else {
            this.onJsLoad();
        }
    },

    onJsLoad: function(){
        this.removeAll();
        var name = Ext4.id();

        Ext4.define(name, {
            extend: this.formResults.formConfig.javascriptClass,
            alias: 'widget.' + name,
            extraMetaData: this.extraMetaData,
            applyConfigToServerStore: function(cfg){
                cfg = this.callParent(arguments);
                cfg.filterArray = cfg.filterArray || [];
                cfg.filterArray.push(LABKEY.Filter.create(this.pkCol, this.pkValue, LABKEY.Filter.Types.EQUAL));

                return cfg;
            },
            onStoreCollectionInitialLoad: function(){
                this.removeAll();
                var item = this.getItems()[0];
                item.itemId = 'formPanel';
                this.add(item);

                var size = this.getSize();
                this.setWidth(size.width + 10);
                this.hasStoreCollectionLoaded = true;

                this.up('window').center();
            },
            getToolbarItems: function(){
                var win = this.up('window');
                if (!win){
                    //NOTE: this can occur once after the window is closed, but before the store returns
                    console.log('no window');
                    return;
                }

                return win.getDockedItems('toolbar[dock="bottom"]');
            },
            getButtons: function(){
                return [];
            }
        });

        this.add({
            xtype: name,
            itemId: 'dataEntryPanel',
            pkCol: this.pkCol,
            pkValue: this.pkValue,
            hideErrorPanel: true,
            formConfig: this.formResults.formConfig,
            onStoreCollectionCommitComplete: this.onStoreCollectionCommitComplete
        });
    },

    onStoreCollectionCommitComplete: function(sc, extraContext){
        Ext4.Msg.hide();
        var win = this.up('window');
        win.fireEvent('save', this);
        win.close();
    }
});