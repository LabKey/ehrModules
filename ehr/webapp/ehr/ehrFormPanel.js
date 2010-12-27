/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

Ext.namespace('EHR.ext');

LABKEY.requiresScript("/ehr/utilities.js");

LABKEY.requiresScript("/ehr/ext.ux.statusbar.js");
LABKEY.requiresScript("/ehr/databind.js");
LABKEY.requiresScript("/ehr/ehrStore.js");
LABKEY.requiresScript("/ehr/ehrStoreCollection.js");
LABKEY.requiresScript("/ehr/ehrEditorGridpanel.js");

LABKEY.requiresScript("/ehr/ExtComponents.js");
LABKEY.requiresScript("/ehr/ExtContainers.js");

var debug = 1;

Ext.Ajax.timeout = 3000000; //in milliseconds

EHR.ext.standardEncounterMetadata = {
    fieldDefaults: {
        lazyCreateStore: false
    },
    Id: {
        allowBlank: false,
        lookups: false,
        colWidth: 70,
        parentConfig: {
            identifier: {queryName: 'encounters', schemaName: 'study'},
            dataIndex: 'Id'
        }
    }
    ,date: {
        allowBlank: false,
        parentConfig: {
            identifier: {queryName: 'encounters', schemaName: 'study'},
            dataIndex: 'date'
        },
        setInitialValue: function(v, rec){
            return v ? v : new Date()
        }
    }
    //used in treatments, possibly more
//    ,Date: {
//        allowBlank: false,
//        parentConfig: {
//            identifier: {queryName: 'encounters', schemaName: 'study'},
//            dataIndex: 'date'
//        },
//        setInitialValue: function(v, rec){
//            return v ? v : new Date()
//        }
//    }
    ,userid: {
        formEditorConfig:{readOnly: true}
        ,defaultValue: LABKEY.Security.currentUser.displayName
    }    
    ,created: {hidden: true}
    //,Created: {hidden: true}
    //,CreatedBy: {hidden: true}
    ,AnimalVisit: {hidden: true}
    ,Modified: {hidden: true}
    ,ModifiedBy: {hidden: true, showInGrid: false}
    ,SequenceNum: {hidden: true}
    ,Description: {hidden: true}
    ,Dataset: {hidden: true} 
    ,project: {
        parentConfig: {
            identifier: {queryName: 'encounters', schemaName: 'study'},
            dataIndex: 'project'
        }
    }
    ,category: {hidden: true}
    ,QCState: {
        allowBlank: false,
        defaultValue: 'In Progress',
        parentConfig: {
            identifier: {queryName: 'encounters', schemaName: 'study'},
            dataIndex: 'QCState'
        }
    }
    ,parentId: {
        allowBlank: false,
        parentConfig: {
            identifier: {queryName: 'encounters', schemaName: 'study'},
            dataIndex: 'objectid'
        },
        lookups: false
    }
    ,taskId: {
        lookups: false
        ,hidden: true
    }
    ,AgeAtTime: {hidden: true}
    ,Notes: {hidden: true}
    ,DateOnly: {hidden: true}
    ,Survivorship: {hidden: true}
//    ,Remark: {
//        formEditorConfig: {xtype: 'ehr-remark'}
//    }
};

