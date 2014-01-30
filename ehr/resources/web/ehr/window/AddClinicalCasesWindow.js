/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * This window will allow users to query open cases and add records to a task based on them
 */
Ext4.define('EHR.window.AddClinicalCasesWindow', {
    extend: 'Ext.window.Window',
    caseCategory: 'Clinical',
    templateName: 'Limited Visual Exam',
    templateStoreId: 'Clinical Observations',

    allowNoSelection: false,
    allowReviewAnimals: true,

    initComponent: function(){
        LABKEY.ExtAdapter.applyIf(this, {
            modal: true,
            closeAction: 'destroy',
            title: 'Add Open ' + this.caseCategory + ' Cases',
            border: true,
            bodyStyle: 'padding: 5px',
            width: 350,
            defaults: {
                width: 330,
                border: false
            },
            items: [{
                html: 'This helper allows you to query open cases and add records for these animals.' +
                    (this.allowNoSelection ? '  Leave blank to load all areas.' : ''),
                style: 'padding-bottom: 10px;'
            },{
                xtype: 'ehr-areafield',
                itemId: 'areaField'
            },{
                xtype: 'ehr-roomfield',
                itemId: 'roomField'
            },{
                xtype: 'xdatetime',
                fieldLabel: 'Date',
                value: new Date(),
                itemId: 'date'
            },{
                xtype: 'textfield',
                fieldLabel: 'Entered By',
                value: LABKEY.Security.currentUser.displayName,
                itemId: 'performedBy'
            },{
                xtype: 'checkbox',
                hidden: !this.allowReviewAnimals,
                fieldLabel: 'Review Animals First',
                itemId: 'reviewAnimals'
            }],
            buttons: [{
                text:'Submit',
                itemId: 'submitBtn',
                scope: this,
                handler: this.getCases
            },{
                text: 'Close',
                scope: this,
                handler: function(btn){
                    btn.up('window').close();
                }
            }]
        });

        this.callParent(arguments);

        LABKEY.Query.selectRows({
            schemaName: 'ehr',
            queryName: 'formtemplates',
            filterArray: [
                LABKEY.Filter.create('title', this.templateName),
                LABKEY.Filter.create('formtype', 'Clinical Observations'),
                LABKEY.Filter.create('category', 'Section')
            ],
            scope: this,
            success: function(results){
                LDK.Assert.assertTrue('Unable to find template: ' + this.templateName, results.rows && results.rows.length == 1);

                this.obsTemplateId = results.rows[0].entityid;
            },
            failure: LDK.Utils.getErrorCallback()
        });
    },

    getCasesFilterArray: function(){
        var filterArray = this.getBaseFilterArray();
        if (!filterArray)
            return;

        filterArray.push(LABKEY.Filter.create('isActive', true, LABKEY.Filter.Types.EQUAL));
        filterArray.push(LABKEY.Filter.create('category', this.caseCategory, LABKEY.Filter.Types.EQUAL));
        return filterArray;
    },

    getBaseFilterArray: function(){
        var area = this.down('#areaField').getValue() || [];
        var rooms = EHR.DataEntryUtils.ensureArray(this.down('#roomField').getValue()) || [];

        if (!this.allowNoSelection && !area.length && !rooms.length){
            Ext4.Msg.alert('Error', 'Must provide at least one room or an area');
            return;
        }

        var filterArray = [];

        if (area.length)
            filterArray.push(LABKEY.Filter.create('Id/curLocation/area', area.join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF));

        if (rooms.length)
            filterArray.push(LABKEY.Filter.create('Id/curLocation/room', rooms.join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF));

        return filterArray;
    },

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
            sort: 'Id/curlocation/room,Id/curlocation/cage,Id',
            columns: 'Id,objectid,mostRecentP2,Id/Utilization/use',
            filterArray: filterArray,
            scope: this,
            success: this.onSuccess,
            failure: LDK.Utils.getErrorCallback()
        });
    },

    onSuccess: function(results){
        if (!results || !results.rows || !results.rows.length){
            Ext4.Msg.hide();
            this.close();
            Ext4.Msg.alert('', 'No active cases were found.');
            return;
        }

        LDK.Assert.assertNotEmpty('Unable to find targetStore in AddClinicalCasesWindow', this.targetStore);

        var records = [];
        this.recordData = {
            performedby: this.down('#performedBy').getValue(),
            date: this.down('#date').getValue()
        }

        var idMap = {};

        Ext4.Array.each(results.rows, function(sr){
            var row = new LDK.SelectRowsRow(sr);
            idMap[row.getValue('Id')] = row;

            var obj = {
                Id: row.getValue('Id'),
                date: this.recordData.date,
                category: 'Clinical',
                s: null,
                o: null,
                a: null,
                p: null,
                p2: row.getValue('mostRecentP2'),
                caseid: row.getValue('objectid'),
                remark: null,
                performedby: this.recordData.performedby
            };

            records.push(this.targetStore.createModel(obj));
        }, this);

        if (this.down('#reviewAnimals').getValue()){
            this.doReviewAnimals(records, idMap);
        }
        else {
            this.addRecords(records);
        }
    },

    doReviewAnimals: function(caseRecords, idMap){
        var toAdd = [{
            html: 'Id'
        },{
            html: 'Projects/Groups'
        },{
            html: 'Include'
        }];

        Ext4.Array.forEach(caseRecords, function(rec){
            var ar = idMap[rec.get('Id')];

            toAdd.push({
                html: rec.get('Id')
            });

            toAdd.push({
                html: ar.getDisplayValue('Id/Utilization/use') ? ar.getDisplayValue('Id/Utilization/use') : 'None'
            });

            toAdd.push({
                xtype: 'checkbox',
                record: rec,
                checked: true
            });
        }, this);

        Ext4.Msg.hide();
        Ext4.create('Ext.window.Window', {
            title: 'Choose Animals To Add',
            ownerWindow: this,
            closeAction: 'destroy',
            width: 450,
            modal: true,
            items: [{
                border: false,
                bodyStyle: 'padding: 5px;',
                defaults: {
                    border: false,
                    style: 'margin-right: 10px;'
                },
                maxHeight: Ext4.getBody().getHeight() * 0.8,
                autoScroll: true,
                layout: {
                    type: 'table',
                    columns: 3
                },
                items: toAdd
            }],
            buttons: [{
                xtype: 'button',
                text: 'Submit',
                scope: this,
                handler: this.onSubmit
            },{
                xtype: 'button',
                text: 'Cancel',
                handler: function(btn){
                    btn.up('window').close();
                }
            }]
        }).show();
    },

    onSubmit: function(btn){
        var win = btn.up('window');
        var cbs = win.query('checkbox');

        var records = [];
        Ext4.Array.forEach(cbs, function(cb){
            if (cb.getValue()){
                records.push(cb.record);
            }
        }, this);

        win.close();

        if (records.length){
            Ext4.Msg.wait('Loading...');
            this.addRecords(records);
        }
        else {
            win.ownerWindow.close();
        }
    },

    addRecords: function(records){
        this.targetStore.add(records);

        if (this.obsTemplateId){
            this.applyObsTemplate(records);
        }
        else {
            Ext4.Msg.hide();
            this.close();
        }
    },

    applyObsTemplate: function(caseRecords){
        var records = [];
        Ext4.Array.forEach(caseRecords, function(rec){
            records.push({
                Id: rec.get('Id'),
                caseid: rec.get('caseid'),
                date: this.recordData.date,
                performedby: this.recordData.performedby
            });
        }, this);

        EHR.window.ApplyTemplateWindow.loadTemplateRecords(function(recMap){
            if (!recMap || LABKEY.Utils.isEmptyObj(recMap)){
                Ext4.Msg.hide();
                this.close();
                return;
            }

            for (var i in recMap){
                var store = Ext4.StoreMgr.get(i);
                store.add(recMap[i]);
            }

            Ext4.Msg.hide();
            this.close();

        }, this, this.targetStore.storeCollection, this.obsTemplateId, records);
    }
});

EHR.DataEntryUtils.registerGridButton('ADDCLINICALCASES', function(config){
    return Ext4.Object.merge({
        text: 'Add Open Cases',
        tooltip: 'Click to automatically add SOAP notes based on open cases',
        handler: function(btn){
            var grid = btn.up('gridpanel');
            if(!grid.store || !grid.store.hasLoaded()){
                console.log('no store or store hasnt loaded');
                return;
            }

            var cellEditing = grid.getPlugin('cellediting');
            if(cellEditing)
                cellEditing.completeEdit();

            Ext4.create('EHR.window.AddClinicalCasesWindow', {
                targetStore: grid.store
            }).show();
        }
    }, config);
});
