/*
 * Copyright (c) 2013-2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.panel.GeneticCalculationSettingsPanel', {
    extend: 'Ext.panel.Panel',

    initComponent: function(){
        Ext4.apply(this, {
            //width: 550,
            border: false,
            defaults: {
                border: false
            },
            items: [{
                html: 'This page allows admins to schedule a nightly pipeline job that will refresh kinship and other genetic data on the colony.  The boxes below control whether the job is scheduled to run, and the time of day (24-hour clock) when it is scheduled to run.  The containerPath should be the location of the EHR study.',
                style: 'padding-bottom: 20px'
            },{
                xtype: 'displayfield',
                fieldLabel: 'Is Scheduled?',
                itemId: 'isScheduled'
            },{
                xtype: 'checkbox',
                fieldLabel: 'Is Enabled?',
                itemId: 'enabled'
            },{
                xtype: 'checkbox',
                fieldLabel: 'Allow Import During Business Hours?',
                itemId: 'allowImportDuringBusinessHours'
            },{
                xtype: 'checkbox',
                fieldLabel: 'Kinship validation?',
                itemId: 'kinshipValidation',
                listeners: {
                    render: function(c) {
                        Ext4.create('Ext.tip.ToolTip', {
                            target: c.getEl(),
                            html: 'This will iterate pedigree queries to ensure a minimum kinship coefficient exists for parents, ' +
                                    'grandparents, offspring, full-siblings and half-siblings. This can significantly increase the time to ' +
                                    'complete the kinship calculations so should only be used when validating kinship and pedigree.'
                        });
                    }
                }
            },{
                xtype: 'numberfield',
                hideTrigger: true,
                fieldLabel: 'Hour Of Day',
                itemId: 'hourOfDay',
                width: 400
            },{
                xtype: 'textfield',
                fieldLabel: 'Container Path',
                itemId: 'containerPath',
                width: 400
            }],
            buttons: [{
                text: 'Save Settings',
                handler: function(btn){
                    btn.up('panel').saveData();
                }
            },{
                text: 'Run Now',
                scope: this,
                handler: function(btn){
                    window.location = LABKEY.ActionURL.buildURL('ehr', 'doGeneticCalculations');
                }
            },{
                text: 'Cancel',
                scope: this,
                handler: function(btn){
                    window.location = LABKEY.ActionURL.buildURL('project', 'start');
                }
            }]
        });

        this.callParent();
        this.doLoad();
    },

    doLoad: function(){
        Ext4.Msg.wait('Loading...');

        LABKEY.Ajax.request({
            url : LABKEY.ActionURL.buildURL('ehr', 'getGeneticCalculationTaskSettings'),
            method : 'POST',
            scope: this,
            failure: LDK.Utils.getErrorCallback(),
            success: LABKEY.Utils.getCallbackWrapper(this.onDataLoad, this)
        });
    },

    onDataLoad: function(results){
        Ext4.Msg.hide();

        this.down('#isScheduled').setValue(results.isScheduled);
        this.down('#enabled').setValue(results.enabled);
        this.down('#hourOfDay').setValue(results.hourOfDay);
        this.down('#containerPath').setValue(results.containerPath);
        this.down('#kinshipValidation').setValue(results.kinshipValidation);
        this.down('#allowImportDuringBusinessHours').setValue(results.allowImportDuringBusinessHours)
    },

    saveData: function(){
        Ext4.Msg.wait('Saving...');
      LABKEY.Ajax.request({
            url : LABKEY.ActionURL.buildURL('ehr', 'setGeneticCalculationTaskSettings'),
            params: {
                containerPath: this.down('#containerPath').getValue(),
                enabled: this.down('#enabled').getValue(),
                hourOfDay: this.down('#hourOfDay').getValue(),
                kinshipValidation: this.down('#kinshipValidation').getValue(),
                allowImportDuringBusinessHours: this.down('#allowImportDuringBusinessHours').getValue()
            },
            method : 'POST',
            scope: this,
            failure: LDK.Utils.getErrorCallback(),
            success: function(result){
                Ext4.Msg.hide();

                Ext4.Msg.alert('Success', 'Settings Updated', function(){
                    this.doLoad();
                }, this);
            }
        });
    }
});