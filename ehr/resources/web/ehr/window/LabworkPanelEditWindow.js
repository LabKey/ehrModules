/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg targetGrid
 * @cfg resultRecord
 */
Ext4.define('EHR.window.LabworkPanelEditWindow', {
    extend: 'Ext.window.Window',

    initComponent: function(){
        Ext4.apply(this, {
            modal: true,
            closeAction: 'destroy',
            width: 500,
            defaults: {
                border: false
            },
            bodyStyle: 'padding: 5px;',
            items: [{
                html: 'This helper allows you to enter the results for one panel worth of data at a time.  It expects you to have already created the result rows, which is most easily done using the \'Copy From Above\' button.',
                style: 'padding-bottom: 10px;'
            },{
                itemId: 'runArea',
                xtype: 'form',
                items: [{
                    html: 'Loading...'
                }]
            }],
            buttons: [{
                text: 'Submit And Close',
                scope: this,
                handler: this.onSubmit
            },{
                text: 'Submit And Next',
                scope: this,
                handler: this.onSubmitAndNext
            },{
                text: 'Cancel',
                handler: function(btn){
                    var win = btn.up('window');
                    if (win.down('form').isDirty()){
                        Ext4.Msg.confirm('Close', 'Closing this window will lose any changes.  Continue?', function(val){
                            if (val == 'yes'){
                                win.close();
                            }
                        }, this);
                    }
                    else {
                        win.close();
                    }
                }
            }]
        });

        this.callParent(arguments);

        LDK.Assert.assertNotEmpty('resultRecord has no runid', this.resultRecord.get('runid'));
        this.bindRun(this.resultRecord);
    },

    onPanelLoad: function(panelMap){
        var target = this.down('#runArea');

        target.removeAll();
        target.add(this.getItemsCfg(this.resultRecord.get('runid'), panelMap));
        this.center();

    },

    getPanelForService: function(runId, callback){
        var clinpathRunRec = this.getClinpathRunRec(runId);
        LDK.Assert.assertNotEmpty('Unable to find clinpathRun record', clinpathRunRec);
        if (!clinpathRunRec){
            Ext4.Msg.alert('Error', 'There was an error finding the panel associated with this record.  Please contact your administrator if you think this is an error.');
            return;
        }

        this.cachedPanels = this.cachedPanels || {};

        var service = clinpathRunRec.get('servicerequested');
        if (this.cachedPanels[service]){
            return callback.call(this, this.cachedPanels[service]);
        }

        LABKEY.Query.selectRows({
            requiredVersion: 9.1,
            schemaName: 'ehr_lookups',
            queryName: 'labwork_panels',
            filterArray: [LABKEY.Filter.create('servicename', service, LABKEY.Filter.Types.EQUAL)],
            scope: this,
            failure: LDK.Utils.getErrorCallback(),
            success: function(results){
                if (results && results.rows && results.rows.length){
                    this.cachedPanels[service] = {};
                    Ext4.Array.forEach(results.rows, function(row){
                        row = new LDK.SelectRowsRow(row);
                        this.cachedPanels[service][row.getValue('testname')] = row.getValue('sortorder');
                    }, this);
                }
                else {
                    this.cachedPanels[service] = {};
                }

                callback.call(this, this.cachedPanels[service]);
            }
        });
    },

    bindNextRun: function(currentRecord){
        var store = this.targetGrid.store;
        var recIdx = store.indexOf(currentRecord);
        recIdx++;

        if (recIdx >= store.getCount()){
            console.log('at end: ' + recIdx);
            return false;
        }

        var currentRunId = currentRecord.get('runid');
        var nextRec;
        while (recIdx < store.getCount()){
            if (store.getAt(recIdx).get('runid') !== currentRunId){
                nextRec = store.getAt(recIdx);
                break;
            }

            recIdx++;
        }

        if (nextRec){
            this.targetGrid.getSelectionModel().select([nextRec]);
            this.bindRun(nextRec);
            return true;
        }

        console.log('not found');
        return false;
    },

    bindRun: function(resultRecord){
        this.resultRecord = resultRecord;

        this.getPanelForService(resultRecord.get('runid'), this.onPanelLoad);
    },

    getClinpathRunRec: function(runId){
        var store = this.targetGrid.store.storeCollection.getClientStoreByName('Clinpath Runs');
        LDK.Assert.assertNotEmpty('Unable to find Clinpath Runs store', store);

        var recIdx = store.findExact('objectid', runId);
        LDK.Assert.assertTrue('Unable to find Clinpath Runs rec with objectid: ' + runId, recIdx != -1);

        if (recIdx != -1)
            return store.getAt(recIdx);
    },

    getItemsCfg: function(runId, panelMap){
        var clinpathRunRec = this.getClinpathRunRec(runId);
        if (!clinpathRunRec){
            return [{
                html: 'There was an error finding the panel associated with this record.  Please contact your administrator if you think this is an error.'
            }];
        }

        var items = [{
            xtype: 'container',
            defaults: {
                border: false
            },
            items: [{
                xtype: 'displayfield',
                fieldLabel: 'Id',
                value: clinpathRunRec.get('Id')
            },{
                xtype: 'displayfield',
                fieldLabel: 'Date',
                value: clinpathRunRec.get('date') ? clinpathRunRec.get('date').format('Y-m-d') : null
            },{
                xtype: 'displayfield',
                fieldLabel: 'Service/Panel',
                value: clinpathRunRec.get('servicerequested')
            },{
                xtype: 'displayfield',
                fieldLabel: 'Panel Remark',
                value: clinpathRunRec.get('remark')
            }]
        }];

        var tableItems = [{
            xtype: 'displayfield',
            value: 'Test Id'
        },{
            xtype: 'displayfield',
            value: 'Result'
        },{
            xtype: 'displayfield',
            value: 'Remark'
        }];

        this.records = [];
        this.targetGrid.store.each(function(rec){
            if (rec.get('runid') != runId){
                return;
            }

            this.records.push(rec);
        }, this);

        //sort records by panel sort
        this.records = this.records.sort(function(a, b){
            var a1 = panelMap[a.get('testid')] ? panelMap[a.get('testid')] : 999;
            var b1 = panelMap[b.get('testid')] ? panelMap[b.get('testid')] : 999;

            return a1 > b1 ? 1 :
                    a1 < b1 ? -1 : 0;
        });


        Ext4.Array.forEach(this.records, function(rec){
            Ext4.Array.forEach(['testid', 'result', 'remark'], function(fieldName){
                var meta = this.targetGrid.store.getFields().get(fieldName);
                var fieldCfg = EHR.model.DefaultClientModel.getFieldConfig(meta, this.targetGrid.formConfig.configSources);
                var editor = EHR.DataEntryUtils.getFormEditorConfig(fieldCfg);

                editor.value = rec.get(fieldName);
                editor.fieldName = fieldName;
                delete editor.width;
                delete editor.height;
                delete editor.fieldLabel;
                editor.width = 100;

                if (fieldName == 'testid'){
                    editor.xtype = 'displayfield'
                }
                else if (fieldName == 'remark'){
                    editor.xtype = 'textfield';
                    editor.width = 200;
                }

                tableItems.push(editor);
            }, this);
        }, this);

        items.push({
            border: false,
            layout: {
                type: 'table',
                columns: 3
            },
            defaults: {
                border: false,
                style: 'margin-right: 5px;'
            },
            items: tableItems
        });

        return items;
    },

    onSubmit: function(){
        this.saveResults();
        this.close();
    },

    saveResults: function(){
        var resultFields = this.query('field[fieldName=result]');
        var remarkFields = this.query('field[fieldName=remark]');

        Ext4.Array.forEach(this.records, function(r, recIdx){
            var result = resultFields[recIdx].getValue();
            var remark = remarkFields[recIdx].getValue();

            r.beginEdit();
            r.set({
                result: result,
                remark: remark
            });
            r.endEdit(true);
        }, this);

        this.targetGrid.store.fireEvent('datachanged', this.targetGrid.store);
        this.targetGrid.getView().refresh();
    },

    onSubmitAndNext: function(){
        this.saveResults();

        if (this.bindNextRun(this.resultRecord) === false){
            Ext4.Msg.alert('', 'There are no more panels');
            this.close();
        }
    }
});

EHR.DataEntryUtils.registerGridButton('EDIT_AS_PANEL', function(config){
    return Ext4.Object.merge({
        text: 'Edit As Panel',
        tooltip: 'Click to edit all the results for one panel at once',
        handler: function(btn){
            var grid = btn.up('gridpanel');
            var selected = grid.getSelectionModel().getSelection();
            if (!selected || selected.length != 1){
                Ext4.Msg.alert('Error', selected.length ? 'Only one record can be selected' : 'Must select a record');
                return;
            }

            LDK.Assert.assertNotEmpty('Unable to find runId for record', selected[0].get('runid'));

            Ext4.create('EHR.window.LabworkPanelEditWindow', {
                targetGrid: grid,
                resultRecord: selected[0]
            }).show();
        }
    }, config);
});