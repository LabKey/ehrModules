/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */



EHR.ext.AnimalSelector = Ext.extend(Ext.Panel, {
    initComponent: function()
    {
        Ext.applyIf(this, {
            layout: 'form'
            ,title: 'Choose Animals'
            ,bodyBorder: true
            ,border: true
            //,frame: true
            ,bodyStyle: 'padding:5px'
            ,width: 350
            ,defaults: {
                width: 200,
                border: false,
                bodyBorder: false
                //parentPanel: this.parentPanel || this
            }
            ,items: [
                {
                    xtype: 'textfield',
                    ref: 'subjArea',
                    fieldLabel: 'Id(s)'
                },
                {
                    xtype: 'combo'
                    ,emptyText:''
                    ,fieldLabel: 'Area'
                    ,displayField:'area'
                    ,valueField: 'area'
                    ,typeAhead: true
                    ,editable: true
                    ,triggerAction: 'all'
                    ,store: new LABKEY.ext.Store({
                        containerPath: 'WNPRC/EHR/',
                        schemaName: 'ehr_lookups',
                        queryName: 'areas',
                        sort: 'area',
                        autoLoad: true
                    }),
                    ref: 'areaField'

                },
                {
                    emptyText:''
                    ,fieldLabel: 'Room'
                    ,ref: 'roomField'
                    ,xtype: 'combo'
                    ,displayField:'room'
                    ,valueField: 'room'
                    ,typeAhead: true
                    ,triggerAction: 'all'
                    ,editable: true
                    ,store: new LABKEY.ext.Store({
                    containerPath: 'WNPRC/EHR/',
                    schemaName: 'ehr_lookups',
                    queryName: 'rooms',
                    sort: 'room',
                    autoLoad: true
                })
                },
                {
                    xtype: 'textfield',
                    ref: 'cageField',
                    fieldLabel: 'Cage'
                }
            ],
//            buttons: [
//                {
//                    xtype: 'button',
//                    text: 'Add Animals',
//                    handler: this.getAnimals,
//                    scope: this
//                }
//            ]
            buttons: [{
                text:'Submit',
                disabled:false,
                ref: '../submit',
                scope: this,
                handler: function(s){
                    this.getAnimals();
                    this.ownerCt.hide();
                }
            },{
                text: 'Close',
                scope: this,
                handler: function(){
                    this.ownerCt.hide();
                }
            }]
            //buttonAlign: 'left'
        });

        EHR.ext.AnimalSelector.superclass.initComponent.call(this, arguments);
    },

    getFilterArray: function(button)
    {
        var room = (this.roomField ? this.roomField.getValue() : null);
        var cage = (this.cageField ? this.cageField.getValue() : null);
        var area = (this.areaField ? this.areaField.getValue() : null);

        //we clean up, combine subjects
        var subjectList = this.subjArea.getValue();
        subjectList = subjectList.replace(/[\s,;]+/g, ';');
        subjectList = subjectList.replace(/(^;|;$)/g, '');
        subjectList = subjectList.toLowerCase();

        var filterArray = [];

        if (area)
            filterArray.push(LABKEY.Filter.create('curLocation/area', area, LABKEY.Filter.Types.STARTS_WITH));

        if (room)
            filterArray.push(LABKEY.Filter.create('curLocation/room', room, LABKEY.Filter.Types.STARTS_WITH));

        if (cage)
            filterArray.push(LABKEY.Filter.create('curLocation/cage', cage, LABKEY.Filter.Types.EQUAL));

        if (subjectList)
            filterArray.push(LABKEY.Filter.create('Id', subjectList, LABKEY.Filter.Types.EQUALS_ONE_OF));

        return filterArray;
    },

    getAnimals: function(button)
    {
        Ext.Msg.wait("Loading...");

        var filterArray = this.getFilterArray();

        if (!filterArray.length)
        {
            Ext.Msg.hide();
            alert('Must Enter A Filter');
            return;
        }

        //find distinct animals matching criteria
        LABKEY.Query.selectRows({
            schemaName: 'study',
            queryName: 'Animal',
            viewName: 'Alive, at WNPRC',
            //containerPath: 'WNPRC/EHR/',
            filterArray: filterArray,
            scope: this,
            successCallback: this.onSuccess
        });

    },
    onSuccess: function(results){
        if (!results.rows || !results.rows.length)
        {
            alert('No matching animals were found.');
            Ext.Msg.hide();
            return;
        }

        var ids = {};
        Ext.each(results.rows, function(row)
        {
            if (!ids[row.Id])
                ids[row.Id] = 0;

            ids[row.Id] += 1;
        }, this);

        if (this.targetStore)
        {
            var records = [];
            for(var i in ids)
                records.push({Id: i});
            this.targetStore.addRecords(records, 0);
        }

        Ext.Msg.hide();
    }

});
Ext.reg('ehr-animalselector', EHR.ext.AnimalSelector);



