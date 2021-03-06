/*
 * Copyright (c) 2013-2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.form.field.RoomFieldSingle', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.ehr-roomfieldsingle',

    caseSensitive: false,
    anyMatch: true,
    displayField: 'room',
    forceSelection: true,
    columns: 'room,area',

    initComponent: function(){
        var ctx = EHR.Utils.getEHRContext();

        Ext4.apply(this, {
            valueField: 'room',
            queryMode: 'local',
            store: {
                type: 'labkey-store',
                containerPath: ctx ? ctx['EHRStudyContainer'] : null,
                schemaName: 'ehr_lookups',
                queryName: 'rooms',
                columns: this.columns,
                sort: 'room_sortValue',
                filterArray: [LABKEY.Filter.create('datedisabled', null, LABKEY.Filter.Types.ISBLANK)],
                autoLoad: true
            },
            plugins: ['ldk-usereditablecombo']
        });

        this.callParent(arguments);
    }
});