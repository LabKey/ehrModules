/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg {String} animalId
 */
Ext4.define('EHR.panel.ManageCasesPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ehr-managecasespanel',

    statics: {
        CASE_CATEGORIES: {
            Clinical: {
                showAssignedVet: true,
                requiredFields: ['assignedvet', 'problem']
            },
            Surgery: {
                showAssignedVet: false,
                requiredFields: ['remark']
            },
            Behavior: {
                showAssignedVet: false,
                requiredFields: ['remark', 'problem']
            }            
        },
        
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
            },{
                xtype: 'button',
                text: 'Show Inactive',
                handler: function(btn){
                    var owner = btn.up('window');
                    if (owner)
                        owner = owner.down('panel');

                    var store = owner.getStore();
                    LDK.Assert.assertNotEmpty('Unable to find animalId in ManageCasesPanel', owner.animalId);
                    var filterArray = [
                        LABKEY.Filter.create('Id', owner.animalId, LABKEY.Filter.Types.EQUAL)
                    ];

                    if (btn.text == 'Show Inactive'){
                        btn.setText('Hide Inactive');
                    }
                    else {
                        btn.setText('Show Inactive');
                        filterArray.push(LABKEY.Filter.create('isOpen', true, LABKEY.Filter.Types.EQUAL));
                    }

                    store.filterArray = filterArray;
                    store.load();
                }
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

        this.addEvents('storeloaded');
    },

    getStore: function(){
        if (this.store)
            return this.store;

        this.store = Ext4.create('LABKEY.ext4.data.Store', {
            schemaName: 'study',
            queryName: 'Cases',
            columns: 'lsid,objectid,Id,date,enddate,reviewdate,category,remark,performedby,problemCategories,encounterid,assignedvet,assignedvet/UserId/DisplayName,isOpen,isActive',
            filterArray: [
                LABKEY.Filter.create('Id', this.animalId, LABKEY.Filter.Types.EQUAL),
                LABKEY.Filter.create('isOpen', true, LABKEY.Filter.Types.EQUAL)
            ],
            autoLoad: true,
            listeners: {
                scope: this,
                synccomplete: function(store){
                    var grid = this.down('grid');
                    if (grid){
                        grid.getView().refresh();
                    }

                    EHR.DemographicsCache.clearCache(this.animalId);
                },
                load: function(store){
                    //NOTE: consumed by SnapshotPanel
                    this.fireEvent('storeloaded', this);
                }
            }
        });

        return this.store;
    },

    getGridConfig: function(){
        return {
            xtype: 'grid',
            cls: 'ldk-grid', //variable row height
            border: false,
            store: this.getStore(),
            viewConfig: {
                loadMask: !(Ext4.isIE && Ext4.ieVersion <= 8)
            },
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
                                    closeAction: 'destroy',
                                    bodyStyle: 'padding: 5px',
                                    width: 400,
                                    items: [{
                                        html: 'This will close this case and all open problems.  If you only want to close one of the problems, but leave the others open, please use \'Edit Case\' and only close the desired problem.',
                                        border: false,
                                        style: 'padding-bottom: 10px;'
                                    },{
                                        xtype: 'datefield',
                                        itemId: 'dateField',
                                        fieldLabel: 'Close Date',
                                        value: new Date(),
                                        minValue: rec.get('date'),
                                        maxValue: new Date()
                                    }],
                                    buttons: [{
                                        text: 'Close Case',
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
                            text: 'Close With Reopen Date',
                            disabled: !EHR.Security.hasPermission(EHR.QCStates.COMPLETED, 'update', [{schemaName: 'study', queryName: 'Cases'}]),
                            scope: this,
                            handler: function(btn){
                                Ext4.create('Ext.window.Window', {
                                    modal: true,
                                    closeAction: 'destroy',
                                    bodyStyle: 'padding: 5px',
                                    width: 400,
                                    items: [{
                                        html: 'This will close this case until the date selected below.',
                                        border: false,
                                        style: 'padding-bottom: 10px;'
                                    },{
                                        xtype: 'datefield',
                                        itemId: 'dateField',
                                        fieldLabel: 'Reopen Date',
                                        minValue: new Date(),
                                        value: rec.get('reviewdate') || Ext4.Date.add(new Date(), Ext4.Date.DAY, 14)
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
                            text: 'Delete Case',
                            disabled: !EHR.Security.hasPermission(EHR.QCStates.COMPLETED, 'delete', [{schemaName: 'study', queryName: 'Cases'}]),
                            handler: function(btn){
                                Ext4.Msg.confirm('Delete Case', 'This will delete all record of this case.  If you just want to close the case, you should choose this option instead.  Are you sure you want to do this?', function(val){
                                    if (val == 'yes'){
                                        var store = rec.store;
                                        store.remove(rec);
                                        store.sync();
                                    }
                                }, this);
                            }
                        },{
                            text: 'Edit Case',
                            disabled: !EHR.Security.hasPermission(EHR.QCStates.COMPLETED, 'update', [{schemaName: 'study', queryName: 'Cases'}]),
                            scope: this,
                            handler: function(btn){
                                this.up('ehr-managecasespanel').showEditCaseWindow(rec);
                            }
                        }]
                    }).showAt(e.getXY());
                }
            },{
                header: 'Category',
                dataIndex: 'category'
            },{
                header: 'Active?',
                dataIndex: 'isActive',
                width: 60,
                renderer: function(value){
                    return value ? 'Y' : 'N';
                }
            },{
                header: 'Open Date',
                dataIndex: 'date',
                xtype: 'datecolumn',
                format: 'Y-m-d',
                width: 130
            },{
                header: 'Reopen Date',
                dataIndex: 'reviewdate',
                xtype: 'datecolumn',
                format: 'Y-m-d',
                width: 130
            },{
                header: 'Description/Notes',
                dataIndex: 'remark',
                tdCls: 'ldk-wrap-text',
                width: 250
            },{
                header: 'Vet',
                dataIndex: 'assignedvet',
                width: 130,
                renderer: function(value, cellMetaData, record){
                    if (Ext4.isDefined(record.get('assignedvet/UserId/DisplayName'))){
                        return record.get('assignedvet/UserId/DisplayName');
                    }

                    return value ? '[' + value + ']' : value;
                }
            },{
                header: 'Problem(s)',
                dataIndex: 'problemCategories',
                width: 220
            }]
        }
    },

    showEditCaseWindow: function(rec){
        if (Ext4.isArray(rec)){
            var data = [];
            Ext4.Array.forEach(rec, function(r){
                console.log(r.data);
                data.push({
                    problems: r.get('problemCategories'),
                    objectid: r.get('objectid'),
                    record: r
                });
            }, this);

            Ext4.create('Ext.window.Window', {
                title: 'Choose Case',
                modal: true,
                closeAction: 'destroy',
                bodyStyle: 'padding: 5px;',
                width: 420,
                items: [{
                    xtype: 'combo',
                    fieldLabel: 'Choose Case',
                    displayField: 'problems',
                    triggerAction: 'all',
                    queryMode: 'local',
                    width: 400,
                    valueField: 'objectid',
                    store: {
                        type: 'store',
                        data: data,
                        fields: ['problems', 'objectid', 'record']
                    },
                    forceSelection: true
                }],
                buttons: [{
                    text: 'Submit',
                    scope: this,
                    handler: function(btn){
                        var win = btn.up('window');
                        var field = win.down('combo');
                        if (!field.getValue()){
                            Ext4.Msg.alert('Error', 'Must choose a case');
                            return;
                        }

                        var selected = field.store.findRecord('objectid', field.getValue());
                        LDK.Assert.assertNotEmpty('Unable to find record in ManageCasesPanel', selected);
                        win.close();

                        Ext4.create('EHR.window.EditCaseWindow', {
                            boundRecord: selected.get('record')
                        }).show();
                    }
                },{
                    text: 'Cancel',
                    handler: function(btn){
                        btn.up('window').close();
                    }
                }]
            }).show();
        }
        else {
            Ext4.create('EHR.window.EditCaseWindow', {
                boundRecord: rec
            }).show();
        }
    },

    showCreateWindow: function(category, defaultRemark){
        var store = this.getStore();
        if (store.isLoading()){
            Ext4.Msg.wait('Loading...');
            store.on('load', function(){
                Ext4.Msg.hide();
                this.showCreateWindow(category, defaultRemark);
            }, this, {single: true});
            return;
        }

        var existingRecs = [];
        store.each(function(r){
            if (r.get('category') == category && r.get('isActive')){
                existingRecs.push(r);
            }
        }, this);

        if (existingRecs.length){
            Ext4.create('Ext.window.MessageBox', {
                buttonText: { yes: 'Open New', no: 'Edit Existing'}
            }).show({
                icon: Ext4.Msg.QUESTION,
                buttons: Ext4.Msg.YESNO,
                title: 'Open Case',
                msg: 'This animal already has an open ' + category + ' case.  Do you want to edit this case or open a second one or edit the first?',
                callback: function(val){
                    if (val == 'yes'){
                        Ext4.create('EHR.window.OpenCaseWindow', {
                            caseCategory: category,
                            ownerPanel: this,
                            animalId: this.animalId,
                            defaultVet: existingRecs[0].get('assignedvet'),
                            defaultRemark: defaultRemark
                        }).show();
                    }
                    else if (val == 'no'){
                        this.showEditCaseWindow(existingRecs);
                    }
                },
                scope: this
            });
        }
        else {
            Ext4.create('EHR.window.OpenCaseWindow', {
                caseCategory: category,
                ownerPanel: this,
                animalId: this.animalId
            }).show();
        }
    }
});