EHR.ext.TaskHeader = Ext.extend(Ext.FormPanel, {
    initComponent: function()
    {
        this.store = new EHR.ext.AdvancedStore({
            //xtype: 'ehr-store',
            //containerPath: 'WNPRC/EHR/',
            schemaName: 'ehr',
            queryName: 'tasks',
            columns: EHR.ext.FormColumns.tasks,
            filterArray: [LABKEY.Filter.create('taskid', this.formUUID, LABKEY.Filter.Types.EQUAL)],
            metadata: EHR.ext.getTableMetadata('tasks', ['Task']),
            storeId: 'ehr||tasks||',
            formUUID: this.formUUID,
            autoLoad: true,
            canSaveInTemplate: false
        });

        Ext.apply(this, {
            autoHeight: true
            ,autoWidth: true
            ,name: 'tasks'
            ,bodyBorder: false
            ,border: false
            ,bodyStyle: 'padding:5px'
            ,style: 'margin-bottom: 15px'
            ,plugins: ['databind']
            ,readOnly: true
            ,buttonAlign: 'left'
            ,tbar: {hidden: true}
            ,items: [{
                xtype: 'displayfield',
                fieldLabel: 'Task Id',
                name: 'rowid',
                dataIndex: 'rowid'
            },{
                xtype: 'displayfield',
                fieldLabel: 'Task Type',
                name: 'formtype',
                dataIndex: 'formtype',
                value: this.parentPanel.formType
            },{
                xtype: 'textfield',
                fieldLabel: 'Task Title',
                value: this.parentPanel.formType,
                name: 'title',
                dataIndex: 'title',
                allowBlank: false
            },{
                xtype: 'datefield',
                fieldLabel: 'Due Date',
                name: 'duedate',
                dataIndex: 'duedate'
            },{
                xtype: 'combo'
                ,fieldLabel: 'Assigned To'
                ,name: 'assignedto'
                ,dataIndex: 'assignedto'
                ,displayField:'DisplayName'
                ,valueField: 'UserId'
                ,forceSelection: true
                ,typeAhead: false
                ,triggerAction: 'all'
                ,mode: 'local'
                ,store: {
                    xtype: 'labkey-store',
                    containerPath: 'WNPRC/EHR/',
                    schemaName: 'core',
                    queryName: 'users',
                    sort: 'DisplayName',
                    autoLoad: true
                }
            },{
                xtype: (debug ? 'combo' : 'hidden')
                ,fieldLabel: 'Status'
                ,ref: 'qcstate'
                ,name: 'qcstate'
                ,dataIndex: 'qcstate'
                ,displayField:'Label'
                ,valueField: 'RowId'
                ,forceSelection: true
                ,typeAhead: false
                ,triggerAction: 'all'
                ,disabled: true
                ,mode: 'local'
                ,store: {
                    xtype: 'labkey-store',
                    containerPath: 'WNPRC/EHR/',
                    schemaName: 'study',
                    queryName: 'QCState',
                    autoLoad: true,
                    sort: 'Label'
                }
            }]
            ,buttons: [{
                xtype: 'button',
                text: 'Apply Template',
                scope: this,
                disabled: !this.canUseTemplates===false,
                handler: this.applyTemplate
            },{
                xtype: 'button',
                text: 'Save As Template',
                scope: this,
                disabled: !this.canUseTemplates===false,
                handler: this.saveTemplate
            }]
        });

        EHR.UTILITIES.rApplyIf(this, {
            bindConfig: {
                disableUnlessBound: false
                ,bindOnChange: false
                ,autoBindRecord: true
                ,showDeleteBtn: false
            }
            ,ref: 'taskHeader'
            ,defaults: {
                width: 160,
                border: false,
                bodyBorder: false
                //parentPanel: this.parentPanel || this
            }
        });

        EHR.ext.TaskHeader.superclass.initComponent.call(this, arguments);

    },
    saveTemplate: function(){
        var theWindow = new Ext.Window({
            closeAction:'hide',
            width: 800,
            minWidth: 300,
            maxWidth: 800,
            title: 'Save As Template',
            items: [{
                xtype: 'ehr-savetemplatepanel',
                ref: 'theForm',
                importPanel: this.parentPanel,
                formType: this.formType
            }]
        });
        theWindow.show();
    },

    applyTemplate: function(){
        var theWindow = new Ext.Window({
            closeAction:'hide',
            title: 'Apply Template To Form',
            width: 350,
            items: [{
                xtype: 'ehr-applytemplatepanel',
                ref: 'theForm',
                importPanel: this.parentPanel,
                formType: this.formType
            }]
        });
        theWindow.show();
    }
});
Ext.reg('ehr-taskheader', EHR.ext.TaskHeader);