EHR.ext.standardTaskMetadata = {
    fieldDefaults: {
        lazyCreateStore: false
    }
    ,Id: {
        lookups: false,
        allowBlank: false,
        colWidth: 70,
        formEditorConfig: {xtype: 'ehr-participant'}}
    ,date: {
        format: 'Y-m-d H:s',
        allowBlank: false,
        formEditorConfig:{readOnly: true},
        setInitialValue: function(v, rec){
            return v ? v : new Date()
        }
    }
    //used in treatments, possibly more
    ,Date: {
        allowBlank: false,
        formEditorConfig:{readOnly: true},
        setInitialValue: function(v, rec){
            return v ? v : new Date()
        }
    }
    ,userid: {
        formEditorConfig:{readOnly: true}
        ,defaultValue: LABKEY.Security.currentUser.displayName
    }
    ,created: {
        hidden: true
    }
    ,createdby: {
        hidden: true,
        defaultValue: LABKEY.Security.currentUser.displayName
    }
    ,AnimalVisit: {hidden: true}
    ,modified: {hidden: true}
    ,ModifiedBy: {hidden: true}
    //,SequenceNum: {hidden: true}
    ,QCState: {
        allowBlank: false,
        shownInGrid: false,
        defaultValue: 'In Progress',
        parentConfig: {
            identifier: {queryName: 'tasks', schemaName: 'ehr'},
            dataIndex: 'QCState'
        }
    }
    ,taskid: {
        parentConfig: {
            identifier:  {queryName: 'tasks', schemaName: 'ehr'}
            ,dataIndex: 'taskid'
        }
        ,lookups: false
    }
    ,TaskId: {
        parentConfig: {
            identifier:  {queryName: 'tasks', schemaName: 'ehr'}
            ,dataIndex: 'taskid'
        }
        ,lookups: false
    }
    ,objectid: {hidden: true}
    ,ts: {hidden: true}


    //by table

    //obs
    ,RoomAtTime: {hidden: true}
    ,CageAtTime: {hidden: true}
    ,feces: {shownInGrid: false}
    ,menses: {shownInGrid: false}
    ,other: {shownInGrid: false}
    ,tlocation: {shownInGrid: false}
    ,breeding: {shownInGrid: false}
    ,remark: {shownInGrid: false}
    ,behavior: {shownInGrid: false}
    ,otherbehavior: {shownInGrid: false}

    //treatment:
    ,CurrentRoom: {lookups: false}
    ,CurrentCage: {lookups: false}
};

EHR.ext.shareCols = 'lsid,id,date,project,account,remark,objectid,qcstate,parentid,taskid';

EHR.ext.FormColumns = {
    encounters: 'userid,type,'+EHR.ext.shareCols,
    Alopecia: 'score,cause,upperlegs,lowerarms,shoulders,rump,head,upperarms,lowerlegs,hips,dorsum,other,'+EHR.ext.shareCols,
    treatments: 'treatment,qualifier,'+EHR.ext.shareCols,
    'Body Condition': 'bcs,weightstatus,'+EHR.ext.shareCols,
    'Clinical Remarks': EHR.ext.shareCols,
    'Dental Status': 'priority,extractions,gingivitis,tartar,'+EHR.ext.shareCols,
    Vitals: 'temp,heartrate,resprate,'+EHR.ext.shareCols,
    tasks: 'taskId,created,createdby',
    'Irregular Observations': EHR.ext.shareCols+',feces,menses,other,tlocation,behavior,otherbehavior,other,breeding',
    'Treatment Orders': 'date,enddate,frequency,code,volume,vunits,conc,cunits,amount,units,route,'+EHR.ext.shareCols 
};


EHR.ext.Buttons = {
    SAVE: function(){return {text: 'Save Draft', id: 'saveDraft', ref: '../saveDraftBtn', disabled: false, handler: this.onSubmit, scope: this}},
    SUBMIT: function(){return {text: 'Submit Final', id: 'submit', ref: '../submitBtn', disabled: false, handler: this.onSubmit, scope: this}},
    REVIEW: function(){return {text: 'Submit for Review', id: 'review', ref: '../reviewBtn', disabled: false, handler: this.onSubmit, scope: this}},
    DISCARD: function(){return {text: 'Discard', id: 'discard', ref: '../discardBtn', handler: this.discard, scope: this}}
}




//config:
// formXtype    
// formSections
//formHeader

