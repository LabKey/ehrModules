/*
 * Copyright (c) 2026 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * A plugin for EHR.panel.BulkEditPanel that makes the Observation/Score field's editor depend on the
 * selected Category, mirroring EHR.grid.plugin.ClinicalObservationsCellEditing so that the data type
 * and options offered in the bulk edit dialog match the clinical observations grid.
 *
 * It is attached to the bulk edit panel via the clinical observations grid's formConfig.bulkEditPlugins
 * (see EHR.grid.ClinicalObservationGridPanel), so the generic bulk edit panel stays free of any
 * observation-specific logic.
 */
Ext4.define('EHR.plugin.ClinicalObservationsBulkEdit', {
    extend: 'Ext.AbstractPlugin',
    alias: 'plugin.clinicalobservationsbulkedit',

    init: function(panel){
        this.panel = panel;
        this.observationTypesStore = EHR.DataEntryUtils.getObservationTypesStore();
        panel.on('afterrender', this.setupObservationDependency, this, {single: true});

        this.callParent(arguments);
    },

    setupObservationDependency: function(){
        var panel = this.panel;
        var categoryField = panel.down('[name=category]');
        var observationField = panel.down('[name=observation]');
        if (!categoryField || !observationField){
            return;
        }

        // Capture the base config of the original Observation/Score field so it can be rebuilt with a
        // category-specific editor (see reconfigureObservationField).
        this.observationFieldBaseCfg = {
            name: observationField.name,
            fieldLabel: observationField.fieldLabel,
            labelWidth: observationField.labelWidth,
            width: observationField.width
        };

        categoryField.on('change', function(field, newValue){
            this.reconfigureObservationField(newValue);
        }, this);

        // Initialize based on any pre-populated category value (e.g. when all selected records share a category)
        var initialCategory = categoryField.getValue();
        if (initialCategory){
            this.reconfigureObservationField(initialCategory);
        }
    },

    reconfigureObservationField: function(category){
        var store = this.observationTypesStore;
        if (store.isLoading() || !store.getCount()){
            store.on('load', function(){
                this.reconfigureObservationField(category);
            }, this, {single: true});
            return;
        }

        var panel = this.panel;
        var observationField = panel.down('[name=observation]');
        if (!observationField){
            return;
        }

        var container = observationField.ownerCt;
        var index = container.items.indexOf(observationField);
        //preserve the user's enable/disable toggle state across category changes
        var wasDisabled = observationField.isDisabled();

        //note: we proceed even if the category cannot be found, to support records saved under a no-longer-supported category
        var rec = category ? store.findRecord('value', category) : null;
        var editorConfig = rec && rec.get('editorconfig') ? Ext4.decode(rec.get('editorconfig')) : null;
        editorConfig = editorConfig || {
            xtype: 'textfield'
        };

        var cfg = Ext4.apply({}, editorConfig);
        Ext4.apply(cfg, this.observationFieldBaseCfg);
        delete cfg.value;
        delete cfg.defaultValue;
        cfg.allowBlank = true;
        cfg.originalDisabled = false;
        cfg.disabled = wasDisabled;

        cfg = EHR.DataEntryUtils.ensureLookupPlugin(cfg, false);

        container.remove(observationField, true);
        var newField = Ext4.widget(cfg);
        panel.addLabelToggle(newField);
        container.insert(index, newField);
    }
});