EHR.ext.ClinicalHeader = Ext.extend(Ext.FormPanel, {
    initComponent: function()
    {
        EHR.UTILITIES.rApplyIf(this, {
            autoHeight: true
            ,autoWidth: true
            ,name: 'encounters'
            ,title: 'Header'
            ,bodyBorder: false
            ,border: false
            ,bodyStyle: 'padding:5px'
            ,buttons: []
            ,plugins: ['databind']
            //databind plugin options
            ,bindConfig: {
                disableUnlessBound: true
                ,bindOnChange: false
                ,autoBindRecord: true
                ,showDeleteBtn: false
            }
            ,monitorValid: false
            ,defaults: {
                border: false,
                bodyBorder: false
                //parentPanel: this.parentPanel || this
            }
            ,items: [
                {
                    layout: 'column'
                    ,labelAlign: 'top'
                    ,defaults: {
                        border: false,
                        bodyBorder: false
                    }
                    ,items: [
                    {
                        columnWidth:'250px',
                        style:'padding-right:4px;padding-top:0px',
                        layout: 'form',
                        defaults: {
                            //parentPanel: this.parentPanel || this,
                            border: false,
                            bodyBorder: false
                        },
                        items: [
                            {
                                xtype:'ehr-participant',
                                name: 'Id',
                                dataIndex: 'Id',
                                allowBlank: false,
                                ref: '../../Id',
                                msgTarget: 'under'
                            }
                        ]
                    },
                    {
                        columnWidth:'300px',
                        layout: 'form',
                        border: false,
                        bodyBorder: false,
//                        defaults: {
//                            parentPanel: this.parentPanel || this
//                        },
                        items: [
                            {
                                xtype:'xdatetime',
                                name: 'date',
                                dataIndex: 'date',
                                allowBlank: false,
                                ref: '../../date',
                                fieldLabel: 'Date/Time',
                                dateFormat: 'Y-m-d',
                                timeFormat: 'H:i'
                            }
                        ]
                    },
                    {
                        //columnWidth:'220px',
                        style:'padding-left:5px;padding-top:0px',
                        layout: 'form',
                        ref: '../projectCt',
                        defaults: {
//                            parentPanel: this.parentPanel || this,
                            border: false,
                            bodyBorder: false
                        },
                        items: [
                            {
                                xtype:'ehr-project',
                                name: 'project',
                                width: 140,
                                dataIndex: 'project',
                                msgTarget: 'under',
                                allowBlank: false,
                                ref: '../../project'
                            }
                        ]
                    }
                ]
                }
            ]
        });

        this.store = {
            xtype: 'ehr-store',
            containerPath: 'WNPRC/EHR/',
            schemaName: 'study',
            queryName: 'Clinical Encounters',
            columns: EHR.ext.FormColumns['Clinical Encounters'],
            filterArray: [LABKEY.Filter.create('taskId', this.parentPanel.formUUID, LABKEY.Filter.Types.EQUAL)],
            metadata: this.metadata || EHR.ext.getTableMetadata('Clinical Encounters', ['Task,Encounter']),
            //maxRows: 1,
            storeId: 'study||Clinical Encounters||',
            autoLoad: true,
            canSaveInTemplate: false
        }

        EHR.ext.ClinicalHeader.superclass.initComponent.call(this, arguments);

        this.addEvents('participantvalid', 'participantinvalid');
        this.projectCt.addEvents('participantvalid', 'participantinvalid');
        this.projectCt.relayEvents(this, ['participantvalid', 'participantinvalid']);

        if (this.parentPanel){
            this.parentPanel.relayEvents(this, ['participantvalid', 'participantinvalid']);
        }
    }
});
Ext.reg('ehr-clinheader', EHR.ext.ClinicalHeader);

