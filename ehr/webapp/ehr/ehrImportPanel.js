/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


EHR.ext.Buttons = {
    SAVEDRAFT: function(){return {
        text: 'Save Draft',
        name: 'saveDraft',
        targetQC: 'In Progress',
        errorThreshold: 'WARN',
        //successURL: LABKEY.ActionURL.buildURL("ehr", "dataEntry.view"),
        disabled: true,
        ref: 'saveDraftBtn',
        handler: this.onSubmit,
        disableOn: 'ERROR',
        scope: this
        }
    },
    SUBMIT: function(){return {
        text: 'Submit Final',
        name: 'submit',
        targetQC: 'Approved',
        errorThreshold: 'INFO',
        successURL: LABKEY.ActionURL.buildURL("ehr", "dataEntry.view"),
        disabled: true,
        ref: 'submitBtn',
        handler: this.onSubmit,
        disableOn: 'WARN',
        scope: this
        }
    },
    REVIEW: function(){return {
        text: 'Submit for Review',
        name: 'review',
        targetQC: 'Review Required',
        errorThreshold: 'WARN',
        successURL: LABKEY.ActionURL.buildURL("ehr", "dataEntry.view"),
        disabled: true,
        ref: 'reviewBtn',
        disableOn: 'ERROR',
        handler: this.onSubmit,
        scope: this
        }
    },
    DISCARD: function(){return {
        text: 'Discard',
        name: 'discard',
        ref: 'discardBtn',
        targetQC: 'Delete Requested',
        successURL: LABKEY.ActionURL.buildURL("ehr", "dataEntry.view"),
        handler: this.discard,
        scope: this
        }
    },
//    CLOSE: function(){return {
//        text: 'Close',
//        name: 'close',
//        ref: 'closeBtn',
//        handler: function(){
//            window.location = LABKEY.ActionURL.buildURL('ehr','dataEntry.view')
//        },
//        scope: this
//        }
//    },
    CLOSE: function(){return {
        text: 'Save & Close',
        name: 'closeBtn',
        targetQC: 'In Progress',
        errorThreshold: 'WARN',
        successURL: LABKEY.ActionURL.buildURL("ehr", "dataEntry.view"),
        disabled: true,
        ref: 'closeBtn',
        handler: this.onSubmit,
        disableOn: 'ERROR',
        scope: this
        }
    },
    PRINT: function(){return {
        text: 'Print',
        name: 'print',
        ref: 'printBtn',
        handler: function(){
            window.open(LABKEY.ActionURL.buildURL('ehr','printTask.view', null, {_print: 1, formtype:this.formType, taskid: this.formUUID}))
        },
        scope: this
        }
    },
    REQUEST: function(){return {
        text: 'Request',
        name: 'request',
        targetQC: 'Request: Pending',
        errorThreshold: 'WARN',
        successURL: LABKEY.ActionURL.buildURL("ehr", "requestServices.view"),
        disabled: true,
        ref: 'requestBtn',
        handler: this.onSubmit,
        disableOn: 'ERROR',
        scope: this
        }
    },
    APPROVE: function(){return {
        text: 'Approve Request',
        name: 'approve',
        targetQC: 'Request: Approved',
        errorThreshold: 'WARN',
        successURL: LABKEY.ActionURL.buildURL("ehr", "dataEntry.view"),
        disabled: true,
        ref: 'approveBtn',
        handler: this.onSubmit,
        disableOn: 'ERROR',
        scope: this
        }
    },
    EDIT: function(){return {
        text: 'Edit',
        name: 'edit',
        targetQC: 'Approved',
        errorThreshold: 'WARN',
        handler: function(){
            window.location = LABKEY.ActionURL.buildURL('ehr','manageTask.view', null, {formtype:this.formType, taskid: this.formUUID});
        },
        disabled: false,
        ref: 'editBtn',
        disableOn: 'ERROR'
        }
    }
};



//config:
// formType
// taskId
// formHeaders
// formSections
// formTabs
// readOnly

EHR.ext.ImportPanelBase = function(config){
    EHR.ext.ImportPanelBase.superclass.constructor.call(this, config);
};

