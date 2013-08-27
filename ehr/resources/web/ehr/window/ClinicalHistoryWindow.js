/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg subjectId
 * @cfg minDate
 */
Ext4.define('EHR.window.ClinicalHistoryWindow', {
    extend: 'Ext.window.Window',
    alias: 'widget.ehr-clinicalhistorywindow',

    initComponent: function(){
        LABKEY.ExtAdapter.apply(this, {
            title: 'Clinical History:',
            bodyStyle: 'padding: 3px;',
            width: 1210,
            modal: true,
            closeAction: 'destroy',
            items: this.getItems(),
            buttons: [{
                text: 'Close',
                handler: function(btn){
                    btn.up('window').close();
                }
            },{
                text: 'Full Screen',
                scope: this,
                handler: function(btn){
                    window.location = LABKEY.ActionURL.buildURL('ehr', 'clinicalManagement', null, {subjectId: this.subjectId})
                }
            },{
                text: 'Actions',
                menu: [{
                    text: 'Enter Remark',
                    handler: function(btn){
                        Ext4.Msg.alert('Enter Remark', 'Because we still use IRIS, we are not doing any data entry through PRIMe.  Once we start this migration, it will be possible to enter remarks, order treatments, etc. from these screens.')
                    }
                },{
                    text: 'Order Diet/Medications',
                    handler: function(btn){
                        Ext4.Msg.alert('Order Medications', 'Because we still use IRIS, we are not doing any data entry through PRIMe.  Once we start this migration, it will be possible to enter remarks, order treatments, etc. from these screens.')
                    }
                }]
            }]

        });

        this.callParent(arguments);
    },

    getItems: function(){
        return [{
            xtype: 'ehr-smallformsnapshotpanel',
            subjectId: this.subjectId,
            hideHeader: true,
            style: 'padding: 5px;'
        },{
            xtype: 'tabpanel',
            items: [{
                xtype: 'ehr-clinicalhistorypanel',
                title: 'History',
                border: true,
                width: 1180,
                gridHeight: 400,
                height: 400,
                autoLoadRecords: true,
                autoScroll: true,
                subjectId: this.subjectId,
                minDate: this.minDate || Ext4.Date.add(new Date(), Ext4.Date.YEAR, -2)
            },{
                xtype: 'ehr-weightgraphpanel',
                title: 'Weights',
                subjectId: this.subjectId,
                width: 1180,
                border: true
            }]
        }];
    }
});