EHR.ext.AbstractPanel = Ext.extend(Ext.FormPanel, {
    initComponent: function()
    {
        var panelDefaults = {
            border: false,
            bodyBorder: false,
            labelStyle: 'padding: 0px;'
        };

        Ext.apply(this, {
            name: 'abstract'
            ,title: 'Animal Info'
            ,labelWidth: 120
            ,autoHeight: true
            //,boxMinHeight: 255
            ,border: true
            ,bodyBorder: false
            ,participantMap: new Ext.util.MixedCollection(null, function(f){return f.Id})
            ,defaults: panelDefaults
            ,defaultType: 'displayfield'
            ,style: 'margin-bottom: 15px'
            ,bodyStyle: 'padding:5px'
            ,ref: '../../abstract'
            ,items: [{
                xtype: 'panel',
                layout: 'form',
                labelWidth: 170,
                defaults: panelDefaults,
                ref: 'placeForAbstract',
                //235 is the height of the Clinical Summary view
                height: this.boxMinHeight || 235,
                items: [{html: 'No Animal Selected'}]
            },{
                xtype: 'panel',
                defaults: panelDefaults,
                border: false,
                bodyBorder: false,
                items: [{tag: 'div', ref: '../placeForQwp'}]
            }]
        });
        EHR.ext.AbstractPanel.superclass.initComponent.call(this, arguments);

        this.addEvents('participantvalid', 'participantinvalid', 'participantloaded');
        this.enableBubble('participantloaded');

        if (this.parentPanel){
            this.mon(this.parentPanel, 'participantvalid', this.fetchAbstract, this);
            this.mon(this.parentPanel, 'participantinvalid', this.clearAbstract, this);
            this.parentPanel.participantMap = this.participantMap;
        }

    },
    fetchAbstract: function(field)
    {
        field.participantMap = this.participantMap;

        var id = field.getValue();

        //no need to reload if ID is unchanged
        if (this.loadedId == id){
            return;
        }

        this.placeForAbstract.removeAll();
        this.placeForQwp.update();

        if(!id){
            this.placeForAbstract.add({html: 'No Animal Selected'});
            this.doLayout();
        }
        else {
            this.loadedId = id;
            this.participantMap.add(id, {loading: true});

            LABKEY.Query.selectRows({
                schemaName: this.schemaName || 'study',
                queryName: this.queryName || 'animal',
                viewName: this.viewName || 'Clinical Summary',
                //columns: '',
                containerPath: 'WNPRC/EHR/',
                filterArray: [LABKEY.Filter.create('Id', id, LABKEY.Filter.Types.EQUAL)],
                scope: this,
                successCallback: function(data){
                    this.renderAbstract(data, id, field)
                }
            });

            if(this.queryConfig){
                var qwpConfig = {
                    allowChooseQuery: false,
                    allowChooseView: true,
                    showRecordSelectors: true,
                    frame: 'none',
                    showDeleteButton: false,
                    timeout: 0,
                    linkTarget: '_new',
                    renderTo: this.placeForQwp.id,
                    scope: this,
                    errorCallback: function(error){
                        EHR.UTILITIES.onError(error)
                    }
                };
                Ext.apply(qwpConfig, this.queryConfig);

                qwpConfig.filterArray = qwpConfig.filterArray || [];
                qwpConfig.filterArray.push(LABKEY.Filter.create('Id', id, LABKEY.Filter.Types.EQUAL));

                this.QWP = new LABKEY.QueryWebPart(qwpConfig);
            }
        }
    },
    renderAbstract: function(data, id, field)
    {
        this.placeForAbstract.removeAll();
        if (!data.rows.length)
        {
            this.participantMap.replace(id, {});
            this.add({html: 'Invalid ID'});
            field.validate();
        }
        else
        {
            var row = data.rows[0];
            if (row['Status/Status'] != 'Alive'){
                alert('Animal: '+id+' is not currently alive and at WNPRC');
            }

            Ext.each(data.metaData.fields, function(c)
            {
                if (c.hidden)
                    return false;
                var value = row['_labkeyurl_' + c.name] ? '<a href="' + row['_labkeyurl_' + c.name] + '" target=new>' + row[c.name] + '</a>' : row[c.name];
                this.placeForAbstract.add({id: c.name, xtype: 'displayfield', fieldLabel: c.caption, value: value, submitValue: false});
            }, this);

            //this.loadedId = row['Id'];
            this.participantMap.replace(row['Id'], row);
            this.fireEvent('participantloaded', this, row['Id'], row);
        }

        this.doLayout();
        this.expand();
    },
    clearAbstract: function(c)
    {
        delete c.loadedId;

        if (c.getValue())
        {
            this.placeForAbstract.removeAll();
            this.placeForQwp.update();
            this.doLayout();
        }
    }

});
Ext.reg('ehr-abstractpanel', EHR.ext.AbstractPanel);