Ext.extend(EHR.ext.ImportPanelBase, Ext.Panel, {
    initComponent: function()
    {
        Ext.QuickTips.init();

        Ext.applyIf(this, {
            autoHeight: true
            //,forceLayout: true
            ,defaults: {
                bodyBorder: false
                ,border: false
            }
            ,items: []
            ,store: new EHR.ext.StoreCollection({
                monitorValid: true
            })
            ,fbar: []
        });

        EHR.ext.ImportPanelBase.superclass.initComponent.call(this);

        this.addEvents('participantchange', 'participantloaded');

        this.mon(this.store, 'validation', this.onStoreValidation, this);
        this.mon(this.store, 'commitcomplete', this.afterSubmit, this);
        this.mon(this.store, 'commitexception', this.afterSubmit, this);

        //monitor dirty state
        window.onbeforeunload = LABKEY.beforeunload(function (){
            if (this.isDirty())
                return this.warningMessage || 'we should set a warning message somewhere';
        }, this);

        EHR.utils.getTablePermissions({
            queries: this.getQueries(),
            success: this.calculatePermissions,
            failure: EHR.utils.onError,
            scope: this
        });
    },

    calculatePermissions: function(permissionMap){
        this.permissionMap = permissionMap;

        this.populateItems();

        //add stores to StoreCollection
        Ext.StoreMgr.each(this.addStore, this);

        this.populateButtons();

        if(this.initialTemplates)
            this.applyTemplates(this.initialTemplates);
    },

    getQueries: function(){
        var queries = [];

        if(this.formHeaders)
            Ext.each(this.formHeaders, function(item){
                if(item.schemaName && item.queryName)
                    queries.push({
                        schemaName: item.schemaName,
                        queryName: item.queryName
                    })
            }, this);
        if(this.formSections)
            Ext.each(this.formSections, function(item){
                if(item.schemaName && item.queryName)
                    queries.push({
                        schemaName: item.schemaName,
                        queryName: item.queryName
                    })
            }, this);
        if(this.formTabs)
            Ext.each(this.formTabs, function(item){
                if(item.schemaName && item.queryName)
                    queries.push({
                        schemaName: item.schemaName,
                        queryName: item.queryName
                    })
            }, this);

        return queries;
    },
    populateButtons: function(){
        if(this.allowableButtons){
            if(!Ext.isArray(this.allowableButtons))
                this.allowableButtons = this.allowableButtons.split(',');
        }
        else {
            this.allowableButtons = [
                'SAVEDRAFT',
                'REVIEW',
                'SUBMIT',
                'DISCARD',
                'CLOSE'
            ];
        }
console.log('buttons')
        var buttons = [];
        var buttonCfg;
        Ext.each(this.allowableButtons, function(b){
            if(EHR.ext.Buttons[b]){
                buttonCfg = this.configureButton(b);
                if(buttonCfg)
                    buttons.push(buttonCfg);
            }
        }, this);

        if (debug){
            buttons.push([
                //{text: 'Stores?', name: 'stores', handler: this.store.showStores, scope: this.store},
                {text: 'Errors?', name: 'errors', handler: this.store.showErrors, scope: this.store}
            ])
        }

        var button;
        Ext.each(buttons, function(b){
            if(this.rendered)
                button = this.getFooterToolbar().add(b);
            else
                button = this.addButton(b);

            if(b.ref)
                this[b.ref] = button;
        }, this);
        this.getFooterToolbar().doLayout();
    },
    configureButton: function(b){
        var buttonCfg = EHR.ext.Buttons[b].call(this);
        buttonCfg.scope = this;
        buttonCfg.xtype = 'button';

        //only show button if user can access this QCState
        if(buttonCfg.targetQC){
            if(!this.permissionMap.hasPermission(buttonCfg.targetQC, 'insert', this.store.getQueries())){
                buttonCfg.hidden = true;
            }
        }

        return buttonCfg;
    },
    populateItems: function(){
        var toAdd = [];
        if(this.formHeaders){
            Ext.each(this.formHeaders, function(c){
                this.configureItem(c);
                this.configureHeaderItem(c);
                toAdd.push(c);
            }, this);
        }

        if(this.formSections){
            Ext.each(this.formSections, function(c){
                this.configureItem(c);
                toAdd.push(c);
            }, this);
        }

        if(this.formTabs && this.formTabs.length){
            var tabs = [];
            Ext.each(this.formTabs, function(c){
                this.configureItem(c);
                tabs.push(c);
            }, this);

            toAdd.push({
                xtype: 'tabpanel',
                activeTab: 0,
                ref: 'queryPanel',
                items: tabs,
                cls: 'extContainer'
            });
        }

        this.add(toAdd);
        this.doLayout();
    },
    configureHeaderItem: function(c){
        EHR.utils.rApplyIf(c, {
            bindConfig: {
                autoBindRecord: true,
                showDeleteBtn: false
            }
        });
    },
    configureItem: function(c){
        EHR.utils.rApplyIf(c, {
            collapsible: true,
            border: true,
            //uuid: this.uuid,
            formUUID: this.formUUID,
            formType: this.formType,
            readOnly: this.readOnly,
            bindConfig: {
                disableUnlessBound: false,
                bindOnChange: true
            },
            defaults: {
                bodyBorder: false
                ,border: false
            },
            showStatus: true,
            storeConfig: {
                //xtype: 'ehr-store',
                containerPath: c.containerPath,
                schemaName: c.schemaName,
                queryName: c.queryName,
                viewName: c.viewName,
                columns: c.columns || EHR.ext.FormColumns[c.queryName] || '',
                //autoLoad: true,
                storeId: [c.schemaName,c.queryName,c.viewName,c.storeSuffix].join('||'),
                metadata: c.metadata
            }
        });
        c.importPanel = this;

        if(this.printFormat)
            c.xtype = 'ehr-printtaskpanel';
        if(this.readOnly){
            c.type = 'ehr-qwppanel';
        }

        c.storeConfig.permissionMap = this.permissionMap.getQueryPermissions(c.schemaName, c.queryName);
    },
    applyTemplates: function(templates){
        templates = templates.split(',');
        Ext.each(templates, function(title){
            EHR.utils.loadTemplateByName(title, this.formType);
        }, this);
    },

    render: function(ct, p){
//        this.setLoadMask();
        EHR.ext.ImportPanelBase.superclass.render.apply(this, arguments);
    },

    setLoadMask: function(){
        if(!this.store.isLoading() && this.permissionMap){
            Ext.Msg.hide();
            delete this.loadMsg;
        }
        else {
            if(!this.loadMsg)
                this.loadMsg = Ext.Msg.wait("Loading...");

            this.setLoadMask.defer(500, this);
        }
    },

    addStore: function(c)
    {
        if (c instanceof EHR.ext.AdvancedStore){
            this.store.add(c);
        }
    },

    onRemove: function(o)
    {
        if(o.store)
            this.store.remove(o.store);
    },

    onSubmit: function(o)
    {
        Ext.Msg.wait("Saving Changes...");

        //add a context flag to the request to saveRows
        var extraContext = {
            targetQC : o.targetQC,
            errorThreshold: o.errorThreshold,
            successURL : o.successURL,
            importPathway: 'ehr-importPanel'
        };

        //we delay this event so that any modified fields can fire their blur events and/or commit changes
        this.store.commitChanges.defer(300, this.store, [extraContext, true]);
    },

    onStoreValidation: function(storeCollection, maxSeverity)
    {
        if(debug && maxSeverity)
            console.log('Error level: '+maxSeverity);

        this.getFooterToolbar().items.each(function(item){
            if(item.disableOn){
                if(maxSeverity && EHR.utils.errorSeverity[item.disableOn] <= EHR.utils.errorSeverity[maxSeverity])
                    item.setDisabled(true);
                else
                    item.setDisabled(false);
            }
        }, this);
    },

    afterSubmit: function(o, e)
    {
        console.log('after submit');
        console.log(o);
        console.log(e);
        Ext.Msg.hide();
    },

    discard: function(o)
    {
        Ext.Msg.confirm(
            "Warning",
            "You are about to discard this form.  All data will be deleted.  Are you sure you want to do this?",
            function(v)
            {
                if (v == 'yes')
                {
                    this.store.each(function(s){
                        s.deleteRecords(s.getAllRecords());
                    }, this);
                    window.onbeforeunload = null;
                    window.location = LABKEY.ActionURL.buildURL("ehr", "dataEntry.view");
                }
            },
        this);
    },

    isDirty: function()
    {
        return this.store.isDirty();
    },

    isValid: function()
    {
        return this.store.isValid();
    }
});


