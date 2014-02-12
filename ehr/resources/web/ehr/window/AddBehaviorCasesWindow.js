/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * This window will allow users to query open cases and add records to a task based on them
 */
Ext4.define('EHR.window.AddBehaviorCasesWindow', {
    extend: 'EHR.window.AddClinicalCasesWindow',
    caseCategory: 'Behavior',
    templateName: 'BSU Rounds',

    allowNoSelection: true,
    showAssignedVetCombo: false,

    getCases: function(button){
        var filterArray = this.getCasesFilterArray();
        if (!filterArray || !filterArray.length){
            return;
        }

        Ext4.Msg.wait("Loading...");
        this.hide();

        //find distinct animals matching criteria
        LABKEY.Query.selectRows({
            requiredVersion: 9.1,
            schemaName: 'study',
            queryName: 'cases',
            sort: 'Id', //Id/curlocation/room,Id/curlocation/cage,
            columns: 'Id,objectid,remark',
            filterArray: filterArray,
            scope: this,
            success: this.onSuccess,
            failure: LDK.Utils.getErrorCallback()
        });
    },

    onSuccess: function(results){
        if (!results || !results.rows || !results.rows.length){
            Ext4.Msg.hide();
            Ext4.Msg.alert('', 'No active cases were found.');
            return;
        }

        LDK.Assert.assertNotEmpty('Unable to find targetStore in AddBehaviorCasesWindow', this.targetStore);

        var records = [];
        this.recordData = {
            performedby: this.down('#performedBy').getValue(),
            date: this.down('#date').getValue()
        }

        var ids = [];

        Ext4.Array.each(results.rows, function(sr){
            var row = new LDK.SelectRowsRow(sr);
            ids.push(row.getValue('Id'));

            var obj = {
                Id: row.getValue('Id'),
                date: this.recordData.date,
                category: this.caseCategory,
                s: null,
                o: null,
                a: null,
                p: null,
                caseid: row.getValue('objectid'),
                performedby: this.recordData.performedby
            };

            records.push(this.targetStore.createModel(obj));
        }, this);

        this.targetStore.add(records);

        if (this.obsTemplateId){
            this.applyObsTemplate(records);
        }
        else {
            Ext4.Msg.hide();
        }
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
