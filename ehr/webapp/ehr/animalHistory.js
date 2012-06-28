/*
 * Copyright (c) 2010-2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.namespace('EHR.ext');

LABKEY.requiresScript("/ehr/ehrAPI.js");
LABKEY.requiresScript("/ehr/reports.js");

/**
 * Constructs a new EHR SingleAnimalReport
 * @class
 * An EHR class that provides a data-driven tabbed report panel.  It is used on the AnimalHistory page, and a subclass defined in participantView.js is used as the participant details page.
 * The set of reports is determined by the records in ehr.reports.  Each record supplies a schema/query and report type, along with other options.
 *
 */
EHR.ext.SingleAnimalReport = Ext.extend(Ext.Panel, {

    initComponent: function()
    {
        Ext.Panel.prototype.bodyBorder = false;

        Ext.apply(this, {
            autoHeight: true
            ,autoWidth: true
            ,bodyBorder: false
            ,bodyStyle: 'background-color : transparent;'
            //,width: '100%'
//            ,width: '1000'
            ,layout: 'anchor'
//            ,boxMaxWidth: 1000
            ,autoScroll: true
            ,border: false
            ,frame: false
            ,reports: {}
            ,defaults: {
                border: false
//                autoHeight: true,
//                autoWidth: true
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
                ,text: 'Refresh'
                ,handler: this.onSubmit
                ,forceRefresh: true
                ,ref: 'submitBtn'
                ,disabled: true
                ,type: 'submit'
                ,scope: this
                ,style:'margin-left:200px;'
            },{
                tag: 'span',
                style: 'padding: 10px'
            },{
                layout: 'anchor',
                ref: 'anchorLayout',
                items: [{
                    xtype: 'tabpanel',
                    ref: '../tabPanel',
                    //autoScroll: true,
                    activeTab: 0,
                    cls: 'extContainer',
                    autoHeight: true,
                    //bodyStyle: 'padding-top: 5px;',
                    frame: false
                }]
            }]

        });

        EHR.ext.SingleAnimalReport.superclass.initComponent.call(this);

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
                ref: '../renderSingleSubject'
            },{
                name: 'selector',
                boxLabel: 'Multiple Animals',
                inputValue: 'renderMultiSubject',
                ref: '../renderMultiSubject'
            },{
                name: 'selector',
                boxLabel: 'Current Location',
                inputValue: 'renderRoomCage',
                ref: '../renderRoomCage'
            },{
                name: 'selector',
                boxLabel: 'Entire Database',
                inputValue: 'renderColony',
                ref: '../renderColony'
            }]
        });

        //now we add each component
        //this.renderDateRow();