EHR.ext.TaskPanel = Ext.extend(EHR.ext.ImportPanelBase, {
    initComponent: function(){

        this.formUUID = this.formUUID || LABKEY.Utils.generateUUID();
        this.formHeaders = this.formHeaders || [];
        this.formHeaders.unshift({
            xtype: 'ehr-importpanelheader',
            formType: this.formType,
            schemaName: 'ehr',
            queryName: 'tasks',
            keyField: 'taskid',
            ref: 'importPanelHeader',
            //uuid: this.uuid,
            formUUID: this.formUUID,
            importPanel: this,
            readOnly: this.readOnly,
            metadata: EHR.ext.getTableMetadata('tasks', ['Task']),
            storeConfig: {
                canSaveInTemplate: false
            }
        });

        EHR.ext.TaskPanel.superclass.initComponent.call(this, arguments);
    },
    configureItem: function(c){
        EHR.ext.TaskPanel.superclass.configureItem.apply(this, arguments);
        c.storeConfig.filterArray = [LABKEY.Filter.create('taskId', this.formUUID, LABKEY.Filter.Types.EQUAL)];
    }
});

EHR.ext.TaskDetailsPanel = Ext.extend(EHR.ext.ImportPanelBase, {
    initComponent: function(){
        this.formUUID = this.formUUID || LABKEY.Utils.generateUUID();
        this.formHeaders = this.formHeaders || [];
        this.formHeaders.unshift({
            xtype: 'ehr-detailsview',
            title: '',
            collapsible: false,
            formType: this.formType,
            schemaName: 'ehr',
            queryName: 'tasks',
            keyField: 'taskid',
            ref: 'importPanelHeader',
            formUUID: this.formUUID,
            importPanel: this,
            readOnly: this.readOnly,
            storeConfig: {
                canSaveInTemplate: false
            }
        });

        EHR.ext.TaskDetailsPanel.superclass.initComponent.call(this, arguments);
    },

    configureItem: function(c){
        if(!c.queryName || !c.schemaName){
            c.hidden = true;
            return;
        }

        EHR.ext.TaskDetailsPanel.superclass.configureItem.apply(this, arguments);
        c.filterArray = [LABKEY.Filter.create('taskId', this.formUUID, LABKEY.Filter.Types.EQUAL)];

        if(c.xtype != 'ehr-detailsview'){
            c.xtype = 'ehr-qwppanel';
            c.autoLoad = true;
            c.collapsed = false;
        }

        c.storeConfig = null;
        c.style = 'padding-bottom:20px;';

    }
});


