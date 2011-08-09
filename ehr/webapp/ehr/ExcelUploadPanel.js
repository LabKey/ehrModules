/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.namespace('LABKEY.ext');

LABKEY.requiresScript("FileUploadField.js");

LABKEY.ext.ExcelUploadPanel = Ext.extend(Ext.FormPanel, {
    initComponent: function(){
        Ext.QuickTips.init();

        //we use query metadata instead of assay metadata b/c query metadata incorporates the .query.xml file
        this.domains = {};

        Ext.apply(this, {
            autoHeight: true
            ,bodyBorder: false
            ,border: false
            ,frame: false
            ,defaults: {
                bodyStyle:'padding:5px'
            }
            ,buttonAlign: 'left'
            ,monitorValid: true
            ,store: new LABKEY.ext.Store({
                schemaName: this.schemaName
                ,queryName: this.queryName
                ,maxRows: 0
                ,autoLoad: true
            })
            ,buttons: [{
                text: 'Upload'
                ,width: 50
                ,handler: this.formSubmit
                ,scope: this
                ,formBind: true
            },{
                text: 'Cancel'
                ,width: 50
                ,scope: this
                ,handler: function(){
                    window.location = LABKEY.ActionURL.buildURL('project', 'begin.view')
                }
                ,formBind: true
            }]
            ,listeners: {
                scope: this,
                actioncomplete: function (f, action){
                    this.handleDataUpload(f, action);
                },
                actionfailed: function (f, action){
                    this.handleDataUpload(f, action);
                }
            }
        });

        LABKEY.ext.ExcelUploadPanel.superclass.initComponent.call(this);

        if(!this.store.fields){
            this.mon(this.store, 'load', this.renderFileArea, this, {single: true});
        }
        else {
            this.renderFileArea();
        }

    },

    renderFileArea: function(){
        this.add({
            title: 'Upload Data',
            xtype: 'panel',
            ref: 'excelPanel',
            autoHeight: true,
            items: [{
                xtype: 'panel',
                ref: '../sampleDataArea',
                border: false
            },{
                xtype: 'button'
                ,html: '[download excel template]'
                ,border: false
                ,style: 'padding-bottom: 10px'
                ,listeners: {
                    scope: this,
                    click: this.templateURL
                },
                scope: this,
                handler: this.templateURL
            },{
                xtype: 'radiogroup',
                name: 'uploadType',
                isFormField: false,
                ref: '../inputType',
                width: 350,
                items: [{
                    boxLabel: 'Copy/Paste Data',
                    xtype: 'radio',
                    name: 'uploadType',
                    isFormField: false,
                    inputValue: 'text',
                    checked: true,
                    scope: this,
                    handler: function(fb, y){
                        if (!y){return};
                        //NOTE: the button from the file input does not get removed
                        this.fileArea.removeAll();
                        this.fileArea.destroy();
                        this.excelPanel.add({
                            xtype: 'panel',
                            ref: '../fileArea',
                            border: false
                        });
                        this.fileArea.add({
                            ref:"../fileContent",
                            name: 'fileContent',
                            xtype: 'textarea',
                            height:350,
                            width: 700
                        })
                        this.excelPanel.doLayout();

                        this.uploadType = 'text';
                    }
                },{
                    boxLabel: 'File Upload',
                    xtype: 'radio',
                    name: 'uploadType',
                    inputValue: 'file',
                    style: 'padding-bottom:50px;',
                    handler: function(fb, y){
                        if (!y){return};

                        this.fileArea.removeAll();
                        this.fileArea.add(new Ext.form.FileUploadField({
                            xtype: 'fileuploadfield',
                            name: 'upload-run-field',
                            ref: '../upload-run-field',
                            width: 300,
                            buttonText: "Select a file",
                            //buttonOffset: 3,
                            buttonOnly: false,
                            buttonCfg: {
                              cls: "labkey-button"
                            }
                        }));
                        this.excelPanel.doLayout();

                        this.uploadType = 'file';
                    },
                    scope: this
                }]
            },{
                xtype: 'panel',
                ref: '../fileArea',
                border: false,
                items: [{
                    ref:"../fileContent",
                    xtype: 'textarea',
                    name: 'fileContent',
                    height:350,
                    width: 700
                }]
            }]
        });
        this.uploadType = 'text';
        this.doLayout();
    },

    templateURL: function(){
        this.makeExcel();
    },

    makeExcel: function(){
        var header = [];

        //var rf = LABKEY.page.assay.domains[LABKEY.page.assay.name + ' Result Fields'];
        var rf = this.domains.Results.columns;
        var sf = this.selectedMethod.skippedResultFields || [];
        sf.sort();

        for (var i=0; i < rf.length; i++){
            //TODO: check metadata to make sure this field should appear in import, skip if false

            if (!sf.contains(rf[i].name) && !rf[i].isHidden && rf[i].shownInInsertView!=false){
                header.push(rf[i].name);
            }
        }

        //we add new global fields
        if (this.selectedMethod.newResultFields){
            for (i=0;i<this.selectedMethod.newResultFields.length;i++)
                header.push(this.selectedMethod.newResultFields[i].name);
        }

        //TODO: Add formatting or validation in the excel sheet?
        var config = {
            fileName : LABKEY.page.assay.name + '_' + (new Date().format('Y-m-d H_i_s')) + '.xls',
            sheets : [{
                    name: 'data',
                    data:
                    [
                        header
                    ]
                }]
        };

        LABKEY.Utils.convertToExcel(config);
    },

    formSubmit: function(){
        Ext.Msg.wait("Uploading...");

        LABKEY.page.batch.runs.length = 0;
        var fields = this.form.getFieldValues();
        var uploadType = this.inputType.getValue();
        
        if (this.selectedMethod.webFormOnly){
            var data = [];
            data.push([], []);
            var run = new LABKEY.Exp.Run();
            this.processData(data, run);
        }
        else {
            if (this.uploadType == 'text'){
                this.form.baseParams = {fileName: fields.Name+'.tsv'};
                this.form.fileUpload = false;
            }
            else {
                    this.form.fileUpload = true;            
            }

            this.form.submit();
        }
    },

    handleDataUpload: function(f, action){
        if (!action)
        {
            console.log(action);
            Ext.Msg.alert("Upload Failed", "Something went horribly wrong when uploading.");
            return;
        }
        if(!action.result){
            switch(action.failureType){
                case 'client':
                    Ext.Msg.alert("One or more fields has a missing or improper value");
                    break;
                default:
                    console.log(action);
                    Ext.Msg.alert("Upload Failed", "Something went wrong when uploading.");
                    break;
            }
            return;
        }
        if (!action.result.id)
        {
            Ext.Msg.alert("Upload Failed", "Failed to upload the data file: " + action.result);
            return;
        }

        var data;
        if (this.uploadType == 'file')
        {
            data = new LABKEY.Exp.Data(action.result);
        }
        else
        {
            data = new LABKEY.Exp.Data(Ext.util.JSON.decode(action.response.responseText));
        }

        var run = new LABKEY.Exp.Run();
        run.dataInputs = [ data ];

        if (!data.content)
        {
            // fetch the contents of the uploaded file.
            // Using 'jsonTSVExtended' will ensure date formats
            // found in the excel document are applied.
            data.getContent({
                format: 'jsonTSVExtended',
                scope: this,
                successCallback: function (content, format)
                {
                    data.content = content;
                    this.handleFileContent(run, content);
                },
                failureCallback: function (error, format)
                {
                    Ext.Msg.hide();
                    Ext.Msg.alert("Upload Failed", "An error occurred while fetching the contents of the data file: " + error.exception);
                    EHR.Assay.onError(error);
                }
            })
        }
        else {
            this.handleFileContent(run, data.content);
        }
    },

    handleFileContent: function(run, content){
        if (!content)
        {
            Ext.Msg.hide();
            Ext.Msg.alert("Upload Failed", "The data file has no content");
            return;
        }
        if (!content.sheets || content.sheets.length == 0)
        {
            // expected the data file to be parsed as jsonTSV
            Ext.Msg.hide();
            Ext.Msg.alert("Upload Failed", "The data file has no sheets of data");
            return;
        }

        // User 1st sheet unless there's a sheet named "Data"
        var sheet = content.sheets[0];
        for (var index = 0; index < content.sheets.length; index++)
        {
            if (content.sheets[index].name == "Data")
                sheet = content.sheets[index];
        }

        var data = sheet.data;
        if (!data.length)
        {
            Ext.Msg.alert("Upload Failed", "The data file contains no rows");
            return;
        }

        this.processData(data, run)
    },

    processData: function(data, run){
        run.name = this.getForm().findField('Name').getValue() || "[New]";

        //Allows a custom parse/transform method to operate on all data
        if (this.selectedMethod.clientParsing.contentPre){
            var data = this.selectedMethod.clientParsing.contentPre.call(this, data);
            if (!data) return false;

            //TODO: figure out some way to save this modified data as an input?
            //run.dataInputs.push(data);
        }

        this.processing = {};

        this._parseHeader(data[0]);
        this._addGlobalFields(run);

        // convert the result data into an array of map objects
        run.dataRows = [];
        for (var i = 1; i < data.length; i++) {
            var row = data[i].concat(this.processing.extraResults);

            //Allows a custom parse/transform method to be defined per row
            //runs prior to default processing
            if (this.selectedMethod.clientParsing.rowPre)
                row = this.selectedMethod.clientParsing.rowPre.cell(this, row);

            var rowContent = {};
            if (!this.selectedMethod.clientParsing.overrideRow)
                rowContent = this._rowParse(row);

            //Allows a custom parse/transform method to be defined per row
            //runs after default processing
            if (this.selectedMethod.clientParsing.rowPost)
                this.selectedMethod.clientParsing.rowPost.call(this, rowContent);

            run.dataRows.push(rowContent);
        }

        //Allows a custom parse/transform method to be defined per upload
        //runs after default processing code
        if (this.selectedMethod.clientParsing.contentPost)
            this.selectedMethod.clientParsing.contentPost.call(this, run.dataRows);


        LABKEY.page.batch.runs = LABKEY.page.batch.runs || new Array();
        LABKEY.page.batch.runs.push(run);

        LABKEY.setDirty(true);
        this.saveBatch();
    },
    saveBatch: function()
    {
        if (!LABKEY.dirty) return;

        LABKEY.Experiment.saveBatch({
            assayId : LABKEY.page.assay.id,
            batch : LABKEY.page.batch,
            scope: this,
            successCallback : function (batch, response)
            {
                //LABKEY.page.batch = batch;
                LABKEY.setDirty(false);

                this.form.items.each(function(f){
                    if(f.isFormField===false)
                        return;

                    f.reset();
                });
                
                Ext.Msg.hide();
                Ext.Msg.alert("Success", "Data Uploaded Successfully");

            },
            failureCallback : function (error, format)
            {
                Ext.Msg.hide();
                Ext.Msg.alert("Failure when communicating with the server: " + error.exception);
                EHR.Assay.onError(error);
            }
        });
    }

});

Ext.reg('labkey-exceluploadpanel', LABKEY.ext.ExcelUploadPanel);