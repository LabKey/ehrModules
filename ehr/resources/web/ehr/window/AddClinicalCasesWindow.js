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
    templateName: 'Clinical Rounds',
    templateStoreId: 'Clinical Observations',

    allowNoSelection: false,

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
                    this.allowNoSelection ? '  Leave blank to load all areas.' : '',
                style: 'padding-bottom: 10px;'
            },{
                xtype: 'ehr-areafield',
                itemId: 'areaField'
            },{
                xtype: 'ehr-roomfield',
                itemId: 'roomField'
            },{
                xtype: 'textfield',
                fieldLabel: 'Entered By',
                value: LABKEY.Security.currentUser.displayName,
                itemId: 'performedBy'
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

    getFilterArray: function(){
        var area = this.down('#areaField') ? this.down('#areaField').getValue() : [];
        var rooms = EHR.DataEntryUtils.ensureArray(this.down('#roomField').getValue()) || [];

        if (!this.allowNoSelection && !area && !rooms.length){
            alert('Must provide at least one room or an area');
            return;
        }

        var filterArray = [];

        filterArray.push(LABKEY.Filter.create('isActive', true, LABKEY.Filter.Types.EQUAL));
        filterArray.push(LABKEY.Filter.create('category', this.caseCategory, LABKEY.Filter.Types.EQUAL));

        if (area.length)
            filterArray.push(LABKEY.Filter.create('Id/curLocation/area', area.join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF));

        if (rooms.length)
            filterArray.push(LABKEY.Filter.create('Id/curLocation/room', rooms.join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF));

        return filterArray;
    },

    getCases: function(button){
        var filterArray = this.getFilterArray();
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
            columns: 'Id,objectid,mostRecentP2',
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

        LDK.Assert.assertNotEmpty('Unable to find targetStore in AddClinicalCasesWindow', this.targetStore);

        var records = [];
        var performedby = this.down('#performedBy').getValue();

        var ids = [];
        var date = new Date();

        Ext4.Array.each(results.rows, function(sr){
            var row = new LDK.SelectRowsRow(sr);
            ids.push(row.getValue('Id'));

            var obj = {
                Id: row.getValue('Id'),
                date: date,
                category: 'Clinical',
                s: null,
                o: null,
                a: null,
                p: null,
                p2: row.getValue('mostRecentP2'),
                caseid: row.getValue('objectid'),
                remark: null,
                performedby: performedby
            };

            records.push(this.targetStore.createModel(obj));
        }, this);

        this.targetStore.add(records);

        if (this.obsTemplateId){
            this.applyObsTemplate(ids, date);
        }
        else {
            Ext4.Msg.hide();
        }
    },

    applyObsTemplate: function(ids, date){
        ids = Ext4.Array.unique(ids);
        var records = [];
        Ext4.Array.forEach(ids, function(id){
            records.push({
                Id: id,
                date: date
            });
        }, this);

        EHR.window.ApplyTemplateWindow.loadTemplateRecords(function(recMap){
            if (!recMap || LABKEY.Utils.isEmptyObj(recMap)){
                Ext4.Msg.hide();
                return;
            }

            for (var i in recMap){
                var store = Ext4.StoreMgr.get(i);
                store.add(recMap[i]);
            }

            Ext4.Msg.hide();

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
