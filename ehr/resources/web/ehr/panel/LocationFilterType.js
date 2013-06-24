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
            html: 'Search By Location:<br><i>(Note: when you select an area, the corresponding rooms will be selected in the room field.)</i>'
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
                xtype: 'checkcombo',
                expandToFitContent: true,
                addAllSelector: true,
                nullCaption: '[Blank]',
                editable: false,
                fieldLabel: 'Area',
                multiSelect: true,
                displayField:'area',
                valueField: 'area',
                typeAhead: true,
                queryMode: 'local',
                store: Ext4.create('LABKEY.ext4.Store', {
                    schemaName: 'ehr_lookups',
                    queryName: 'areas',
                    sort: 'area',
                    autoLoad: true
                }),
                itemId: 'areaField',
                listeners: {
                    select: function(field, records){
                        if (!records.length)
                            return;

                        var areas = [];
                        Ext4.Array.forEach(records, function(r){
                            areas.push(r.get('area'));
                        }, this);

                        var roomField = field.up('panel').down('#roomField');
                        roomField.suspendEvents();
                        roomField.selectByAreas(areas);
                        roomField.resumeEvents();
                    },
                    render: function(field){
                        var val = field.getValue();
                        val = Ext4.isArray(val) || !val ? val : [val];

                        var roomField = field.up('panel').down('#roomField');
                        roomField.suspendEvents();
                        roomField.selectByAreas(val);
                        roomField.resumeEvents();
                    }
                },
                value: ctx.area ? ctx.area.split(',') :  null
            },{
                xtype: 'ehr-roomfield',
                itemId: 'roomField',
                fieldLabel: 'Room',
                value: ctx.room ? ctx.room.split(',') :  null,
                listeners: {
                    change: function(field){
                        var areaField = field.up('panel').down('#areaField');
                        areaField.reset();
                    }
                }
            },{
                xtype: 'ehr-cagefield',
                itemId: 'cageField',
                fieldLabel: 'Cage',
                value: ctx.cage
            }]
        });

        return toAdd;
    },

    getFilters: function(){
        var obj = {
            area: this.down('#areaField').getValue(),
            room: this.down('#roomField').getValue(),
            cage: this.down('#cageField').getValue()
        };

        for (var key in obj){
            if (Ext4.isArray(obj[key]))
                obj[key] = obj[key].join(',')
        }

        return obj;
    },

    getFilterArray: function(tab, subject){
        var filterArray = {
            removable: [],
            nonRemovable: []
        };

        var areaFieldName = tab.report.areaFieldName;
        var roomFieldName = tab.report.roomFieldName;
        var cageFieldName = tab.report.cageFieldName;

        if (!areaFieldName || !roomFieldName || !cageFieldName){
            Ext4.Msg.alert('Error', 'This report does provide an area, room and cage field');
            return;
        }

        var roomField = this.down('#roomField');
        var room = this.down('#roomField').getValue();
        if(Ext4.isArray(room)){
            room = room.join(';');
        }

        var cage = this.down('#cageField').getValue();
        var areaField = this.down('#areaField');
        var area = areaField.getValue();
        if(Ext4.isArray(area)){
            area = area.join(';');
        }

        //rooms always relate to a specific area.  if we're filtering on room, omit the area
        if(area && !room){
            filterArray.nonRemovable.push(LABKEY.Filter.create(areaFieldName, area, LABKEY.Filter.Types.EQUALS_ONE_OF));
        }

        if(room){
            filterArray.nonRemovable.push(LABKEY.Filter.create(roomFieldName, room, LABKEY.Filter.Types.EQUALS_ONE_OF));
        }

        if(cage){
            filterArray.nonRemovable.push(LABKEY.Filter.create(cageFieldName, cage, LABKEY.Filter.Types.EQUAL));
        }

        return filterArray;
    },

    validateReport: function(report){
        var areaFieldName = report.areaFieldName;
        var roomFieldName = report.roomFieldName;
        var cageFieldName = report.cageFieldName;

        if (!areaFieldName || !roomFieldName || !cageFieldName){
            return 'This report cannot be used with the selected filter type, because the report does not contain area, room and/or cage fields';
        }

        return null;
    },

    checkValid: function(){
        if(!this.down('#roomField').getValue() && !this.down('#areaField').getValue()){
            alert('Error: Must Enter A Room or Area');
            return false;
        }

        return true;
    },

    getTitle: function(){
        var title = [];

        var room = this.down('#roomField').getValue();
        if (Ext4.isArray(room)){
            if (room.length < 8)
                room = room.join(', ');
            else
                room = 'multiple rooms selected';
        }

        var cage = this.down('#cageField').getValue();

        var area = this.down('#areaField').getValue();
        area = Ext4.isArray(area) ? area.join(', ') : area;

        //see note in getFilterArray() about area/room
        if (area && !room)
            title.push('Area: ' + area);

        if (room)
            title.push('Room: ' + room);

        if (cage)
            title.push('Cage: ' + cage);

        return title.join(', ');
    }
});