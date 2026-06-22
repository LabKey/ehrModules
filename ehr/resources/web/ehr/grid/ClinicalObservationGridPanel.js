/*
 * Copyright (c) 2014-2019 LabKey Corporation
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
        this.observationTypesStore = EHR.DataEntryUtils.getObservationTypesStore();

        // Make the bulk edit panel for this grid offer the same category-dependent Observation/Score
        // editor as the grid's cell editor. formConfig is threaded unchanged to EHR.panel.BulkEditPanel,
        // which instantiates any plugins listed here.
        if (this.formConfig){
            this.formConfig.bulkEditPlugins = Ext4.Array.from(this.formConfig.bulkEditPlugins || []);
            if (!Ext4.Array.contains(this.formConfig.bulkEditPlugins, 'clinicalobservationsbulkedit')){
                this.formConfig.bulkEditPlugins.push('clinicalobservationsbulkedit');
            }
        }

        this.callParent(arguments);
    },

    getEditingPlugin: function(){
        LDK.Assert.assertNotEmpty('this.observationTypesStore is null in ClinicalObservationsGridPanel', this.observationTypesStore);

        return Ext4.create('EHR.grid.plugin.ClinicalObservationsCellEditing', {
            pluginId: this.editingPluginId,
            clicksToEdit: this.clicksToEdit,
            observationTypesStore: EHR.DataEntryUtils.getObservationTypesStore()
        });
    }
});