EHR.ext.ParentFormPanel = Ext.extend(Ext.Panel, {
    initComponent: function()
    {
        this.uuid = this.uuid || LABKEY.Utils.generateUUID();
this.uuid = '2740da71-a932-102d-be95-73892a760bbf',

        Ext.QuickTips.init();

        Ext.each(this.formSections, function(c)
        {
            Ext.apply(c, {
                parentPanel: this,
                parentFieldName: this.parentFieldName,
                collapsible: true,
                border: true
            });
        }, this);

        Ext.applyIf(this, {
            autoHeight: true
            ,submitHolds: new Ext.util.MixedCollection()
            ,defaults: {
                bodyBorder: false
                ,border: false
                ,disableUnlessBound: false
            }
            ,buttons: [
                EHR.ext.Buttons.SAVE.call(this),
                EHR.ext.Buttons.REVIEW.call(this),
                EHR.ext.Buttons.SUBMIT.call(this),
                EHR.ext.Buttons.DISCARD.call(this)
            ]
            ,items: [
                {
                    xtype: this.formHeader || 'ehr-clinheader',
                    formType: this.formType,
                    ref: 'formHeader',
                    uuid: this.uuid,
                    parentPanel: this
                },
                {
                    xtype: this.formXtype || 'panel',
                    activeTab: 0,
                    ref: 'queryPanel',
                    items: this.formSections,
                    cls: 'extContainer'
                }
            ],
            store: new EHR.ext.StoreCollection(),
            bbar: {
                xtype: 'statusbar',
                defaultText: 'Default text',
                text: 'Ready',
                statusAlign: 'right',
                iconCls: 'x-status-valid'
            }
        });

        if (debug)
        {
            this.buttons.push([
                {text: 'Stores?', id: 'stores', handler: this.store.showStores, scope: this.store},
                {text: 'Valid?', id: 'valid', handler: this.store.isValid, scope: this.store}
            ])
        }

        EHR.ext.ParentFormPanel.superclass.initComponent.call(this);

        this.addEvents('participantvalid', 'participantinvalid');

        this.submitHolds.on('add', this.submitHoldChange, this);
        this.submitHolds.on('remove', this.submitHoldChange, this);

//        this.on('beforesubmit', function(c){
//            console.log('parent panel before submit');
//        }, this);

        this.store.on('invalid', function (s, recs){
            this.canSubmit(false);    
        }, this);

        this.store.on('valid', function (s, recs){
            this.canSubmit(true);
        }, this);

        this.on('participantinvalid', function(f){
            this.submitHolds.add({invalidAnimal: true});
        }, this);

        this.store.on('commitcomplete', this.afterSubmit, this);
        this.store.on('commitexception', this.afterSubmit, this);

        this.store.on('beforecommit', this.onBeforeCommit, this);

        if(this.qcstate){
            this.mon(this.qcstate, 'change', this.updateStatusBar, this);
        }

        //monitor dirty state
        window.onbeforeunload = LABKEY.beforeunload(function ()
        {
            if (this.isDirty())
                return this.warningMessage || 'form dirty';
        }, this);

        console.log("Parent UUID: " + this.uuid);

        this.cascade(this.onAddStore, this);
    },

    onAddStore: function(c)
    {
        if (c instanceof Ext.form.FormPanel && c.store){
            this.store.add(c.store);
        }
    },

    onBeforeCommit: function(r, s)
    {
        console.log('parent formPanel beforecommit');
        console.log(r);
        console.log(s);
    },

    onRemove: function(o){
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
        switch (o.id)
        {
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

        //TODO: set QCState on records

        this.store.commitChanges();
    },

    canSubmit: function(val)
    {
        this.getBottomToolbar().setStatus({text: 'Form Is Valid?: '+val});
        this.submitBtn.setDisabled(!val);
    },

    onParticipantChange: function(val){
        this.saveDraftBtn.setDisabled(!val);
        this.reviewBtn.setDisabled(!val);
    },

    submitHoldChange: function(){

        console.log('submit holds changed');
    },

    afterSubmit: function(o, e)
    {
        console.log('commit complete');
        console.log(o);
        console.log(e);
        Ext.Msg.hide();
    },

    updateStatusBar: function(cmp, val)
    {
        var text = cmp.getRawValue();
        this.getBottomToolbar().setStatus({text: 'Form Status: '+text});
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
                        this.store.each(function(s){s.deleteAllRecords()}, this);
                        //window.location = '';
                    }
                },
                this);
    },

    isDirty: function()
    {
        var dirty = false;
        this.store.each(function(s){
            if(s.getModifiedRecords().length) dirty=true;
        }, this);
        return dirty;
    },
    isValid: function()
    {
        return this.store.isValid();
    },
    getUUID: function()
    {
        return this.uuid;
    }
});