EHR.ext.QueryPanel = Ext.extend(Ext.Panel, {
    initComponent: function(){
        Ext.applyIf(this, {
            width: 'auto',
            layout: 'anchor',
            border: false,
            //headerStyle: 'background-color : transparent;background : transparent;',
            frame: false,
            autoHeight: true,
            listeners: {
                scope: this,
                activate: this.loadQuery,
                click: this.loadQuery
            },
            bodyStyle: 'padding:5px;'
        });

        EHR.ext.QueryPanel.superclass.initComponent.call(this, arguments);
    },
    loadQuery: function(tab){
        if(tab.isLoaded)
            return;

        var target = tab.body;
        var qwpConfig = {
            schemaName: 'ehr',
            queryName: tab.queryName,
            allowChooseQuery: false,
            allowChooseView: true,
            showRecordSelectors: true,
            frame: 'none',
            showDeleteButton: false,
            timeout: 0,
            linkTarget: '_new',
            renderTo: target.id,
            errorCallback: function(error){
                EHR.UTILITIES.onError(error)
            },
            scope: this
        };
        Ext.apply(qwpConfig, tab.queryConfig);

        tab.QWP = new LABKEY.QueryWebPart(qwpConfig);
        tab.isLoaded = true;
    }
});
Ext.reg('ehr-qwppanel', EHR.ext.QueryPanel);

EHR.ext.RecordDuplicator = Ext.extend(Ext.FormPanel, {
    initComponent: function()
    {
        Ext.applyIf(this, {
            layout: 'form'
            ,bodyBorder: true
            ,border: true
            ,bodyStyle: 'padding:5px'
            ,defaults: {
                width: 200,
                border: false,
                bodyBorder: false
            }
            ,items: [{
                xtype: 'numberfield',
                fieldLabel: 'Number of Records',
                ref: 'newRecs',
                value: 1
            },{
                xtype: 'fieldset',
                fieldLabel: 'Choose Fields to Copy',
                items: []
            }]
            ,scope: this
            ,buttons: [{
                text:'Submit',
                disabled:false,
                ref: '../submit',
                scope: this,
                handler: function(s){
                    this.duplicate();
                    this.ownerCt.hide();
                }
            },{
                text: 'Close',
                scope: this,
                handler: function(){
                    this.ownerCt.hide();
                }
            }]
        });

        this.populateForm();

        if(!this.records || !this.records.length){
            this.ownerCt.hide();
        }
        EHR.ext.RecordDuplicator.superclass.initComponent.call(this, arguments);
    },

    populateForm: function(){
        this.targetStore.fields.each(function(f){
            if (!f.hidden && f.shownInInsertView && f.allowDuplicateValue!==false){
                this.items[1].items.push({
                    xtype: 'checkbox',
                    dataIndex: f.dataIndex,
                    name: f.dataIndex,
                    fieldLabel: f.fieldLabel,
                    checked: !f.noDuplicateByDefault
                })
            }
        }, this);

    },

    duplicate: function(){
        var newRec;
        for (var i=0;i<this.newRecs.getValue();i++){
            Ext.each(this.records, function(rec){
                var data = {};
                this.getForm().items.each(function(f){
                    if(f.checked){
                        data[f.dataIndex] = rec.get(f.dataIndex);
                    }
                }, this);
                newRec = this.targetStore.addRecord(data);
            }, this);
        }
    }
});
Ext.reg('ehr-recordduplicator', EHR.ext.RecordDuplicator);

