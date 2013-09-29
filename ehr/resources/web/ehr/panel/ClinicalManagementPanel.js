/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg subjectId
 * @cfg minDate
 */
Ext4.define('EHR.panel.ClinicalManagementPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ehr-clinicalmanagementpanel',

    statics: {
        getActionMenu: function(animalId){
            return [{
                text: 'Manage Treatments',
                disabled: !EHR.Security.hasPermission(EHR.QCStates.COMPLETED, 'update', [{schemaName: 'study', queryName: 'Treatment Orders'}]),
                scope: this,
                handler: function(btn){
                    Ext4.create('EHR.window.ManageTreatmentsWindow', {
                        animalId: animalId
                    }).show(btn);
                }
            },{
                text: 'Manage Cases',
                disabled: !EHR.Security.hasPermission(EHR.QCStates.COMPLETED, 'update', [{schemaName: 'study', queryName: 'Cases'}]),
                scope: this,
                handler: function(btn){
                    Ext4.create('EHR.window.ManageCasesWindow', {
                        animalId: animalId
                    }).show(btn);
                }
            },{
                text: 'Enter Remark/Observations',
                disabled: !EHR.Security.hasPermission(EHR.QCStates.IN_PROGRESS, 'insert', [{schemaName: 'study', queryName: 'Clinical Remarks'}]),
                scope: this,
                handler: function(btn){
                    Ext4.create('EHR.window.EnterRemarkWindow', {
                        animalId: animalId,
                        mode: 'Clinical'
                    }).show(btn);
                }
            }]
        }
    },

    initComponent: function(){
        LABKEY.ExtAdapter.apply(this, {
            bodyStyle: 'padding: 3px;',
            border: false,
            items: this.getItems(),
            buttonAlign: 'left',
            buttons: [{
                text: 'Close',
                handler: function(btn){
                    //btn.up('window').close();
                    window.location = LABKEY.ActionURL.buildURL('project', 'home');
                }
            },{
                text: 'Actions',
                menu: EHR.panel.ClinicalManagementPanel.getActionMenu(this.subjectId)
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
//TODO: restore
//        },{
//            xtype: 'tabpanel',
//            items: [{
//                xtype: 'ehr-clinicalhistorypanel',
//                title: 'History',
//                border: true,
//                width: 1180,
//                gridHeight: 400,
//                height: 400,
//                autoLoadRecords: true,
//                autoScroll: true,
//                subjectId: this.subjectId,
//                minDate: this.minDate || Ext4.Date.add(new Date(), Ext4.Date.YEAR, -2)
//            },{
//                xtype: 'ehr-weightgraphpanel',
//                title: 'Weights',
//                subjectId: this.subjectId,
//                width: 1180,
//                border: true
//            }]
        }];
    }
});