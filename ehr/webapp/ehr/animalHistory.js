/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.namespace('EHR.ext.customPanels');

LABKEY.requiresScript("/ehr/transposeRows.js");
LABKEY.requiresScript("/ehr/utilities.js");
LABKEY.requiresScript("/ehr/reports.js");
LABKEY.requiresScript("/ehr/ext.ux.datetimefield.js");

EHR.ext.customPanels.SingleAnimalReport = Ext.extend(Ext.Panel, {

    initComponent: function()
    {
        this.on('afterLayout', this.afterLayout, this);

        Ext.Panel.prototype.bodyBorder = false;

        Ext.apply(this, {
            autoHeight: true
//            ,autoWidth: true
            ,bodyBorder: false
            ,border: false
            ,frame: false
//            ,layout: 'anchor'
//            ,width: '90%'
//            ,width: 1000
            ,defaults: {
                border: false,
//                autoHeight: true,
                autoWidth: true
                //bodyStyle:'align: center;padding-bottom:30px, vertical-align:middle'
            }
            ,items: [
            {
                layout: 'column'
                ,defaults: {
                    autoHeight: true
//                    autoWidth: true
                }
                ,items: [{
                    width: 500,
//                    width: 'auto',
                    items: [{
                        xtype: 'panel',
                        ref: '../../togglePanel',
                        layout: 'hbox'
                    },{
                        xtype: 'panel',
                        ref: '../../filterPanel',
                        layout: 'hbox'
                    },{
                        xtype: 'panel',
                        ref: '../../datePanel',
                        layout: 'hbox'
                    }]
                },{
                    width: 'auto',
                    ref: '../idPanel'
                }]
            },{
                xtype: 'button'
                ,text: 'Display Report'
                ,handler: this.onSubmit
                ,type: 'submit'
                ,scope: this
                ,style:'padding-top: 5px;margin-left:205px'
            },{
                tag: 'span',
                style: 'padding: 10px'
            },{
                xtype: 'tabpanel',
                ref: 'tabPanel',
                cls: 'extContainer',
                //activeTab: 0,
//                autoWidth: true,
                bodyBorder: true,
                width: '90%',
                border: true,
                autoHeight: true,
                bodyStyle: 'padding-top: 5px;',
                frame: true
            }]
        });

        EHR.ext.customPanels.SingleAnimalReport.superclass.initComponent.call(this);

        this.togglePanel.add({
            width: 200,
            html: '<p>Type of Search:</p>'
        },{
            xtype: 'radiogroup',
            ref: '../../../inputType',
            style: 'padding-bottom:10px',
            columns: 1,
            listeners: {
                scope: this,
                change: function(o, s){
                    var val = o.getValue();
                    val = val.inputValue;
                    //this.subjectArray = [];
                    this.processSubj();
                    this[val]();
                }
            },
            items: [{
                name: 'selector',
                boxLabel: 'Single Animal',
                inputValue: 'renderSingleSubject',
                ref: 'renderSingleSubject'
            },{
                name: 'selector',
                boxLabel: 'Multiple Animals',
                inputValue: 'renderMultiSubject',
                ref: 'renderMultiSubject'
            },{
                name: 'selector',
                boxLabel: 'Room/Cage',
                inputValue: 'renderRoomCage',
                ref: 'renderRoomCage'
//            },{
//                name: 'selector',
//                boxLabel: 'Complex',
//                inputValue: 'renderComplex'
            }]
        });

        //now we add each component
        this.renderDateRow();
//        this.renderCombineSubjects();

        //force filter area to render
        var inputType = LABKEY.ActionURL.getParameter('inputType') || 'renderSingleSubject';
        Ext.each(this.inputType.items, function(c){
            c.checked = (c.inputValue == inputType)
        }, this);

        this[inputType]();


        this.allReports = new LABKEY.ext.Store({
            schemaName: 'lists',
            queryName: 'reports',
            filterArray: [LABKEY.Filter.create('Visible', true, LABKEY.Filter.Types.EQUAL)],
            //, LABKEY.Filter.create('ReportCategory', 'AnimalReport', LABKEY.Filter.Types.EQUAL)
            sort: 'ReportName',
            autoLoad: true,
//            listeners: {
//                scope: this,
//                load: this.createTabPanel
//            },
            errorCallback: function(error){
                console.log('Error callback called');
                console.log(target);
                EHR.UTILITIES.onError(error)
            }
        });
//TODO: replace when store is fixed
        this.allReports.on('load', this.createTabPanel, this);


        this.doLayout();

    },
    renderSingleSubject: function(){
        var target = this.filterPanel;
        target.removeAll();

        target.add({width: 200, html: 'Enter Subject Id:', style: 'padding-bottom:10px'});

        target.add({
            xtype: 'panel',
            items: [
                new Ext.form.TextField({
                    name:"subjectBox",
                    width:165,
                    ref: '../../../../subjArea',
                    value: (this.subjectArray && this.subjectArray.length ? this.subjectArray.join(';') : ''),
                    keys: [
                        {
                            key: Ext.EventObject.ENTER,
                            handler: this.onSubmit,
                            scope: this
                        }
                    ]
                })
            ]});

        target.doLayout();

    },
    renderMultiSubject: function(){
        var target = this.filterPanel;
        target.removeAll();
        target.add({width: 200, html: 'Enter Subject Id(s):<br><i>(Separated by commas, semicolons, space or line breaks)</i>'});

        var thePanel = target.add({xtype: 'panel'});

        thePanel.add (new Ext.form.TextArea({
            name:"subjectBox",
            width:165,
            ref: '../../../../subjArea'})
        );

        var subjButton = target.add(new Ext.Panel({
            bodyStyle:'padding-left: 16px;padding-right: 16px',
            buttonAlign: 'center',
            defaults: {buttonAlign: 'center'}
        }));

        subjButton.add(new Ext.Button({
            text: '  Append -->'
            ,minWidth: 85
            ,handler: this.processSubj
            ,scope: this
            //,style:'align: center'
            ,bodyStyle:'align: center'
            ,buttonAlign: 'center'
            //,cls: 'labkey-button'
            })
        );
        subjButton.add(new Ext.Button({
            text: '  Replace -->'
            ,minWidth: 85
            ,handler: function(){
                this.subjectArray = [];
                this.processSubj()
            }
            ,scope: this
            //,style:'text-align: center'
            ,bodyStyle:'align: center'
            })
        );
        subjButton.add(new Ext.Button({
            text: ' Clear Dates '
            ,minWidth: 85
            ,handler: function(c){
                this.subjectArray = [];
                this.idPanel.removeAll();
            }
            ,scope: this
            //,style:'align: center'
            ,bodyStyle:'align: center'
            ,buttonAlign: 'center'
            })
        );

        this.projectWin = new Ext.Window({
            width: 280,
            height: 130,
            bodyStyle:'padding:5px',
            closeAction:'hide',
            plain: true,
            keys: [
                {
                    key: Ext.EventObject.ENTER,
                    handler: this.loadProject,
                    scope: this
                }
            ],
            title: 'Search By Project/Protocol',
            layout: 'form',

            items: [new EHR.ext.customFields.LabKeyCombo({
                emptyText:''
                ,fieldLabel: 'Project'
                ,ref: 'project'
                ,xtype: 'combo'
                ,displayField:'project'
                ,valueField: 'project'
                ,typeAhead: true
                ,width: 150
                ,editable: true
                ,store: new LABKEY.ext.Store({
                    containerPath: 'WNPRC/EHR/',
                    schemaName: 'lists',
                    queryName: 'project',
                    viewName: 'Projects With Active Assignments',
                    sort: 'project',
                    autoLoad: true
                })
            }),
                new EHR.ext.customFields.LabKeyCombo({
                emptyText:''
                ,fieldLabel: 'Protocol'
                ,ref: 'protocol'
                ,xtype: 'combo'
                ,displayField:'protocol'
                ,valueField: 'protocol'
                ,typeAhead: true
                ,width: 150
                ,editable: true
                ,store: new LABKEY.ext.Store({
                    containerPath: 'WNPRC/EHR/',
                    schemaName: 'lists',
                    queryName: 'protocol',
                    viewName: 'Protocols With Active Assignments',
                    sort: 'protocol',
                    autoLoad: true
                })
            })],
            buttons: [{
                text:'Submit',
                disabled:false,
                ref: '../submit',
                scope: this,
                handler: this.loadProject
            },{
                text: 'Close',
                scope: this,
                handler: function(){
                    this.projectWin.hide();
                }
            }]
        });

        this.housingWin = new Ext.Window({
            width: 280,
            height: 125,
            bodyStyle:'padding:5px',
            closeAction:'hide',
            plain: true,
            keys: [
                {
                    key: Ext.EventObject.ENTER,
                    handler: this.loadRoom,
                    scope: this
                }
            ],
            title: 'Search By Room/Cage',
            layout: 'form',

            items: [{
                xtype: 'textfield',
                fieldLabel: 'Room',
                ref: 'room'
            },{
                xtype: 'numberfield',
                fieldLabel: 'Cage',
                ref: 'cage'
            }],
            buttons: [{
                text:'Submit',
                disabled:false,
                ref: '../submit',
                scope: this,
                handler: this.loadRoom
            },{
                text: 'Close',
                scope: this,
                handler: function(){
                    this.housingWin.hide();
                }
            }]
        });

//        target.add(new Ext.Button({
//            text: ' Search Room/Cage '
//            ,minWidth: 80
//            ,handler: function(c){
//                this.housingWin.show(this);
//            }
//            ,scope: this
//            //,bodyStyle:'align: center'
//            ,buttonAlign: 'center'
//            })
//        );

        thePanel.add({
            xtype: 'button'
            ,html: '[Search By Project/Protocol]'
            ,minWidth: 80
            ,scope: this
            ,handler: function(c){
                this.projectWin.show(this);
            }
            ,style: 'padding-bottom:10px'
            ,buttonAlign: 'center'
        });

        target.doLayout();
    },
    renderRoomCage: function(){
        var target = this.filterPanel;
        target.removeAll();
        this.subjectArray = [];

        target.add({width: 200, html: 'Search By Location:<br><i>(enter partial room name to search by floor)</i>'});
        var roomPanel = target.add({
            xtype: 'panel',
            buttonAlign: 'center',
            bodyStyle:'align: center;padding-bottom:10px',
            defaults: {cls: 'extContainer', bodyBorder: false}
        });

        roomPanel.add({tag: 'div', html: 'Room:'});
        roomPanel.add({
            xtype: 'textfield',
            ref: '../../../../roomField',
            width: 165,
            fieldLabel: 'Room'
        });
        roomPanel.add({tag: 'div', html: 'Cage:'});
        roomPanel.add({
            xtype: 'textfield',
            ref: '../../../../cageField',
            width: 165,
            fieldLabel: 'Cage'
        });

        target.doLayout();

    },
    renderDateRow: function(){
        var target = this.datePanel;
        target.add({
            width: 200,
            html: 'Enter Date Range:<br><i>(optional - ignored by some reports)</i>'
        });

        //the date range cell:
        var datePanel = new Ext.Panel({
            defaults: {bodyBorder: false, style:'vertical-align:middle'}
        });

        this.startDateField = Ext.ComponentMgr.create({
            width: 165
            ,name:'startDate'
            //,xtype: 'datetimefield'
            ,xtype: 'datefield'
            ,allowBlank:true
            ,vtype: 'daterange'
            ,listeners: {
                scope: this,
                blur: function(o){
                    o.fireEvent('change');
                    o.endDateField.fireEvent('change');
                    o.validate(o.getValue(), o);
                }
            }
            ,validateOnBlur: true
            ,value: LABKEY.ActionURL.getParameter('startDate')
        });

        this.endDateField = Ext.ComponentMgr.create({
            width:165
            ,xtype: 'datetimefield'
            ,name:'endDate'
            ,allowBlank:true
            ,vtype: 'daterange'
            ,listeners: {
                scope: this,
                blur: function(o){
                    o.fireEvent('change');
                    o.startDateField.fireEvent('change');
                    o.validate(o.getValue(), o);
                    console.log('blur')
                }
//                ,change: function(c){
//                    console.log('change');
//                    if(c)
//                        Ext.form.VTypes.daterange(c.getValue(), c);
//                }
                ,keyup: function(a,b){
                    console.log('keyup')
                }
            }
//            ,validateOnBlur: true
            ,value: LABKEY.ActionURL.getParameter('endDate')
            //,scope: this
        });

        Ext.apply(this.endDateField, {startDateField: this.startDateField});
        Ext.apply(this.startDateField, {endDateField: this.endDateField});

        datePanel.add({tag: 'div', html: 'From:'});
        datePanel.add(this.startDateField);
        datePanel.add({tag: 'div', html: 'To:'});
        datePanel.add(this.endDateField);
        //datePanel.add({tag: 'div', html: '<br>'});
        datePanel.add({
            xtype: 'button',
            text: 'Clear',
            html: '[Clear All]',
            listeners: {
                scope: this,
                click: function(o){
                    this.startDateField.reset();
                    this.endDateField.reset();
                }
            }
        })

        target.add(datePanel);

        //the date buttons:
        var dateButtons = new Ext.Panel({minButtonWidth: 150, bodyStyle:'padding:5px;vertical-align:middle'});

        dateButtons.add(this.renderTimePreset("Past 24 Hours", -1));
        dateButtons.add(this.renderTimePreset("Past Week", -7));
        dateButtons.add(this.renderTimePreset("Past 30 Days", -30));
        dateButtons.add(this.renderTimePreset("Past Year", -365));

        target.add(dateButtons);
    },
//    renderReportRow: function(){
//        //the report row
//        this.add({html: 'Choose Report:'});
//
//        var reportStore = new LABKEY.ext.Store({
//            schemaName: 'lists',
//            queryName: 'reports',
//            filterArray: [LABKEY.Filter.create('Visible', true, LABKEY.Filter.Types.EQUAL), LABKEY.Filter.create('ReportCategory', 'AnimalReport', LABKEY.Filter.Types.EQUAL)],
//            sort: 'ReportName',
//            autoLoad: true
//        });
//
//        var comboConfig = {
//            emptyText:'Select a report...'
//            ,xtype: 'LabKeyCombo'
//            ,displayField:'ReportName'
//            ,id:'report'
//            ,store: reportStore
//        };
//
//        if (LABKEY.ActionURL.getParameter('report') && LABKEY.ActionURL.getParameter('report') != ''){
//            comboConfig.value = LABKEY.ActionURL.getParameter('report')
//        }
//        else {
//            comboConfig.value = 1;
//        }
//
//        this.reportSelector = this.add(comboConfig);
//        this.add({});
//
//    },
    renderCombineSubjects: function(){
        this.add({html: 'Combine Subjects Into Single Table:'});
        this.combineSubj = this.add(new Ext.form.Checkbox());

        if (LABKEY.ActionURL.getParameter('combineSubj')){
            this.combineSubj.setValue(true);
        }
        this.add({});
    },
    loadProject: function(o){
        var project = this.projectWin.project.getValue();
        var protocol = this.projectWin.protocol.getValue();
        this.projectWin.project.reset();
        this.projectWin.protocol.reset();

        this.projectWin.hide();
        
        Ext.Msg.wait("Loading...");

        if(!project && !protocol){
            Ext.Msg.hide();
            return;
        }

        var filters = [];

        if(project){
            filters.push(LABKEY.Filter.create('project', project, LABKEY.Filter.Types.EQUAL))
        }

        if(protocol){
            protocol = protocol.toLowerCase();
            filters.push(LABKEY.Filter.create('project/protocol', protocol, LABKEY.Filter.Types.EQUAL))
        }

        LABKEY.Query.selectRows({
            schemaName: 'study',
            queryName: 'assignment',
            viewName: 'Active Assignments',
            containerPath: 'WNPRC/EHR/',
            filterArray: filters,
            scope: this,
            successCallback: function(rows){
                var subjectArray = [];
                Ext.each(rows.rows, function(r){
                    subjectArray.push(r.Id);
                }, this)
                if(subjectArray.length){
                    this.subjectArray = subjectArray;
                    this.makeSubjGrid();
                }
                Ext.Msg.hide();
            },
            errorCallback: function(e){
                console.log(e);
                Ext.Msg.hide();
            }
        });


    },
    loadRoom: function(o){
        var room = this.housingWin.room.getValue();
        var cage = this.housingWin.cage.getValue();
        this.housingWin.room.reset();
        this.housingWin.cage.reset();
        
        this.housingWin.hide();
        
        Ext.Msg.wait("Loading...");

        if(!room && !cage){
            Ext.Msg.hide();
            return;
        }

        var filters = [];

        if(room){
            room = room.toLowerCase();
            filters.push(LABKEY.Filter.create('room', room, LABKEY.Filter.Types.STARTS_WITH))
        }

        if(cage){
            cage = cage.toLowerCase();
            filters.push(LABKEY.Filter.create('cage', cage, LABKEY.Filter.Types.EQUAL))
        }

        LABKEY.Query.selectRows({
            schemaName: 'study',
            queryName: 'housing',
            viewName: 'Current Housing',
            containerPath: 'WNPRC/EHR/',
            filterArray: filters,
            scope: this,
            successCallback: function(rows){
                var subjectArray = [];
                Ext.each(rows.rows, function(r){
                    subjectArray.push(r.Id);
                }, this)
                if(subjectArray.length){
                    this.subjectArray = subjectArray;
                    this.makeSubjGrid();
                }
                Ext.Msg.hide();
            },
            errorCallback: function(e){
                console.log(e);
                Ext.Msg.hide();
            }
        });
    },
    afterLayout: function()
    {
        //TODO: if the query webpart is changed to prevent page reload, this should be rewritten
        //we reload the fields from URL if the params exist
        if (this.subjArea && LABKEY.ActionURL.getParameter('participantId') && LABKEY.ActionURL.getParameter('participantId') != '')
        {
            this.subjArea.setValue(LABKEY.ActionURL.getParameter('participantId'));
            this.processSubj();
        }

        if (LABKEY.ActionURL.getParameter('showReport'))
        {
            //test whether the store loaded
            if(this.allReports.getCount())
            {
                this.onSubmit();
            }
            else
            {
                this.awaitStore = function(){
                    this.allReports.un('load', this.awaitStore, this);
                    this.onSubmit();
                    };

                this.allReports.on('load', this.awaitStore, this)
            }
        }

    },

    renderTimePreset: function(label, timeShift)
    {
        return {
            xtype: 'button'
//            ,html: '['+label+']'
            ,text: label
            ,minWidth: 100
            ,listeners: {
                scope: this,
                click: function(o){
                    var dt = new Date();
                    dt.setDate(dt.getDate() + timeShift);
                    dt = dt.format("Y-m-d");
                    this.endDateField.setValue('');
                    this.startDateField.setValue(dt);
                }
            }            
        };
    },

    processSubj: function()
    {
        var type = this.inputType.getValue().inputValue;

        if(!this.subjArea){
            this.subjectArray = [];
            this.idPanel.removeAll();
            return;
        }

        //we clean up, combine, then split the subjectBox and subject inputs
        var subjectArray = this.subjArea.getValue();
        
        subjectArray = subjectArray.replace(/[\s,;]+/g, ';');
        subjectArray = subjectArray.replace(/(^;|;$)/g, '');
        subjectArray = subjectArray.toLowerCase();

        if(subjectArray)
            subjectArray = subjectArray.split(';');
        else
            subjectArray = new Array();

        if (type == 'renderMultiSubject' && this.subjectArray && this.subjectArray.length){ 
            subjectArray = subjectArray.concat(this.subjectArray);
        }

        if (subjectArray.length != 0){
            subjectArray = subjectArray.unique();
            subjectArray.sort();
        }

        this.subjectArray = subjectArray;

        if(type == 'renderMultiSubject'){
            this.subjArea.setValue('');

            //we display the result
            this.makeSubjGrid();
        }
        else {
            this.subjArea.setValue(subjectArray);
            this.idPanel.removeAll();
        }
    },

    makeSubjGrid: function()
    {
        var target = this.idPanel;
        target.removeAll();

        var thePanel = target.add({
            xtype: 'panel'
            ,layout: 'table'
            ,layoutConfig: {
                columns: 4
            }
        });
        
        for (var i = 0; i < this.subjectArray.length; i++)
        {
            thePanel.add(new Ext.Button({
                text: this.subjectArray[i]+' (X)'
                ,subjectID: this.subjectArray[i]
                ,style: 'padding-right:0px;padding-left:0px'
                ,handler: function(button)
                {
                    var subject = button.subjectID;

                    //we find the subjectArray
                    this.subjectArray.remove(subject);

                    //we rebuild the table
                    this.makeSubjGrid()
                }
                ,scope: this
            }));

        }
        target.add(thePanel);
        target.doLayout();
    },

    onSubmit: function(){
       if (!this.checkValid())
            return;

       if (!this.activeReport){
           this.activeReport = this.tabPanel['General']['Abstract'];
           var parent = this.activeReport.ownerCt;
           this.tabPanel.activate(parent);
           parent.activate(this.activeReport);
       }
       else {
           this.loadTab(this.activeReport);    
       }

    },

    //separated so subclasses can override as needed
    checkValid: function(){
       this.processSubj();
       var type = this.inputType.getValue().inputValue;

       if (type == 'renderRoomCage'){
           if(!this.roomField.getValue()){
               alert('Must Enter A Room');
               return 0;
           }
       }
       else
       {
           if(!this.subjectArray.length){
                alert('Must Enter At Least 1 Animal ID');
                return 0;
           }
       }
        return 1;
    },

    displayReport: function(tab){
//        this.wheel = document.getElementById('reportDiv').appendChild(document.createElement('span'));
//        this.wheel.innerHTML = 'Loading...<p>';
//        this.wheel.setAttribute('class', "loading-indicator");

        if(tab.subjectArray.length){
            //we handle differently depending on whether we combine subjects
            if (!tab.combineSubj)
            {
                for (var i = 0; i < tab.subjectArray.length; i++)
                {
                    //first we make a new DIV for each subject to hold the report
                    var subject = [tab.subjectArray[i]];
                    this._renderReport(tab, subject);
                }
            }
            else
            {
                this._renderReport(tab, tab.subjectArray);
            }
        }
        else {
            this._renderReport(tab);    
        }


    },

//    _reportSelector: function(subject)
//    {
//        var reportStore = this.allReports;
//
//        //verify the store is loaded.
//        if (!reportStore.getCount())
//        {
//            reportStore.on('load', this.displayReport, this);
//            return;
//        }
//
//        var selectedReport = this.reportSelector.getValue();
//        selectedReport = reportStore.getById(selectedReport);
//
//        this.reportName = selectedReport.get("QueryName");
//
//        this._renderReport(selectedReport, subject);
//
//    },

    _renderReport: function(tab, subject)
    {
        Ext.Ajax.timeout = 3000000; //in milliseconds
        switch (tab.rowData.get("ReportType"))
        {
            case 'query':
                this.loadQuery(tab, subject);
                break;
            case 'webpart':
                this.loadWebPart(tab, subject);
                break;
            case 'details':
                this.loadDetails(tab, subject);
                break;
            case 'multi':
                alert("Error: Child Report Cannot Be a Multipart Report");
                break;
            case 'report':
                this.loadReport(tab, subject);
                break;
            case 'js':
                this.loadJS(tab, subject);
                break;
            case 'chart':
                this.loadChart(tab, subject);
                break;
            default:
                EHR.UTILITIES.onError('Improper Report Type');
        }
    },

    getFilterArray: function(tab, subject){
        var rowData = tab.rowData;
        var filterArray = [];

        var room = (this.roomField ? this.roomField.getValue() : null);
        var cage = (this.cageField ? this.cageField.getValue() : null);

        if(tab.subjectArray && tab.subjectArray.length){
            filterArray.push(LABKEY.Filter.create('Id', subject.join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF));
        }

        if(room){
            filterArray.push(LABKEY.Filter.create('Id/curLocation/room', room, LABKEY.Filter.Types.STARTS_WITH));
        }

        if(cage){
            filterArray.push(LABKEY.Filter.create('Id/curLocation/cage', cage, LABKEY.Filter.Types.EQUAL));
        }

        //we handle date
        if (rowData.get("DateFieldName"))
        {
            if (this.startDateField && this.startDateField.getValue())
                filterArray.push(LABKEY.Filter.create(rowData.get("DateFieldName"), this.startDateField.getValue().format('Y-m-d'), LABKEY.Filter.Types.GREATER_THAN_OR_EQUAL));
            if (this.endDateField && this.endDateField.getValue())
                filterArray.push(LABKEY.Filter.create(rowData.get("DateFieldName"), this.endDateField.getValue().format('Y-m-d'), LABKEY.Filter.Types.LESS_THAN_OR_EQUAL));
        }

        tab.filterArray = filterArray;
        return filterArray;
    },

    loadQuery: function(tab, subject, target)
    {
        var filterArray = this.getFilterArray(tab, subject);
        var target = target || tab.add({tag: 'span', html: 'Loading...', cls: 'loading-indicator'});
        var title = (subject ? subject.join("; ") : '');

        var queryConfig = {
            title: tab.rowData.get("ReportTitle") + ": " + title,
            schemaName: tab.rowData.get("Schema"),
            queryName: tab.rowData.get("QueryName"),
            allowChooseQuery: false,
            allowChooseView: false,
            showInsertNewButton: false,
            showDeleteButton: false,
            showDetailsColumn: true,
            showUpdateColumn: false,
            showRecordSelectors: true,
            frame: (tab.combineSubj ? 'title' : 'none'),            
            buttonBarPosition: 'top',
            //TODO: switch to 0 once bug is fixed
            timeout: 3000000,
            filters: filterArray,
            successCallback: function(c){
                console.log('Success callback called');
                this.endMsg();
            },
            errorCallback: function(error){
                console.log('Error callback called');
                console.log(target);
                target.innerHTML = 'ERROR: ' + error.exception + '<br>';
                this.endMsg();
                EHR.UTILITIES.onError(error)
            },
            scope: this
        };

        if (tab.rowData.get("View"))
        {
            queryConfig.viewName = tab.rowData.get("View")
        }

        if (tab.rowData.get("ContainerPath"))
        {
            queryConfig.containerPath = tab.rowData.get("ContainerPath");
        }

        if (tab.rowData.get("DateFieldName"))
        {
            queryConfig.sort = 'Id,-'+tab.rowData.get("DateFieldName");
        }

        new LABKEY.QueryWebPart(queryConfig).render(target.id);

    },


    loadReport: function(tab, subject, target)
    {
        var filterArray = this.getFilterArray(tab, subject);
        var target = target || tab.add({tag: 'span', html: 'Loading...', cls: 'loading-indicator'});
        var title = (subject ? subject.join("; ") : '');

        var queryConfig = {
            partName: 'Report',
            renderTo: target.id,
            partConfig: {
                title: tab.rowData.get("ReportTitle") + ": " + title,
                schemaName: tab.rowData.get("Schema"),
                reportId : tab.rowData.get("Report"),
                'query.queryName': tab.rowData.get("QueryName"),
                'query.Id~in': subject,
                '_union.Id~in': subject,
                '_select.Id~in': subject
            },
            filters: filterArray,
            successCallback: this.endMsg,
            errorCallback: function(error){
                target.innerHTML = 'ERROR: ' + error.exception + '<br>';
                this.endMsg();
                EHR.UTILITIES.onError(error)
            },
            scope: this
        };


        if (tab.rowData.get("ContainerPath"))
        {
            queryConfig.containerPath = tab.rowData.get("ContainerPath");
        }

        if (tab.rowData.get("View"))
        {
            queryConfig.partConfig.showSection = tab.rowData.get("View");
        }

        new LABKEY.WebPart(queryConfig).render();

    },

    loadJS: function(tab, subject, target)
    {
//        var filterArray = this.getFilterArray(tab, subject);
//        var target = target || tab.add({tag: 'span'});
//        var title = (subject ? subject.join("; ") : '');
 
        EHR.reports[tab.rowData.get('QueryName')].call(this, tab, subject, target);
    },

    loadGrid: function(tab, subject, target)
    {
        var filterArray = this.getFilterArray(tab, subject);
        var target = target || tab.add({tag: 'span', html: 'Loading...', cls: 'loading-indicator'});
        var title = (subject ? subject.join("; ") : '');

        var store = new LABKEY.ext.Store({
            schemaName: tab.rowData.get("Schema"),
            queryName: tab.rowData.get("QueryName"),
            filterArray: filterArray,
            sort: 'Id'
        });

        if (tab.rowData.get("View"))
        {
            store.viewName = tab.rowData.get("View")
        }

        var grid = new LABKEY.ext.EditorGridPanel({
            store: store
            ,title: tab.rowData.get("ReportTitle") + ": " + title
            ,width: 1000
            ,autoHeight: true
            ,editable: false
            ,stripeRows: true
            ,disableSelection: true
            ,successCallback: this.endMsg
            ,errorCallback: function(error){
                target.innerHTML = 'ERROR: ' + error.exception + '<br>';
                this.endMsg();
                EHR.UTILITIES.onError(error)
            }
            ,scope: this
        });
        grid.render(target);

    },

    loadWebPart: function(tab, subject, target)
    {
        var filterArray = this.getFilterArray(tab, subject);
        var target = target || tab.add({tag: 'span', html: 'Loading...', cls: 'loading-indicator'});
        var title = (subject ? subject.join("; ") : '');

        this.params = {};
        this.subject = subject;
        this.params.rowData = rowData;

        var WebPartRenderer = new LABKEY.WebPart({
            partName: tab.rowData.get("QueryName"),
            title: tab.rowData.get("ReportTitle") + ": " + title,
            renderTo: target,
            config: tab.rowData.get("Config"),
            successCallback: this.endMsg,
            errorCallback: function(error){
                target.innerHTML = 'ERROR: ' + error.exception + '<br>';
                this.endMsg();
                EHR.UTILITIES.onError(error)
            },
            scope: this
        });
        WebPartRenderer.render(target);
    },

    loadDetails: function(tab, subject, target)
    {
        var filterArray = this.getFilterArray(tab, subject);
        var target = target || tab.add({tag: 'span', html: 'Loading...', cls: 'loading-indicator'});
        var title = (subject ? subject.join("; ") : '');

        tab.doLayout();
        
        var config = {
            schemaName: tab.rowData.get("Schema"),
            queryName: tab.rowData.get("QueryName"),
            title: tab.rowData.get("ReportTitle") + ":",
            titleField: 'Id',
            renderTo: target.id,
            filterArray: filterArray,
            multiToGrid: this.multiToGrid
        };

        if (tab.rowData.get("View"))
        {
            config.viewName = tab.rowData.get("View");
        }

        new EHR.ext.customPanels.detailsView(config);

        this.endMsg();

    },

    loadChart: function(tab, subject, target)
    {
        var filterArray = this.getFilterArray(tab, subject);
        var target = target || tab.add({tag: 'span', html: 'Loading...', cls: 'loading-indicator'});
        var title = (subject ? subject.join("; ") : '');

        var store = new LABKEY.ext.Store({
            schemaName: tab.rowData.get("Schema"),
            queryName: tab.rowData.get("QueryName"),
            filterArray: filterArray,
            sort: 'Id',
            autoLoad: true
        });
        
        var chart = new Ext.Panel({
            title: tab.rowData.get("ReportTitle") + ": " + title,
            renderTo: target.id,
            //layout:'vbox',
            items: [
                {
                    xtype: 'linechart',
                    width:600,
                    height:300,
                    store: store,
                    xField: 'Date',
                    yField: 'weight'
//                },{
//                    xtype: 'button',
//                    html: 'test'
                }
            ]              
        });

    },

    endMsg: function(){
        Ext.Msg.hide();

//        //log using analytics
//        var loadTime = new Date().getTime() - this.startTime;
//        pageTracker._trackEvent('AnimalReport', 'LoadTime', this.reportName, loadTime);
    },

    createTabPanel: function(){
        this.allReports.each(function(c){
            var category = c.get('Category');

            //create top-level tab
            if(!this.tabPanel[category]){
                this.tabPanel.add(new Ext.TabPanel({
                    ref: category,
                    title: category,
                    enableTabScroll: true,
                    autoHeight: true,
                    autoWidth: true,
                    frame:false
                }))
            }

            var subTab = this.tabPanel[category];
            var report = c.get('ReportName');

            //create 2nd tier tab
            if(!subTab[report]){
                var theTab = subTab.add(new Ext.Panel({
                    title: c.get('ReportTitle'),
                    ref: report,
                    rowData: c,
                    autoHeight: true,
                    bodyStyle:'padding:5px',
                    border: false,
                    autoWidth: true,
//                    buttons: [
//                        {text: 'Reload', ref: '../reload', handler: function(o){
//                            this.loadTab(o.refOwner)
//                        }, scope: this}
//                    ],
                    subjectArray: [],
                    filterArray: [],
                    listeners: {
                        scope: this,
                        activate: function(t){
                            this.activeReport = t;
                            this.onSubmit();
                        },
                        click: function(t){
                            console.log('click');
                            this.activeReport = t;
                            this.onSubmit();
                        }
                    }
                }));

                if(LABKEY.ActionURL.getParameter('report')==report){
                    this.activeReport = theTab;    
                }
            }

        }, this);

        this.add(this.tabPanel);
        console.log(this.activeReport)
        if(this.activeReport){
            console.log('setting tab')
            this.tabPanel.setActiveTab(this.activeReport.ownerCt);
            this.activeReport.suspendEvents();
            this.activeReport.ownerCt.setActiveTab(this.activeReport);
            this.activeReport.resumeEvents();
        }
        else{
            this.tabPanel.setActiveTab(0);
        }

        this.doLayout();
        this.tabPanel.doLayout();
    },
    loadTab: function(o){
        o.combineSubj = false;
        
        this.setFilters(o);

        var reload = 0;
        for (var i in this.filters){
            if(!o.filters || this.filters[i]!==o.filters[i]){
                reload = 1;
                continue;
            }
        }
                
        //indicates tab already has up to date content
        if(reload == 0){
            console.log('no reload needed');
            return;
        }



        o.filters = this.filters;
        o.subjectArray = this.subjectArray;

//        tab.loadMask = new Ext.LoadMask(tab.body);
//        tab.loadMask.show();
        
        o.removeAll();

        this.displayReport(o);
        this.activeReport = o;
        o.doLayout();
        
    },
    setFilters: function(tab){
        this.filters = {};
        this.processSubj();

        this.filters.room = (this.roomField ? this.roomField.getValue() : null);
        this.filters.cage = (this.cageField ? this.cageField.getValue() : null);
        this.filters.subjectString = this.subjectArray.join(';');
        this.filters.startDate = this.startDateField ? this.startDateField.getValue() : null;
        this.filters.endDate = this.endDateField ? this.endDateField.getValue() : null;
        this.filters.combineSubj = tab.combineSubj;

    }

});


