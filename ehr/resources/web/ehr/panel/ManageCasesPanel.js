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

    minWidth: 600,
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
                        Ext4.Msg.alert('Not enabled', 'This is not enabled yet');
                    }
                },{
                    text: 'Open Clinical Case',
                    handler: function(btn){
                        Ext4.Msg.alert('Not enabled', 'This is not enabled yet');
                    }
                },{
                    text: 'Open Surgery Case',
                    handler: function(btn){
                        Ext4.Msg.alert('Not enabled', 'This is not enabled yet');
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
            columns: 'lsid,objectid,Id,date,enddate,reviewdate,category,remark,performedby,encounterid',
            filterArray: [
                LABKEY.Filter.create('Id', this.animalId, LABKEY.Filter.Types.EQUAL),
                LABKEY.Filter.create('enddate', null, LABKEY.Filter.Types.ISBLANK)
            ],
            autoLoad: true
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
                                        value: new Date()
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
                            text: 'Add Remark For Case',
                            disabled: !EHR.Security.hasPermission(EHR.QCStates.COMPLETED, 'update', [{schemaName: 'study', queryName: 'Cases'}]),
                            scope: this,
                            handler: function(btn){
                                Ext4.create('EHR.window.EnterRemarkWindow', {
                                    animalId: rec.get('Id'),
                                    caseId: rec.get('objectid'),
                                    encounterId: rec.get('encounterid'),
                                    mode: rec.get('category')
                                }).show(btn);
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
                header: 'Opened By',
                dataIndex: 'performedby',
                width: 130
            },{
                header: 'Reason',
                dataIndex: 'remark',
                width: 200
            }]
        }
    }
});