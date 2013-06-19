/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.data.DataEntryClientStore', {
    extend: 'Ext.data.Store',
    alias: 'store.ehr-dataentryclientstore',
    loaded: true,

    constructor: function(){
        Ext4.apply(this, {

        });

        this.callParent(arguments);
    },

    getFields: function(){
        return this.proxy.reader.model.prototype.fields;
    },

    hasLoaded: function(){
        return this.loaded;
    }
});
