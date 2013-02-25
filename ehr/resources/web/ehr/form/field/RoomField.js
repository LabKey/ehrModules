/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.form.field.RoomField', {
    extend: 'Ext.ux.CheckCombo',
    alias: 'widget.ehr-roomfield',
    fieldLabel: 'Room',
    initComponent: function(){
        Ext4.apply(this, {
            multiSelect: true,
            expandToFitContent: true,
            addAllSelector: true,
            nullCaption: '[Blank]',
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

    filterByAreas: function(areas){
        if (!this.rendered){
            this.on('afterrender', function(field){
                field.filterByAreas(areas);
            }, this);
        }
        else if (!this.store.getCount()){
            this.store.on('load', function(store){
                this.filterByAreas(areas);
            }, this);
        }
        else {
            this.store.clearFilter();
            if (areas && areas.length){
                this.store.filterBy(function(rec){
                    return areas.indexOf(rec.get('area')) != -1;
                }, this);
            }
        }
    }
});