EHR.ext.ClinPathOrderPanel = Ext.extend(Ext.FormPanel, {
    initComponent: function()
    {
        Ext.applyIf(this, {
            layout: 'form'
            ,bodyBorder: true
            ,border: true
            ,bodyStyle: 'padding:5px'
            ,defaults: {
                width: 200,
                border: false,
                bodyBorder: false
            }
            ,items: [{
                xtype: 'ehr-participant',
                value: this.defaultAnimal
            },{
                xtype: 'ehr-remotecheckboxgroup',
                ref: 'testName',
                displayField: 'type',
                valueField: 'type',
                store: new LABKEY.ext.Store({
                    schemaName: 'ehr_lookups',
                    queryName: 'clinpath_request_type'
                })
            }]
            ,scope: this
            ,buttons: [{
                text:'Submit',
                disabled:false,
                ref: '../submit',
                scope: this,
                handler: function(s){
                    this.onSubmit();
                    this.ownerCt.hide();
                }
            },{
                text: 'Close',
                scope: this,
                handler: function(){
                    this.ownerCt.hide();
                }
            }]
        });

        EHR.ext.ClinPathOrderPanel.superclass.initComponent.call(this, arguments);
    },

    onSubmit: function(){
        var data = this.getForm().getValues();
        var tests  = this.testName.getValue()
        console.log(data)



    }
});
Ext.reg('ehr-clinpathorderpanel', EHR.ext.ClinPathOrderPanel);

EHR.ext.ApplyTemplatePanel = Ext.extend(Ext.FormPanel, {
    initComponent: function()
    {
        Ext.applyIf(this, {
            layout: 'form'
            ,bodyBorder: true
            ,border: true
            ,bodyStyle: 'padding:5px'
            ,defaults: {
                width: 200,
                border: false,
                bodyBorder: false
            }
            ,items: [{
                xtype: 'combo',
                displayField: 'title',
                valueField: 'entityid',
                triggerAction: 'all',
                fieldLabel: 'Template Name',
                ref: 'templateName',
                store: new LABKEY.ext.Store({
                    schemaName: 'ehr',
                    queryName: 'formtemplates',
                    sort: 'title',
                    autoLoad: true,
                    filterArray: [LABKEY.Filter.create('formtype', this.formType, LABKEY.Filter.Types.EQUAL)]
                })
            }]
            ,scope: this
            ,buttons: [{
                text:'Submit',
                disabled:false,
                ref: '../submit',
                scope: this,
                handler: this.onSubmit
            },{
                text: 'Close',
                scope: this,
                handler: function(){
                    this.ownerCt.hide();
                }
            }]
        });

        EHR.ext.ApplyTemplatePanel.superclass.initComponent.call(this, arguments);
    },

    onSubmit: function(){
        this.ownerCt.hide();
        var templateId = this.templateName.getValue();
        if(!templateId)
            return;

        EHR.UTILITIES.loadTemplate(templateId);
    }
});
Ext.reg('ehr-applytemplatepanel', EHR.ext.ApplyTemplatePanel);

