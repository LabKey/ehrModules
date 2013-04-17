/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.panel.MiniSnapshotPanel', {
    extend: 'EHR.panel.SnapshotPanel',
    alias: 'widget.ehr-minisnapshotpanel',

    initComponent: function(){


        this.callParent();
    },

    getItems: function(){
        return [{
            border: false,
            defaults: {
                border: false
            },
            items: [{
                html: '<b>Summary:</b><hr>'
            },{
                bodyStyle: 'padding: 5px;',
                layout: 'column',
                defaults: {
                    border: false
                },
                items: [{
                    columnWidth: 0.5,
                    defaults: {
                        labelWidth: 170,
                        width: 400,
                        style: 'margin-right: 20px;'
                    },
                    items: [{
                        xtype: 'displayfield',
                        fieldLabel: 'Location',
                        itemId: 'location'
                    },{
                        xtype: 'displayfield',
                        fieldLabel: '# Animals In Cage',
                        itemId: 'roommates'
                    },{
                        xtype: 'displayfield',
                        fieldLabel: 'Status',
                        itemId: 'calculated_status'
                    },{
                        xtype: 'displayfield',
                        fieldLabel: 'Gender',
                        itemId: 'gender'
                    },{
                        xtype: 'displayfield',
                        fieldLabel: 'Species',
                        itemId: 'species'
                    },{
                        xtype: 'displayfield',
                        fieldLabel: 'Geographic Origin',
                        itemId: 'geographic_origin'
                    },{
                        xtype: 'displayfield',
                        fieldLabel: 'Age',
                        itemId: 'age'
                    }]
                },{
                    columnWidth: 0.5,
                    defaults: {
                        labelWidth: 170,
                        width: 450,
                        style: 'margin-right: 20px;'
                    },
                    items: [{
                        xtype: 'displayfield',
                        fieldLabel: 'Birth',
                        itemId: 'birth'
                    },{
                        xtype: 'displayfield',
                        fieldLabel: 'Death',
                        itemId: 'death'
                    },{
                        xtype: 'displayfield',
                        fieldLabel: 'Dam',
                        itemId: 'dam'
                    },{
                        xtype: 'displayfield',
                        fieldLabel: 'Sire',
                        itemId: 'sire'
                    },{
                        xtype: 'displayfield',
                        fieldLabel: 'Last TB Date',
                        itemId: 'lastTB'
                    },{
                        xtype: 'displayfield',
                        fieldLabel: 'Current Weight (kg)',
                        itemId: 'currentWeight'
                    },{
                        xtype: 'displayfield',
                        fieldLabel: 'Weight Date',
                        itemId: 'weightDate'
                    }]
                }]
            },{
                itemId: 'flags',
                xtype: 'ehr-snapshotchildpanel',
                headerLabel: 'Active Flags'
            },{
                itemId: 'cases',
                xtype: 'ehr-snapshotchildpanel',
                headerLabel: 'Open Cases',
                emptyText: 'There are no open cases',
                style: 'padding-top: 5px;',
                renderCollapsed: true
            },{
                itemId: 'problems',
                xtype: 'ehr-snapshotchildpanel',
                headerLabel: 'Open Problems',
                emptyText: 'There are no open problems',
                style: 'padding-top: 5px;',
                renderCollapsed: true
            },{
                itemId: 'assignments',
                xtype: 'ehr-snapshotchildpanel',
                headerLabel: 'Active Assignments',
                emptyText: 'There are no active assignments',
                style: 'padding-top: 5px;',
                renderCollapsed: true
            },{
                itemId: 'treatments',
                xtype: 'ehr-snapshotchildpanel',
                headerLabel: 'Current Medications',
                emptyText: 'There are no active medications',
                style: 'padding-top: 5px;',
                renderCollapsed: true
            },{
                itemId: 'diet',
                xtype: 'ehr-snapshotchildpanel',
                headerLabel: 'Special Diets',
                emptyText: 'There are no active special diets',
                style: 'padding-top: 5px;',
                renderCollapsed: true
            }]
        }];
    }
});
