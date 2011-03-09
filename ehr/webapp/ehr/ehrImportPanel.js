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
        handler: this.discard,
        scope: this
        }
    },
    CLOSE: function(){return {
        text: 'Close',
        name: 'close',
        ref: 'closeBtn',
        handler: function(){
            window.location = LABKEY.ActionURL.buildURL('ehr','dataEntry.view')
        },
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
        disabled: true,
        ref: 'approveBtn',
        handler: this.onSubmit,
        disableOn: 'ERROR',
        scope: this
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
        this.items = this.items || [];

        Ext.QuickTips.init();

        if(this.formHeaders){
            Ext.each(this.formHeaders, function(c){
                this.configureItem(c);
                this.configureHeaderItem(c);
                this.items.push(c);
            }, this);
        }

        if(this.formSections){
            Ext.each(this.formSections, function(c){
                this.configureItem(c);
                this.items.push(c);
            }, this);
        }

        if(this.formTabs && this.formTabs.length){
            var tabs = [];
            Ext.each(this.formTabs, function(c){
                this.configureItem(c);
                tabs.push(c);
            }, this);

            this.items.push({
                xtype: 'tabpanel',
                activeTab: 0,
                ref: 'queryPanel',
                items: tabs,
                cls: 'extContainer'
            });
        }

        Ext.applyIf(this, {
            autoHeight: true
            //,forceLayout: true
            ,defaults: {
                bodyBorder: false
                ,border: false
            }
            ,store: new EHR.ext.StoreCollection({
                monitorValid: true
            })
            ,fbar: []
        });

        EHR.ext.ImportPanelBase.superclass.initComponent.call(this);

        this.addEvents('participantchange', 'participantloaded');
        this.mon(this.store, 'validation', this.onStoreValidation, this);

//        this.on('participantloaded', function(field, id, row){
//            console.log('Participant loaded: '+id);
//        }, this);

        this.mon(this.store, 'commitcomplete', this.afterSubmit, this);
        this.mon(this.store, 'commitexception', this.afterSubmit, this);

        this.initGlobalQCstate();

        EHR.utils.getTablePermissions({
            success: this.calculatePermissions,
            failure: EHR.utils.onError,
            scope: this
        });

        //monitor dirty state
        window.onbeforeunload = LABKEY.beforeunload(function (){
            if (this.isDirty())
                return this.warningMessage || 'form dirty';
        }, this);

        //add stores to StoreCollection
        Ext.StoreMgr.each(this.addStore, this);

        if(this.initialTemplates)
            this.applyTemplates(this.initialTemplates);
    },

    calculatePermissions: function(qcMap, schemaMap){
//console.log(arguments)
        var tables = [];
        var perms = {
            editor: true,
            dataAdmin: true,
            requestor: true,
            submittor: true
        };

        this.store.each(function(t){
            tables.push(t.queryName);
            if(schemaMap.schemas.study[t.queryName]){
                console.log(schemaMap.schemas.study[t.queryName])
            }

        }, this);

        this.populateButtons();
    },

    populateButtons: function(){
        //TODO: apply logic to see what buttons appear

        if(this.allowableButtons){
            if(!Ext.isArray(this.allowableButtons))
                this.allowableButtons = this.allowableButtons.split(',');
        }
        else {
            this.allowableButtons = [
                'SAVEDRAFT',
                'REVIEW',
                'SUBMIT',
                //'PRINT',
                'DISCARD',
                'CLOSE'
            ];
        }

        var buttonCfg;
        var buttons = [];
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

        if(buttonCfg.targetQC){
            //TODO: only show if user can access this QCState
        }

        return buttonCfg;
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
            importPanel: this,
            showStatus: true,
            storeConfig: {
                //xtype: 'ehr-store',
                containerPath: c.containerPath,
                schemaName: c.schemaName,
                queryName: c.queryName,
                viewName: c.viewName,
                columns: c.columns || EHR.ext.FormColumns[c.queryName] || '',
                //autoLoad: true,
                storeId: [c.schemaName,c.queryName,c.viewName].join('||'),
                metadata: c.metadata
            }
        });

        if(this.printFormat)
            c.xtype = 'ehr-printtaskpanel';
    },

    applyTemplates: function(templates){
        templates = templates.split(',');
        Ext.each(templates, function(title){
            EHR.utils.loadTemplateByName(title, this.formType);
        }, this);
    },
    initGlobalQCstate: function(){
        //designed to be overriden by subclasses
    },

    render: function(ct, p){
        this.setLoadMask();
        EHR.ext.ImportPanelBase.superclass.render.apply(this, arguments);
    },

    setLoadMask: function(){
        if(!this.store.isLoading()){
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
        if (o instanceof Ext.form.FormPanel){
            if(o.store){
                this.store.remove(o.store);
            }
        }
    },

    onSubmit: function(o)
    {
        Ext.Msg.wait("Saving Changes...");

        var val;
        switch (o.targetQC)
        {
            //TODO: values will be distinct per server...
            case 'submit':
                val = 1;
                break;
            case 'review':
                val = 4;
                break;
            case 'saveDraft':
                val = 2;
                break;
            case 'abnormal':
                val = 3;
                break;
        }

        if(this.qcstate){
            var oldVal = this.qcstate.getValue();
            if(val != oldVal){
                this.qcstate.setValue(val);
                //allow store inheritance to propagate changes to child stores
                this.qcstate.fireEvent('change', this.qcstate, val, oldVal);
            }
        }
        this.store.commitChanges();
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
    initGlobalQCstate: function(){
        this.qcstate = this.importPanelHeader.qcstate;
    },
    configureItem: function(c){
        EHR.ext.TaskPanel.superclass.configureItem.apply(this, arguments);
        c.storeConfig.filterArray = [LABKEY.Filter.create('taskId', this.formUUID, LABKEY.Filter.Types.EQUAL)];
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

        this.allowableButtons = 'REQUEST,APPROVE,CLOSE';

        EHR.ext.RequestPanel.superclass.initComponent.call(this, arguments);
    },
    initGlobalQCstate: function(){
        this.qcstate = this.importPanelHeader.qcstate;
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

        if(this.keyField){
            c.storeConfig.filterArray = [LABKEY.Filter.create(this.keyField, this.keyValue, LABKEY.Filter.Types.EQUAL)];
        }
        else {
            delete c.storeConfig.filterArray;
            c.storeConfig.loadMetadataOnly = true;
        }
    }

});