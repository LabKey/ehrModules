/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg targetGrid
 * @cfg runsStore
 * @cfg targetTab
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

        this.inferPanels();

        this.callParent();

        this.on('beforeshow', function(window){
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

    tableNameMap: {
        'Medications/Treatments': {
            queryName: 'procedure_default_treatments',
            columns: 'procedureid,code,qualifier,route,frequency,volume,vol_units,dosage,dosage_units,concentration,conc_units,amount,amount_units'
        },
        'Misc. Charges': {
            queryName: 'procedure_default_charges',
            columns: 'procedureid,chargeid,quantity'
        },
        Flags: {
            queryName: 'procedure_default_flags',
            columns: 'procedureid,flag,value',
            targetColumns: 'procedureid,category,value'
        },
        Narrative: {
            queryName: 'procedure_default_comments',
            columns: 'procedureid,comment',
            targetColumns: 'procedureid,remark'
        },
        'SNOMED Codes': {
            queryName: 'procedure_default_codes',
            columns: 'procedureid,code,qualifier',
            sort: 'sort_order'
        }
    },

    loadServices: function(){
        var cfg = this.tableNameMap[this.targetTab];
        if (cfg){
            LABKEY.Query.selectRows({
                schemaName: 'ehr_lookups',
                queryName: cfg.queryName,
                requiredVersion: 9.1,
                columns: cfg.columns,
                failure: LDK.Utils.getErrorCallback(),
                success: this.onLoad,
                scope: this
            });
        }
        else {
            this.onLoad();
        }
    },

    onLoad: function(results){
        this.panelMap = {};

        if (results && results.rows && results.rows.length){
            Ext4.Array.forEach(results.rows, function(r){
                var row = new LDK.SelectRowsRow(r);
                if (!this.panelMap[row.getValue('procedureid')])
                    this.panelMap[row.getValue('procedureid')] = [];

                this.panelMap[row.getValue('procedureid')].push(row);
            }, this);
        }

        var toAdd= [{
            html: '<b>Id</b>'
        },{
            html: '<b>Date</b>'
        },{
            html: '<b>Procedure</b>'
        },{
            html: '<b>Choose Template</b>'
        },{
            html: '<b>Ignore</b>'
        }];

        Ext4.Array.forEach(this.procedureRecords, function(r){
            toAdd.push({
                html: r.get('Id'),
                width: 60
            });
            toAdd.push({
                html: r.get('date').format('Y-m-d'),
                width: 80
            });
            toAdd.push({
                html: r.get('procedureid')
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
                checked: false
            });
        }, this);

        var target = this.down('#services');

        target.removeAll();
        target.add({
            border: false,
            itemId: 'fieldPanel',
            layout: {
                type: 'table',
                columns: 5
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
        var records = [];
        this.down('#fieldPanel').items.each(function(item){
            if (item.boundRecord){
                var ignoreCheckbox = this.down('#' + item.ignoreCheckbox);
                if (ignoreCheckbox.getValue()){
                    return;
                }

                var panel = item.getValue();
                var rows;
                if (panel && this.panelMap[panel]){
                    rows = this.panelMap[panel];
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

                        var cfg = this.tableNameMap[this.targetTab];
                        if (cfg && cfg.columns){
                            var columns = cfg.columns.split(',');
                            var targetColumns = (cfg.targetColumns || cfg.columns).split(',');
                            Ext4.Array.forEach(columns, function(col, idx){
                                if (!Ext4.isEmpty(row.getValue(col))){
                                    data[targetColumns[idx]] = row.getValue(col);
                                }
                            }, this);
                        }

                        records.push(this.targetGrid.store.createModel(data));
                    }, this);
                }
            }
        }, this);

        if (records.length){
            this.targetGrid.store.add(records);
            this.close();
        }
        else {
            Ext4.Msg.alert('No Records', 'There are no records to add');
        }
    }
});