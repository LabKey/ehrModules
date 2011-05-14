/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.namespace('EHR.Assay.UploadPanel', 'EHR.Assay.Upload.ImportMethod', 'EHR.ext');

LABKEY.requiresScript("FileUploadField.js");
LABKEY.requiresScript("/ehr/arrayUtils.js");
LABKEY.requiresScript("/ehr/utils.js");
LABKEY.requiresScript("ehr/AssayUtils.js");
LABKEY.requiresScript("ehr/ehrMetaHelper.js");

LABKEY.NavTrail.setTrail(LABKEY.page.assay.name+' Import');
Ext.Ajax.timeout = 30000000; //in milliseconds

EHR.Assay.UploadPanel = Ext.extend(Ext.FormPanel, {
    initComponent: function(){
        Ext.QuickTips.init();

        //we use query metadata instead of assay metadata b/c query metadata incorporates the .query.xml file
        this.domains = {};

        var multi = new LABKEY.MultiRequest();
        multi.add(LABKEY.Query.getQueryDetails, {
            schemaName: 'assay'
            ,queryName: LABKEY.page.assay.name+' Batches'
            ,successCallback: function(results){
                this.domains.Batch = results;
            }
            ,errorCallback: EHR.Assay.onError
            ,scope: this
        });
        multi.add(LABKEY.Query.getQueryDetails, {
            schemaName: 'assay'
            ,queryName: LABKEY.page.assay.name+' Runs'
            ,successCallback: function(results){
                this.domains.Run = results;
            }
            ,errorCallback: EHR.Assay.onError
            ,scope: this
        });
        multi.add(LABKEY.Query.getQueryDetails, {
            schemaName: 'assay'
            ,queryName: LABKEY.page.assay.name+' Data'
            ,successCallback: function(results){
//                Ext.each(results.columns, function(c){
//                    if(!c.nullable)
//                        console.log(c.name + '/' + c.nullable)
//                })
                this.domains.Results = results;
            }
            ,errorCallback: EHR.Assay.onError
            ,scope: this
        });

        multi.send(this.onMetaLoad, this);

        Ext.apply(this, {
            autoHeight: true
            ,autoWidth: true
            ,bodyBorder: false
            ,border: false
            ,frame: false
            ,style: 'background-color: transparent;'
            ,bodyStyle: 'background-color: transparent;'
            ,defaults: {
//                border: false
//                ,bodyBorder: false
                style:'padding:5px',
                bodyStyle:'padding:5px'
            },
            buttonAlign: 'left',
            monitorValid: true,
            buttons: [{
                text: 'Upload'
                ,width: 50
                ,handler: this.formSubmit
                ,scope: this
                ,formBind: true
            },{
                text: 'Cancel'
                ,width: 50
                ,scope: this
                ,href: LABKEY.ActionURL.getContextPath() + '/assay' + LABKEY.ActionURL.getContainer() + '/assayRuns.view?rowId='+LABKEY.page.assay.id
                ,formBind: true
            }],
            listeners: {
                scope: this,
                actioncomplete : {fn: function (f, action)
                {
                    this.handleDataUpload(f, action);
                }, scope: this},
                actionfailed : function (f, action)
                {
                    this.handleDataUpload(f, action);
                }
            }
        });

        EHR.Assay.UploadPanel.superclass.initComponent.call(this);

        this.form.url = LABKEY.ActionURL.buildURL("assay", "assayFileUpload");

        Ext.form.TextField.prototype.width = 200;
        
    },
    onMetaLoad: function(){
        this.handleImportMethods();

        //create the panel:
        var radios = [];
        for (var i=0;i<this.importMethods.length;i++){
            var config = {
                xtype: 'radio',
                name:'importMethod',
                id:'importMethod'+i,
                boxLabel: this.importMethods[i].label,
                inputValue: i,
                value: i,
                scope: this,
                listeners: {
                    scope: this,
                    check: function(radio, val){
                        if(val){
                            this.selectedMethod = this.importMethods[radio.inputValue];
                            this.toggleMethod();
                        }
                    }
                }
            };
            radios.push(config);
        }

        this.add({
            layout: 'form',
            title: 'Assay Properties',
            ref: 'assayProperties',
            items: [
                {xtype: 'displayfield', fieldLabel: 'Assay Name', value: LABKEY.page.assay.name, isFormField: false},
                {xtype: 'displayfield', fieldLabel: 'Assay Description', value: LABKEY.page.assay.description, isFormField: false}
            ]},{
            xtype: 'panel',
            layout: 'form',
            title: 'Import Properties',
            ref: 'runProperties',
            items: [{
                xtype: 'radiogroup',
                ref: '../importMethodRadio',
                fieldLabel: 'Import Method',
                columns: 1,
                isFormField: false,
                scope: this,
                items: radios
            }
            ]}
        );

        this.add({
            layout: 'form',
            title: 'Run Fields',
            ref: 'runFields'
        });

        this.renderFileArea();
        this.doLayout();

        for (var i=0;i<this.importMethods.length;i++){
            var hasValue;
            if (this.importMethods[i].isDefault){
                this.importMethodRadio.setValue(i);
                hasValue = true;
            }
            if(!hasValue)
                this.importMethodRadio.setValue(0);
        }
    },


    handleImportMethods: function(){
        this.importMethods = this.importMethods || new Array();

        this.importMethods.unshift(new EHR.Assay.Upload.ImportMethod({
            name: 'singleSample',
            label: 'Single Sample Upload',
            webFormOnly: true,
            noTemplateDownload: true,
            newGlobalFields: (function(panel){
                var fields = new Array();
                //var rf =  LABKEY.page.assay.domains[LABKEY.page.assay.name + ' Result Fields'];
                var rf =  panel.domains.Results.columns;
                for (i=0;i<rf.length;i++)
                    {
                        var tmp = rf[i];
                        tmp.domain = 'Results';
                        fields.push(tmp);

                        if(tmp.inputType=='textarea'){
                            EHR.Assay.rApplyIf(tmp, {
                                editorConfig: {
                                    height: 100,
                                    width: 400
                                }
                            });
                        }
                    }
                return fields;
            })(this)
        }));

        this.importMethods.unshift(new EHR.Assay.Upload.ImportMethod({
            name: 'defaultExcel',
            label: 'Default Excel Upload'
        }));

        for (var i=0;i<this.importMethods.length;i++){
            if (this.importMethods[i].init){
                this.importMethods[i].init();
            }

            if(this.importMethods[i].isDefault)
                this.selectedMethod = this.importMethods[i];
        }

        this.selectedMethod = this.selectedMethod || this.importMethods[0]; 
    },


    toggleMethod: function(){
        this.runFields.removeAll();
        //removes records of all fields except run name and description.
        //this.formFields.index = new Array();

        //we add new global fields
        this.addDomain('Batch');
        this.addDomain('Run');
        this.addDomain('Other');

        this.runFields.doLayout();
        
        //we toggle visibility on the file import area
        if (this.selectedMethod.webFormOnly == true){
            this.assayResults.setVisible(false);
        }
        else {
            this.assayResults.setVisible(true);
        }

        this.sampleDataArea.removeAll();

        if (!this.selectedMethod.noTemplateDownload){
            this.sampleDataArea.add({
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
            });
        }

        if (this.selectedMethod.exampleData){
            this.sampleDataArea.add({
                tag: 'a'
                ,border: false
                ,style: 'padding-bottom: 10px'
                ,html: '<a href="'+this.selectedMethod.exampleData+'">[example data]</a>'
                });
        }


        this.sampleDataArea.doLayout();
    },

    addDomain: function(domain){

        var domainFields = new Array();
        switch (domain){
            case 'Other':
                domainFields = domainFields.concat(this.selectedMethod.newGlobalFields);
                break;
            case 'Run':
                domainFields = domainFields.concat(this.domains[domain].columns);

                for (var i=0;i<this.domains.Results.columns.length;i++){
                    var tmp = this.domains.Results.columns[i];
                    if (this.selectedMethod.promotedResultFields.contains(tmp.name)){
                        tmp.domain = 'Results';
                        domainFields.push(tmp);
                    }
                }
                break;
            case 'Results':
                //domainFields = domainFields.concat(LABKEY.page.assay.domains[LABKEY.page.assay.name + ' '+domain+' Fields']);
                domainFields = domainFields.concat(this.domains[domain].columns);
                break;
            default:
                //domainFields = domainFields.concat(LABKEY.page.assay.domains[LABKEY.page.assay.name + ' '+domain+' Fields']);
                domainFields = domainFields.concat(this.domains[domain].columns);
        }

        var skippedFields = this.selectedMethod['skipped'+domain+'Fields'] || [];
        if (domain == 'Results'){
            skippedFields.merge(this.selectedMethod.promotedResultFields)
        }
        skippedFields.sort();

        for (var i=0; i < domainFields.length; i++){
            if (domain == 'Other' && !domainFields[i].domain){
                alert('Error: Must supply the domain for field: '+domainFields[i].name);
                return
            }

            domainFields[i].domain = domainFields[i].domain || domain;

            if (!skippedFields.contains(domainFields[i].name) && !domainFields[i].isHidden && domainFields[i].shownInInsertView!==false){
                var fieldObj = domainFields[i];
                if(!fieldObj.jsonType)
                    fieldObj.jsonType = EHR.Assay.addJsonType(fieldObj);

                if(!fieldObj.id){
                    fieldObj.id = fieldObj.name
                }

                EHR.Assay.rApplyIf(fieldObj, {editorConfig: {editable: false, width: 200, lazyInit: false, domain: domainFields[i].domain}});

                if (this.metadata && this.metadata[fieldObj.domain] && this.metadata[fieldObj.domain][fieldObj.name]){
                    EHR.Assay.rApply(fieldObj, this.metadata[fieldObj.domain][fieldObj.name]);
                }

                if (this.selectedMethod.metadata && this.selectedMethod.metadata[fieldObj.domain] && this.selectedMethod.metadata[fieldObj.domain][fieldObj.name]){
                    EHR.Assay.rApply(fieldObj, this.selectedMethod.metadata[fieldObj.domain][fieldObj.name]);
                }

                fieldObj.input = EHR.ext.metaHelper.getFormEditor.call(this, fieldObj);

                console.log(fieldObj.input.allowBlank);
                this.runFields.add(fieldObj.input);
            }
        }
    },

    templateURL: function(){
        if (!this.selectedMethod.template)
            this.makeExcel();
        else
            this.selectedMethod.template();
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

    renderFileArea: function(){
        this.add({
            title: 'Assay Results',
            xtype: 'panel',
            ref: 'assayResults',
            autoHeight: true,
            items: [{
                xtype: 'panel',
                ref: '../sampleDataArea',
                border: false
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
                        //NOTE: the fileInput button will not go away without this
                        this.fileArea.removeAll();
                        this.fileArea.destroy();
                        this.assayResults.add({
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
                        this.assayResults.doLayout();

                        this.uploadType = 'text';
                    }
                },{
                    boxLabel: 'File Upload',
                    xtype: 'radio',
                    name: 'uploadType',
                    inputValue: 'file',
                    handler: function(fb, y){
                        if (!y){return};
                        //NOTE: the fileInput button would not go away without this
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
                        this.assayResults.doLayout();

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
    _addGlobalFields: function(run){
        //run name and description:
        //run.properties[this.form.items.map.RunName.name] = this.form.items.map.RunName.getValue();
        //run.properties[this.form.items.map.RunDescription.name] = this.form.items.map.RunDescription.getValue();

        //this adds the batch, run and global fields
        //any validation of these values should be done on form submission so we dont need to repeat here
        this.processing.extraResults = [];
        this.processing.otherFields = [];

        for (var i in this.form.items.map){
            var field = this.form.items.map[i];
            var value = field.getValue();
            
            if(field.isFormField === false)
                continue;

            switch (field.domain)
            {
            //TODO: verify batch works
            case 'Batch':
                LABKEY.page.batch.properties[field.name] = value;
                break;
            case 'Run':
                run.properties[field.name] = value;
                break;
            case 'Results':
                this.processing.extraResults.push({value: value});
                this.processing.headers.push({name: (field.name || field.id)});
                break;
            case 'Other':
                this.processing.otherFields.push({label: field.name, value: value});
                break;
            }
        }
    },
    _parseHeader: function(row){
        //TODO: figure out how to find row aliases and hook into metadata.          
        //because column titles can be variable, we try to translate them
        this.processing.headers = [];
        for (var i=0;i<row.length;i++){
            //TODO: I think the data object has different format for headers depending on whether it was text or a file
            //text has headers as an array of objects, files have a simple array of scalars
            var rawName = row[i].value || row[i];

            //var name = EHR.Assay.findFieldname(rawName, LABKEY.page.assay.domains[LABKEY.page.assay.name + ' Result Fields']);
            var name = EHR.Assay.findFieldname(rawName, this.domains.Results.columns);

            //NOTE: we let the process continue b/c it's possible we want to pass values to the validation script
            if (!name){
                console.log('Header Name Not Found: '+rawName);
                //return false;
            }

            this.processing.headers.push({raw: rawName, name: name});
        }
    },
    _rowParse: function(row){
        var rowContent = {};
        for (var j=0;j<this.processing.headers.length;j++){
            var field = row[j];
            var header = this.processing.headers[j];

            //Allows a custom parse/transform method to be defined per field
            //runs prior to default processing
            if (this.selectedMethod.clientParsing.fieldsPre[header.name])
                this.selectedMethod.clientParsing.fieldsPre[header.name](field);

            var value = '';
            if (!this.selectedMethod.clientParsing[header.name] || !this.selectedMethod.clientParsing[header.name].overrideField)
                value = this._fieldParse(field);

            //Allows a custom parse/transform method to be defined per field
            //runs after default processing
            if (this.selectedMethod.clientParsing.fieldsPost[header.name])
                value = this.selectedMethod.clientParsing.fieldsPost[header.name](value);

            rowContent[header.name] = value;
        }

        return rowContent;
    },
    _fieldParse: function (field){
        //TODO: sort out when cells are returned as objects versus scalars
        var value = field.formattedValue || field.value;

        return value;
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

//this is a prototype for the structure of a spreadsheet import method
//the idea is to let the use define custom methods, which contain might contain unique transform/validation
//it allows multiple pathways to import into the same table/assay
EHR.Assay.Upload.ImportMethod = function(config){

    //check the config
    var required = ['name', 'label'];
    for (var i=0;i<required.length;i++){
        if (!config[required[i]]){
            alert('Must supply config.'+required[i]);
            return false;
        }
    }

    //this is the set of default options.
    // All possible params have been included even if not used
    //commented params are there for documentation only
    var defaults = {
        //name: 'Name',
        //,label: 'Other CSV Upload'

        //if true, this will be selected on load
        //,isDefault: true

        //provide arrays with the names of any existing fields to skip
        skippedBatchFields: []
        ,skippedRunFields: []
        ,skippedResultFields: []

        //controls whether link to excel template appears
        ,noTemplateDownload: false

        //controls whether file content area shows.  otherwise this would be a web form only
        ,webFormOnly: false

        //path to file with example data
        ,exampleData: null

        //you can provide an array of new fields to add
        //object should match the labkey row object
        ,newGlobalFields: new Array()
        //,newGlobalFields: [{name: 'New', label: 'New', domain: 'Run'}]

        //names of result domain fields to be displayed globally.  will not appear in excel file
        ,promotedResultFields: new Array()

        //extra metadata applied to fields
        ,metadata: null

        //will be appended to excel template. note: result fields can also be added globally above
        //,newResultFields: [{name: 'New', label: 'New', domain: 'Run'}]

        //init function will run on page load.  useful if you need to load queries for validation
        //,init: function(){}

        //javascript methods to process data. not mutually exclusive with server-side scripts
        //methods should accept the listed argument and return the modified result

        //currently allows scripts to be run per cell, row or per upload.
        //allows scripts to be run either before or after the default processing
        //perhaps both are not needed, although in the past I have had a need for both
        //perhaps any pre-processing is best shifted to single transform script, rather than trying to do it per row/cell
        ,clientParsing: {
            contentPre: null, //function(data){}
            contentPost: null, //function(run.dataRows){}

            rowPre: null, //function(row){}
            rowPost: null, //function(rowContent){}

            fieldsPre: {
                //fieldName: function(field){}  //supplements processing on the named field
            },
            fieldsPost: {
                //fieldName: function(value){}
            }

        }

        //name or other ID to identify the server-side processing scripts
        //not currently supported,
        //ideally, would permit the same granularity as client-side scripts
        ,serverValidationScript: ''
        ,serverTransformScript: ''
        };

    return EHR.Assay.rApply(defaults, config);
    
};