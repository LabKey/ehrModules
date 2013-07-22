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
        LABKEY.ExtAdapter.apply(this, {
            expandToFitContent: true,
            queryMode: 'local',
            anyMatch: true,
            store: {
                type: 'labkey-store',
                schemaName: 'ehr_lookups',
                queryName: 'rooms',
                columns: 'room,area',
                sort: 'area,sort_order',
                filterArray: [LABKEY.Filter.create('datedisabled', null, LABKEY.Filter.Types.ISBLANK)],
                autoLoad: true
            },
            valueField: 'room',
            displayField: 'room'
        });

        if (!Ext4.isDefined(this.initialConfig.multiSelect)){
            this.multiSelect = true;
        }

        this.callParent();

        this.on('render', function(field){
            field.el.set({autocomplete: 'off'});
        });
    },

    selectByAreas: function(areas){
        this.store.clearFilter();
        if (!this.rendered){
            this.on('afterrender', function(field){
                field.selectByAreas(areas);
            }, this, {single: true});
        }
        else if (!this.store.getCount()){
            this.store.on('load', function(store){
                this.selectByAreas(areas);
            }, this, {single: true});
        }
        else {
            if (areas && areas.length){
                var values = [];
                this.store.each(function(rec){
                    if (areas.indexOf(rec.get('area')) != -1){
                        values.push(rec.get('room'));
                    }
                }, this);

                this.setValue(values);
            }
        }
    },

    filterByAreas: function(areas){
        this.store.clearFilter();
        if (!this.rendered){
            this.on('afterrender', function(field){
                field.filterByAreas(areas);
            }, this, {single: true});
        }
        else if (!this.store.getCount()){
            this.store.on('load', function(store){
                this.filterByAreas(areas);
            }, this, {single: true});
        }
        else {
            if (areas && areas.length){
                this.store.filterBy(function(rec){
                    return areas.indexOf(rec.get('area')) != -1;
                }, this);
            }
        }
    }
});