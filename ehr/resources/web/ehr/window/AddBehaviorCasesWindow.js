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
    templateName: 'BSU Rounds',

    allowNoSelection: true,
    showAssignedVetCombo: false,
    defaultRemark: null
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