Ext4.define('EHR.window.EditCaseWindow', {
    extend: 'Ext.window.Window',

    initComponent: function(){
        LABKEY.ExtAdapter.apply(this, {
            modal: true,
            closeAction: 'destroy',
            title: 'Edit Case',
            width: 600,
            bodyStyle: 'padding: 5px;',
            items: [{
                xtype: 'form',
                border: false,
                defaults: {
                    labelWidth: 140,
                    border: false
                },
                items: [{
                    xtype: 'ehr-vetfieldcombo',
                    fieldLabel: 'Assigned Vet',
                    itemId: 'assignedvet',
                    allowBlank: EHR.panel.ManageCasesPanel.CASE_CATEGORIES[this.boundRecord.get('category')].requiredFields.indexOf('assignedvet') == -1,
                    width: 560,
                    value: this.boundRecord.get('assignedvet')
                },{
                    xtype: 'datefield',
                    fieldLabel: 'Initial Open Date',
                    itemId: 'date',
                    allowBlank: false,
                    width: 560,
                    value: this.boundRecord.get('date')
                },{
                    xtype: 'datefield',
                    fieldLabel: 'Reopen Date',
                    itemId: 'reviewdate',
                    allowBlank: EHR.panel.ManageCasesPanel.CASE_CATEGORIES[this.boundRecord.get('category')].requiredFields.indexOf('reviewdate') == -1,
                    width: 560,
                    value: this.boundRecord.get('reviewdate')
                },{
                    xtype: 'textarea',
                    fieldLabel: 'Description/Notes',
                    allowBlank: EHR.panel.ManageCasesPanel.CASE_CATEGORIES[this.boundRecord.get('category')].requiredFields.indexOf('remark') == -1,
                    width: 560,
                    height: 75,
                    value: this.boundRecord.get('remark'),
                    itemId: 'remark'
                }]
            },{
                xtype: 'ldk-gridpanel',
                itemId: 'problemGrid',
                title: 'Master Problems',
                viewConfig: {
                    loadMask: !(Ext4.isIE && Ext4.ieVersion <= 8)
                },
                store: {
                    type: 'labkey-store',
                    schemaName: 'study',
                    queryName: 'problem',
                    sort: 'date',
                    columns: 'Id,date,lsid,objectid,category,enddate,caseid',
                    filterArray: [LABKEY.Filter.create('caseid', this.boundRecord.get('objectid'), LABKEY.Filter.Types.EQUAL)],
                    autoLoad: true
                },
                columns: [{
                    dataIndex: 'category',
                    width: 180,
                    header: 'Problem'
                },{
                    dataIndex: 'date',
                    header: 'Date',
                    xtype: 'datecolumn',
                    width: 180,
                    format: 'Y-m-d'
                },{
                    dataIndex: 'enddate',
                    header: 'End Date',
                    xtype: 'datecolumn',
                    width: 180,
                    format: 'Y-m-d'
                }],
                dockedItems: [{
                    xtype: 'toolbar',
                    position: 'top',
                    items: [{
                        text: 'Add',
                        scope: this,
                        handler: function(button){
                            var grid = button.up('grid');
                            LDK.Assert.assertNotEmpty('No bound record', this.boundRecord);

                            Ext4.create('Ext.window.Window', {
                                modal: true,
                                boundRecord: this.boundRecord,
                                title: 'Add Problem',
                                bodyStyle: 'padding: 5px;',
                                defaults: {
                                    width: 350
                                },
                                items: [{
                                    xtype: 'labkey-combo',
                                    fieldLabel: 'Problem',
                                    valueField: 'value',
                                    displayField: 'value',
                                    itemId: 'category',
                                    anyMatch: true,
                                    queryMode: 'local',
                                    forceSelection: true,
                                    store: {
                                        type: 'labkey-store',
                                        schemaName: 'ehr_lookups',
                                        queryName: 'problem_list_category',
                                        autoLoad: true
                                    }
                                },{
                                    xtype: 'datefield',
                                    fieldLabel: 'Open Date',
                                    itemId: 'dateField',
                                    maxValue: new Date(),
                                    //cant open prior to case open
                                    minValue: this.boundRecord.get('date'),
                                    value: new Date()
                                }],
                                buttons: [{
                                    text: 'Submit',
                                    handler: function(btn){
                                        var win = btn.up('window');
                                        if (!win.down('#category').getValue() || !win.down('#dateField').getValue()){
                                            Ext4.Msg.alert('Error', 'Must enter the problem and date');
                                            return;
                                        }

                                        var newModel = grid.store.createModel({});
                                        newModel.set({
                                            Id: win.boundRecord.get('Id'),
                                            caseid: win.boundRecord.get('objectid'),
                                            category: win.down('#category').getValue(),
                                            date: win.down('#dateField').getValue()
                                        });

                                        grid.store.add(newModel);
                                        grid.store.sync();
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
                        text: 'End Selected',
                        scope: this,
                        handler: function(btn){
                            var grid = btn.up('grid');
                            var recs = grid.getSelectionModel().getSelection();
                            if (!recs || !recs.length){
                                Ext4.Msg.alert('Error', 'No problems selected');
                                return;
                            }

                            Ext4.Array.forEach(recs, function(r){
                                if (!r.get('enddate')){
                                    r.set('enddate', new Date());
                                }
                            }, this);

                            grid.store.sync();
                        }
                    }]
                }]
            }],
            buttons: [{
                text: 'Submit',
                scope: this,
                handler: function(btn){
                    var win = btn.up('window');

                    if (!win.down('form').isValid()){
                        Ext4.Msg.alert('Error', 'Missing one or more required fields');
                        return;
                    }

                    win.boundRecord.set({
                        remark: win.down('#remark').getValue(),
                        assignedvet: win.down('#assignedvet').getValue(),
                        date: win.down('#date').getValue(),
                        reviewdate: win.down('#reviewdate').getValue()
                    });

                    win.boundRecord.set('assignedvet/UserId/DisplayName', win.down('#assignedvet').getDisplayValue());
                    win.boundRecord.store.sync();

                    var problemGrid = win.down('#problemGrid');
                    problemGrid.store.sync();

                    win.close();
                }
            },{
                text: 'Cancel',
                handler: function(btn){
                    btn.up('window').close();
                }
            }]
        });

        this.callParent(arguments);
    }
});


/**
 * @cfg caseCategory
 * @cfg ownerPanel,
 * @cfg animalId
 * @cfg defaultVet
 * @cfg defaultRemark
 */
Ext4.define('EHR.window.OpenCaseWindow', {
    extend: 'Ext.window.Window',

    initComponent: function(){
        Ext4.apply(this, {
            title: 'Open Case: ' + this.animalId,
            width: 600,
            modal: true,
            closeAction: 'destroy',
            bodyStyle: 'padding: 5px;',
            items: [{
                xtype: 'form',
                border: false,
                defaults: {
                    border: false,
                    labelWidth: 140,
                    width: 550
                },
                items: [{
                    xtype: 'displayfield',
                    fieldLabel: 'Category',
                    value: this.caseCategory,
                    name: 'category'
                },{
                    xtype: 'ehr-vetfieldcombo',
                    fieldLabel: 'Assigned Vet',
                    name: 'assignedvet',
                    value: EHR.panel.ManageCasesPanel.CASE_CATEGORIES[this.caseCategory].showAssignedVet ? this.defaultVet : null,
                    allowBlank: EHR.panel.ManageCasesPanel.CASE_CATEGORIES[this.caseCategory].requiredFields.indexOf('assignedvet') == -1,
                    hidden: !EHR.panel.ManageCasesPanel.CASE_CATEGORIES[this.caseCategory].showAssignedVet
                },{
                    xtype: 'labkey-combo',
                    fieldLabel: 'Problem',
                    allowBlank: EHR.panel.ManageCasesPanel.CASE_CATEGORIES[this.caseCategory].requiredFields.indexOf('problem') == -1,
                    anyMatch: true,
                    queryMode: 'local',
                    forceSelection: true,
                    name: 'problem',
                    valueField: 'value',
                    displayField: 'value',
                    store: {
                        type: 'labkey-store',
                        schemaName: 'ehr_lookups',
                        queryName: 'problem_list_category',
                        autoLoad: true
                    }
                },{
                    xtype: 'textarea',
                    fieldLabel: 'Description/Notes',
                    name: 'remark',
                    value: this.defaultRemark,
                    allowBlank: EHR.panel.ManageCasesPanel.CASE_CATEGORIES[this.caseCategory].requiredFields.indexOf('remark') == -1,
                    height: 75
                }]
            }],
            buttons: [{
                text: 'Open Case',
                handler: function(btn){
                    var win = btn.up('window');
                    win.doSave();
                }
            },{
                text: 'Open & Immediately Close',
                handler: function(btn){
                    var win = btn.up('window');
                    win.doSave(new Date());
                }
            },{
                text: 'Cancel',
                handler: function(btn){
                    btn.up('window').close();
                }
            }]
        });

        this.callParent(arguments);
    },

    doSave: function(enddate){
        if (!this.down('form').getForm().isValid()){
            Ext4.Msg.alert('Error', 'Missing one or more required fields');
            return;
        }

        var values = this.down('form').getForm().getValues();
        var caseId = LABKEY.Utils.generateUUID().toUpperCase();
        values.date = new Date();
        values.category = this.caseCategory;
        values.Id = this.ownerPanel.animalId;
        values.performedby = LABKEY.Security.currentUser.displayName;
        values.objectid = caseId;
        if (enddate){
            values.enddate = enddate;
        }

        var problemRow = {
            Id: values.Id,
            date: values.date,
            enddate: values.enddate,
            category: values.problem,
            caseid: values.objectid
        };

        var panel = this.ownerPanel;

        Ext4.Msg.wait('Saving...');

        var commands = [];
        commands.push({
            command: 'insertWithKeys',
            schemaName: 'study',
            queryName: 'cases',
            rows: [{
                values: values
            }]
        });

        commands.push({
            command: 'insert',
            schemaName: 'study',
            queryName: 'problem',
            rows: [problemRow]
        });

        LABKEY.Query.saveRows({
            commands: commands,
            scope: this,
            failure: LDK.Utils.getErrorCallback(),
            success: function(results){
                this.close();
                Ext4.Msg.hide();

                EHR.DemographicsCache.reportCaseCreated(this.animalId, this.caseCategory, caseId);

                if (panel){
                    panel.fireEvent('casecreated', this.animalId, this.caseCategory, caseId);
                    panel.down('grid').store.load();
                }

                EHR.DemographicsCache.clearCache(this.animalId);
            }
        });
    }
});
