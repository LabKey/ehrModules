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
            width: 600,
            modal: true
        });

        this.callParent();

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
            applyConfigToServerStore: function(cfg){
                cfg = this.callParent(arguments);
                cfg.filterArray = cfg.filterArray || [];
                cfg.filterArray.push(LABKEY.Filter.create(this.pkCol, this.pkValue, LABKEY.Filter.Types.EQUAL));

                return cfg;
            }
        });

        this.add(Ext4.create(name, {
            pkCol: this.pkCol,
            pkValue: this.pkValue,
            formConfig: this.formResults.formConfig
        }));

        //this.doLayout();
    }
});