EHR.ext.SaveTemplatePanel = Ext.extend(Ext.Panel, {
    initComponent: function()
    {
        Ext.applyIf(this, {
            //layout: 'form',
            //labelAlign: 'top',
            bodyBorder: false
            ,border: false
            //,width: 'auto'
            ,minWidth: 300
            ,minBoxWidth: 300
            ,bodyStyle: 'padding:5px'
            ,defaults: {
                //width: 200,
                border: false,
                bodyBorder: false
            }
            ,items: [{
                layout: 'form',
                monitorValid: true,
                items: [{
                    xtype: 'textfield',
                    fieldLabel: 'Template Name',
                    allowBlank: false,
                    ref: '../templateName',
                    listeners: {
                        scope: this,
                        change: function(f){
                            this.buttons[0].setDisabled(!f.getValue())
                        }
                    }
                },{
                    xtype: 'textarea',
                    fieldLabel: 'Description',
                    width: 300,
                    ref: '../templateDescription'
                }]
            },{
                html: 'You can elect to save either all or some of the records in this form as a template.  For each section, you can choose which fields to save.',
                style: 'padding-bottom:10px;padding-top:10px;'
            }]
            ,scope: this
            ,buttons: [{
                text:'Submit',
                scope: this,
                disabled: true,
                handler: function(s){
                    this.onSubmit();
                    this.ownerCt.hide();
                }
            },{
                text: 'Close',
                scope: this,
                handler: function(){
                    this.ownerCt.hide();
                }
            }]
        });

        if(!this.importPanel.store || !this.importPanel.store)
            return;
        else if (this.importPanel.store instanceof EHR.ext.StoreCollection)
            this.populateFromStoreCollection();
        else if (this.importPanel.store instanceof LABKEY.ext.Store)
            this.populateFromStore();

        EHR.ext.SaveTemplatePanel.superclass.initComponent.call(this, arguments);

        this.ownerCt.on('show', function(){
            this.templateName.focus(false, 50);
        }, this);
    },
    populateFromStoreCollection: function(){
        var hasRecords = false;
        this.importPanel.store.each(function(s){
            if(s.canSaveInTemplate === false)
                return;

            this.addStore(s);
            if(s.getCount())
                hasRecords = true;
        }, this);

        if(!hasRecords){
            this.ownerCt.on('beforeshow', function(){return false}, this, {single: true});
            this.ownerCt.hide();
            Ext.Msg.alert('Error', 'There are no records to save.');
        }
    },
    populateFromStore: function(){
        if(!this.importPanel.store.getCount()){
            this.ownerCt.on('beforeshow', function(){return false}, this, {single: true});
            this.ownerCt.hide();
            Ext.Msg.alert('Error', 'There are no records to save.');
        }
        else
            this.addStore(this.importPanel.store);
    },
    addStore: function(store){
        this.items.push({
            html: '<b>'+store.queryName + ':</b> '+store.getCount()+' Records',
            style: 'padding-bottom:5px;'
        },{
            xtype: 'radiogroup',
            ref: store.storeId+'-radio',
            columns: 3,
            items: [{
                fieldLabel: 'Include All',
                inputValue: 'all',
                checked: true,
                name: store.storeId+'-radio'
            },{
                fieldLabel: 'Include None',
                inputValue: 'none',
                name: store.storeId+'-radio'
            },{
                fieldLabel: 'Selected Only',
                inputValue: 'selected',
                name: store.storeId+'-radio'
            }]
        });

        if(!store.getCount()){
            return
        }

        var toAdd = {
            xtype: 'checkboxgroup',
            style: 'padding-left:10px;',
            name: store.storeId,
            columns: 4,
            items: []
        };
        store.fields.each(function(f){
            if(!f.hidden && f.shownInInsertView && f.allowSaveInTemplate!==false && f.allowDuplicate!==false){
                toAdd.items.push({
                    xtype: 'checkbox',
                    dataIndex: f.dataIndex,
                    name: f.dataIndex,
                    fieldLabel: f.fieldLabel || f.name,
                    checked: !f.noDuplicateByDefault
                })
            }
        }, this);

        this.items.push(toAdd);
    },
    onSubmit: function(){
        this.ownerCt.hide();
        Ext.Msg.wait("Saving...");

        var tn = this.templateName.getValue();
        var rows = [];

        this.items.each(function(item){
            if(item.getXType() == 'checkboxgroup'){
                var fields = item.getValue();
                if(!fields.length)
                    return;

                var store = Ext.StoreMgr.get(item.name);
                var selections = this[store.storeId+'-radio'].getValue().inputValue;

                if(selections == 'none')
                    return;

                var records;

                if(selections == 'selected'){
                    records = this.grid.getSelectionModel().getSelections();
                    if(!records.length){
                        Ext.Msg.hide();
                        Ext.Msg.alert('Error', 'No records were selected in the grid');
                    }
                }
                else
                    records = store.data.items;

                Ext.each(records, function(rec){
                    var json = {};
                    Ext.each(fields, function(chk){
                        json[chk.dataIndex] = rec.get(chk.dataIndex);
                    }, this);

                    rows.push({
                        templateId: null,
                        storeId: store.storeId,
                        json: Ext.util.JSON.encode(json),
                        templateName: tn
                    })
                }, this);
            }
        }, this);

        if(!rows.length){
            Ext.Msg.hide();
            Ext.Msg.alert('Error', "No records selected");
            return;
        };

        LABKEY.Query.insertRows({
            schemaName: 'ehr',
            queryName: 'formtemplates',
            scope: this,
            rowDataArray: [{
                title: tn,
                description: this.templateDescription.getValue(),
                formType: this.formType
            }],
            success: function(rows){return function(data){
                Ext.each(rows, function(r){
                    r.templateId = data.rows[0].entityid;
                }, this);

                LABKEY.Query.insertRows({
                    schemaName: 'ehr',
                    queryName: 'formTemplateRecords',
                    rowDataArray: rows,
                    failure: EHR.UTILITIES.onError,
                    success: function(){
                        Ext.Msg.hide();
                    }
                });
            }}(rows),
            failure: EHR.UTILITIES.onError
        });
    }
});
Ext.reg('ehr-savetemplatepanel', EHR.ext.SaveTemplatePanel);