EHR.ext.RequestPanel = Ext.extend(EHR.ext.ImportPanelBase, {
    initComponent: function(){

        this.formUUID = this.formUUID || LABKEY.Utils.generateUUID();
        this.formHeaders = this.formHeaders || [];

        this.formHeaders.unshift({
            xtype: 'ehr-importpanelheader',
            formType: this.formType,
            schemaName: 'ehr',
            queryName: 'requests',
            keyField: 'requestid',
            ref: 'importPanelHeader',
            formUUID: this.formUUID,
            importPanel: this,
            readOnly: this.readOnly,
            metadata: EHR.ext.getTableMetadata('requests', ['Request']),
            storeConfig: {
                canSaveInTemplate: false
            }
        });

        this.allowableButtons = this.allowableButtons || 'REQUEST,APPROVE,CLOSE';

        EHR.ext.RequestPanel.superclass.initComponent.call(this, arguments);
    },
    configureItem: function(c){
        EHR.ext.RequestPanel.superclass.configureItem.apply(this, arguments);
        c.storeConfig.filterArray = [LABKEY.Filter.create('requestId', this.formUUID, LABKEY.Filter.Types.EQUAL)];
    }
});

EHR.ext.SimpleImportPanel = Ext.extend(EHR.ext.ImportPanelBase, {
    initComponent: function(){
        EHR.ext.SimpleImportPanel.superclass.initComponent.call(this, arguments);
    },
    configureItem: function(c){
        EHR.ext.SimpleImportPanel.superclass.configureItem.apply(this, arguments);
        c.bindConfig.showDeleteBtn = false;
        c.bindConfig.bindOnChange = true;

        if(c.keyField && c.keyValue){
            c.storeConfig.filterArray = [LABKEY.Filter.create(c.keyField, c.keyValue, LABKEY.Filter.Types.EQUAL)];
        }
        else {
            delete c.storeConfig.filterArray;
            c.storeConfig.maxRows = 0;
            c.storeConfig.loadMetadataOnly = true;
        }
    }

});