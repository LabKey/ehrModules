/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


EHR.ext.Buttons = {
    SAVEDRAFT: function(){return {
        text: 'Save Draft',
        name: 'saveDraft',
        //targetQC: 'In Progress',
        requiredQC: 'In Progress',
        errorThreshold: 'WARN',
        //successURL: LABKEY.ActionURL.getParameter('srcURL') || LABKEY.ActionURL.buildURL("ehr", "dataEntry.view"),
        disabled: true,
        ref: 'saveDraftBtn',
        handler: this.onSubmit,
        disableOn: 'ERROR',
        scope: this
        }
    },
    SUBMITADMIN: function(){return {
        text: 'Submit Final',
        name: 'submit',
        requiredQC: 'Completed',
        targetQC: 'Completed',
        requiresAdmin: true,
        errorThreshold: 'INFO',
        successURL: LABKEY.ActionURL.getParameter('srcURL') || LABKEY.ActionURL.buildURL("ehr", "dataEntry.view"),
        disabled: true,
        ref: 'submitBtn',
        handler: function(o){
            Ext.Msg.confirm('Finalize Form', 'You are about to finalize this form.  Do you want to do this?', function(v){
                if(v=='yes')
                    this.onSubmit(o);
            }, this);
        },
        disableOn: 'WARN',
        scope: this
        }
    },
    SUBMIT: function(){return {
        text: 'Submit Final',
        name: 'submit',
        requiredQC: 'Completed',
        targetQC: 'Completed',
        errorThreshold: 'INFO',
        successURL: LABKEY.ActionURL.getParameter('srcURL') || LABKEY.ActionURL.buildURL("ehr", "dataEntry.view"),
        disabled: true,
        ref: 'submitBtn',
        handler: function(o){
            Ext.Msg.confirm('Finalize Form', 'You are about to finalize this form.  Do you want to do this?', function(v){
                if(v=='yes')
                    this.onSubmit(o);
            }, this);
        },
        disableOn: 'WARN',
        scope: this
        }
    },
    SUBMITDEATH: function(){return {
        text: 'Submit Final',
        name: 'submit',
        requiredQC: 'Completed',
        targetQC: 'Completed',
        errorThreshold: 'INFO',
        successURL: LABKEY.ActionURL.getParameter('srcURL') || LABKEY.ActionURL.buildURL("ehr", "dataEntry.view"),
        disabled: true,
        ref: 'submitBtn',
        handler: function(o){
            Ext.Msg.confirm('Finalize Death', 'You are about to finalize this death record on this animal.  This will end all treatments, problems, assignments and housing. BE ABSOLUTELY SURE YOU WANT TO DO THIS BEFORE CLICKING SUBMIT.', function(v){
                if(v=='yes')
                    this.onSubmit(o);
            }, this);
        },
        disableOn: 'WARN',
        scope: this
        }
    },
    FORCESUBMIT: function(){return {
        text: 'Force Submit',
        name: 'submit',
        requiredQC: 'Completed',
        targetQC: 'Completed',
        requiresAdmin: true,
        errorThreshold: 'ERROR',
        successURL: LABKEY.ActionURL.getParameter('srcURL') || LABKEY.ActionURL.buildURL("ehr", "dataEntry.view"),
        disabled: true,
        ref: 'foreceSubmitBtn',
        handler: function(o){
            Ext.Msg.confirm('Force Finalize Form', 'You are about to finalize this form.  Do you want to do this?', function(v){
                if(v=='yes')
                    this.onSubmit(o);
            }, this);
        },
        disableOn: 'SEVERE',
        scope: this
        }
    },
    FINALIZEDEATH: function(){return {
        text: 'Finalize Death',
        name: 'finalizeDeath',
        requiredQC: 'Completed',
        //targetQC: 'Completed',
        errorThreshold: 'INFO',
        //successURL: LABKEY.ActionURL.getParameter('srcURL') || LABKEY.ActionURL.buildURL("ehr", "dataEntry.view"),
        disabled: true,
        ref: 'finalizeDeathBtn',
        handler: function(o){
            Ext.Msg.confirm('Finalize Death', 'You are about to finalize this death record on this animal.  This will end all treatments, problems, assignments and housing. BE ABSOLUTELY SURE YOU WANT TO DO THIS BEFORE CLICKING SUBMIT.', function(v){
                if(v=='yes'){
                    var store = Ext.StoreMgr.get('study||Necropsies||||');
                    var record = store.getAt(0);

                    if(!record ||
                        !record.get('Id') ||
                        !record.get('causeofdeath') ||
                        !record.get('timeofdeath')
                    ){
                        alert('Must provide Id, type of death, and time of death');
                        return;
                    }

                    var Id = record.get('Id');
                    var obj = {
                        Id: Id,
                        date: record.get('timeofdeath'),
                        cause: record.get('causeofdeath'),
                        manner: record.get('mannerofdeath'),
                        necropsy: record.get('caseno'),
                        parentid: record.get('objectid')
                    };

                    var queryName;
                    if(Id.match(/^pd/))
                        queryName = 'Prenatal Deaths';
                    else
                        queryName = 'Deaths';

                    //we look for a death record
                    LABKEY.Query.selectRows({
                        schemaName: 'study',
                        queryName: queryName,
                        scope: this,
                        filterArray: [
                            LABKEY.Filter.create('Id', Id, LABKEY.Filter.Types.EQUAL)
                        ],
                        success: function(data){
                            if(data && data.rows && data.rows.length){
                                obj.lsid = data.rows[0].lsid;
                                LABKEY.Query.updateRows({
                                    schemaName: 'study',
                                    queryName: queryName,
                                    rows: [obj],
                                    scope: this,
                                    success: function(data){
                                        alert('Success updating '+queryName+' from necropsy for '+Id)
                                    },
                                    failure: EHR.onFailure
                                });
                            }
                            //otherwise we create a new record
                            else {
                                LABKEY.Query.insertRows({
                                    schemaName: 'study',
                                    queryName: queryName,
                                    scope: this,
                                    rows: [obj],
                                    success: function(data){
                                        alert('Success inserting into '+queryName+' from necropsy for '+Id)
                                    },
                                    failure: EHR.onFailure
                                });
                            }
                        },
                        failure: EHR.onFailure
                    });
                }
            }, this);
        },
        disableOn: 'ERROR',
        scope: this
        }
    },
    BASICSUBMIT: function(){return {
        text: 'Submit',
        name: 'basicsubmit',
        requiredQC: 'Completed',
        errorThreshold: 'INFO',
        successURL: LABKEY.ActionURL.getParameter('srcURL') || LABKEY.ActionURL.buildURL("ehr", "dataEntry.view"),
        disabled: true,
        ref: 'submitBtn',
        handler: function(o){
//            Ext.Msg.confirm('Finalize Form', 'You are about to finalize this form.  Do you want to do this?', function(v){
//                if(v=='yes')
                    this.onSubmit(o);
//            }, this);
        },
        disableOn: 'WARN',
        scope: this
        }
    },
    SUBMITANDNEXT: function(){return {
        text: 'Submit And Next',
        name: 'submit',
        requiredQC: 'Completed',
        targetQC: 'Completed',
        errorThreshold: 'INFO',
        successURL: LABKEY.ActionURL.buildURL("ehr", LABKEY.ActionURL.getAction(), null, {
            schemaName: LABKEY.ActionURL.getParameter('schemaName'),
            queryName: LABKEY.ActionURL.getParameter('queryName'),
            formtype: LABKEY.ActionURL.getParameter('formtype')
        }),
        disabled: true,
        ref: 'submitNextBtn',
        handler: this.onSubmit,
        disableOn: 'WARN',
        scope: this
        }
    },
    REVIEW: function(){return {
        text: 'Submit for Review',
        name: 'review',
        requiredQC: 'Review Required',
        targetQC: 'Review Required',
        errorThreshold: 'WARN',
        successURL: LABKEY.ActionURL.getParameter('srcURL') || LABKEY.ActionURL.buildURL("ehr", "dataEntry.view"),
        disabled: true,
        ref: 'reviewBtn',
        disableOn: 'ERROR',
        handler: function(o){
            var theWindow = new Ext.Window({
                closeAction:'hide',
                title: 'Submit For Review',
                width: 350,
                scope: this,
                buttons: [{
                    text:'Submit',
                    disabled:false,
                    ref: '../submit',
                    scope: this,
                    handler: function(btn){
                        var assignedTo = btn.ownerCt.ownerCt.theForm.assignedTo.getValue();
                        if(!assignedTo){
                            alert('Must assign this task to someone');
                            return;
                        }
                        var taskStore = Ext.StoreMgr.get('ehr||tasks||||');
                        taskStore.getAt(0).set('assignedto', assignedTo);
                        theWindow.hide();
                        this.onSubmit(o);
                    }
                },{
                    text: 'Cancel',
                    scope: this,
                    handler: function(){
                        theWindow.hide();
                    }
                }],
                items: [{
                    xtype: 'form',
                    ref: 'theForm',
                    bodyStyle: 'padding:5px;',
                    items: [{
                        xtype: 'combo',
                        fieldLabel: 'Assign To',
                        width: 200,
                        triggerAction: 'all',
                        mode: 'local',
                        store: new LABKEY.ext.Store({
                            xtype: 'labkey-store',
                            schemaName: 'core',
                            queryName: 'PrincipalsWithoutAdmin',
                            columns: 'userid,name',
                            sort: 'type,name',
                            autoLoad: true,
                            listeners: {
                                //scope: this,
                                load: function(s){
                                    var recIdx = s.find('name', (o.ownerCt.ownerCt.reviewRequiredRecipient || 'dataentry (LDAP)'));
                                    if(recIdx!=-1){
                                        theWindow.theForm.assignedTo.setValue(s.getAt(recIdx).get('UserId'));
                                    }
                                }
                            }
                        }),
                        displayField: 'name',
                        valueField: 'UserId',
                        ref: 'assignedTo'
                    }]
                }]
            });
            theWindow.show();
        },
        scope: this
        }
    },
    SCHEDULE: function(){return {
        text: 'Schedule',
        name: 'review',
        requiredQC: 'Scheduled',
        targetQC: 'Scheduled',
        errorThreshold: 'WARN',
        successURL: LABKEY.ActionURL.getParameter('srcURL') || LABKEY.ActionURL.buildURL("ehr", "dataEntry.view"),
        disabled: true,
        ref: 'scheduledBtn',
        disableOn: 'ERROR',
        handler: this.onSubmit,
        scope: this
        }
    },
    VALIDATE: function(){return {
        text: 'Validate',
        name: 'validate',
        //targetQC: 'In Progress',
        //errorThreshold: 'WARN',
        //successURL: LABKEY.ActionURL.buildURL("ehr", "dataEntry.view"),
        disabled: false,
        ref: 'validateBtn',
        handler: this.validateAll,
        //disableOn: 'ERROR',
        scope: this
        }
    },
    DISCARD: function(){return {
        text: 'Discard',
        name: 'discard',
        ref: 'discardBtn',
        targetQC: 'Delete Requested',
        requiredQC: 'Delete Requested',
        successURL: LABKEY.ActionURL.getParameter('srcURL') || LABKEY.ActionURL.buildURL("ehr", "dataEntry.view"),
        handler: this.requestDelete,
        //handler: this.onSubmit,
        scope: this
        }
    },
    DELETEBTN: function(){return {
        text: 'Delete',
        name: 'delete',
        ref: 'deleteBtn',
        targetQC: 'Delete Requested',
        requiredQC: 'Delete Requested',
        successURL: LABKEY.ActionURL.getParameter('srcURL') || LABKEY.ActionURL.buildURL("ehr", "dataEntry.view"),
        handler: this.requestDelete,
        //handler: this.onSubmit,
        scope: this
        }
    },
    CLOSE: function(){return {
        text: 'Save & Close',
        name: 'closeBtn',
        //targetQC: 'In Progress',
        requiredQC: 'In Progress',
        errorThreshold: 'WARN',
        successURL: LABKEY.ActionURL.getParameter('srcURL') || LABKEY.ActionURL.buildURL("ehr", "dataEntry.view"),
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
            this.mon(this.store, 'commitcomplete', function(){
                window.open(LABKEY.ActionURL.buildURL('ehr','printTask.view', null, {_print: 1, formtype:this.formType, taskid: this.formUUID}))
            }, this, {single: true});

            this.onSubmit({
                text: 'Print',
                name: 'print'
            });
        },
        requiredQC: 'In Progress',
        errorThreshold: 'WARN',
        disabled: true,
        disableOn: 'ERROR',
        scope: this
        }
    },
    REQUEST: function(){return {
        text: 'Request',
        name: 'request',
        targetQC: 'Request: Pending',
        requiredQC: 'Request: Pending',
        errorThreshold: 'WARN',
        successURL: LABKEY.ActionURL.getParameter('srcURL') || LABKEY.ActionURL.buildURL("ehr", "requestServices.view"),
        disabled: true,
        ref: 'requestBtn',
        handler: this.onSubmit,
        disableOn: 'WARN',
        scope: this
        }
    },
    APPROVE: function(){return {
        text: 'Approve Request',
        name: 'approve',
        targetQC: 'Request: Approved',
        requiredQC: 'Request: Approved',
        errorThreshold: 'WARN',
        successURL: LABKEY.ActionURL.getParameter('srcURL') || LABKEY.ActionURL.buildURL("ehr", "dataEntry.view"),
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
        targetQC: 'Completed',
        requiredQC: 'Completed',
        errorThreshold: 'WARN',
        handler: function(){
            window.onbeforeunload = Ext.emptyFn;
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
                monitorValid: true,
                allowOthersToEditRecords: this.allowOthersToEditRecords
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

        EHR.utils.getDatasetPermissions({
            //queries: this.getQueries(),
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

        if(this.initialTemplates && this.initialTemplates.length)
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
                    });
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
                'VALIDATE',
                //'PRINT',
                'SAVEDRAFT',
                //'SCHEDULE',
                'REVIEW',
                'SUBMIT',
                'FORCESUBMIT',
                'DISCARD',
                'CLOSE'
            ];
        }

        var buttons = [];
        var buttonCfg;
        Ext.each(this.allowableButtons, function(b){
            var buttonCfg;
            if(Ext.isString(b) && EHR.ext.Buttons[b])
                buttonCfg = EHR.ext.Buttons[b].call(this);
            else
                buttonCfg = b;

            buttonCfg = this.configureButton(buttonCfg);

            if(buttonCfg)
                buttons.push(buttonCfg);

        }, this);

        if (debug){
            buttons.push([
                {text: 'Stores?', name: 'stores', handler: this.store.showStores, scope: this.store},
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
    configureButton: function(buttonCfg){
        buttonCfg.scope = this;
        buttonCfg.xtype = 'button';

        //only show button if user can access this QCState
        if(buttonCfg.requiredQC){
            if(!this.permissionMap.hasPermission(buttonCfg.requiredQC, 'insert', this.store.getQueries())){
                buttonCfg.hidden = true;
            }
        }

        if(buttonCfg.requiresAdmin){
            if(!this.permissionMap.hasPermission('Completed', 'admin', this.store.getQueries())){
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
                createRecordOnLoad: true,
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
                metadata: c.metadata,
                ignoreFilter: 1
            }
        });
        c.importPanel = this;

        if(c.xtype == 'ehr-formpanel'){
            c.bindConfig.autoBindRecord = true;
        }

        if(this.printFormat)
            c.xtype = 'ehr-printtaskpanel';
        if(this.readOnly){
            c.type = 'ehr-qwppanel';
        }
    },
    applyTemplates: function(templates){
//        templates = templates.split(',');
        Ext.each(templates, function(obj){
            EHR.utils.loadTemplateByName(obj.title, obj.storeId);
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

    requestDelete: function(o)
    {
        Ext.Msg.confirm(
            "Warning",
            "You are about to delete this form and all its data.  Are you sure you want to do this?",
            function(v)
            {
                if (v == 'yes')
                {
                    Ext.Msg.wait("Discarding Form...");

                    var extraContext = {
                        errorThreshold: o.errorThreshold,
                        successURL : o.successURL,
                        importPathway: 'ehr-importPanel'
                    };

                    this.store.requestDeleteAllRecords(extraContext);
                }
            }, this);
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

    validateAll: function(){
        this.store.each(function(s){
            s.validateRecords(s, null, true, {operation: 'edit'});
        }, this);
    },

    afterSubmit: function(o, e)
    {
        //console.log('after submit');
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
                    Ext.Msg.wait("Deleting Records...");

                    //add a context flag to the request to saveRows
                    var extraContext = {
                        targetQC : o.targetQC,
                        errorThreshold: o.errorThreshold,
                        successURL : LABKEY.ActionURL.getParameter('srcURL') || LABKEY.ActionURL.buildURL("ehr", "dataEntry.view"),
                        importPathway: 'ehr-importPanel'
                    };

                    //we delay this event so that any modified fields can fire their blur events and/or commit changes
                    this.store.deleteAllRecords.defer(300, this.store, [extraContext]);
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
            metadata: EHR.ext.getTableMetadata('tasks', this.taskHeaderMetaSources || ['Task']),
            storeConfig: {
                canSaveInTemplate: false
            }
        });

        EHR.ext.TaskPanel.superclass.initComponent.call(this, arguments);
    },
    configureItem: function(c){
        EHR.ext.TaskPanel.superclass.configureItem.apply(this, arguments);
        c.storeConfig.filterArray = [
            LABKEY.Filter.create('taskId', this.formUUID, LABKEY.Filter.Types.EQUAL),
            LABKEY.Filter.create('qcstate/label', 'Delete Requested', LABKEY.Filter.Types.NEQ)
        ];
        c.storeConfig.sort = 'id/curlocation/location,id';
    }
});

EHR.ext.TaskDetailsPanel = Ext.extend(EHR.ext.ImportPanelBase, {
    initComponent: function(){
        this.formUUID = this.formUUID || LABKEY.Utils.generateUUID();
        this.formHeaders = this.formHeaders || [];
        this.formHeaders.unshift({
            xtype: 'ehr-qwppanel',
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
            c.autoLoadQuery = true;
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

        this.allowableButtons = this.allowableButtons || 'VALIDATE,REQUEST';

        EHR.ext.RequestPanel.superclass.initComponent.call(this, arguments);
    },
    configureItem: function(c){
        EHR.ext.RequestPanel.superclass.configureItem.apply(this, arguments);
        c.storeConfig.filterArray = [
            LABKEY.Filter.create('requestId', this.formUUID, LABKEY.Filter.Types.EQUAL),
            LABKEY.Filter.create('qcstate/label', 'Delete Requested', LABKEY.Filter.Types.NEQ)
        ];
    }
});

EHR.ext.RequestDetailsPanel = Ext.extend(EHR.ext.ImportPanelBase, {
    initComponent: function(){
        this.formUUID = this.formUUID || LABKEY.Utils.generateUUID();
        this.formHeaders = this.formHeaders || [];
        this.formHeaders.unshift({
            xtype: 'ehr-qwppanel',
            title: '',
            collapsible: false,
            formType: this.formType,
            schemaName: 'ehr',
            queryName: 'requests',
            keyField: 'requestid',
            ref: 'importPanelHeader',
            formUUID: this.formUUID,
            importPanel: this,
            readOnly: true,
            storeConfig: {
                canSaveInTemplate: false
            }
        });

        EHR.ext.RequestDetailsPanel .superclass.initComponent.call(this, arguments);
    },

    configureItem: function(c){
        if(!c.queryName || !c.schemaName){
            c.hidden = true;
            return;
        }

        EHR.ext.RequestDetailsPanel .superclass.configureItem.apply(this, arguments);
        c.filterArray = [LABKEY.Filter.create('requestId', this.formUUID, LABKEY.Filter.Types.EQUAL)];

        if(c.xtype != 'ehr-detailsview'){
            c.xtype = 'ehr-qwppanel';
            c.autoLoadQuery = true;
            c.collapsed = false;
        }

        c.storeConfig = null;
        c.style = 'padding-bottom:20px;';

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
        c.bindConfig.autoBindRecord = true;

        if(c.keyField && c.keyValue){
            c.storeConfig.filterArray = [
                LABKEY.Filter.create(c.keyField, c.keyValue, LABKEY.Filter.Types.EQUAL),
                LABKEY.Filter.create('qcstate/label', 'Delete Requested', LABKEY.Filter.Types.NEQ)
            ];
        }
        else {
            delete c.storeConfig.filterArray;
            c.storeConfig.maxRows = 0;
            c.storeConfig.loadMetadataOnly = true;
        }
    }

});

