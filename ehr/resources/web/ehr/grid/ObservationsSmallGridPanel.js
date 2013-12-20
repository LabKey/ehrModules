/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * Created to allow editing of observations for a single animal using ClinicalRemarksRowEditor
 *
 */
Ext4.define('EHR.grid.ObservationsSmallGridPanel', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.ehr-observationssmallgridpanel',

    initComponent: function(){
        LABKEY.ExtAdapter.apply(this, {
            columns: this.getColumns(),
            plugins: [{
                ptype: 'cellediting',
                pluginId: 'cellediting',
                clicksToEdit: 1,
                startEdit: function(record, columnHeader) {
                    this.editors.clear();
                    Ext4.grid.plugin.CellEditing.prototype.startEdit.apply(this, arguments);
                }
            }],
            listeners: {
                scope: this,
                cellclick: function(grid, cell, cellIdx, rec){
                    //because we show a different editor depending on the field value,
                    //we need to clear the cached editor
                    var grid = grid.up('grid');
                    var column = grid.columns[cellIdx];
                    var plugin = grid.getPlugin('cellediting');
                    if (plugin.editors)
                        plugin.editors.removeAtKey(column.getItemId());
                }
            },
            dockedItems: [{
                xtype: 'toolbar',
                position: 'top',
                items: [{
                    text: 'Add',
                    scope: this,
                    handler: function(btn){
                        var rec = this.createModel();
                        if (!rec)
                            return;

                        this.store.add(rec);
                        this.getPlugin('cellediting').startEdit(rec, 0);
                    }
                },{
                    text: 'Remove',
                    scope: this,
                    handler: function(btn){
                        var recs = this.getSelectionModel().getSelection();
                        this.store.remove(recs);
                    }
                },{
                    text: 'Template',
                    scope: this,
                    menu: [{
                        text: 'Clinical Rounds',
                        scope: this,
                        handler: function(item){
                            var model1 = this.createModel({
                                category: 'Stool',
                                observation: 'F'
                            });

                            if (!model1)
                                return;

                            this.store.add(model1);

                            this.store.add(this.createModel({
                                category: 'App',
                                observation: 'Good'
                            }));

                            this.store.add(this.createModel({
                                category: 'Att',
                                observation: 'BAR'
                            }));

                            this.store.add(this.createModel({
                                category: 'Pain Score',
                                observation: '0'
                            }));

                            this.store.add(this.createModel({
                                category: 'Hyd',
                                observation: 'Good'
                            }));
                        }
                    },{
                        text: 'Physical Exam',
                        scope: this,
                        handler: function(item){
                            var model1 = this.createModel({
                                category: 'BCS'
                            });

                            if (!model1)
                                return;

                            this.store.add(model1);

                            this.store.add(this.createModel({
                                category: 'Alopecia'
                            }));

                            this.store.add(this.createModel({
                                category: 'T'
                            }));

                            this.store.add(this.createModel({
                                category: 'P'
                            }));

                            this.store.add(this.createModel({
                                category: 'R'
                            }));

                            this.store.add(this.createModel({
                                category: 'Assessment',
                                area: 'Oral',
                                observation: 'Normal'
                            }));

                            this.store.add(this.createModel({
                                category: 'Assessment',
                                area: 'Integ',
                                observation: 'Normal'
                            }));

                            this.store.add(this.createModel({
                                category: 'Assessment',
                                area: 'Abd/Thorax',
                                observation: 'Normal'
                            }));

                            this.store.add(this.createModel({
                                category: 'Assessment',
                                area: 'EENT',
                                observation: 'Normal'
                            }));

                            this.store.add(this.createModel({
                                category: 'Assessment',
                                area: 'MS',
                                observation: 'Normal'
                            }));

                            this.store.add(this.createModel({
                                category: 'Assessment',
                                area: 'PLN',
                                observation: 'Normal'
                            }));

                            this.store.add(this.createModel({
                                category: 'Assessment',
                                area: 'U/G',
                                observation: 'Normal'
                            }));
                        }
                    },{
                        text: 'Surgical Rounds',
                        scope: this,
                        handler: function(item){
                            var model1 = this.createModel({
                                category: 'Att',
                                observation: 'BAR'
                            });

                            if (!model1)
                                return;

                            this.store.add(model1);

                            this.store.add(this.createModel({
                                category: 'App',
                                observation: 'Good'
                            }));

                            this.store.add(this.createModel({
                                category: 'Stool',
                                observation: 'F'
                            }));

                            this.store.add(this.createModel({
                                category: 'Pain Score',
                                observation: '0'
                            }));
                        }
                    }]
                }]
            }]
        });

        this.callParent();
    },

    createModel: function(data){
        var form = this.up('window').down('ehr-formpanel');
        var br = form.getRecord();
        LDK.Assert.assertNotEmpty('No bound record in ObservationsSmallGridPanel', br);
        if (!br){
            Ext4.Msg.alert('Error', 'Unable to find record');
            return;
        }

        LDK.Assert.assertNotEmpty('No animal ID in ObservationsSmallGridPanel', br.get('Id'));
        if (!br.get('Id')){
            Ext4.Msg.alert('Error', 'No Animal ID Provided');
            return;
        }

        return this.store.createModel(LABKEY.ExtAdapter.apply({
            Id: br.get('Id'),
            date: new Date()
        }, data));
    },

    getColumns: function(){
        return [{
            header: 'Category',
            dataIndex: 'category',
            editable: true,
            renderer: function(value, cellMetaData, record){
                if (Ext4.isEmpty(value)){
                    cellMetaData.tdCls = 'labkey-grid-cell-invalid';
                }

                return value;
            },
            editor: {
                xtype: 'labkey-combo',
                editable: false,
                displayField: 'value',
                valueField: 'value',
                forceSelection: true,
                store: {
                    type: 'labkey-store',
                    schemaName: 'ehr_lookups',
                    queryName: 'observation_types',
                    columns: 'value,description',
                    autoLoad: true
                }
            }
        },{
            header: 'Area',
            width: 200,
            editable: true,
            dataIndex: 'area',
            editor: {
                xtype: 'labkey-combo',
                displayField: 'value',
                valueField: 'value',
                forceSelection: true,
                value: 'N/A',
                store: {
                    type: 'labkey-store',
                    schemaName: 'ehr_lookups',
                    queryName: 'observation_areas',
                    autoLoad: true
                }
            }
        },{
            header: 'Observation/Score',
            width: 200,
            editable: true,
            dataIndex: 'observation',
            renderer: function(value, cellMetaData, record){
                if (Ext4.isEmpty(value)){
                    cellMetaData.tdCls = 'labkey-grid-cell-invalid';
                }

                return value;
            },
            getEditor: function(record){
                if (!record){
                    //NOTE: i think this is an Ext4 core bug.  if you tab between cells
                    //this method is called w/o arguments
                    var records = this.up('grid').getSelectionModel().getSelection();
                    if (records.length)
                        record = records[0];
                    else
                        return;
                }

                var category = record.get('category');
                if (!category){
                    return false;
                }

                var store = this.up('grid').store.observationTypesStore;
                var rec = store.findRecord('value', category);
                LDK.Assert.assertNotEmpty('Unable to find record matching category: ' + category, rec);

                var config = rec.get('description') ? Ext4.decode(rec.get('description')) : null;
                return config || {
                    xtype: 'textfield'
                }
            }
        }]
    },

    loadRecord: function(rec){
        var id = rec.get('Id');
console.log('Loading Id: ' + id);
        this.store.filter('Id', id);
    }
});