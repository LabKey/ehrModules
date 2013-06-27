/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @param fieldConfigs
 */
Ext4.define('EHR.model.DefaultClientModel', {
    extend: 'Ext.data.Model',
    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
            root: 'root'
        }
    },

    statics: {
        getFieldConfigs: function(fieldConfigs, sources){
            var fields = [];
            for (var i=0;i<fieldConfigs.length;i++){
                fields.push(this.getFieldConfig(fieldConfigs[i], sources));
            }

            return fields;
        },

        getFieldConfig: function(cfg, sources){
            var tableConfig = EHR.model.DataModelManager.getTableMetadata(cfg.schemaName, cfg.queryName, sources);
            var ret = LABKEY.ExtAdapter.apply({}, cfg);
            LABKEY.ExtAdapter.apply(ret, {
                useNull: true
            });

            if (tableConfig[cfg.name]){
                ret = LABKEY.Utils.merge(ret, tableConfig[cfg.name]);
            }

            return ret;
        }
    },

    constructor: function(config){
//        this.validations = this.validations || [];
//        this.fields.each(function(field){
//            if (field.allowBlank===false || field.nullable === false){
//                this.validations.push({
//                    type: 'presence',
//                    message: 'This field is required',
//                    field: field.name
//                });
//            }
//        }, this);
        this.callParent(arguments);
        this.setFieldDefaults();
        if (this.storeCollection){
            this.storeCollection.setClientModelDefaults(this);
        }
    },

    setFieldDefaults: function(){
        this.fields.each(function(field){
            if (Ext4.isFunction(field.getInitialValue)){
                this.data[field.name] = field.getInitialValue.call(this, this.data[field.name], this);
            }
        }, this);
    },

    validate: function(){
        var errors = this.callParent(arguments);

        this.fields.each(function(field){
            //NOTE: we're drawing a distinction between LABKEY's nullable and ext's allowBlank.
            // This allows fields to be set to 'allowBlank: false', which throws a warning
            // nullable:false will throw an error when null.
            // also, if userEditable==false, we assume will be set server-side so we ignore it here
            if(field.userEditable !== false && Ext4.isEmpty(this.get(field.name))){
                if(field.nullable === false || field.allowBlank === false){
                    errors.add({
                        id: LABKEY.Utils.generateUUID(),
                        field: field.name,
                        message: (field.nullable === false ? 'ERROR' : 'WARN') + ': This field is required',
                        severity: (field.nullable === false ? 'ERROR' : 'WARN'),
                        fromServer: false
                    });
                }
            }
        }, this);

        if(this.serverErrors && this.serverErrors.getCount()){
            errors.addAll(this.serverErrors.getRange());
        }

        return errors;
    }
});