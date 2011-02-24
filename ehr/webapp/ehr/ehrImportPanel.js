/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


EHR.ext.Buttons = {
    SAVEDRAFT: function(){return {text: 'Save Draft', name: 'saveDraft', ref: 'saveDraftBtn', disabled: false, handler: this.onSubmit, scope: this}},
    SUBMIT: function(){return {text: 'Submit Final', name: 'submit', ref: 'submitBtn', disabled: false, handler: this.onSubmit, scope: this}},
    REVIEW: function(){return {text: 'Submit for Review', name: 'review', ref: 'reviewBtn', disabled: false, handler: this.onSubmit, scope: this}},
    DISCARD: function(){return {text: 'Discard', name: 'discard', ref: 'discardBtn', handler: this.discard, scope: this}},
    CLOSE: function(){return {text: 'Close', name: 'close', ref: 'closeBtn', handler: function(){window.location = LABKEY.ActionURL.buildURL('ehr','dataEntry.view')}, scope: this}},
    PRINT: function(){return {text: 'Print', name: 'print', ref: 'printBtn', handler: function(){window.open(LABKEY.ActionURL.buildURL('ehr','printTask.view', null, {_print: 1, formtype:this.formType, taskid: this.formUUID}))}, scope: this}}
    //REQUEST:
    //APPROVE:
}



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
            ,defaults: {
                bodyBorder: false
                ,border: false
            }
            ,store: new EHR.ext.StoreCollection({
                monitorValid: true
            })
        });

        EHR.ext.ImportPanelBase.superclass.initComponent.call(this);

        this.addEvents('participantvalid', 'participantinvalid', 'participantloaded');
        this.mon(this.store, 'validation', this.onStoreValidation, this);

//        this.on('participantloaded', function(field, id, row){
//            console.log('Participant loaded: '+id);
//        }, this);

        this.mon(this.store, 'commitcomplete', this.afterSubmit, this);
        this.mon(this.store, 'commitexception', this.afterSubmit, this);

        this.initGlobalQCstate();
        this.populateButtons();

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

    populateButtons: function(){
        LABKEY.Security.getSecurableResources({
            includeEffectivePermissions: true,
            successCallback: function(data){
//                console.log('securable resources:');
//                console.log(data);
            }
        });

        //TODO: apply logic to see what buttons appear
        var buttons = [];
        if(this.allowableButtons){
            if(!Ext.isArray(this.allowableButtons))
                this.allowableButtons = this.allowableButtons.split(',');

            var buttonCfg;
            Ext.each(this.allowableButtons, function(b){
                if(EHR.ext.Buttons[b]){
                    buttonCfg = EHR.ext.Buttons[b].call(this);
                    buttonCfg.scope = this;
                    buttonCfg.disabled = true;
                    buttons.push(buttonCfg);
                }
            }, this);
        }
        else {
            buttons = [
                EHR.ext.Buttons.SAVEDRAFT.call(this),
                EHR.ext.Buttons.REVIEW.call(this),
                EHR.ext.Buttons.SUBMIT.call(this),
                EHR.ext.Buttons.CLOSE.call(this),
                EHR.ext.Buttons.DISCARD.call(this),
                EHR.ext.Buttons.CLOSE.call(this)
            ];
        }

        if (debug){
            buttons.push([
                {text: 'Stores?', name: 'stores', handler: this.store.showStores, scope: this.store},
                {text: 'Errors?', name: 'errors', handler: this.store.showErrors, scope: this.store}
            ])
        }

        var button;
        Ext.each(buttons, function(b){
            button = this.addButton(b);
            if(b.ref)
                this[b.ref] = button;
        }, this);
    },
    configureHeaderItem: function(c){
        EHR.UTILITIES.rApplyIf(c, {
            bindConfig: {
                autoBindRecord: true,
                showDeleteBtn: false
            }
        });
    },
    configureItem: function(c){
        EHR.UTILITIES.rApplyIf(c, {
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
            parentPanel: this,
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
            EHR.UTILITIES.loadTemplateByName(title, this.formType);
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
        switch (o.name)
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
    onStoreValidation: function(storeCollection, errors, maxSeverity)
    {
        //can only submit final if no errors and no warnings
        if(this.submitBtn)
            this.submitBtn.setDisabled(errors.length);

        //can submit draft or review there's no errors
        if(this.saveDraftBtn)
            this.saveDraftBtn.setDisabled(maxSeverity == 'ERROR');
        if(this.reviewBtn)
            this.reviewBtn.setDisabled(maxSeverity == 'ERROR');
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
        this.items = this.items || [];
        this.items.push({
            xtype: 'ehr-taskheader',
            formType: this.formType,
            ref: 'taskHeader',
            //uuid: this.uuid,
            formUUID: this.formUUID,
            parentPanel: this,
            readOnly: this.readOnly
        });

        EHR.ext.TaskPanel.superclass.initComponent.call(this, arguments);
    },
    initGlobalQCstate: function(){
        this.qcstate = this.taskHeader.qcstate;
    },
    configureItem: function(c){
        EHR.ext.TaskPanel.superclass.configureItem.apply(this, arguments);
        c.storeConfig.filterArray = [LABKEY.Filter.create('taskId', this.formUUID, LABKEY.Filter.Types.EQUAL)];
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