//        this.renderCombineSubjects();

        //force filter area to render
        var inputType = LABKEY.ActionURL.getParameter('inputType') || 'renderSingleSubject';
        Ext.each(this.inputType.items, function(c){
            c.checked = (c.inputValue == inputType)
        }, this);

        this[inputType]();


        this.allReports = new LABKEY.ext.Store({
            schemaName: 'ehr',
            queryName: 'reports',
            filterArray: [LABKEY.Filter.create('visible', true, LABKEY.Filter.Types.EQUAL)],
//            , LABKEY.Filter.create('ReportCategory', 'AnimalReport', LABKEY.Filter.Types.EQUAL)
            sort: 'category,sort_order,reporttitle',
            autoLoad: true,
//            listeners: {
//                scope: this,
//                load: this.createTabPanel
//            },
            failure: function(error){
                console.log('Error callback called');
                console.log(target);
                EHR.Utils.onError(error)
            }
        });

        this.allReports.on('load', this.createTabPanel, this);
        this.on('beforeRender', this.restoreUrl);
    },
    renderColony: function(){
        var target = this.filterPanel;
        target.removeAll();
        target.doLayout();

    },
    renderSingleSubject: function(){
        var target = this.filterPanel;
        target.removeAll();

        target.add({width: 200, html: 'Enter Subject Id:', style: 'padding-bottom:10px'});

        target.add({
            xtype: 'panel',
            items: [{
                xtype: 'ehr-participant',
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
                ]}
            ],
            keys: [
                {
                    key: Ext.EventObject.ENTER,
                    handler: this.onSubmit,
                    scope: this
                }
            ]
        });

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
            text: ' Clear '
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

            items: [{
                emptyText:''
                ,xtype: 'combo'
                ,fieldLabel: 'Project'
                ,ref: 'project'
                ,triggerAction: 'all'
                ,displayField:'project'
                ,valueField: 'project'
                ,typeAhead: true
                ,mode: 'local'
                ,width: 150
                ,editable: true
                ,store: new LABKEY.ext.Store({
                    schemaName: 'ehr',
                    queryName: 'project',
                    viewName: 'Projects With Active Assignments',
                    sort: 'project',
                    autoLoad: true
                })
            },{
                emptyText:''
                ,fieldLabel: 'Protocol'
                ,ref: 'protocol'
                ,xtype: 'combo'
                ,displayField:'protocol'
                ,valueField: 'protocol'
                ,typeAhead: true
                ,width: 150
                ,editable: true
                ,triggerAction: 'all'
                ,mode: 'local'
                ,store: new LABKEY.ext.Store({
                    schemaName: 'ehr',
                    queryName: 'protocol',
                    viewName: 'Protocols With Active Assignments',
                    sort: 'protocol',
                    autoLoad: true
                })
            }],
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
                emptyText:''
                ,fieldLabel: 'Room'
                ,ref: 'room'
                ,xtype: 'combo'
                ,displayField:'room'
                ,valueField: 'room'
                ,typeAhead: true
                ,triggerAction: 'all'
                ,mode: 'local'
                ,width: 150
                ,editable: true
                ,store: new LABKEY.ext.Store({
                    schemaName: 'ehr_lookups',
                    queryName: 'rooms',
                    sort: 'room',
//                    filterArray: [LABKEY.Filter.create('TotalAnimals', 0, LABKEY.Filter.Types.NOT_EQUAL)],
                    autoLoad: true
                })
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

        thePanel.add(new Ext.Button({
            text: ' Search By Room/Cage '
            ,html: '[Search By Room/Cage]'
            ,minWidth: 80
            ,handler: function(c){
                this.housingWin.show(this);
            }
            ,scope: this
            //,bodyStyle:'align: center'
            ,buttonAlign: 'center'
            })
        );

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

        target.add({width: 200, html: 'Search By Location:<br><i>(enter multiple rooms by separating with commas or whitespace. Note: you must enter the entire cage #, such as 0001)</i>'});
        var roomPanel = target.add({
            xtype: 'panel',
            buttonAlign: 'center',
            bodyStyle:'align: center;padding-bottom:10px',
            defaults: {cls: 'extContainer', bodyBorder: false},
            keys: [
                {
                    key: Ext.EventObject.ENTER,
                    handler: this.onSubmit,
                    scope: this
                }
            ]
        });

        roomPanel.add({tag: 'div', html: 'Area:'});
        roomPanel.add({
            name: 'areaField',
            xtype: 'combo'
            ,emptyText:''
            ,fieldLabel: 'Area'
            ,displayField:'area'
            ,valueField: 'area'
            ,typeAhead: true
            ,mode: 'local'
            ,editable: true
            ,triggerAction: 'all'
            ,store: new LABKEY.ext.Store({
                schemaName: 'ehr_lookups',
                queryName: 'areas',
                sort: 'area',
                autoLoad: true
            }),
            ref: '../../../../areaField',
            width: 165

        });
        roomPanel.add({tag: 'div', html: 'Room:'});
        roomPanel.add({
            name: 'roomField',
            xtype: 'textfield',
            ref: '../../../../roomField',
            width: 165,
            fieldLabel: 'Room',
            listeners: {
                render: function(field){
                    field.el.set({autocomplete: 'off'});
                }
            }
        });
        roomPanel.add({tag: 'div', html: 'Cage:'});
        roomPanel.add({
            name: 'cageField',
            xtype: 'textfield',
            ref: '../../../../cageField',
            width: 165,
            fieldLabel: 'Cage',
            listeners: {
                scope: this,
                change: function(field, val){
                    if(val && !isNaN(val)){
                        var newVal = EHR.Utils.padDigits(val, 4);
                        if(val != newVal)
                            field.setValue(newVal);
                    }
                },
                render: function(field){
                    field.el.set({autocomplete: 'off'});
                }
            }
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
                    o.fireEvent('change', o, o.getValue());
                    o.endDateField.fireEvent('change', o.endDateField, o.endDateField.getValue());
                    o.validate(o.getValue(), o);
                }
            }
            ,validateOnBlur: true
            ,value: LABKEY.ActionURL.getParameter('startDate')
        });

        this.endDateField = Ext.ComponentMgr.create({
            width:165
            ,xtype: 'datefield'
            ,name:'endDate'
            ,allowBlank:true
            ,vtype: 'daterange'
            ,listeners: {
                scope: this,
                blur: function(o){
                    o.fireEvent('change', o, o.getValue());
                    o.startDateField.fireEvent('change', o.startDateField, o.startDateField.getValue());
                    o.validate(o.getValue(), o);
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
                    this.startDateField.setValue();
                    this.endDateField.setValue();
                }
            }
        })

        target.add(datePanel);

        //the date buttons:
        var dateButtons = new Ext.Panel({minButtonWidth: 150, bodyStyle:'padding:5px;vertical-align:middle'});

        dateButtons.add(this.renderTimePreset("Today", 0));
        dateButtons.add(this.renderTimePreset("Past Week", -7));
        dateButtons.add(this.renderTimePreset("Past 30 Days", -30));
        dateButtons.add(this.renderTimePreset("Past Year", -365));

        target.add(dateButtons);
    },

