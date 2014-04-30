/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * This window will allow users to query open cases and add records to a task based on them
 */
Ext4.define('EHR.window.AddBehaviorCasesWindow', {
    extend: 'EHR.window.AddSurgicalCasesWindow',
    caseCategory: 'Behavior',
    templateName: null,

    allowNoSelection: true,
    showAssignedVetCombo: false,
    defaultRemark: 'BSU Rounds Entered',

    //always add single blank obs record
    applyObsTemplate: function(caseRecords){
        var records = [];
        var obsStore = this.targetStore.storeCollection.getClientStoreByName('Clinical Observations');
        LDK.Assert.assertNotEmpty('Unable to find Clinical Observations store', obsStore);

        Ext4.Array.forEach(caseRecords, function(rec){
            records.push(obsStore.createModel({
                Id: rec.get('Id'),
                caseid: rec.get('caseid'),
                date: this.recordData.date,
                performedby: this.recordData.performedby
            }));
        }, this);

        if (records.length){
            obsStore.add(records);
        }

        Ext4.Msg.hide();
        this.close();
    }
});

EHR.DataEntryUtils.registerGridButton('ADDBEHAVIORCASES', function(config){
    return Ext4.Object.merge({
        text: 'Add Open Cases',
        tooltip: 'Click to automatically add animals with open cases',
        handler: function(btn){
            var grid = btn.up('gridpanel');
            if(!grid.store || !grid.store.hasLoaded()){
                console.log('no store or store hasnt loaded');
                return;
            }

            var cellEditing = grid.getPlugin('cellediting');
            if(cellEditing)
                cellEditing.completeEdit();

            Ext4.create('EHR.window.AddBehaviorCasesWindow', {
                targetStore: grid.store
            }).show();
        }
    }, config);
});