EHR.ext.FormPanel = Ext.extend(Ext.FormPanel,
{
    initComponent: function()
    {

        Ext.applyIf(this, {
            autoHeight: true
            ,autoWidth: true
            ,items: {xtype: 'displayfield', value: 'Loading...'}
            ,id: this.queryName
            ,bodyBorder: false
            ,border: false
            ,bodyStyle: 'padding:5px'
            ,style: 'margin-bottom: 15px'
            ,plugins: [new EHR.ext.plugins.DataBind()]
            ,disableUnlessBound: false
            ,bindOnChange: true
            ,deferredRender: true
            ,monitorValid: false
            ,trackResetOnLoad: true
            ,bubbleEvents: ['added']
            ,tbar: new Ext.Toolbar({buttonAlign: 'left', hidden: true})
        });

        var storeConfig = {
            //xtype: 'ehr-store',
            containerPath: this.containerPath,
            schemaName: this.schemaName,
            queryName: this.queryName,
            viewName: this.viewName,
            columns: this.columns || EHR.ext.FormColumns[this.queryName] || '',
            autoLoad: true,
            metadata: this.metadata,
            storeId: [this.schemaName,this.queryName,this.viewName].join('||'),
            parentPanel: this,
            noValidationCheck: true,
            listeners: {
                scope: this,
                load: this.loadQuery
            }
        };

        if (this.parentPanel)
        {
            storeConfig.filterArray = [LABKEY.Filter.create((this.parentFieldName ? this.parentFieldName : 'parentid'), this.parentPanel.uuid, LABKEY.Filter.Types.EQUAL)];
        }

        if (!this.store)
        {
            this.store = new EHR.ext.AdvancedStore(storeConfig);
        }
        else
        {
            Ext.applyIf(this.store, storeConfig);
            this.store.on('load', this.loadQuery, this);
        }

        EHR.ext.FormPanel.superclass.initComponent.call(this);

        this.addEvents('beforesubmit');

    },
    loadQuery: function(store)
    {
        this.removeListener('load', this.loadQuery, this);
        this.removeAll();

        store.fields.each(function(c)
        {
            EHR.UTILITIES.rApply(c, {
                fieldLabel: c.label,
                queryName: this.queryName,
                schemaName: this.schemaName,
                formEditorConfig: {
                    name: c.name,
                    fieldLabelTip: 'Type: ' + c.type.type,
                    dataIndex: c.name,
                    width: 200
                }
            });

            if (!c.hidden && c.shownInInsertView && !c.parentConfig)
            {

                if (c.inputType == 'textarea')
                    EHR.UTILITIES.rApply(c, {formEditorConfig: {height: 100, width: '80%'}});

                //var theField = LABKEY.ext.FormHelper.getFieldEditor(c);
                var theField = this.store.getFormEditorConfig(c);

                if(theField.xtype == 'combo'){
                    theField.lazyInit = false;
                    theField.store.autoLoad = true;
                }

                if(this.readOnly)
                    theField.disabled = true;

                theField = this.add(theField);
            }
        }, this);

        this.doLayout();
    },

    //TODO: rethink how this should work
    markInvalid : function(errors)
    {
        var formMessage;

        if (typeof errors == "string")
        {
            formMessage = errors;
            errors = null;
        }
        else if (Ext.isArray(errors))
        {
            for (var i = 0, len = errors.length; i < len; i++)
            {
                var fieldError = errors[i];
                if (!("id" in fieldError) || "_form" == fieldError.id)
                    formMessage = fieldError.msg;
            }
        }
        else if (typeof errors == "object" && "_form" in errors)
        {
            formMessage = errors._form;
        }

        if (errors)
        {
            this.getForm().markInvalid(errors);
        }

        if (formMessage)
        {
            if (this.errorEl)
                Ext.get(this.errorEl).update(Ext.util.Format.htmlEncode(formMessage));
            else
                Ext.Msg.alert("Error", formMessage);
        }
    }

});
Ext.reg('ehr-formpanel', EHR.ext.FormPanel);