//    renderCombineSubjects: function(){
//        this.add({html: 'Combine Subjects Into Single Table:'});
//        this.combineSubj = this.add(new Ext.form.Checkbox());
//
//        if (LABKEY.ActionURL.getParameter('combineSubj')){
//            this.combineSubj.setValue(true);
//        }
//        this.add({});
//    },
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
            queryName: 'ActiveAssignments',
            sort: 'Id',
            filterArray: filters,
            scope: this,
            successCallback: function(rows){
                var subjectArray = [];
                Ext.each(rows.rows, function(r){
                    subjectArray.push(r.Id);
                }, this);
                subjectArray = Ext.unique(subjectArray);
                if(subjectArray.length){
                    this.subjectArray = subjectArray;
                    this.makeSubjGrid();
                }
                Ext.Msg.hide();
            },
            failure: function(e){
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
            sort: 'Id',
            filterArray: filters,
            scope: this,
            successCallback: function(rows){
                var subjectArray = [];
                Ext.each(rows.rows, function(r){
                    subjectArray.push(r.Id);
                }, this);
                subjectArray = Ext.unique(subjectArray);
                if(subjectArray.length){
                    this.subjectArray = subjectArray;
                    this.makeSubjGrid();
                }
                Ext.Msg.hide();
            },
            failure: function(e){
                console.log(e);
                Ext.Msg.hide();
            }
        });
    },
    restoreUrl: function()
    {

        if(document.location.hash){
            var token = document.location.hash.split('#');
            token = token[1].split('&');
            for (var i=0;i<token.length;i++){
                var t = token[i].split(':');
                switch(t[0]){
                    case '_inputType':
                        Ext.each(this.inputType.items, function(c){
                            c.checked = (c.inputValue == t[1]);
                        }, this);

                        this[t[1]]();
                        break;
                    case 'subject':
                        if(this.subjArea){
                            this.subjArea.setValue(t[1]);
                            //this.processSubj();
                        }
                        break;
                    case '_showReport':
                        this.doLoad = 1;
                        break;
                    case 'activeReport':
                        this.report = t[1];
                        break;
                    case 'room':
                        if(this.roomField){
                            this.roomField.setValue(t[1]);
                        }
                        break;
                    case 'cage':
                        if(this.cageField){
                            this.cageField.setValue(t[1]);
                        }
                        break;
                    case 'area':
                        if(this.areaField){
                            this.areaField.setValue(t[1]);
                        }
                        break;
                    case 'startDate':
                        if(this.startDateField){
                            this.startDateField.setValue(t[1]);
                        }
                        break;
                    case 'endDate':
                        if(this.endDateField){
                            this.endDateField.setValue(t[1]);
                        }
                        break;
                }
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
                    var now = new Date();
                    now.setDate(now.getDate() + 1);
                    now = now.format('Y-m-d');
                    this.endDateField.setValue(now);
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
            subjectArray = Ext.unique(subjectArray);
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

        target.add({
            tag: 'div',
            html: 'Total IDs: '+this.subjectArray.length
        });

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

    onSubmit: function(b){
       if (!this.checkValid())
            return;

       if(b)
            this.forceRefresh = b.forceRefresh;

        if (!this.activeReport){
           this.activeReport = this.tabPanel['General']['abstract'];
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

       switch (type){
       case 'renderRoomCage':
           if(!this.roomField.getValue() && !this.areaField.getValue()){
               alert('Must Enter A Room or Area');
               return 0;
           }
           break;
       case 'renderColony':
           break;
       default:
           if(!this.subjectArray.length){
                alert('Must Enter At Least 1 Animal ID');
                return 0;
           }
       }
       return 1;
    },

    displayReport: function(tab){
        this.addHeader(tab);

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
//        this.reportName = selectedReport.get("queryname");
//
//        this._renderReport(selectedReport, subject);
//
//    },

    _renderReport: function(tab, subject)
    {
        Ext.Ajax.timeout = 3000000; //in milliseconds
        switch (tab.rowData.get("reporttype"))
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
            case 'ProtovisChart':
                this.loadProtovisChart(tab, subject);
                break;
            default:
                EHR.Utils.onError('Improper Report Type');
        }
    },

    getFilterArray: function(tab, subject){
        var rowData = tab.rowData;
        var filterArray = {
            removable: [],
            nonRemovable: []
        };

        var room = (this.roomField ? this.roomField.getValue() : null);

        if(room){
            room = room.replace(/[\s,;]+/g, ';');
            room = room.replace(/(^;|;$)/g, '');
            room = room.toLowerCase();
            this.roomField.setValue(room);
        }

        var cage = (this.cageField ? this.cageField.getValue() : null);
        var area = (this.areaField ? this.areaField.getValue() : null);

        if(tab.subjectArray && tab.subjectArray.length){
            filterArray.nonRemovable.push(LABKEY.Filter.create('Id', subject.join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF));
        }

        if(area){
            if(rowData.get("queryhaslocation")){
                filterArray.nonRemovable.push(LABKEY.Filter.create('room/area', area, LABKEY.Filter.Types.STARTS_WITH));
            }
            else {
                filterArray.nonRemovable.push(LABKEY.Filter.create('Id/curLocation/area', area, LABKEY.Filter.Types.EQUAL));
            }
        }

        if(room){
            if(rowData.get("queryhaslocation")){
                filterArray.nonRemovable.push(LABKEY.Filter.create('room', room, LABKEY.Filter.Types.EQUALS_ONE_OF));
            }
            else {
                filterArray.nonRemovable.push(LABKEY.Filter.create('Id/curLocation/room', room, LABKEY.Filter.Types.EQUALS_ONE_OF));
            }

        }

        if(cage){
            if(rowData.get("queryhaslocation")){
                filterArray.nonRemovable.push(LABKEY.Filter.create('cage', cage, LABKEY.Filter.Types.STARTS_WITH));
            }
            else {
                filterArray.nonRemovable.push(LABKEY.Filter.create('Id/curLocation/cage', cage, LABKEY.Filter.Types.EQUAL));
            }
        }

        //we handle date
        if (rowData.get("datefieldname") && rowData.get("todayonly"))
        {
            filterArray.removable.push(LABKEY.Filter.create(rowData.get("datefieldname"), (new Date()).format('Y-m-d'), LABKEY.Filter.Types.DATE_EQUAL));
        }

        //account for QCstate
//        if (rowData.get("QCStatePublicDataFieldName")){
//            filterArray.nonRemovable.push(LABKEY.Filter.create(rowData.get("QCStatePublicDataFieldName"), true, LABKEY.Filter.Types.EQUAL));
//        }

        tab.filterArray = filterArray;
        return filterArray;
    },

    makeTitle: function(tab, subject){
        var title = [];
        var room = (this.roomField ? this.roomField.getValue() : null);
        var cage = (this.cageField ? this.cageField.getValue() : null);
        var area = (this.areaField ? this.areaField.getValue() : null);


        if(subject && subject.length)
            title.push(subject.join("; "));

        if (area)
            title.push('Area: '+area);

        if (room)
            title.push('Room: '+room);

        if (cage)
            title.push('Cage: '+cage);

        return title.join(', ');
    },

    loadQuery: function(tab, subject, target)
    {
        var filterArray = this.getFilterArray(tab, subject);
        var targetId = Ext.id();
        target = tab.add({
            autoScroll : true,
            border: false,
            frame: false,
            items : [{
                layout : 'fit',
                //autoScroll: true,
                id : targetId,
                border : false, frame : false
            }]
        });
        var title = this.makeTitle(tab, subject);
        var queryConfig = {
            title: tab.rowData.get("reporttitle") + ": " + title,
            schemaName: tab.rowData.get("schemaname"),
            queryName: tab.rowData.get("queryname"),
            suppressRenderErrors: true,
            allowChooseQuery: false,
            allowChooseView: true,
            showInsertNewButton: false,
            showDeleteButton: false,
            showDetailsColumn: true,
            showUpdateColumn: false,
            showRecordSelectors: true,
            showReports: false,
            tab: tab,
            frame: 'portal',            
            buttonBarPosition: 'top',
            timeout: 0,
            filters: filterArray.nonRemovable,
            removeableFilters: filterArray.removable,
            linkTarget: '_blank',
            renderTo: target.id,
            ref: 'qwp',
            success: function(dr){
                var width1 = Ext.get('dataregion_'+dr.id).getSize().width+50;
                var width2 = Ext.get(this.anchorLayout.id).getSize().width;

                if(width1 > width2){
                    this.anchorLayout.setWidth(width1+140);
                }
                else {
                    this.anchorLayout.setWidth('100%');
                }
            },
            failure: function(error){
                console.log('Error callback called');
                console.log(target);
                //target.innerHTML = 'ERROR: ' + error.exception + '<br>';
                EHR.Utils.onError(error)
            },
            scope: this
        };

        if (tab.rowData.get("viewname"))
        {
            queryConfig.viewName = tab.rowData.get("viewname")
        }

        if (tab.rowData.get("containerpath"))
        {
            queryConfig.containerPath = tab.rowData.get("containerpath");
        }

        tab.QWP = new LABKEY.QueryWebPart(queryConfig);
    },


    loadReport: function(tab, subject, target)
    {
        var filterArray = this.getFilterArray(tab, subject);
        filterArray = filterArray.nonRemovable.concat(filterArray.removable);
        var target = target || tab.add({tag: 'span', html: 'Loading...', cls: 'loading-indicator'});
        var title = (subject ? subject.join("; ") : '');

        var queryConfig = {
            partName: 'Report',
            renderTo: target.id,
            suppressRenderErrors: true,
            partConfig: {
                title: tab.rowData.get("reporttitle") + ": " + title,
                schemaName: tab.rowData.get("schemaname"),
                reportId : tab.rowData.get("report"),
                'query.queryName': tab.rowData.get("queryname"),
                'query.Id~in': subject.join(";"),
                '_union.Id~in': subject.join(";"),
                '_select.Id~in': subject.join(";")
            },
            filters: filterArray,
            //successCallback: this.endMsg,
            failure: function(error){
                //target.innerHTML = 'ERROR: ' + error.exception + '<br>';
                EHR.Utils.onError(error);
            },
            scope: this
        };


        if (tab.rowData.get("containerpath"))
        {
            queryConfig.containerPath = tab.rowData.get("containerpath");
        }

        if (tab.rowData.get("viewname"))
        {
            queryConfig.partConfig.showSection = tab.rowData.get("viewname");
        }

        new LABKEY.WebPart(queryConfig).render();

    },

    loadJS: function(tab, subject, target)
    {
        EHR.reports[tab.rowData.get('queryname')].call(this, tab, subject, target);
    },

    loadGrid: function(tab, subject, target)
    {
        var filterArray = this.getFilterArray(tab, subject);
        filterArray = filterArray.nonRemovable.concat(filterArray.removable);

        var target = target || tab.add({tag: 'span', html: 'Loading...', cls: 'loading-indicator'});
        var title = (subject ? subject.join("; ") : '');

        var store = new LABKEY.ext.Store({
            schemaName: tab.rowData.get("schemaname"),
            queryName: tab.rowData.get("queryname"),
            filterArray: filterArray,
            sort: 'Id'
        });

        if (tab.rowData.get("viewname"))
        {
            store.viewName = tab.rowData.get("viewname")
        }

        var grid = new LABKEY.ext.EditorGridPanel({
            store: store
            ,title: tab.rowData.get("reporttitle") + ": " + title
            ,width: 1000
            ,autoHeight: true
            ,editable: false
            ,stripeRows: true
            ,disableSelection: true
            //,successCallback: this.endMsg
            ,failure: function(error){
                //target.innerHTML = 'ERROR: ' + error.exception + '<br>';
                EHR.Utils.onError(error)
            }
            ,scope: this
        });
        grid.render(target);

    },

    loadWebPart: function(tab, subject, target)
    {
        var filterArray = this.getFilterArray(tab, subject);
        filterArray = filterArray.nonRemovable.concat(filterArray.removable);
        var target = target || tab.add({tag: 'span', html: 'Loading...', cls: 'loading-indicator'});
        var title = (subject ? subject.join("; ") : '');

        this.params = {};
        this.subject = subject;
        this.params.rowData = rowData;

        var WebPartRenderer = new LABKEY.WebPart({
            partName: tab.rowData.get("queryname"),
            title: tab.rowData.get("reporttitle") + ": " + title,
            suppressRenderErrors: true,
            renderTo: target,
//            config: tab.rowData.get("config"),
            //success: this.endMsg,
            failure: function(error){
                //target.innerHTML = 'ERROR: ' + error.exception + '<br>';
                EHR.Utils.onError(error)
            },
            scope: this
        });
        WebPartRenderer.render(target);
    },

    loadDetails: function(tab, subject, target)
    {
        var filterArray = this.getFilterArray(tab, subject);
        filterArray = filterArray.nonRemovable.concat(filterArray.removable);
        target = target || tab.add({tag: 'span', html: 'Loading...', cls: 'loading-indicator'});
        var title = (subject ? subject.join("; ") : '');

        tab.doLayout();
        
        var config = {
            schemaName: tab.rowData.get("schemaname"),
            queryName: tab.rowData.get("queryname"),
            title: tab.rowData.get("reporttitle") + ":",
            titleField: 'Id',
            renderTo: target.id,
            filterArray: filterArray,
            multiToGrid: this.multiToGrid
        };

        if (tab.rowData.get("viewname"))
        {
            config.viewName = tab.rowData.get("viewname");
        }

        new EHR.ext.DetailsView(config);

    },

    loadChart: function(tab, subject, target)
    {
        var filterArray = this.getFilterArray(tab, subject);
        filterArray = filterArray.nonRemovable.concat(filterArray.removable);
        var target = target || tab.add({tag: 'span', html: 'Loading...', cls: 'loading-indicator'});
        var title = (subject ? subject.join("; ") : '');

        var store = new LABKEY.ext.Store({
            schemaName: tab.rowData.get("schemaname"),
            queryName: tab.rowData.get("queryname"),
            filterArray: filterArray,
            sort: 'Id',
            autoLoad: true
        });
        
        var chart = new Ext.Panel({
            title: tab.rowData.get("reporttitle") + ": " + title,
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

    loadProtovisChart: function(tab, subject, target)
    {
        var filterArray = this.getFilterArray(tab, subject);
        filterArray = filterArray.nonRemovable.concat(filterArray.removable);
        var target = target || tab.add({tag: 'span', html: 'Loading...'});
        var title = (subject ? subject.join("; ") : '');

        var store = LABKEY.Query.selectRows({
            schemaName: tab.rowData.get("schemaname"),
            queryName: tab.rowData.get("queryname"),
            filterArray: filterArray,
            successCallback: makeChart,
            scope: this,
            sort: 'date',
            autoLoad: true
        });

//        var store = new LABKEY.ext.Store({
//            schemaName: tab.rowData.get("schemaname"),
//            queryName: tab.rowData.get("queryname"),
//            filterArray: filterArray,
//            listeners: {
//                load: makeChart,
//                scope: this
//            },
//            //scope: this,
//            sort: 'date',
//            autoLoad: true
//        });
        
        var rows;
        function makeChart(queryResults){
            var cols = (tab.rowData.get("columns")).split(';');

            //selectRows() returns dates as strings.  convert dates to date objects.  seems very ugly
            Ext.each(cols, function(c){
                Ext.each(queryResults.metaData.fields, function(f){
                    if(f.name == c && f.jsonType == 'date'){
                        Ext.each(queryResults.rows, function(r){
                            r[c] = new Date(r[c]);
                        });
                    }
                }, this);
            }, this);

            var chart = new LABKEY.vis.LineChart({
               yAxis:{caption:'Viral Load'}, //scale:'log', 
               xAxis:{caption:'Week'},
               renderTo: target.id,
               main: {},
               series: generateSeries(store, "Id", {
                   xProperty: cols[0],
                   yProperty: cols[1],
                   dotShape: 'circle'
               })
           });

           function generateSeries(store, seriesCol, seriesProps)
           {
               var seriesMap = {};
               var ret = [];
               store.each(function(row)
               {
                   var ser = seriesMap[row.get(seriesCol)];
                   if (null == ser) {
                       ser = {caption: row.get(seriesCol), data:[]};
                       for (var p in seriesProps)
                           ser[p] = seriesProps[p];
                       seriesMap[row.get(seriesCol)] = ser;
                       ret.push(ser);
                   }

                   if (null != row.get(seriesProps.xProperty) && null !=row.get(seriesProps.yProperty))
                       ser.data.push(row);
               }, this);

               return ret;
           }
        }
    },

    createTabPanel: function(){
        this.allReports.each(function(c){
            var category = c.get('category');

            //create top-level tab
            if(!this.tabPanel[category]){
                this.tabPanel.add({
                    xtype: 'tabpanel',
                    ref: category,
                    title: category,
                    enableTabScroll: true,
                    autoHeight: true,
                    autoWidth: true,
                    //bodyStyle: 'background-color : transparent;',
                    frame:false,
                    listeners: {
                        scope: this,
                        activate: function(t){
                            if(t.activeTab){
                                this.activeReport = t.activeTab;
                                this.onSubmit();
                            }
                        }
                    }
                })
            }

            var subTab = this.tabPanel[category];
            var report = c.get('reportname');

            //create 2nd tier tab
            if(!subTab[report]){
                var theTab = subTab.add({
                    xtype: 'panel',
                    title: c.get('reporttitle'),
                    ref: report,
                    rowData: c,
                    autoHeight: true,
                    autoWidth: true,
                    bodyStyle:'padding:5px',
                    border: false,
                    autoScroll: true,
//                    buttons: [
//                        {text: 'Reload', ref: '../reload', handler: function(o){
//                            this.loadTab(o.refOwner)
//                        }, scope: this}
//                    ],
                    subjectArray: [],
                    filterArray: {},
                    tbar: {style: 'padding-left:10px'},
                    combineSubj: true,
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
                });

                if(this.report==report){
                    this.activeReport = theTab;
                }

                this.reports[c.get('reportname')] = theTab;

            }

        }, this);

        if(this.activeReport){
//            console.log('setting tab');
            this.tabPanel.setActiveTab(this.activeReport.ownerCt);
            this.activeReport.suspendEvents();
            this.activeReport.ownerCt.setActiveTab(this.activeReport);
            this.activeReport.resumeEvents();
            if(this.doLoad){
                this.onSubmit(this.activeReport);
            }
        }
        else{
            this.tabPanel.setActiveTab(this.tabPanel.General);
        }

//        this.doLayout();
//        this.tabPanel.doLayout();

        if(this.submitBtn)
            this.submitBtn.setDisabled(false);

    },
    loadTab: function(o){
        o.combineSubj = o.combineSubj;
        
        this.setFilters(o);

        var reload = 0;
        for (var i in this.filters){
            if(!o.filters || this.filters[i]!==o.filters[i]){
                reload = 1;
                continue;
            }
        }
                
        //indicates tab already has up to date content
        if(reload == 0 && !this.forceRefresh){
            //console.log('no reload needed');
            return;
        }
        this.forceRefresh = null;


        o.filters = this.filters;
        o.subjectArray = this.subjectArray;
        
        o.removeAll();

        this.displayReport(o);
        this.activeReport = o;
        o.doLayout();
        
    },
    setFilters: function(tab){
        this.filters = {
            _inputType : this.inputType.getValue().inputValue,
            _showReport: 1,
            room: (this.roomField ? this.roomField.getValue() : null),
            cage : (this.cageField ? this.cageField.getValue() : null),
            area : (this.areaField ? this.areaField.getValue() : null),
            subject : this.subjectArray.join(';'),
            //startDate : (this.startDateField && this.startDateField.getValue()) ? this.startDateField.getValue().format('Y-m-d') : null,
            //endDate : (this.endDateField && this.endDateField.getValue()) ? this.endDateField.getValue().format('Y-m-d'): null,
            combineSubj : tab.combineSubj,
            activeReport: tab.rowData.get('reportname')
        };

        this.processSubj();
        var token = [];
        for (var i in this.filters){
            if(this.filters[i]){
                token.push(i+':'+this.filters[i]);
            }
        }
        Ext.History.add(token.join('&'));
    },
    addHeader: function(tab, items){
        var tb = tab.getTopToolbar();
        tb.removeAll();

        //cannot separate subjects if filtering by room
        if(!this.subjArea){
            return;
        }

        tb.add({
                html: 'Combine Subjects:'
            });
        tb.add({
            xtype: 'radiogroup',
            ref: 'combine',
            tab: tab,
            style: 'padding-left:5px;padding-top:0px;padding-bottom:2px;',
//            defaults: {
//                style: 'padding-right:10px'
//                //,labelWidth: 100
//                //,labelStyle: 'padding:10px'
//            },
//            columns: 2,
//            boxMinWidth: 300,
            width: 90,
            listeners: {
                scope: this,
                change: function(o, s){
                    var val = o.getValue();

                    if(o.tab.combineSubj != val && o.tab.subjectArray.length!=1){
                        o.tab.combineSubj = val.inputValue;
                        this.loadTab(tab)
                    }
                }
            },
            items: [{
                name: 'combine',
                boxLabel: 'No',
                inputValue: false,
//                autoWidth: true,
                ref: 'combine',
                checked: !tab.combineSubj
            },{
                name: 'combine',
                boxLabel: 'Yes',
                inputValue: true,
//                autoWidth: true,
                ref: 'separate',
                checked: tab.combineSubj
            }]
        },
            '-'
        );

        if(items){
            tb.add(items);
        }
    }

});


