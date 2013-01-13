/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.panel.LocationFilterType', {
    extend: 'LDK.panel.AbstractFilterType',
    alias: 'widget.ehr-locationfiltertype',

    initComponent: function(){
        this.items = this.getItems();

        this.callParent();
    },

    statics: {
        filterName: 'roomCage',
        label: 'Current Location'
    },

    getItems: function(){
        var toAdd = [];
        var ctx = this.filterContext;

        toAdd.push({
            width: 200,
            html: 'Search By Location:<br><i>(enter multiple rooms by separating with commas or whitespace. Note: you must enter the entire cage #, such as 0001)</i>'
        });

        toAdd.push({
            xtype: 'panel',
            defaults: {
                border: false,
                width: 200,
                labelWidth: 90,
                labelAlign: 'top'
            },
            keys: [{
                key: Ext4.EventObject.ENTER,
                handler: this.tabbedReportPanel.onSubmit,
                scope: this.tabbedReportPanel
            }],
            items: [{
                xtype: 'labkey-combo',
                emptyText:'',
                fieldLabel: 'Area',
                displayField:'area',
                valueField: 'area',
                typeAhead: true,
                queryMode: 'local',
                editable: false,
                store: Ext4.create('LABKEY.ext4.Store', {
                    schemaName: 'ehr_lookups',
                    queryName: 'areas',
                    sort: 'area',
                    autoLoad: true
                }),
                itemId: 'areaField',
                value: ctx.area
            },{
                xtype: 'textfield',
                itemId: 'roomField',
                fieldLabel: 'Room',
                listeners: {
                    render: function(field){
                        field.el.set({autocomplete: 'off'});
                    }
                },
                value: ctx.room
            },{
                xtype: 'textfield',
                itemId: 'cageField',
                fieldLabel: 'Cage',
                listeners: {
                    scope: this,
                    change: function(field, val){
                        if(val && !isNaN(val)){
                            var newVal = EHR.Utils.padDigits(val, 4);
                            if(val != newVal)
                                field.setValue(newVal);
                        }
                    },
                    render: function(field){
                        field.el.set({autocomplete: 'off'});
                    }
                },
                value: ctx.cage
            }]
        });

        return toAdd;
    },

    getFilters: function(){
        return {
            area: this.down('#areaField').getValue(),
            room: this.down('#roomField').getValue(),
            cage: this.down('#cageField').getValue()
        };
    },

    getFilterArray: function(tab, subject){
        var filterArray = {
            removable: [],
            nonRemovable: []
        };

        var roomField = this.down('#roomField');
        var room = this.down('#roomField').getValue();
        if(room){
            room = room.replace(/[\s,;]+/g, ';');
            room = room.replace(/(^;|;$)/g, '');
            room = room.toLowerCase();
            roomField.setValue(room);
        }

        var cage = this.down('#cageField').getValue();
        var area = this.down('#areaField').getValue();

        if(area){
            if(tab.rowData.get("queryhaslocation")){
                filterArray.nonRemovable.push(LABKEY.Filter.create('room/area', area, LABKEY.Filter.Types.STARTS_WITH));
            }
            else {
                filterArray.nonRemovable.push(LABKEY.Filter.create('Id/curLocation/area', area, LABKEY.Filter.Types.EQUAL));
            }
        }

        if(room){
            if(tab.rowData.get("queryhaslocation")){
                filterArray.nonRemovable.push(LABKEY.Filter.create('room', room, LABKEY.Filter.Types.EQUALS_ONE_OF));
            }
            else {
                filterArray.nonRemovable.push(LABKEY.Filter.create('Id/curLocation/room', room, LABKEY.Filter.Types.EQUALS_ONE_OF));
            }
        }

        if(cage){
            if(tab.rowData.get("queryhaslocation")){
                filterArray.nonRemovable.push(LABKEY.Filter.create('cage', cage, LABKEY.Filter.Types.STARTS_WITH));
            }
            else {
                filterArray.nonRemovable.push(LABKEY.Filter.create('Id/curLocation/cage', cage, LABKEY.Filter.Types.EQUAL));
            }
        }

        return filterArray;
    },

    checkValid: function(){
        if(!this.down('#roomField').getValue() && !this.down('#areaField').getValue()){
            alert('Error: Must Enter A Room or Area');
            return false;
        }

        return true;
    }
});