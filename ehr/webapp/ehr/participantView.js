/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.namespace('EHR.ext.customPanels');

LABKEY.requiresScript("/ehr/transposeRows.js");
LABKEY.requiresScript("/ehr/utilities.js");

EHR.ext.customPanels.participantView = Ext.extend(Ext.Panel, {

    initComponent: function()
    {
        //we reload the fields from URL if the params exist
        if (LABKEY.ActionURL.getParameter('participantId'))
        {
            this.subjectArray = LABKEY.ActionURL.getParameter('participantId');
        }

        this.cp = new Ext.state.CookieProvider({
            expires: new Date(new Date().getTime() + (1000 * 60 * 60)) //1 hour from now
        });

        Ext.apply(this, {
            layout:'table'
            ,autoHeight: true
            ,bodyBorder: false
            ,border: false
            ,defaults: {
                // applied to each contained panel
                border: false
                //,bodyStyle:'padding:5px'
            },
            layoutConfig: {
                columns: 4
            }
        });

        EHR.ext.customPanels.participantView.superclass.initComponent.call(this);

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
            sort: 'ReportName'
        });

        var comboConfig = {
            emptyText:'Select a report...'
            ,xtype: 'LabkeyComboBox'
            ,displayField:'ReportName'
            ,hiddenName:'report'
            ,store: reportStore
        };

        if (LABKEY.ActionURL.getParameter('report') && LABKEY.ActionURL.getParameter('report') != ''){
            comboConfig.value = LABKEY.ActionURL.getParameter('report')
        }
        else {
            comboConfig.value = 1;
        }

        this.reportSelector = new EHR.ext.customFields.LabKeyCombo(comboConfig);

        this.add(this.reportSelector);

        this.combineSubj = new Ext.form.Checkbox();
        /*
        this.add({});

        this.add({html: 'Combine Subjects Into Single Table:'});
        this.combineSubj = this.add(new Ext.form.Checkbox());

        if (LABKEY.ActionURL.getParameter('combineSubj')){
            this.combineSubj.setValue(true);
        }
        */

        //placeholder
        this.add({});
        this.add(new Ext.Button({
            text: 'Display Report'
            ,scope: this
            ,handler: this.onSubmit
            ,type: 'submit'
        })
                );

        this.add(new Ext.form.Field({
            html: 'Test',
            autoCreate: {
                tag: 'input'
                ,type: 'hidden'
            }
            })
        );

    },

    //this function builds the URL and reloads the page
    onSubmit: function(){
        this.displayReport()
    },


    displayReport: function(){
        var subjectArray = this.subjectArray.split(';');

        //we clear any old reports
        var div = document.getElementById('reportDiv');
        if (div.hasChildNodes())
        {
            while (div.childNodes.length >= 1)
            {
                div.removeChild(div.firstChild);
            }
        }

        if (!subjectArray)
        {
            alert('Must Enter At Least 1 Animal ID');
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
        Ext.Ajax.timeout = 30000; //in milliseconds

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
            default:
                EHR.UTILITIES.onError();
        }
    },

    loadQuery: function(rowData, subject)
    {
        var filterArray = [LABKEY.Filter.create('Id', subject, LABKEY.Filter.Types.EQUALS_ONE_OF)];
        var div = document.getElementById('reportDiv');
        var target = div.appendChild(document.createElement('span'));


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
            buttonBarPosition: 'top',
            filters: filterArray,
            successCallback: this.endMsg,
            errorCallback: function(error){target.innerHTML = 'ERROR: ' + error.exception + '<br>'; this.endMsg; EHR.UTILITIES.onError(error)},
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


        Ext.Ajax.timeout = 30000; //in milliseconds

        new LABKEY.QueryWebPart(queryConfig).render(target);

    },


    loadReport: function(rowData, subject)
    {
        var filterArray = [LABKEY.Filter.create('Id', subject, LABKEY.Filter.Types.EQUALS_ONE_OF)];
        var div = document.getElementById('reportDiv');
        var target = div.appendChild(document.createElement('span'));
        Ext.Ajax.timeout = 30000; //in milliseconds



        var queryConfig = {
            partName: 'Report',
            renderTo: target,
            partConfig: {
                title: rowData.get("ReportTitle") + ": " + subject,
                schemaName: rowData.get("Schema"),
                reportId : rowData.get("Report"),
                'query.queryName': rowData.get("QueryName"),
                'query.Id~in': subject,
                '_select.Id~in': subject
            },
            filters: filterArray,
            successCallback: this.endMsg,
            errorCallback: function(error){target.innerHTML = 'ERROR: ' + error.exception + '<br>'; this.endMsg; EHR.UTILITIES.onError(error)},
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

        Ext.Ajax.timeout = 30000; //in milliseconds

        new LABKEY.WebPart(queryConfig).render();

    },

    loadJS: function(rowData, subject)
    {
        var div = document.getElementById('reportDiv');
        var target = div.appendChild(document.createElement('span'));
//        //need 10.2 for this
//        LABKEY.requiresScript("/ehr/AnimalReports/"+rowData.get("QueryName")+".js");
//
//        LABKEY.Utils.onTrue({
//               testCallback: function(){return undefined != window.rowData.get("QueryName")},
//               successCallback: function(){EHR.AnimalReports[rowData.get("QueryName")].call(this, rowData, subject)},
//               maxTests: 100,
//               scope: this
//        });
    },

    loadGrid: function(rowData, subject)
    {

        var div = document.getElementById('reportDiv');
        var target = div.appendChild(document.createElement('span'));

        var filterArray = [LABKEY.Filter.create('Id', subject, LABKEY.Filter.Types.EQUALS_ONE_OF)];

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
            ,errorCallback: function(error){target.innerHTML = 'ERROR: ' + error.exception + '<br>'; this.endMsg; EHR.UTILITIES.onError(error)}
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
            errorCallback: function(error){target.innerHTML = 'ERROR: ' + error.exception + '<br>'; this.endMsg; EHR.UTILITIES.onError(error)},
            scope: this
        });
        WebPartRenderer.render(target);
    },

    loadDetails: function(rowData, subject)
    {
        var div = document.getElementById('reportDiv');
        var header = div.appendChild(document.createElement('span'));
        var target = div.appendChild(document.createElement('span'));
        /*
        header.innerHTML = '<table class="labkey-wp"><tbody><tr class="labkey-wp-header"><th class="labkey-wp-title-left">' +
            rowData.get("ReportTitle") + ": " + subject + '</th></tr></table>';
        */
        new EHR.ext.customPanels.detailsView({
            schemaName: rowData.get("Schema"),
            queryName: rowData.get("QueryName"),
            title: rowData.get("ReportTitle") + ":",
            renderTo: target,
            filterArray: [LABKEY.Filter.create('Id', subject, LABKEY.Filter.Types.EQUALS_ONE_OF)]
        });

        this.endMsg();

    },

    endMsg: function(){
        Ext.fly(this.wheel).remove();
    }

});




Ext.onReady(function ()
{
    /* get the participant id from the request URL: this parameter is required. */
    var participantId = LABKEY.ActionURL.getParameter('participantId');
    /* get the dataset id from the request URL: this is used to remember expand/collapse
       state per-dataset.  This parameter is optional; we use -1 if it isn't provided. */

    if (!participantId){alert('Must Provide Id'); return false;}

    new EHR.ext.customPanels.detailsView({
        schemaName: 'study',
        queryName: 'demographics',
        title: 'Animal Details:',
        renderTo: 'participantDetails',
        filterArray: [LABKEY.Filter.create('Id', participantId, LABKEY.Filter.Types.EQUAL)]
    });

    new EHR.ext.customPanels.participantView({applyTo: 'participantView'});

});
