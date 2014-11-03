/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.data.ClinicalObservationsClientStore', {
    extend: 'EHR.data.DataEntryClientStore',

    constructor: function(){
        this.callParent(arguments);

        this.observationTypesStore = Ext4.create('LABKEY.ext4.Store', {
            type: 'labkey-store',
            schemaName: 'onprc_ehr',
            queryName: 'observation_types',
            columns: 'value,editorconfig',
            autoLoad: true
        });
    }
});
