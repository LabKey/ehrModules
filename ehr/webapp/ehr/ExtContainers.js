/*
 * Copyright (c) 2010-2011 LabKey Corporation
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
                    ,mode: 'local'
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



EHR.ext.ImportPanelHeader = Ext.extend(EHR.ext.FormPanel, {
    initComponent: function()
    {
        Ext.apply(this, {
            autoHeight: true
            ,autoWidth: true
            ,name: 'tasks'
            ,bodyBorder: false
            ,border: false
            ,bodyStyle: 'padding:5px'
            ,style: 'margin-bottom: 15px'
            ,plugins: ['databind']
            ,readOnly: false
            ,buttonAlign: 'left'
            ,tbar: {hidden: true}
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
//            },{
//                xtype: 'button',
//                text: 'Print Form',
//                scope: this,
//                handler: this.printFormHandler
            }]
        });

        EHR.utils.rApplyIf(this, {
            bindConfig: {
                disableUnlessBound: false
                ,bindOnChange: false
                ,autoBindRecord: true
                ,showDeleteBtn: false
            }
            ,ref: 'importPanelHeader'
            ,defaults: {
                width: 160,
                border: false,
                bodyBorder: false,
                importPanel: this.importPanel || this
            }
        });

        EHR.ext.ImportPanelHeader.superclass.initComponent.call(this, arguments);

    },
    saveTemplate: function(){
        var theWindow = new EHR.ext.SaveTemplatePanel({
            width: 600,
            height: 300,
            importPanel: this.importPanel,
            formType: this.formType
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
                importPanel: this.importPanel,
                formType: this.formType
            }]
        });
        theWindow.show();
    },
    printFormHandler: function(){
        window.location = LABKEY.ActionURL.buildURL(
            'ehr',
            'printTask.view',
            (this.containerPath || LABKEY.ActionURL.getContainer()),
            {
                taskid: this.formUUID,
                formtype: this.formType,
                _print: 1
            }
        );
    }
});
Ext.reg('ehr-importpanelheader', EHR.ext.ImportPanelHeader);

EHR.ext.ClinicalHeader = Ext.extend(Ext.FormPanel, {
    initComponent: function()
    {
        EHR.utils.rApplyIf(this, {
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
                //importPanel: this.importPanel || this
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
                            //importPanel: this.importPanel || this,
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
//                            importPanel: this.importPanel || this
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
//                            importPanel: this.importPanel || this,
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
            filterArray: [LABKEY.Filter.create('taskId', this.importPanel.formUUID, LABKEY.Filter.Types.EQUAL)],
            metadata: this.metadata || EHR.ext.getTableMetadata('Clinical Encounters', ['Task,Encounter']),
            //maxRows: 1,
            storeId: 'study||Clinical Encounters||',
            autoLoad: true,
            canSaveInTemplate: false
        }

        EHR.ext.ClinicalHeader.superclass.initComponent.call(this, arguments);

        this.addEvents('participantchange');
        this.projectCt.addEvents('participantchange');
        this.projectCt.relayEvents(this, ['participantchange']);

        if (this.importPanel){
            this.importPanel.relayEvents(this, ['participantchange']);
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

        this.addEvents('participantchange', 'participantloaded');
        this.enableBubble('participantloaded');

        if (this.importPanel){
            this.mon(this.importPanel, 'participantchange', this.onParticipantChange, this);
            this.importPanel.participantMap = this.participantMap;
        }

    },
    onParticipantChange: function(field)
    {
        field.participantMap = this.participantMap;

        var id = field.getValue();

        //no need to reload if ID is unchanged
        if (this.loadedId == id){
            console.log('animal id is the same, no reload needed');
            return;
        }

        this.loadedId = id;

        this.placeForAbstract.removeAll();
        this.placeForQwp.update();

        if(!id){
            this.placeForAbstract.add({html: 'No Animal Selected'});
            this.doLayout();
        }
        else {
            this.participantMap.add(id, {loading: true});

            LABKEY.Query.selectRows({
                schemaName: this.schemaName || 'study',
                queryName: this.queryName || 'demographics',
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
                        EHR.utils.onError(error)
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
            this.placeForAbstract.add({html: 'Id not found: '+id});
        }
        else
        {
            var row = data.rows[0];
            if (!this.allowDeadAnimals && row['Id/Status/Status'] != 'Alive'){
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
    }
//    clearAbstract: function(c)
//    {
//        delete c.loadedId;
//
//        if (c.getValue())
//        {
//            this.placeForAbstract.removeAll();
//            this.placeForQwp.update();
//            this.doLayout();
//        }
//    }

});
Ext.reg('ehr-abstractpanel', EHR.ext.AbstractPanel);


EHR.ext.QueryPanel = Ext.extend(Ext.Panel, {
    initComponent: function(){
        Ext.applyIf(this, {
            width: 'auto',
            layout: 'anchor',
            autoScroll: true,
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

        if(this.autoLoad){
            this.loadQuery(this);
        }
    },
    loadQuery: function(tab){
        if(tab.isLoaded)
            return;

        if(!tab.rendered){
            this.on('render', this.loadQuery, this, {single: true});
            return;
        }

        var target = tab.body;
        var qwpConfig = {
            schemaName: tab.schemaName,
            queryName: tab.queryName,
            filters: tab.filterArray,
            allowChooseQuery: false,
            allowChooseView: true,
            showRecordSelectors: true,
            showDetailsColumn: false,
//            showUpdateColumn: false,
            frame: 'none',
            showDeleteButton: false,
            timeout: 0,
            linkTarget: '_new',
            renderTo: target.id,
            errorCallback: function(error){
                EHR.utils.onError(error)
            },
            success: function(result){
                tab.isLoaded = true;
            },
            scope: this
        };
        Ext.apply(qwpConfig, tab.queryConfig);
console.log(qwpConfig)
        tab.QWP = new LABKEY.QueryWebPart(qwpConfig);

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

//EHR.ext.ClinPathOrderPanel = Ext.extend(Ext.FormPanel, {
//    initComponent: function()
//    {
//        Ext.applyIf(this, {
//            layout: 'form'
//            ,bodyBorder: true
//            ,border: true
//            ,bodyStyle: 'padding:5px'
//            ,defaults: {
//                width: 200,
//                border: false,
//                bodyBorder: false
//            }
//            ,items: [{
//                xtype: 'ehr-participant',
//                value: this.defaultAnimal
//            },{
//                xtype: 'ehr-remotecheckboxgroup',
//                ref: 'testName',
//                displayField: 'label',
//                valueField: 'dataset',
//                store: new LABKEY.ext.Store({
//                    schemaName: 'ehr_lookups',
//                    queryName: 'clinpath_services'
//                })
//            }]
//            ,scope: this
//            ,buttons: [{
//                text:'Submit',
//                disabled:false,
//                ref: '../submit',
//                scope: this,
//                handler: function(s){
//                    this.onSubmit();
//                    this.ownerCt.hide();
//                }
//            },{
//                text: 'Close',
//                scope: this,
//                handler: function(){
//                    this.ownerCt.hide();
//                }
//            }]
//        });
//
//        EHR.ext.ClinPathOrderPanel.superclass.initComponent.call(this, arguments);
//    },
//
//    onSubmit: function(){
//        var data = this.getForm().getValues();
//        var tests  = this.testName.getValue()
//        console.log(data)
//
//
//
//    }
//});
//Ext.reg('ehr-clinpathorderpanel', EHR.ext.ClinPathOrderPanel);


//creates a pair of date fields that automatically set their min/max dates to create a date range
EHR.ext.DateRangePanel = Ext.extend(Ext.Panel,
{
    initComponent : function(config)
    {
        var defaults = {
            //cls: 'extContainer',
            bodyBorder: false,
            border: false,
            defaults: {
                border: false,
                bodyBorder: false
            }
        };

        Ext.applyIf(defaults, config);

        Ext.apply(this, defaults);

        EHR.ext.DateRangePanel.superclass.initComponent.call(this);

        this.startDateField = new LABKEY.ext.DateField({
            format: 'Y-M-d' //YYYY-MMM-DD
            ,width: 165
            ,name:'startDate'
            ,allowBlank:true
            ,vtype: 'daterange'
            ,scope: this
            ,value: LABKEY.ActionURL.getParameter('startDate')
        });

        this.endDateField = new LABKEY.ext.DateField({
            format: 'Y-M-d' //YYYY-MMM-DD
            ,width:165
            ,name:'endDate'
            ,allowBlank:true
            ,vtype: 'daterange'
            ,scope: this
            ,value: LABKEY.ActionURL.getParameter('endDate')
        });

        Ext.apply(this.endDateField, {startDateField: this.startDateField});
        Ext.apply(this.startDateField, {endDateField: this.endDateField});

        this.add({tag: 'div', html: 'From:'});
        this.add(this.startDateField);
        this.add({tag: 'div', html: 'To:'});
        this.add(this.endDateField);
        this.add({tag: 'div', html: '<br>'});

    }

});
Ext.reg('DateRangePanel', EHR.ext.DateRangePanel);


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
            },{
                xtype: 'checkbox',
                fieldLabel: 'Customize Values',
                ref: 'customizeValues',
                checked: false
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

        this.loadTemplate(templateId);
    },

    loadTemplate: function(templateId){
        if(!templateId)
            return;

        LABKEY.Query.selectRows({
            schemaName: 'ehr',
            queryName: 'formtemplaterecords',
            filterArray: [LABKEY.Filter.create('templateId', templateId, LABKEY.Filter.Types.EQUAL)],
            sort: '-rowid',
            success: this.onLoadTemplate,
            scope: this
        });

        Ext.Msg.wait("Loading Template...");
    },

    onLoadTemplate: function(data){
        if(!data || !data.rows.length){
            Ext.Msg.hide();
            return;
        }

        var toAdd = {};
        Ext.each(data.rows, function(row){
            var data = Ext.util.JSON.decode(row.json);
            var store = Ext.StoreMgr.get(row.storeid);

            //verify store exists
            if(!store){
                Ext.StoreMgr.on('add', function(){
                    this.onLoadTemplate(data);
                }, this, {single: true, delay: 200});
                return false;
            };

            //also verify it is loaded
            if(!store.fields && store.fields.length){
                store.on('load', function(){
                    this.onLoadTemplate(data);
                }, this, {single: true, delay: 200});
                return false;
            };

            if(!toAdd[store.storeId])
                toAdd[store.storeId] = [];

            toAdd[store.storeId].push(data);
        });

        if(this.customizeValues.checked)
            this.customizeData(toAdd);
        else
            this.loadTemplateData(toAdd);
    },

    customizeData: function(toAdd){
        Ext.Msg.hide();

        //create window
        this.theWindow = new Ext.Window({
            closeAction:'hide',
            title: 'Customize Values',
            width: 350,
            items: [{
                xtype: 'tabpanel',
                autoHeight: true,
                ref: 'theForm',
                activeTab: 0
            }],
            scope: this,
            buttons: [{
                text:'Submit',
                disabled:false,
                ref: '../submit',
                scope: this,
                handler: this.onCustomize
            },{
                text: 'Close',
                scope: this,
                handler: function(){
                    this.theWindow.hide();
                }
            }]
        });

        for (var i in toAdd){
            this.addStore(i, toAdd[i]);
        }

        this.theWindow.show();
    },

    addStore: function(storeId, records){
        var store = Ext.StoreMgr.get(storeId);
        if(!store){
            alert('ERROR: Store not found');
            return;
        }

        var toAdd = {
            xtype: 'form',
            //layout: 'form',
            ref: 'thePanel',
            autoHeight: true,
            storeId: storeId,
            records: records,
            items: []
        };

        store.fields.each(function(f){
            if(!f.hidden && f.shownInInsertView && f.allowSaveInTemplate!==false && f.allowDuplicate!==false){
                var editor = store.getFormEditorConfig(f.name);
                editor.width= 200;
                if (f.inputType == 'textarea')
                    editor.height = 100;

                var values = [];
                Ext.each(records, function(data){
                    if(data[f.dataIndex]!==undefined){
                        values.push(f.convert(data[f.dataIndex], data));
                    }
                }, this);

                values = Ext.unique(values);

                if(values.length==1)
                    editor.value=values[0];
                else if (values.length > 1){
                    editor.xtype = 'displayfield';
                    editor.value = values.join(';');
                }

                toAdd.items.push(editor);
            }
        }, this);

        this.theWindow.theForm.add({
            bodyStyle: 'padding: 5px;',
            title: store.queryName,
            autoHeight: true,
            defaults: {
                border: false,
                bodyStyle: 'padding: 5px;'
            },
            items: [{
                html: '<b>'+records.length+' Record'+(records.length==1 ? '' : 's')+' will be added.</b><br>If you enter values below, these will be applied to all new records, overriding any saved values.'
            },
                toAdd
            ]
        });
    },

    loadTemplateData: function(toAdd){
        for (var i in toAdd){
            var store = Ext.StoreMgr.get(i);
            store.addRecords(toAdd[i])
        }

        Ext.Msg.hide();
    },

    onCustomize: function(){
        var toAdd = {};
        this.theWindow.theForm.items.each(function(tab){
            var values = tab.thePanel.getForm().getFieldValues(true);
            toAdd[tab.thePanel.storeId] = tab.thePanel.records;
            Ext.each(tab.thePanel.records, function(r){
                Ext.apply(r, values);
            }, this);
        }, this);

        this.loadTemplateData(toAdd);
        this.theWindow.hide();
    }
});
Ext.reg('ehr-applytemplatepanel', EHR.ext.ApplyTemplatePanel);

EHR.ext.SaveTemplatePanel = Ext.extend(Ext.Window, {
    initComponent: function()
    {
        Ext.apply(this, {
            closeAction:'hide'
            ,title: 'Save As Template'
            ,xtype: 'panel'
            ,autoScroll: true
            ,autoHeight: true
            ,boxMaxHeight: 600
            ,defaults: {
                border: false
                ,bodyStyle: 'padding: 5px;'
            }
            ,items: [{
                layout: 'form',
                autoScroll: true,
                bodyStyle: 'padding: 5px;',
                monitorValid: true,
                defaults: {
                    border: false
                },
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
                },{
                    html: 'You can elect to save either all or some of the records in this form as a template.  For each section, you can choose which fields to save.',
                    style: 'padding-top:10px;'
                }]
            },{
                xtype: 'tabpanel',
                activeTab: 0,
                ref: 'theForm',
                autoScroll: true
            }]
            ,scope: this
            ,buttons: [{
                text:'Submit',
                scope: this,
                disabled: true,
                handler: function(s){
                    this.onSubmit();
                    this.hide();
                }
            },{
                text: 'Close',
                scope: this,
                handler: function(){
                    this.hide();
                }
            }]

        });

        EHR.ext.SaveTemplatePanel.superclass.initComponent.call(this, arguments);

        //function differently depending on whether we're bound to a grid or import panel
        if(this.grid)
            this.targetStore = this.grid.store;
        else
            this.targetStore = this.importPanel.store;

        if(!this.targetStore)
            return;
        else if (this.targetStore instanceof EHR.ext.StoreCollection)
            this.populateFromStoreCollection();
        else if (this.targetStore instanceof LABKEY.ext.Store)
            this.populateFromStore();

        this.on('show', function(){
            this.templateName.focus(false, 50);
        }, this);
    },
    populateFromStoreCollection: function(){
        var hasRecords = false;
        this.targetStore.each(function(s){
            if(s.canSaveInTemplate === false)
                return;

            this.addStore(s);
            if(s.getCount())
                hasRecords = true;
        }, this);

        if(!hasRecords){
            this.on('beforeshow', function(){return false}, this, {single: true});
            this.hide();
            Ext.Msg.alert('Error', 'There are no records to save.');
        }
    },
    populateFromStore: function(){
        if(!this.targetStore.getCount()){
            this.on('beforeshow', function(){return false}, this, {single: true});
            this.hide();
            Ext.Msg.alert('Error', 'There are no records to save.');
        }
        else
            this.addStore(this.targetStore);
    },
    addStore: function(store){
        var count = store.getCount();

        if(!count){
            return
        }
        var panel = {
            xtype: 'panel',
            title: store.queryName + ': '+count+' Record' + (count==1 ? '' : 's'),
            border: false,
            style: 'padding-bottom:10px;',
            autoHeight: true,
            storeId: store.storeId,
            items: [{
                xtype: 'fieldset',
                title: 'Choose Records To Save',
                items: [{
                    xtype: 'radiogroup',
                    style: 'padding-bottom:10px;',
                    //bodyStyle: 'padding: 5px;',
                    ref: '../recordSelector',
                    columns: 3,
                    //width: 400,
                    items: [{
                        fieldLabel: 'Include All',
                        inputValue: 'all',
                        checked: true,
                        name: store.storeId+'-radio'
                    },{
                        fieldLabel: 'Include None',
                        inputValue: 'none',
                        name: store.storeId+'-radio'
                    }]
                }]
            }]
        };

        if(this.grid){
            panel.items[0].items.push({
                fieldLabel: 'Selected Only',
                inputValue: 'selected',
                name: store.storeId+'-radio'
            });
        }

        panel = this.theForm.add(panel);

        var toAdd = {
            xtype: 'checkboxgroup',
            ref: '../fieldSelector',
            name: store.storeId,
            columns: 3,
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

        panel.add({
            xtype: 'fieldset',
            title: 'Choose Fields to Save',
            items: [toAdd]
        });
    },
    onSubmit: function(){
        this.hide();
        Ext.Msg.wait("Saving...");

        var tn = this.templateName.getValue();
        var rows = [];

        this.theForm.items.each(function(tab){
            var selections = tab.recordSelector.getValue().inputValue;
            var fields = tab.fieldSelector.getValue();

            if(!fields.length)
                return;
            if(selections == 'none')
                return;

            var store = Ext.StoreMgr.get(tab.storeId);

            var records = [];
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
        }, this);

        if(!rows.length){
            Ext.Msg.hide();
            Ext.Msg.alert('Error', "No records selected");
            return;
        };

        this.saveTemplate(rows);
    },

    saveTemplate: function(rows){
        LABKEY.Query.insertRows({
            schemaName: 'ehr',
            queryName: 'formtemplates',
            scope: this,
            rows: [{
                title: this.templateName.getValue(),
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
                    rows: rows,
                    failure: EHR.utils.onError,
                    success: function(){
                        Ext.Msg.hide();
                    }
                });
            }}(rows),
            failure: EHR.utils.onError
        });
    }
});
Ext.reg('ehr-savetemplatepanel', EHR.ext.SaveTemplatePanel);


EHR.ext.createImportPanel = function(config){

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
            if(config.panelType=='TaskPanel')
                EHR.ext.createSimpleTaskPanel(config);
            else if (config.panelType=='TaskDetailsPanel')
                EHR.ext.createSimpleTaskDetailsPanel(config);
            else
                alert('Form type not found');
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

        return new EHR.ext[config.panelType](panelCfg);
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


EHR.ext.createSimpleTaskDetailsPanel = function(config){
    if(!config || !config.queryName){
         alert('Must provide queryName');
         return;
    }

    var panelCfg = Ext.apply({}, config);
    Ext.apply(panelCfg, {
        title: config.queryName,
        formSections: [{
            xtype: 'ehr-gridformpanel',
            schemaName: config.schemaName,
            queryName: config.queryName,
            readOnly: true,
            title: config.title || config.queryName,
            columns: EHR.ext.FormColumns[config.queryName],
            metadata: EHR.ext.getTableMetadata(config.queryName, ['Task'])
        }],
        formTabs: []
    });

    return new EHR.ext.TaskDetailsPanel(panelCfg);
};