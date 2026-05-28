/*
 * Copyright (c) 2025-2026 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.form.field.BuildingField', {
    extend: 'Ext.ux.CheckCombo',
    alias: 'widget.ehr-buildingfield',

    fieldLabel: 'Building',
    nullCaption: '[Blank]',
    editable: false,
    expandToFitContent: true,
    addAllSelector: true,
    typeAhead: true,

    initComponent: function(){
        Ext4.apply(this, {
            displayField:'name',
            valueField: 'name',
            queryMode: 'local',
            store: Ext4.create('LABKEY.ext4.data.Store', {
                schemaName: 'ehr_lookups',
                queryName: 'buildings',
                sort: 'name',
                filterArray: [LABKEY.Filter.create('dateDisabled', true, LABKEY.Filter.Types.ISBLANK)],
                autoLoad: true
            })
        });

        this.callParent(arguments);

        if (this.pairedWithRoomField)
            this.addRoomListeners();
    },


    addRoomListeners: function(){
        this.on('select', function(field, records){
            if (!records.length)
                return;

            var buildings = [];
            Ext4.Array.forEach(records, function(r){
                buildings.push(r.get('name'));
            }, this);

            var roomField = this.getRoomField();
            roomField.suspendEvents();
            roomField.selectByBuildings(buildings);
            roomField.resumeEvents();
        }, this);

        this.on('render', function(field){
            var val = field.getValue();
            val = Ext4.isArray(val) || !val ? val : [val];

            var roomField = this.getRoomField();
            roomField.suspendEvents();
            roomField.selectByBuildings(val);
            roomField.resumeEvents();
        }, this);
    }
});