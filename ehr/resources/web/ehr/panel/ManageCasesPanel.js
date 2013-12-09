/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg {String} animalId
 */
Ext4.define('EHR.panel.ManageCasesPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ehr-managecasespanel',

    minWidth: 900,
    minHeight: 50,

    statics: {
        getButtonConfig: function(){
            return [{
                xtype: 'button',
                text: 'Open Case',
                disabled: !EHR.Security.hasPermission(EHR.QCStates.COMPLETED, 'insert', [{schemaName: 'study', queryName: 'Cases'}]),
                menu: [{
                    text: 'Open Behavior Case',
                    handler: function(btn){
                        var owner = btn.up('window');
                        if (owner)
                            owner = owner.down('panel');

                        owner.showCreateWindow('Behavior');
                    }
                },{
                    text: 'Open Clinical Case',
                    handler: function(btn){
                        var owner = btn.up('window');
                        if (owner)
                            owner = owner.down('panel');

                        owner.showCreateWindow('Clinical');
                    }
                },{
                    text: 'Open Surgery Case',
                    handler: function(btn){
                        var owner = btn.up('window');
                        if (owner)
                            owner = owner.down('panel');

                        owner.showCreateWindow('Surgery');
                    }
                }]
            }]
        }
    },

    initComponent: function(){
        Ext4.apply(this, {
            border: false,
            items: [this.getGridConfig()],
            buttons: this.hideButtons ? null : this.getButtonConfig()
        });

        this.callParent();

        this.on('render', function(){
            if (this.store.loading){
                this.store.on('load', function(){
                    this.setLoading(false);
                }, this);

                this.setLoading(true);
            }
        }, this, {delay: 100});
    },

    getStore: function(){
        if (this.store)
            return this.store;

        this.store = Ext4.create('LABKEY.ext4.data.Store', {
            schemaName: 'study',
            queryName: 'Cases',
            columns: 'lsid,objectid,Id,date,enddate,reviewdate,category,remark,performedby,problem,encounterid',
            filterArray: [
                LABKEY.Filter.create('Id', this.animalId, LABKEY.Filter.Types.EQUAL),
                LABKEY.Filter.create('enddate', null, LABKEY.Filter.Types.ISBLANK)
            ],
            autoLoad: true,
            listeners: {
                scope: this,
                synccomplete: function(store){
                    this.down('grid').getView().refresh();
                }
            }
        });

        return this.store;
    },

    getGridConfig: function(){
        return {
            xtype: 'grid',
            border: true,
            store: this.getStore(),
            columns: [{
                xtype: 'actioncolumn',
                width: 40,
                icon: LABKEY.ActionURL.getContextPath() + '/_images/editprops.png',
                tooltip: 'Edit',
                handler: function(view, rowIndex, colIndex, item, e, rec){
                    Ext4.create('Ext.menu.Menu', {
                        items: [{
                            text: 'Close Case',
                            disabled: !EHR.Security.hasPermission(EHR.QCStates.COMPLETED, 'update', [{schemaName: 'study', queryName: 'Cases'}]),
                            scope: this,
                            handler: function(btn){
                                Ext4.create('Ext.window.Window', {
                                    modal: true,
                                    bodyStyle: 'padding: 5px',
                                    width: 400,
                                    items: [{
                                        xtype: 'datefield',
                                        itemId: 'dateField',
                                        fieldLabel: 'Close Date',
                                        value: new Date(),
                                        maxValue: new Date()
                                    }],
                                    buttons: [{
                                        text: 'Submit',
                                        scope: this,
                                        handler: function(btn){
                                            var win = btn.up('window');
                                            var val = win.down('#dateField').getValue();
                                            if (!val){
                                                Ext4.Msg.alert('Error', 'Must choose a date');
                                                return;
                                            }

                                            rec.set('enddate', val);

                                            Ext4.Msg.wait('Saving...');
                                            var store = rec.store;
                                            store.sync({
                                                scope: this,
                                                success: function(){
                                                    Ext4.Msg.hide();
                                                    store.load();
                                                }
                                            });

                                            win.close();
                                        }
                                    },{
                                        text: 'Cancel',
                                        handler: function(btn){
                                            btn.up('window').close();
                                        }
                                    }]
                                }).show();
                            }
                        },{
                            text: 'Close With Review',
                            disabled: !EHR.Security.hasPermission(EHR.QCStates.COMPLETED, 'update', [{schemaName: 'study', queryName: 'Cases'}]),
                            scope: this,
                            handler: function(btn){
                                Ext4.create('Ext.window.Window', {
                                    modal: true,
                                    bodyStyle: 'padding: 5px',
                                    width: 400,
                                    items: [{
                                        xtype: 'datefield',
                                        itemId: 'dateField',
                                        fieldLabel: 'Review Date',
                                        minValue: new Date(),
                                        value: rec.get('reviewdate') || Ext4.Date.add(new Date(), Ext4.Date.DAY, 7)
                                    }],
                                    buttons: [{
                                        text: 'Submit',
                                        scope: this,
                                        handler: function(btn){
                                            var win = btn.up('window');
                                            var val = win.down('#dateField').getValue();
                                            if (!val){
                                                Ext4.Msg.alert('Error', 'Must choose a date');
                                                return;
                                            }

                                            rec.set('reviewdate', val);
                                            rec.store.sync();

                                            win.close();
                                        }
                                    },{
                                        text: 'Cancel',
                                        handler: function(btn){
                                            btn.up('window').close();
                                        }
                                    }]
                                }).show();
                            }
                        },{
                            text: 'Change To Monitoring',
                            disabled: !EHR.Security.hasPermission(EHR.QCStates.COMPLETED, 'update', [{schemaName: 'study', queryName: 'Cases'}]),
                            scope: this,
                            handler: function(btn){
                                Ext4.Msg.confirm('Switch To Monitoring', 'This will close the selected case and open a new case with \'Monitoring\' as the problem.  Do you want to do this?', function(val){
                                    if (val == 'yes'){
                                        rec.set('enddate', new Date());
                                        Ext4.Msg.wait('Saving...');
                                        rec.store.sync({
                                            scope: this,
                                            success: function(batch, options){
                                                var store = rec.store;
                                                LABKEY.Query.insertRows({
                                                    schemaName: 'study',
                                                    queryName: 'cases',
                                                    scope: this,
                                                    rows: [{
                                                        Id: rec.get('Id'),
                                                        category: rec.get('category'),
                                                        date: new Date(),
                                                        performedby: LABKEY.Security.currentUser.displayName,
                                                        remark: rec.get('remark'),
                                                        problem: 'Monitoring'
                                                    }],
                                                    failure: LDK.Utils.getErrorCallback(),
                                                    success: function(results){
                                                        Ext4.Msg.hide();
                                                        store.load();
                                                    }
                                                });
                                            }
                                        });
                                    }
                                })
                            }
                        },{
                            text: 'Edit Hx',
                            disabled: !EHR.Security.hasPermission(EHR.QCStates.COMPLETED, 'update', [{schemaName: 'study', queryName: 'Cases'}]),
                            scope: this,
                            handler: function(btn){
                                var remark = rec.get('remark');

                                Ext4.create('Ext.window.Window', {
                                    modal: true,
                                    closeAction: 'destroy',
                                    title: 'Edit Hx',
                                    width: 400,
                                    record: rec,
                                    bodyStyle: 'padding: 5px;',
                                    items: [{
                                        xtype: 'textarea',
                                        width: 380,
                                        value: rec.get('remark'),
                                        itemId: 'remark'
                                    }],
                                    buttons: [{
                                        text: 'Submit',
                                        scope: this,
                                        handler: function(btn){
                                            var win = btn.up('window');
                                            var val = win.down('#remark').getValue();
                                            rec.set('remark', val);
                                            rec.store.sync();

                                            win.close();
                                        }
                                    },{
                                        text: 'Cancel',
                                        handler: function(btn){
                                            btn.up('window').close();
                                        }
                                    }]
                                }).show();
                            }
                        }]
                    }).showAt(e.getXY());
                }
            },{
                header: 'Category',
                dataIndex: 'category'
            },{
                header: 'Open Date',
                dataIndex: 'date',
                xtype: 'datecolumn',
                format: 'Y-m-d',
                width: 130
            },{
                header: 'Review Date',
                dataIndex: 'reviewdate',
                xtype: 'datecolumn',
                format: 'Y-m-d',
                width: 130
            },{
                header: 'Hx',
                dataIndex: 'remark',
                width: 250
            },{
                header: 'Opened By',
                dataIndex: 'performedby',
                width: 130
            },{
                header: 'Problem',
                dataIndex: 'problem',
                width: 200
            }]
        }
    },

    showCreateWindow: function(category){
        Ext4.create('Ext.window.Window', {
            title: 'Open Case: ' + this.animalId,
            caseCategory: category,
            width: 400,
            modal: true,
            closeAction: 'destroy',
            bodyStyle: 'padding: 5px;',
            ownerPanel: this,
            items: [{
                xtype: 'form',
                border: false,
                defaults: {
                    border: false,
                    width: 350
                },
                items: [{
                    xtype: 'displayfield',
                    fieldLabel: 'Category',
                    value: category,
                    name: 'category'
                },{
                    xtype: 'textarea',
                    fieldLabel: 'Hx',
                    name: 'remark',
                    allowBlank: false,
                    height: 150
                },{
                    xtype: 'labkey-combo',
                    fieldLabel: 'Problem',
                    allowBlank: false,
                    name: 'problem',
                    valueField: 'value',
                    displayField: 'value',
                    store: {
                        type: 'labkey-store',
                        schemaName: 'ehr_lookups',
                        queryName: 'problem_list_category',
                        autoLoad: true
                    }
                }]
            }],
            buttons: [{
                text: 'Submit',
                handler: function(btn){
                    var win = btn.up('window');
                    var values = win.down('form').getForm().getValues();

                    values.date = new Date();
                    values.category = win.caseCategory;
                    values.Id = win.ownerPanel.animalId;
                    values.performedby = LABKEY.Security.currentUser.displayName;

                    if (!values.Id || !values.problem || !values.remark){
                        Ext4.Msg.alert('Error', 'Must choose a problem and enter a history');
                        return;
                    }

                    var panel = win.ownerPanel;
                    win.close();
                    Ext4.Msg.wait('Saving...');

                    LABKEY.Query.insertRows({
                        schemaName: 'study',
                        queryName: 'cases',
                        scope: this,
                        rows: [values],
                        failure: LDK.Utils.getErrorCallback(),
                        success: function(results){
                            Ext4.Msg.hide();
                            panel.down('grid').store.load();
                        }
                    });
                }
            },{
                text: 'Cancel',
                handler: function(btn){
                    btn.up('window').close();
                }
            }]
        }).show();
    }
});