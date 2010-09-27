/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.namespace('EHR.ext.customPanels');

LABKEY.requiresScript("/ehr/transposeRows.js");
LABKEY.requiresScript("/ehr/utilities.js");

EHR.ext.customPanels.SingleAnimalReport = Ext.extend(Ext.Panel, {

    initComponent: function()
    {
        this.on('afterLayout', this.afterLayout, this);

//        this.cp = new Ext.state.CookieProvider({
//            expires: new Date(new Date().getTime() + (1000 * 60 * 60)) //1 hour from now
//        });

        Ext.apply(this, {
            layout:'table'
            ,autoHeight: true
            ,bodyBorder: false
            ,border: false
            ,defaults: {
                // applied to each contained panel
                border: false
                //,bodyStyle:'padding:0px'
            },
            layoutConfig: {
                columns: 4
            }
        });

        EHR.ext.customPanels.SingleAnimalReport.superclass.initComponent.call(this);

        //now we add each component
        this.add({html: '<p>Enter Subject ID(s):<br><i>(Separated by commas, semicolons, space or line breaks)</i></p>'});

        this.textarea = new Ext.form.TextArea({name:"subjectBox", width:165});
        this.add(this.textarea);

        var subjButton = this.add(new Ext.Panel({
            bodyStyle:'padding-left: 16px',
//            bodyStyle:'align: center'
            buttonAlign: 'center',
            defaults: {buttonAlign: 'center'}
        }));

        subjButton.add(new Ext.Button({
            text: '  Append -->'
            ,minWidth: 80
            ,handler: this.processSubj
            ,scope: this
            //,style:'align: center'
            ,bodyStyle:'align: center'
            ,buttonAlign: 'center'
            })
        );
        subjButton.add(new Ext.Button({
            text: '  Replace -->'
            ,minWidth: 80
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
            text: ' Clear All '
            ,minWidth: 80
            ,handler: function(c){
                this.subjectArray = [];
                this.subjTable.body.update('');                
            }
            ,scope: this
            //,style:'align: center'
            ,bodyStyle:'align: center'
            ,buttonAlign: 'center'
            })
        );

        this.subjTable = new Ext.Panel({style:'vertical-align: top', height: 220, rowspan: 6});
        this.add(this.subjTable);

        this.add({});

        var thePanel = this.add({xtype: 'panel',bodyStyle:'align: center',buttonAlign: 'center'});

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
                xtype: 'numberfield',
                fieldLabel: 'Project',
                ref: 'project'
            },{
                xtype: 'textfield',
                fieldLabel: 'Protocol',
                ref: 'protocol'
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

//        thePanel.add(new Ext.Button({
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

        thePanel.add(new Ext.Button({
            text: 'Search Protocol/Project'
            ,minWidth: 80
            ,scope: this
            ,handler: function(c){
                this.projectWin.show(this);
            }
            ,scope: this
            //,bodyStyle:'align: center'
            ,buttonAlign: 'center'
            })
        );

        this.add({});
        
        this.add({html: '<p>Or Search By Location:<br><i>(active location only. to search by floor, enter start of room)</i></p>'});
        var roomPanel = this.add({
            xtype: 'panel',
            buttonAlign: 'center',
            bodyStyle:'align: center;padding-top:5px;padding-bottom:5px',
            defaults: {cls: 'extContainer', bodyBorder: false}
        });

        roomPanel.add({tag: 'div', html: 'Room:'});
        roomPanel.add({
            xtype: 'textfield',
            ref: '../roomField',
            width: 165,
            fieldLabel: 'Room'
        });
        roomPanel.add({tag: 'div', html: 'Cage:'});
        roomPanel.add({
            xtype: 'textfield',
            ref: '../cageField',
            width: 165,
            fieldLabel: 'Cage'
        });


        this.add({});

        this.add({html: '<p>Enter Date Range<br><i>(optional - ignored by some reports)</i></p>'});

        //the date range cell:
        var datePanel = new Ext.Panel({
            defaults: {cls: 'extContainer', bodyBorder: false}
        });

        this.startDateField = new LABKEY.ext.DateField({
            format: 'Y-M-d' //YYYY-MMM-DD
            ,width: 165
            ,name:'startDate'
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

        this.endDateField = new LABKEY.ext.DateField({
            format: 'Y-M-d' //YYYY-MMM-DD
            ,width:165
            ,name:'endDate'
            ,allowBlank:true
            ,vtype: 'daterange'
            ,listeners: {
                scope: this,
                blur: function(o){
                    o.fireEvent('change');                    
                    o.startDateField.fireEvent('change');
                    o.validate(o.getValue(), o);
                }
            }
            ,validateOnBlur: true
            ,value: LABKEY.ActionURL.getParameter('endDate')
            //,scope: this
        });

        Ext.apply(this.endDateField, {startDateField: this.startDateField});
        Ext.apply(this.startDateField, {endDateField: this.endDateField});

        datePanel.add({tag: 'div', html: 'From:'});
        datePanel.add(this.startDateField);
        datePanel.add({tag: 'div', html: 'To:'});
        datePanel.add(this.endDateField);
        datePanel.add({tag: 'div', html: '<br>'});

        this.add(datePanel);

        //the date buttons:
        var dateButtons = new Ext.Panel({minButtonWidth: 150, bodyStyle:'padding:5px'});

        dateButtons.add(this.renderTimePreset("Past 24 Hours", -1));
        dateButtons.add(this.renderTimePreset("Past Week", -7));
        dateButtons.add(this.renderTimePreset("Past 30 Days", -30));
        dateButtons.add(this.renderTimePreset("Past Year", -365));

        this.add(dateButtons);

        //the report row
        this.add({html: 'Choose Report:'});

        this.allReports = new LABKEY.ext.Store({
            schemaName: 'lists',
            queryName: 'reports',
            sort: 'ReportName'
        });
        this.allReports.load();

        var reportStore = new LABKEY.ext.Store({
            schemaName: 'lists',
            queryName: 'reports',
            filterArray: [LABKEY.Filter.create('Visible', true, LABKEY.Filter.Types.EQUAL), LABKEY.Filter.create('ReportCategory', 'AnimalReport', LABKEY.Filter.Types.EQUAL)],
            sort: 'ReportName',
            autoLoad: true
        });

        var comboConfig = {
            emptyText:'Select a report...'
            ,xtype: 'LabKeyCombo'
            ,displayField:'ReportName'
            ,id:'report'
            ,store: reportStore
        };

        if (LABKEY.ActionURL.getParameter('report') && LABKEY.ActionURL.getParameter('report') != ''){
            comboConfig.value = LABKEY.ActionURL.getParameter('report')
        }
        else {
            comboConfig.value = 1;            
        }

        this.reportSelector = this.add(comboConfig);
        this.add({});

        this.add({html: 'Combine Subjects Into Single Table:'});
        this.combineSubj = this.add(new Ext.form.Checkbox());

        if (LABKEY.ActionURL.getParameter('combineSubj')){
            this.combineSubj.setValue(true);
        }

        //placeholders
        this.add({});
        this.add({});
        this.add(new Ext.Button({
            text: 'Display Report'
            ,handler: this.onSubmit
            ,type: 'submit'
            ,scope: this
            })
        );

    },
    loadProject: function(o){
        var project = this.projectWin.project.getValue();
        var protocol = this.projectWin.protocol.getValue();
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
                    this.subjectArray = subjectArray.join(';');
                    this.makeSubjGrid(subjectArray);
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
                    this.subjectArray = subjectArray.join(';');
                    this.makeSubjGrid(subjectArray);
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
        if (LABKEY.ActionURL.getParameter('participantId'))
        {
            this.subjectArray = LABKEY.ActionURL.getParameter('participantId');
            this.processSubj();
        }


        if (LABKEY.ActionURL.getParameter('showReport'))
        {
            //test whether the store loaded
            if(this.reportSelector.store.getCount())
            {
                this.displayReport()
            }
            else
            {
                this.awaitStore = function(){
                    this.reportSelector.store.un('load', this.awaitStore, this);
                    this.displayReport();
                    };

                this.reportSelector.store.on('load', this.awaitStore, this)
            }
        }

    },

    renderTimePreset: function(label, timeShift)
    {
        return new Ext.Button({
            text: label
            ,minWidth: 100
            //TODO: Add cls
            ,handler: function(){
                var dt = new Date();
                dt.setDate(dt.getDate() + timeShift);
                dt = dt.format("Y-m-d");
                this.endDateField.setValue('');
                this.startDateField.setValue(dt);
            }
            ,scope: this
        });
    },

    processSubj: function()
    {
        //we clean up, combine, then split the subjectBox and subject inputs
        var subjectArray = this.textarea.getValue();

        if (this.subjectArray){
            subjectArray += ';' + this.subjectArray;
        }

        subjectArray = subjectArray.replace(/[\s,;]+/g, ';');
        subjectArray = subjectArray.replace(/(^;|;$)/g, '');
        subjectArray = subjectArray.toLowerCase();

        if (subjectArray == '') return;

        subjectArray = subjectArray.split(';');
        subjectArray = subjectArray.unique();
        subjectArray.sort();

        this.textarea.setValue('');
        this.subjectArray = subjectArray.join(';');

        //we display the result
        this.makeSubjGrid(subjectArray);

        return subjectArray;
    },

    makeSubjGrid: function(subjectArray)
    {
        this.subjTable.body.update('');

        var table = document.createElement('table');


        for (var i = 0; i < subjectArray.length; i++)
        {

            //we calculate row/col
            var maxRow = 8;
            var r = i % maxRow;
            var c = Math.floor(i / maxRow) * 2;

            if (c == 0)
                var row = table.insertRow(r);

            var row = table.rows[r];

            var cell0 = row.insertCell(c);
            cell0.setAttribute('style', 'padding-left:15px;');
            cell0.innerHTML = subjectArray[i];

            var cell1 = row.insertCell(c+1).appendChild(document.createElement('span'));

            var button = new Ext.Button({
                text:'X'
                ,renderTo: cell1
                //,applyTo: target
                ,subjectID: subjectArray[i]
                ,style: 'padding-right:0px;padding-left:0px'
                ,handler: function(button)
                {
                    var subject = button.subjectID;

                    //we find the subjectArray
                    var subjectArray = this.subjectArray.split(';');
                    subjectArray.remove(subject);
                    this.subjectArray = subjectArray.join(';');

                    //we rebuild the table
                    this.makeSubjGrid(subjectArray)
                }
                ,scope: this
            });

        }
        this.subjTable.body.appendChild(table);
    },

    onSubmit: function(){
       this.processSubj();

       if (!this.subjectArray && !this.roomField.getValue())
        {
            alert('Must Enter At Least 1 Animal ID or Room');
            return
        }
        if (!this.reportSelector.getValue())
        {
            alert('Must Choose A Report');
            return
        }

        var params = {
            report: this.reportSelector.getValue()
            ,showReport: 1
            ,participantId: this.subjectArray
            ,other: 2
            ,room: this.roomField.getValue()
            ,cage: this.cageField.getValue()
        };

        if (this.startDateField.getValue()){
            params.startDate = this.startDateField.getValue().format('Y-m-d')
        }

        if (this.endDateField.getValue()){
            params.endDate = this.endDateField.getValue().format('Y-m-d')
        }

        if (this.combineSubj.getValue()){
            params.combineSubj = this.combineSubj.getValue()
        }

        this.displayReport();
    },


    displayReport: function(){
       var subjectArray = this.processSubj();
       var room = this.roomField.getValue();
       var cage = this.cageField.getValue();

       this.startTime = new Date().getTime();

       //we clear any old reports
       var div = document.getElementById('reportDiv');
       div.innerHTML = '';

       if (subjectArray && !room)
        {
            alert('Must Enter At Least 1 Animal ID or a Room');
            return
        }
        if (!this.reportSelector.getValue())
        {
            alert('Must Choose A Report');
            return
        }


        this.wheel = document.getElementById('reportDiv').appendChild(document.createElement('span'));
        this.wheel.innerHTML = 'Loading...<p>';
        this.wheel.setAttribute('class', "loading-indicator");

        //we handle differently depending on whether we combine subjects
        if (!this.combineSubj.getValue())
        {
            for (var i = 0; i < subjectArray.length; i++)
            {
                //first we make a new DIV for each subject to hold the report
                var subject = [subjectArray[i]];
                _reportSelector.call(this, subject);
            }
        }
        else
        {
            var subject = subjectArray;
            _reportSelector.call(this, subject);
        }

        function _reportSelector(subject)
        {
            var reportStore = this.allReports;

            //verify the store is loaded.
            if (!reportStore.getCount())
            {
                reportStore.on('load', this.displayReport, this);
                return;
            }

            var selectedReport = this.reportSelector.getValue();
            selectedReport = reportStore.getById(selectedReport);

            this.reportName = selectedReport.get("QueryName");
            
            if (selectedReport.get("ReportType") == 'multi')
            {
                selectedReport = selectedReport.get("QueryName");
                selectedReport = selectedReport.split(',');

                for (var i = 0; i < selectedReport.length; i++)
                {
                    var curReport = reportStore.getById(selectedReport[i]);
                    this._renderReport(curReport, subject);
                }
            }
            else
            {
                this._renderReport(selectedReport, subject);
            }
        }

    },

    _renderReport: function(rowData, subject)
    {
        subject = subject.join(';');

        //we run a different function depending on report type
        //Ext.Ajax.timeout = 30000; //in milliseconds

        switch (rowData.get("ReportType"))
        {
            case 'query':
                this.loadQuery(rowData, subject);
                break;
            case 'webpart':
                this.loadWebPart(rowData, subject);
                break;
            case 'details':
                this.loadDetails(rowData, subject);
                break;
            case 'multi':
                alert("Error: Child Report Cannot Be a Multipart Report");
                break;
            case 'report':
                this.loadReport(rowData, subject);
                break;
            case 'js':
                this.loadJS(rowData, subject);
                break;
            case 'chart':
                this.loadChart(rowData, subject);
                break;
            default:
                EHR.UTILITIES.onError('Improper Report Type');
        }
    },

    loadQuery: function(rowData, subject)
    {
        var filterArray = [LABKEY.Filter.create('Id', subject, LABKEY.Filter.Types.EQUALS_ONE_OF)];
        var div = document.getElementById('reportDiv');
        var target = div.appendChild(document.createElement('span'));

        //we handle date
        if (rowData.get("DateFieldName"))
        {
            if (this.startDateField.getValue())
                filterArray.push(LABKEY.Filter.create(rowData.get("DateFieldName"), this.startDateField.getValue().format('Y-m-d'), LABKEY.Filter.Types.GREATER_THAN_OR_EQUAL));
            if (this.endDateField.getValue())
                filterArray.push(LABKEY.Filter.create(rowData.get("DateFieldName"), this.endDateField.getValue().format('Y-m-d'), LABKEY.Filter.Types.LESS_THAN_OR_EQUAL));
        }


        var queryConfig = {
            title: rowData.get("ReportTitle") + ": " + subject.replace(/;/g, "; "),
            schemaName: rowData.get("Schema"),
            queryName: rowData.get("QueryName"),
            allowChooseQuery: false,
            allowChooseView: false,
            showInsertNewButton: false,
            //showPagination: false,
            showDeleteButton: false,
            showDetailsColumn: true,
            showUpdateColumn: false,
            showRecordSelectors: true,
            buttonBarPosition: 'top',
            //TODO: switch to 0 once bug is fixed
            timeout: 3000000,
            filters: filterArray,
            successCallback: function(){
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

        if (rowData.get("View"))
        {
            queryConfig.viewName = rowData.get("View")
        }

        if (rowData.get("ContainerPath"))
        {
            queryConfig.containerPath = rowData.get("ContainerPath");
        }

        if (rowData.get("DateFieldName"))
        {
            queryConfig.sort = 'Id,-'+rowData.get("DateFieldName");
        }


        Ext.Ajax.timeout = 3000000; //in milliseconds

        new LABKEY.QueryWebPart(queryConfig).render(target);

    },


    loadReport: function(rowData, subject)
    {
        var filterArray = [LABKEY.Filter.create('Id', subject, LABKEY.Filter.Types.EQUALS_ONE_OF)];
        var div = document.getElementById('reportDiv');
        var target = div.appendChild(document.createElement('span'));
        //Ext.Ajax.timeout = 30000; //in milliseconds
        
        //we handle date
        if (rowData.get("DateFieldName"))
        {
            if (this.startDateField.getValue())
                filterArray.push(LABKEY.Filter.create(rowData.get("DateFieldName"), this.startDateField.getValue().format('Y-m-d'), LABKEY.Filter.Types.GREATER_THAN_OR_EQUAL));
            if (this.endDateField.getValue())
                filterArray.push(LABKEY.Filter.create(rowData.get("DateFieldName"), this.endDateField.getValue().format('Y-m-d'), LABKEY.Filter.Types.LESS_THAN_OR_EQUAL));
        }

        var queryConfig = {
            partName: 'Report',
            renderTo: target,
            partConfig: {
                title: rowData.get("ReportTitle") + ": " + subject,
                schemaName: rowData.get("Schema"),
                reportId : rowData.get("Report"),
                'query.queryName': rowData.get("QueryName"),
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


        if (rowData.get("ContainerPath"))
        {
            queryConfig.containerPath = rowData.get("ContainerPath");
        }

        if (rowData.get("View"))
        {
            queryConfig.partConfig.showSection = rowData.get("View");
        }

        new LABKEY.WebPart(queryConfig).render();

    },

    loadJS: function(rowData, subject)
    {
        var div = document.getElementById('reportDiv');
        var target = div.appendChild(document.createElement('span'));
        //need 10.2 for this
        LABKEY.requiresScript("/ehr/AnimalReports/"+rowData.get("QueryName")+".js");

        LABKEY.Utils.onTrue({
               testCallback: function(){return undefined != rowData.get("QueryName")},
               successCallback: function(){EHR.AnimalReports[rowData.get("QueryName")].call(this, rowData, subject)},
               maxTests: 100,
               scope: this
        });
    },

    loadGrid: function(rowData, subject)
    {

        var div = document.getElementById('reportDiv');
        var target = div.appendChild(document.createElement('span'));

        var filterArray = [LABKEY.Filter.create('Id', subject, LABKEY.Filter.Types.EQUALS_ONE_OF)];

        //we handle date
        if (rowData.get("DateFieldName"))
        {

            if (this.startDateField.getValue())
            //var date = this.startDateField.getValue().format('Y-m-d');
                filterArray.push(LABKEY.Filter.create(rowData.get("DateFieldName"), this.startDateField.getValue().format('Y-m-d'), LABKEY.Filter.Types.GREATER_THAN_OR_EQUAL));
            if (this.endDateField.getValue())
                filterArray.push(LABKEY.Filter.create(rowData.get("DateFieldName"), this.endDateField.getValue().format('Y-m-d'), LABKEY.Filter.Types.LESS_THAN_OR_EQUAL));

        }


        var store = new LABKEY.ext.Store({
            schemaName: rowData.get("Schema"),
            queryName: rowData.get("QueryName"),
            filterArray: filterArray,
            sort: 'Id'

        });

        if (rowData.get("View"))
        {
            store.viewName = rowData.get("View")
        }

        var grid = new LABKEY.ext.EditorGridPanel({
            store: store
            ,title: rowData.get("ReportTitle") + ": " + subject
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

    loadWebPart: function(rowData, subject)
    {
        var div = document.getElementById('reportDiv');
        var target = div.appendChild(document.createElement('span'));

        this.params = {};
        this.subject = subject;
        this.params.rowData = rowData;

        var WebPartRenderer = new LABKEY.WebPart({
            partName: rowData.get("QueryName"),
            title: rowData.get("ReportTitle") + ": " + subject,
            renderTo: target,
            config: rowData.get("Config"),
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

    loadDetails: function(rowData, subject)
    {
        var div = document.getElementById('reportDiv');
        var target = div.appendChild(document.createElement('span'));

        var config = {
            schemaName: rowData.get("Schema"),
            queryName: rowData.get("QueryName"),
            title: rowData.get("ReportTitle") + ":",
            titleField: 'Id',
            renderTo: target,
            filterArray: [LABKEY.Filter.create('Id', subject, LABKEY.Filter.Types.EQUALS_ONE_OF)]
        };

        if (rowData.get("View"))
        {
            config.viewName = rowData.get("View");
        }

        new EHR.ext.customPanels.detailsView(config);

        this.endMsg();

    },

    loadChart: function(rowData, subject)
    {
        var div = document.getElementById('reportDiv');
        var target = div.appendChild(document.createElement('span'));

        var filterArray = [LABKEY.Filter.create('Id', subject, LABKEY.Filter.Types.EQUALS_ONE_OF)];

        //we handle date
        if (rowData.get("DateFieldName"))
        {

            if (this.startDateField.getValue())
            //var date = this.startDateField.getValue().format('Y-m-d');
                filterArray.push(LABKEY.Filter.create(rowData.get("DateFieldName"), this.startDateField.getValue().format('Y-m-d'), LABKEY.Filter.Types.GREATER_THAN_OR_EQUAL));
            if (this.endDateField.getValue())
                filterArray.push(LABKEY.Filter.create(rowData.get("DateFieldName"), this.endDateField.getValue().format('Y-m-d'), LABKEY.Filter.Types.LESS_THAN_OR_EQUAL));

        }

        var store = new LABKEY.ext.Store({
                    schemaName: rowData.get("Schema"),
                    queryName: rowData.get("QueryName"),
                    filterArray: filterArray,
                    sort: 'Id',
                    autoLoad: true
                });
        
        var chart = new Ext.Panel({
            title: rowData.get("ReportTitle") + ": " + subject,
            renderTo: target,
            width:500,
            height:300,
            layout:'fit',
            items: {
                xtype: 'linechart',
                store: store,
                xField: 'Date',
                yField: 'weight'
//                listeners: {
//                    scope: this,
//                    itemclick: function(o){
//                        var rec = o.getStore().getAt(o.index);
//                        Ext.example.msg('Item Selected', 'You chose {0}.', rec.get('weight'));
//                    },
//                    render: this.endMsg
//                }
            }
        });

    },

    endMsg: function(){
        Ext.fly(this.wheel).remove();

        //log using analytics
        var loadTime = new Date().getTime() - this.startTime;
        pageTracker._trackEvent('AnimalReport', 'LoadTime', this.reportName, loadTime);
    }

});


