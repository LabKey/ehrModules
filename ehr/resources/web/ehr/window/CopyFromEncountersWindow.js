/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg dataEntryPanel
 * @cfg runsStore
 * @cfg [] targetTabs
 */
Ext4.define('EHR.window.CopyFromEncountersWindow', {
    extend: 'Ext.window.Window',

    initComponent: function(){
        LABKEY.ExtAdapter.applyIf(this, {
            modal: true,
            width: 750,
            closeAction: 'destroy',
            title: 'Copy From Above',
            bodyStyle: 'padding: 5px;',
            defaults: {
                border: false
            },
            items: [{
                html: 'This helper allows you to populate expected rows based on the procedures requested above.  A list of the procedures and expected values are below.',
                style: 'margin-bottom: 10px;'
            },{
                itemId: 'services',
                html: 'Loading...'
            }],
            buttons: [{
                text: 'Submit',
                itemId: 'submitBtn',
                disabled: true,
                scope: this,
                handler: this.onSubmit
            },{
                text: 'Close',
                handler: function(btn){
                    btn.up('window').close();
                }
            }]
        });

        if (!this.targetTabs){
            this.targetTabs = [];
            Ext4.each(this.dataEntryPanel.formConfig.sections, function(s){
                if (this.tableNameMap[s.name]){
                    var item = this.dataEntryPanel.getSectionByName(s.name);
                    LDK.Assert.assertNotEmpty('Unable to find panel: ' + s.name, item);
                    if (item != null)
                        this.targetTabs.push(item);
                }
            }, this);
        }

        this.inferPanels();

        this.callParent();

        this.on('beforeshow', function(){
            if (!this.procedureRecords.length){
                Ext4.Msg.alert('No Records', 'There are no available procedures, nothing to add');
                return false;
            }
        }, this);
    },

    inferPanels: function(){
        this.procedureRecords = this.getProcedureRecords();
        if (!this.procedureRecords.length){
            return;
        }

        var services = {};
        Ext4.Array.forEach(this.procedureRecords, function(r){
            services[r.get('procedureid')] = true;
        }, this);

        this.loadServices(Ext4.Object.getKeys(services));
    },

    getProcedureRecords: function(){
        var records = [];
        this.encountersStore.each(function(r){
            if (r.get('Id') && r.get('date') && r.get('procedureid')){
                records.push(r);
            }
        }, this);

        return records;
    },

    getExistingParentIds: function(){
        var keys = {};
        Ext4.Array.forEach(this.targetTabs, function(tab){
            keys[tab.formConfig.name] = {};
            tab.store.each(function(r){
                if (r.get('parentid'))
                    keys[tab.formConfig.name][r.get('parentid')] = true;
            }, this);
        }, this);

        return keys
    },

    tableNameMap: {
        'Drug Administration': {
            queryName: 'procedure_default_treatments',
            columns: 'procedureid,code,qualifier,route,frequency,volume,vol_units,dosage,dosage_units,concentration,conc_units,amount,amount_units'
        },
        'miscCharges': {
            queryName: 'procedure_default_charges',
            columns: 'procedureid,chargeid,quantity'
        },
        flags: {
            queryName: 'procedure_default_flags',
            columns: 'procedureid,flag,value',
            targetColumns: 'procedureid,category,value'
        },
        encounter_summaries: {
            queryName: 'procedure_default_comments',
            columns: 'procedureid,comment',
            targetColumns: 'procedureid,remark'
        },
        snomed_tags: {
            queryName: 'procedure_default_codes',
            columns: 'procedureid,code,qualifier',
            sort: 'sort_order'
        }
    },

    loadServices: function(){
        var multi = new LABKEY.MultiRequest();
        var totalRequests = 0;
        this.panelMap = {};
        Ext4.Array.forEach(this.targetTabs, function(tab){
            var cfg = this.tableNameMap[tab.formConfig.name];
            if (cfg){
                totalRequests++;
                multi.add(LABKEY.Query.selectRows, {
                    schemaName: 'ehr_lookups',
                    queryName: cfg.queryName,
                    requiredVersion: 9.1,
                    columns: cfg.columns,
                    failure: LDK.Utils.getErrorCallback(),
                    success: function(results){
                        this.panelMap[tab.formConfig.name] = {};
                        if (results && results.rows && results.rows.length){
                            Ext4.Array.forEach(results.rows, function(r){
                                var row = new LDK.SelectRowsRow(r);
                                if (!this.panelMap[tab.formConfig.name][row.getValue('procedureid')])
                                    this.panelMap[tab.formConfig.name][row.getValue('procedureid')] = [];

                                this.panelMap[tab.formConfig.name][row.getValue('procedureid')].push(row);
                            }, this);
                        }
                    },
                    scope: this
                });
            }
        }, this);

        LDK.Assert.assertTrue('No matching tables found in CopyFromEncountersWindow', totalRequests > 0);

        if (totalRequests > 0)
            multi.send(this.onLoad, this);
        else {
            //this should never actually get called
            this.on('beforeshow', function(window){
                Ext4.Msg.alert('No Records', 'Add defaults is not supported for this section.');
                return false;
            }, this);
        }
    },

    onLoad: function(){
        var toAdd= [{
            html: '<b>Id</b>'
        },{
            html: '<b>Date</b>'
        },{
            html: '<b>Choose Template</b>'
        },{
            html: '<b>Ignore</b>'
        }];

        var keys = this.getExistingParentIds();
        Ext4.Array.forEach(this.procedureRecords, function(r){
            toAdd.push({
                html: r.get('Id'),
                width: 60
            });
            toAdd.push({
                html: r.get('date').format('Y-m-d'),
                width: 110
            });

            var ignoreId = 'ignore_' + Ext4.id();
            toAdd.push({
                xtype: 'labkey-combo',
                width: 250,
                boundRecord: r,
                ignoreCheckbox: ignoreId,
                displayField: 'name',
                valueField: 'rowid',
                forceSelection: true,
                queryMode: 'local',
                value: r.get('procedureid'),
                store: {
                    type: 'labkey-store',
                    schemaName: 'ehr_lookups',
                    queryName: 'procedures',
                    columns: 'name,rowid',
                    autoLoad: true
                }
            });
            toAdd.push({
                xtype: 'checkbox',
                width: 80,
                itemId: ignoreId,
                checked: this.targetTabs.length == 1 ? keys[this.targetTabs[0].formConfig.name][r.get('objectid')] : false
            });
        }, this);

        var target = this.down('#services');

        target.removeAll();
        target.add({
            border: false,
            itemId: 'fieldPanel',
            layout: {
                type: 'table',
                columns: 4
            },
            defaults: {
                border: false,
                height: '15px',
                style: 'padding: 2px;margin-right: 4px;vertical-align:text-top;'
            },
            items: toAdd
        });

        this.down('#submitBtn').setDisabled(false);
    },

    onSubmit: function(){
        var hasRecords = false;
        this.down('#fieldPanel').items.each(function(item){
            if (item.boundRecord){
                var ignoreCheckbox = this.down('#' + item.ignoreCheckbox);
                if (ignoreCheckbox.getValue()){
                    return;
                }

                var panel = item.getValue();
                Ext4.Array.forEach(this.targetTabs, function(targetTab){
                    var rows;
                    var records = [];

                    if (panel && this.panelMap[targetTab.formConfig.name] && this.panelMap[targetTab.formConfig.name][panel]){
                        rows = this.panelMap[targetTab.formConfig.name][panel];
                    }

                    if (rows && rows.length){
                        Ext4.Array.forEach(rows, function(row){
                            var data = {
                                Id: item.boundRecord.get('Id'),
                                date: item.boundRecord.get('date'),
                                project: item.boundRecord.get('project'),
                                encounterid: item.boundRecord.get('objectid'),
                                parentid: item.boundRecord.get('objectid')
                            };

                            var cfg = this.tableNameMap[targetTab.formConfig.name];
                            if (cfg && cfg.columns){
                                var columns = cfg.columns.split(',');
                                var targetColumns = (cfg.targetColumns || cfg.columns).split(',');
                                Ext4.Array.forEach(columns, function(col, idx){
                                    if (!Ext4.isEmpty(row.getValue(col))){
                                        data[targetColumns[idx]] = row.getValue(col);
                                    }
                                }, this);
                            }

                            records.push(targetTab.store.createModel(data));
                        }, this);

                        if (records.length){
                            targetTab.store.add(records);
                            hasRecords = true;
                        }
                    }
                }, this);
            }
        }, this);

        this.close();
        if (!hasRecords)
            Ext4.Msg.alert('No Records', 'There are no records to add');
    }
});