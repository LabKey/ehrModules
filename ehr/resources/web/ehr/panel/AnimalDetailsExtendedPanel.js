/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 * 
 * @param subjectId
 */
Ext4.define('EHR.panel.AnimalDetailsExtendedPanel', {
    extend: 'EHR.panel.AnimalDetailsPanel',
    alias: 'widget.ehr-animaldetailsextendedpanel',

    getItems: function(){
        return [{
            layout: 'column',
            defaults: {
                border: false,
                bodyStyle: 'padding-right: 20px;'
            },
            items: [{
                width: 380,
                defaults: {
                    xtype: 'displayfield',
                    labelWidth: this.defaultLabelWidth
                },
                items: [{
                    fieldLabel: 'Id',
                    itemId: 'animalId'
                },{
                    fieldLabel: 'Location',
                    itemId: 'location'
                },{
                    fieldLabel: 'Gender',
                    itemId: 'gender'
                },{
                    fieldLabel: 'Species',
                    itemId: 'species'
                },{
                    fieldLabel: 'Age',
                    itemId: 'age'
                },{
                    fieldLabel: 'Projects / Groups',
                    itemId: 'assignmentsAndGroups'
                }]
            },{
                width: 350,
                defaults: {
                    xtype: 'displayfield'
                },
                items: [{
                    fieldLabel: 'Status',
                    itemId: 'calculated_status'
                },{
                    fieldLabel: 'Flags',
                    itemId: 'flags'
                },{
                    fieldLabel: 'Weight',
                    itemId: 'weights'
                },{
                    xtype: 'ldk-linkbutton',
                    style: 'margin-top: 10px;',
                    scope: this,
                    text: '[Show Full Hx]',
                    handler: function(){
                        if (this.subjectId){
                            EHR.window.ClinicalHistoryWindow.showClinicalHistory(null, this.subjectId, null);
                        }
                        else {
                            console.log('no id');
                        }
                    }
                },{
                    xtype: 'ldk-linkbutton',
                    style: 'margin-top: 5px;',
                    scope: this,
                    text: '[Show Recent SOAPs]',
                    handler: function(){
                        if (this.subjectId){
                            EHR.window.RecentRemarksWindow.showRecentRemarks(this.subjectId);
                        }
                        else {
                            console.log('no id');
                        }
                    }
                },{
                    xtype: 'ldk-linkbutton',
                    style: 'margin-top: 5px;',
                    scope: this,
                    text: '[Manage Treatments]',
                    hidden: EHR.Security.hasClinicalEntryPermission() && !EHR.Security.hasPermission(EHR.QCStates.COMPLETED, 'update', [{schemaName: 'study', queryName: 'Treatment Orders'}]),
                    handler: function(){
                        if (this.subjectId){
                            Ext4.create('EHR.window.ManageTreatmentsWindow', {animalId: this.subjectId}).show();
                        }
                        else {
                            console.log('no id');
                        }
                    }
                },{
                    xtype: 'ldk-linkbutton',
                    style: 'margin-top: 5px;margin-bottom:10px;',
                    scope: this,
                    text: '[Manage Cases]',
                    hidden: EHR.Security.hasClinicalEntryPermission() && !EHR.Security.hasPermission(EHR.QCStates.COMPLETED, 'update', [{schemaName: 'study', queryName: 'Cases'}]),
                    handler: function(){
                        if (this.subjectId){
                            Ext4.create('EHR.window.ManageCasesWindow', {animalId: this.subjectId}).show();
                        }
                        else {
                            console.log('no id');
                        }
                    }
                }]
            }]
        },{
            itemId: 'treatments',
            xtype: 'ehr-snapshotchildpanel',
            headerLabel: 'Current Medications / Prescribed Diets',
            emptyText: 'There are no active medications'
        },{
            itemId: 'caseSummary',
            xtype: 'ehr-snapshotchildpanel',
            headerLabel: 'Case Summary',
            emptyText: 'There are no active cases'
        },{
            xtype: 'button',
            border: true,
            text: 'Reload',
            scope: this,
            handler: function(btn){
                this.loadAnimal(this.subjectId, true);
            }
        }];
    }
});