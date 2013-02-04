Ext4.define('EHR.form.field.RoomField', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.ehr-roomfield',
    fieldLabel: 'Room',
    initComponent: function(){
        Ext4.apply(this, {
            multiSelect: true,
            store: {
                type: 'labkey-store',
                schemaName: 'ehr_lookups',
                queryName: 'rooms',
                columns: 'room,area',
                filterArray: [LABKEY.Filter.create('datedisabled', null, LABKEY.Filter.Types.ISBLANK)],
                autoLoad: true
            },
            valueField: 'room',
            displayField: 'room'
        });
        this.callParent();

        this.on('render', function(field){
            field.el.set({autocomplete: 'off'});
        });
    },

    filterbyAreas: function(areas){
        this.store.clearFilter();
        if (areas && areas.length){
            this.store.filterBy(function(rec){
                return areas.indexOf(rec.get('area')) != -1;
            }, this);
        }
    }
});