EHR.ext.GridFormPanel = Ext.extend(Ext.Panel,
{
    initComponent: function()
    {
        this.store = this.store || new EHR.ext.AdvancedStore({
            //xtype: 'ehr-store',
            containerPath: this.containerPath,
            schemaName: this.schemaName,
            queryName: this.queryName,
            viewName: this.viewName,
            columns: this.columns || EHR.ext.FormColumns[this.queryName] || '',
            filterArray: (this.parentPanel ? [LABKEY.Filter.create((this.parentFieldName ? this.parentFieldName : 'parentid'), this.parentPanel.uuid, LABKEY.Filter.Types.EQUAL)] : []),
            autoLoad: true,
            storeId: [this.schemaName,this.queryName,this.viewName].join('||'),
            parentPanel: this,
            noValidationCheck: true,
            metadata: this.metadata
        });

        var buttons = this.tbarBtns || ['add', 'delete', 'next', 'previous'];
        var tbar = [];
        Ext.each(buttons, function(b, idx){
            tbar.push(EHR.ext.gridFormPanelBtns[b].call(this));
            if(idx != buttons.length)
                tbar.push('-')
        }, this);

        Ext.applyIf(this, {
            autoHeight: true
            ,autoWidth: true
            ,layout: 'column'
            ,defaults: {
                border: false
            }
            ,id: this.queryName
            ,style: 'margin-bottom: 15px'
            ,tbar: tbar
            ,items: [{
                width: 330
                ,items: [
                    {
                        xtype: 'ehr-formpanel',
                        width: 330,
                        name: this.queryName,
                        schemaName: this.schemaName,
                        queryName: this.queryName,
                        viewName: this.viewName,
                        disableUnlessBound: true,
                        bindOnChange: false,
                        showDeleteBtn: false,
                        ref: '../theForm',
                        metadata: this.metadata,
                        store: this.store,
                        parentPanel: this.parentPanel || this,
                        parentFieldName: this.parentFieldName,
                        border: true,
                        items: {xtype: 'displayfield', value: 'Loading...'}
                    }]
            },{
                items: [{
                    xtype: 'ehr-editorgrid',
                    title: 'Records',
                    editable: false,
                    width: this.gridWidth || 700,
                    maxHeight: 500,
                    autoHeight: true,
                    store: this.store,
                    style: 'margin: 5px;vertical-align: top;',
                    metadata: this.metadata,
                    ref: '../theGrid',
                    parentPanel: this.parentPanel || this,
                    tbar: {},
                    sm: new Ext.grid.RowSelectionModel({
                        singleSelect: true,
                        listeners: {
                            scope: this,
                            rowselect: function(sm, row, rec)
                            {
                                this.theForm.bindRecord(rec);
                            },
                            selectionchange: function(sm)
                            {
                                var rec = sm.getSelected();
                                if (rec != this.theForm.boundRecord)
                                {
                                    this.theForm.focusFirstField();
                                }
                            }
                        }
                    })
                }]
            }]
        });

        EHR.ext.GridFormPanel.superclass.initComponent.call(this);

        this.addEvents('beforesubmit');
        this.doLayout();
    }

});

Ext.reg('ehr-gridformpanel', EHR.ext.GridFormPanel);


EHR.ext.gridFormPanelBtns = {
    add: function(){return {
        text: 'Add Record',
        xtype: 'button',
        tooltip: 'Click to add a blank record',
        id: 'add-record-button',
        handler: function ()
        {
            var store = this.theGrid.store;
            if (store.recordType)
            {
                store.addRecord(undefined, 0);
                this.theGrid.getSelectionModel().selectFirstRow();
                this.theForm.focusFirstField();
            }
        },
        scope: this
    }},
    'delete': function(){return {
        text: 'Delete Selected',
        xtype: 'button',
        tooltip: 'Click to delete selected row(s)',
        id: 'delete-records-button',
        handler: function()
        {
            this.theGrid.stopEditing();
            var s = this.theGrid.getSelectionModel().getSelections();
            for (var i = 0, r; r = s[i]; i++){
                if (r.store.boundPanel)
                    r.store.boundPanel.unbindRecord();

                r.store.remove(r);
            }
        },
        scope: this
    }},
    next: function(){return {
        text: 'Select Next',
        xtype: 'button',
        tooltip: 'Click to move one record forward',
        id: 'select-next-button',
        handler: function()
        {
            this.theGrid.getSelectionModel().selectNext();
            this.theForm.focusFirstField();
        },
        scope: this
    }},
    previous: function(){return {
        text: 'Select Previous',
        xtype: 'button',
        tooltip: 'Click to move one record backward',
        id: 'select-previous-button',
        handler: function()
        {
            this.theGrid.getSelectionModel().selectPrevious();
            this.theForm.focusFirstField();
        },
        scope: this
    }},
    addbatch: function(){return {
        text: 'Add Batch',
        xtype: 'button',
        scope: this,
        tooltip: 'Click to add a group of animals',
        id: 'add-batch-button',
        handler: function()
        {
            this.animalSelectorWin = new Ext.Window({
                closeAction:'hide',
                width: 350,
                items: [{
                    xtype: 'ehr-animalselector',
                    ref: 'animalselector',
                    targetStore: this.store,
                    buttons: [{
                        text:'Submit',
                        disabled:false,
                        ref: '../submit',
                        scope: this,
                        handler: function(s){
                            this.animalSelectorWin.animalselector.getAnimals();
                            this.animalSelectorWin.hide();
                        }
                    },{
                        text: 'Close',
                        scope: this,
                        handler: function(){
                            this.animalSelectorWin.hide();
                        }
                    }],
                    title: ''
                }]
            });

            this.animalSelectorWin.show();
        }
    }}
};