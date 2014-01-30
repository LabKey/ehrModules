/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * Created to allow a custom row editor plugin and column that summarize observations
 */
Ext4.define('EHR.grid.ClinicalObservationGridPanel', {
    extend: 'EHR.grid.Panel',
    alias: 'widget.ehr-clinicalobservationgridpanel',

    initComponent: function(){
        this.observationTypesStore = Ext4.create('LABKEY.ext4.Store', {
            type: 'labkey-store',
            schemaName: 'ehr_lookups',
            queryName: 'observation_types',
            columns: 'value,description',
            autoLoad: true
        });

        this.callParent(arguments);
    },

    getEditingPlugin: function(){
        return Ext4.create('EHR.grid.plugin.ClinicalObservationsCellEditing', {
            pluginId: this.editingPluginId,
            clicksToEdit: this.clicksToEdit,
            observationTypesStore: this.observationTypesStore
        });
    }
});