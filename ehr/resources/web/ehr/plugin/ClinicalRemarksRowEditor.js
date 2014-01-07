/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.plugin.ClinicalRemarksRowEditor', {
    extend: 'EHR.plugin.RowEditor',

    getObservationPanelCfg: function(){
        var store = this.cmp.dataEntryPanel.storeCollection.getClientStoreByName('Clinical Observations');
        LDK.Assert.assertNotEmpty('Observations store not found', store);

        return {
            xtype: 'ehr-observationsroweditorgridpanel',
            itemId: 'observationsPanel',
            remarkStore: this.cmp.store,
            width: 500,
            store: store
        };
    },

    getDetailsPanelCfg: function(){
        return {
            xtype: 'ehr-animaldetailsextendedpanel',
            itemId: 'detailsPanel'
        }
    },

    onWindowClose: function(){
        this.callParent(arguments);
        this.getEditorWindow().down('#observationsPanel').store.clearFilter();

    },

    getWindowCfg: function(){
        var ret = this.callParent(arguments);

        var formCfg = ret.items[0].items[1];
        ret.items[0].items[1] = {
            xtype: 'panel',
            layout: 'column',
            defaults: {
                border: false
            },
            border: false,
            items: [formCfg, this.getObservationPanelCfg()]
        };

        ret.width = 950;
        return ret;
    },

    loadRecord: function(record){
        this.callParent(arguments);
        this.getEditorWindow().down('#observationsPanel').loadRecord(record);
    }
});