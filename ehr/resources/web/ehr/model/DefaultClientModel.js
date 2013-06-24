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

        if(this.serverErrors){
            console.log(this.serverErrors);
//            for (var field in this.serverErrors){
//                errors = errors.concat(this.serverErrors[field]);
//            }
        }

        //console.log(errors);
        return errors;
    }
});