Ext4.define('EHR.form.field.RoomFieldSingle', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.ehr-roomfieldsingle',

    caseSensitive: false,
    anyMatch: true,
    displayField: 'room',
    forceSelection: true,

    initComponent: function(){
        var ctx = EHR.Utils.getEHRContext();

        LABKEY.ExtAdapter.apply(this, {
            valueField: 'room',
            queryMode: 'local',
            store: {
                type: 'labkey-store',
                containerPath: ctx ? ctx['EHRStudyContainer'] : null,
                schemaName: 'ehr_lookups',
                queryName: 'rooms',
                columns: 'room,area',
                sort: 'sort_order',
                filterArray: [LABKEY.Filter.create('datedisabled', null, LABKEY.Filter.Types.ISBLANK)],
                autoLoad: true
            }
        });

        this.callParent(arguments);
    }
});