EHR.ext.createTaskPanel = function(config){

    LABKEY.Query.selectRows({
        schemaName: 'ehr',
        queryName: 'formpanelsections',
        filterArray: [LABKEY.Filter.create('formType', config.formType, LABKEY.Filter.Types.EQUAL)],
        sort: 'destination,sort_order',
        successCallback: onSuccess
    });

    function onSuccess(data){
        if(!data.rows.length){
            //we assume this is a simple query:
            config.queryName = config.formType;
            config.schemaName = 'study';
            EHR.ext.createSimpleTaskPanel(config);
            return;
        }

        var panelCfg = Ext.apply({}, config);
        Ext.applyIf(panelCfg, {
            title: config.formType,
            formHeaders: [],
            formSections: [],
            formTabs: []
        });

        Ext.each(data.rows, function(row){
            var metaSources;
            if(row.metadatasources)
                metaSources = row.metadatasources.split(',');

            var obj = {
                xtype: row.xtype,
                schemaName: row.schemaName,
                queryName: row.queryName,
                title: row.title || row.queryName,
                metadata: EHR.ext.getTableMetadata(row.queryName, metaSources)
            };

            if(row.buttons)
                obj.tbarBtns = row.buttons.split(',');

            if(row.initialTemplates && !config.formUUID)
                panelCfg.initialTemplates = (panelCfg.initialTemplates ? panelCfg.initialTemplates+','+row.initialTemplates : row.initialTemplates);

            if(row.configJson){
                var json = Ext.util.JSON.decode(row.configJson);
                Ext.apply(obj, json);
            }

            panelCfg[row.destination].push(obj);
        }, this);

        return new EHR.ext.TaskPanel(panelCfg);
    }

};


EHR.ext.createSimpleTaskPanel = function(config){
    if(!config || !config.queryName){
         alert('Must provide queryName');
         return;
    }

    var panelCfg = Ext.apply({}, config);
    Ext.apply(panelCfg, {
        title: config.queryName,
        formHeaders: [{xtype: 'ehr-abstractpanel'}],
        formSections: [{
            xtype: 'ehr-gridformpanel',
            schemaName: config.schemaName,
            queryName: config.queryName,
            title: config.title || config.queryName,
            columns: EHR.ext.FormColumns[config.queryName],
            metadata: EHR.ext.getTableMetadata(config.queryName, ['Task'])
        }],
        formTabs: []
    });

    return new EHR.ext.TaskPanel(panelCfg);
};