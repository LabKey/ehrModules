/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

Ext.namespace('EHR.ext');

LABKEY.requiresScript("/ehr/datetime.js");
LABKEY.requiresScript("/ehr/utilities.js");
LABKEY.requiresScript("/ehr/ehrEditorGridpanel.js");
LABKEY.requiresScript("/ehr/ext.ux.statusbar.js");
LABKEY.requiresScript("/ehr/databind.js");


var debug = 0;

Ext.form.Field.prototype.msgTarget = 'side';



//a css fix for Ext datepicker
Ext.menu.DateMenu.prototype.addClass('extContainer');

EHR.ext.standardMetadata = {
    Id: {lookups: false, parentField: {queryName: 'encounters', field: 'id'}}
    ,Date: {parentField: {queryName: 'encounters', field: 'Date'}}
    //,created: {isHidden: true}
    ,AnimalVisit: {isHidden: true}
    //,modified: {isHidden: true}
    //,SequenceNum: {isHidden: true}
    ,QCState: {parentField: {queryName: 'encounters', field: 'qcstate'}}
    //,QCState: {isHidden: true}
    ,parentId: {parentField: {queryName: 'encounters', field: 'key'}, lookups: false}



    //by table
    ,score: {ext: {allowDecimals: false, minValue: 0, maxValue: 10}}
};


/**
 * The following overwrite allows tooltips on labels within form layouts.
 * The field have to have a property named "fieldLabelTip" in the corresponding
 * config object.
 */
Ext.override(Ext.layout.FormLayout, {
    fieldTpl: (function() {
        var t = new Ext.Template(
            '<div class="x-form-item {itemCls}" tabIndex="-1">',
                '<label for="{id}" style="{labelStyle}" class="x-form-item-label" {labelAttrs}>{label}{labelSeparator}</label>',
                '<div class="x-form-element" id="x-form-el-{id}" style="{elementStyle}">',
                '</div><div class="{clearCls}"></div>',
            '</div>'
        );
        t.disableFormats = true;
        return t.compile();
    })(),
    getTemplateArgs: function(field) {
        var noLabelSep = !field.fieldLabel || field.hideLabel;
        return {
            id            : field.id,
            label         : field.fieldLabel,
            labelAttrs    : field.fieldLabelTip ? 'ext:qtip="' + Ext.util.Format.htmlEncode(field.fieldLabelTip) + '"' : '',
            itemCls       : (field.itemCls || this.container.itemCls || '') + (field.hideLabel ? ' x-hide-label' : ''),
            clearCls      : field.clearCls || 'x-form-clear-left',
            labelStyle    : this.getLabelStyle(field.labelStyle),
            elementStyle  : this.elementStyle || '',
            labelSeparator: noLabelSep ? '' : (Ext.isDefined(field.labelSeparator) ? field.labelSeparator : this.labelSeparator)
        };
    }
});


EHR.ext.ParentFormPanel = Ext.extend(Ext.Panel, {
    initComponent: function(){

        var loadDisabled = undefined!==this.uuid;
        this.uuid = this.uuid || LABKEY.Utils.generateUUID();

        Ext.QuickTips.init();

        var tabItems = this.abstractPanel || [{
            xtype: 'form'
            ,id: 'abstract'
            ,title: 'Animal Info'
            ,border: false
            ,autoHeight: true
            ,collapsible: false
            ,collapsed: false
            ,defaultType: 'displayfield'
            ,bodyStyle: 'padding:5px 5px 5px 5px'
            ,ref: '../abstract'
            ,items: {html: 'No Animal Selected'}
        }]

        if (this.tabs)
            tabItems.push(this.tabs);

        Ext.each(this.tabs, function(c){
            c.parent=this;    
        }, this);

        Ext.applyIf(this, {
            autoHeight: true
            ,bodyBorder: true
            ,border: true
            ,buttonAlign: 'left'
            ,canSubmit: false
            ,frame:true
            ,defaultType: 'textfield'
            ,style: 'border-style:solid;border-width:1px'
            ,monitorValid: false
            ,monitorPoll : 200
            ,deferredRender: false
            ,defaults: {
                msgTarget: 'side'
                ,validationDelay: 100
                ,loadDisabled: loadDisabled 
            }
            ,buttons: [
                {text: 'Save Draft', id: 'saveDraft', ref: '../saveDraftBtn', disabled: true, handler: this.onSubmit, scope: this},
                {text: 'Submit', id: 'submit', ref: '../submitBtn', disabled: true, handler: this.onSubmit, scope: this, formBind: true},
                {text: 'Submit for SNOMED Coding', id: 'snomedReview', ref: '../snomedBtn', disabled: true, handler: this.onSubmit, scope: this, formBind: true},
                {text: 'Discard', id: 'discard', ref: '../discardBtn', handler: this.discard, scope: this}
            ],
            items: [
                {
                xtype: 'statusbar',
                defaultText: 'Default text',
                text: 'Ready',
                statusAlign: 'right',
                iconCls: 'x-status-valid',
                ref: 'statusBar',
                items: [{
                    text: 'Dirty',
                    ref: '../dirtyState'
                },{
                    text: 'Valid',
                    ref: '../validState'
                }
                ]
                //iconCls: 'x-status-error',
//                    sb.setStatus({
//                            iconCls: 'x-status-saved',
//                            text: 'Draft auto-saved at ' + new Date().format('g:i:s A')
//                        })

            }
                ,{
                    xtype: 'ehr-clinheader',
                    scope: this,
                    parent: this,
                    loadDisabled: loadDisabled,
                    ref: 'forms/encounters'
                },
                {
                    xtype: 'tabpanel',
                    activeTab: 0,
                    deferredRender: false,
                    ref: 'queryPanel',
                    items: tabItems,
                    cls: 'extContainer',
                    scope: this
                }
            ],
//            tbar: {
//                xtype: 'statusbar',
//                defaultText: 'Default text',
//                text: 'Ready',
//                iconCls: 'x-status-valid',
//                ref: 'statusBar'
//                //iconCls: 'x-status-error',
////                    sb.setStatus({
////                            iconCls: 'x-status-saved',
////                            text: 'Draft auto-saved at ' + new Date().format('g:i:s A')
////                        })
//
//            },
            store: new EHR.ext.ParentStore()
//            ,listeners: {
//                scope: this,
//                clientvalidation: function(o, valid){
//                    //console.log('clientvalidation: '+o.id+'/'+valid);
//                    //this.bindHandler(valid);
//                }
//                add: function (o){
//                    console.log(o)
//
//                }
//            }
        });

        if (debug){
            this.buttons.push([
                //{text: 'Dirty?', id: 'dirty', handler: this.isDirty, scope: this},
                //{text: 'Valid?', id: 'valid', handler: this.isValid, scope: this},
                {text: 'Stores?', id: 'stores', handler: this.showStores, scope: this}
            ])
        }

        EHR.ext.ParentFormPanel.superclass.initComponent.call(this);

        this.addEvents('beforesubmit');
        this.on('beforesubmit', this.updateQCState);
        
        //monitor dirty state
        window.onbeforeunload = LABKEY.beforeunload(function () {
            if (this.isDirty())
                return this.warningMessage || 'form dirty';
        }, this);

        console.log("Parent UUID: "+this.uuid);
    },
    initEvents : function(){
        EHR.ext.ParentFormPanel.superclass.initEvents.call(this);

        if(this.monitorValid){ // initialize after render
            this.startMonitoring();
        }
    },
    onSubmit: function(o){
        Ext.Msg.wait("Loading...");
        this.statusBar.showBusy();

        this.updateQCState(o.id)

        for (var i in this.forms){
            var f = this.forms[i];
            f.fireEvent('beforesubmit', f);
        }
        this.fireEvent('beforesubmit', this);
        
        this.store.commitChanges();
        Ext.Msg.hide();
    },
    updateQCState: function(val){
        if(!val){
            val = this.qcstate.getValue();
        }

        if (typeof val == 'string'){
            switch (val){
                case 'submit':
                    val = 1;
                    break;
                case 'snomedReview':
                    val = 4;
                    break;
                case 'saveDraft':
                    val = 2;
                    break;
                case 'abnormal':
                    val = 3;
                    break;
            }
        }

        this.qcstate.setValue(val);

        //TODO: possibly include logic to flag children as needing review??

    },
    discard: function(o){
        Ext.Msg.confirm(
                "Warning",
                "You are about to discard this form.  All data will be deleted.  Are you sure you want to do this?",
                function(v){
                    if(v == 'yes'){
                        this.store.deleteAllRecords();
                    }
                },
                this);
    },
    getForms: function(){
        var forms = [];
        for (var i in this.forms){
            forms.push(this.forms[i].getForm());
        }
        return forms;
    },
    getStores: function(){
        var stores = [];
        for (var i in this.forms){
            stores.push(this.forms[i].getStore());
        }
        return stores;
    },
    showStores: function(){
        for (var i in this.forms){
            console.log(this.forms[i].id);
            console.log(this.forms[i].showStore());
        }
    },
    bindHandler : function(){
        var valid = this.isValid();
        var dirty = this.isDirty();

        if(this.fbar){
            var fitems = this.fbar.items.items;
            for(var i = 0, len = fitems.length; i < len; i++){
                var btn = fitems[i];
                if(btn.formBind === true && btn.disabled === valid){
                    btn.setDisabled(!valid);
                }
            }
        }
        this.fireEvent('clientvalidation', this, valid);

        //TODO: possibly auto-save here?
        var s = !dirty || !this.encounters.id.loadedId || !this.encounters.Date.getValue();
        this.saveDraftBtn.setDisabled(s);

        //set status bar
        //this.statusBar.dirtyState.text = dirty;
    },
    startMonitoring : function(){
        if(!this.validTask){
            this.validTask = new Ext.util.TaskRunner();
            this.validTask.start({
                run : this.bindHandler,
                interval : this.monitorPoll || 200,
                scope: this
            });
        }
    },
    stopMonitoring : function(){
        if(this.validTask){
            this.validTask.stopAll();
            this.validTask = null;
        }
    },
    isDirty: function(){
        var dirty = [];
        for (var i in this.forms){
            if(this.forms[i].getForm().isDirty()){
                dirty.push(i);
            }
        }
        if (dirty.length){
            return true;
        }
        return false;
    },
    isValid: function(){
        var invalid = [];
        for (var i in this.forms){
            if(!this.forms[i].getForm().isValid()){
                invalid.push(i);
            }
        }
        if (invalid.length){
            return false;
        }
        return true;
    },
    getUUID: function(){
        return this.uuid;
    }
});


EHR.ext.ClinicalHeader = Ext.extend(Ext.FormPanel, {
    initComponent: function(){
        Ext.apply(this, {
            autoHeight: true
            ,id: 'encounters'
            ,name: 'encounters'
            ,width: 'auto'
            ,bodyBorder: true
            ,border: true
            ,buttons: []
            ,bodyStyle: 'padding:5px 5px 5px 5px'
            ,style: 'margin-bottom: 5px'
            ,useFieldValues: true
            ,plugins: [new EHR.ext.plugins.DataBind()]
            ,defaults: {
                width: 'auto',
                border: true,
                parent: this.parent || this
            }
            ,items: [{
                layout: 'column'
                ,labelAlign: 'top'
                ,items: [
                {
                    columnWidth:'250px',
                    style:'padding-right:4px;padding-top:0px',
                    layout: 'form',
                    defaults: {
                        parent: this.parent || this
                    },                    
                    items: [{
                        xtype:'ehr-animal',
                        //id: 'id',
                        name: 'encounters.id',
                        dataIndex: 'Id',
                        allowBlank: false,
                        ref: '../../../encounters/id',
                        disabled: this.loadDisabled,
                        msgTarget: 'under',
                        listeners: {
                            scope: this,
                            valid: function(c){
                                if(c.getValue() != c.loadedId)
                                    this.fireEvent('animalvalid', c)
                            },
                            invalid: function(c){
                                if(c.loadedId)
                                    this.fireEvent('animalinvalid', c)
                                c.loadId = null;
                            }
                        }
                        },{
                            xtype: (debug ? 'combo': 'hidden')
                            ,fieldLabel: 'QC State'
                            ,ref: '../../../encounters/qcstate'
                            ,disabled: this.loadDisabled
                            ,width: 140
                            ,name: 'encounters.qcstate'
                            ,dataIndex: 'QCState'
                            ,displayField:'Label'
                            ,valueField: 'RowId'
                            ,forceSelection: true
                            ,typeAhead: false
                            ,triggerAction: 'all'
                            ,mode: 'local'
                            ,value: this.qcState || 'In Progress'
                            ,store: EHR.ext.getLookupStore({
                                containerPath: 'WNPRC/EHR/',
                                schemaName: 'study',
                                queryName: 'QCState',
                                sort: 'Label'
                            })
                        }
                    ]
                },{
                    columnWidth:'300px',
                    layout: 'form',
                    defaults: {
                        parent: this.parent || this
                    },
                    items: [{
                        xtype:'xdatetime',
                        name: 'encounters.Date',
                        dataIndex: 'Date',
                        allowBlank: false,
                        ref: '../../../encounters/Date',
                        disabled: this.loadDisabled,
                        fieldLabel: 'Date/Time',
                        dateFormat: 'Y-m-d',
                        timeFormat: 'H:i'
                    }]
                },{
                    //columnWidth:'220px',
                    style:'padding-left:5px;padding-top:0px',
                    layout: 'form',
                    defaults: {
                        parent: this.parent || this
                    },                           
                    items: [{
                        xtype:'ehr-project',
                        name: 'encounters.project',
                        dataIndex: 'Project',
                        msgTarget: 'under',
                        allowBlank: false,
                        ref: '../../../encounters/project',
                        disabled: this.loadDisabled
                    },{
                        xtype: (debug ? 'displayfield': 'hidden'),
                        name: 'encounters.key',
                        dataIndex: 'objectid',
                        value: this.parent.uuid,
                        width: 140,
                        fieldLabel: 'UUID',
                        ref: '../../../encounters/key'
                    }]
                }]
            }]
            ,store: new LABKEY.ext.Store({
                xtype: 'labkey-store',
                containerPath: 'WNPRC/EHR/',
                schemaName: 'study',
                queryName: 'encounters',
                columns: '*',
                filterArray: [LABKEY.Filter.create('objectid', this.parent.uuid, LABKEY.Filter.Types.EQUAL)],
                maxRows: 1,
                storeId: 'study||encounters',
                autoLoad: true,
                parent: this,
                noValidationCheck: true
            })
        });

        EHR.ext.ClinicalHeader.superclass.initComponent.call(this, arguments);

        this.addEvents('animalvalid', 'animalinvalid');

        this.on('animalvalid', this.fetchAbstract);
        this.on('animalinvalid', this.clearAbstract);

        if(this.parent){
            this.parent.addEvents('animalvalid', 'animalinvalid');
            this.parent.relayEvents(this, ['animalvalid', 'animalinvalid']);

            this.parent.qcstate = this.parent.encounters.qcstate;
        }        

        this.parent.store.addStore(this.store);
    },
    fetchAbstract: function(c){
        var id = c.getValue();
        if (!id){
            this.refOwner.canSubmit = false;
            return false;
        }

        var target = this.refOwner.abstract;

        //no need to reload if ID is unchanged
        if (c.loadedId == id){
            return;
        }

        c.loadedId = id;
        target.removeAll();

        LABKEY.Query.selectRows({
            schemaName: 'study',
            queryName: 'animal',
            viewName: 'Clinical Summary',
            containerPath: 'WNPRC/EHR/',
            filterArray: [LABKEY.Filter.create('Id', id, LABKEY.Filter.Types.EQUAL)],
            scope: this,
            successCallback: this.renderAbstract
        });
    },
    renderAbstract: function(data){
        var target = this.refOwner.abstract;
        target.removeAll();

        if(!data.rows.length){
            console.log('no id');
            this.refOwner.encounters.id.markInvalid('Animal Id Not Found');
            this.refOwner.canSubmit = false;
            this.refOwner.stopMonitoring();
            this.refOwner.submitBtn.setDisabled(true);
            this.refOwner.snomedReview.setDisabled(true);
        }
        else {
            this.refOwner.canSubmit = true;
            var row = data.rows[0];
            Ext.each(data.metaData.fields, function(c){
                if(c.isHidden)
                    return false;
                var value = row['_labkeyurl_'+c.name] ? '<a href="'+row['_labkeyurl_'+c.name]+'" target=new>'+row[c.name]+'</a>' : row[c.name];
                target.add({id: c.name, xtype: 'displayfield', fieldLabel: c.caption, value: value, submitValue: false});

                if(c.name == 'Id')
                    c.loadedId = row[c.name];
            }, this);

            this.refOwner.startMonitoring();
        }

        target.doLayout();
        target.expand();
        this.refOwner.queryPanel.setActiveTab('abstract');
    },
    clearAbstract: function(c){
        var target = this.parent.abstract;
        c.loadedId = undefined;

        if(c.getValue()){
            target.removeAll();
            target.add({html: 'Invalid ID'});
            target.doLayout();
            target.expand();
        }
    }
});
Ext.reg('ehr-clinheader', EHR.ext.ClinicalHeader);


EHR.ext.DateTimeField = Ext.extend(Ext.form.Field,
{
    initComponent: function(){
        Ext.apply(this, {
            autoHeight: true
            ,bodyBorder: false
            ,labelAlign: 'top'
            ,border: false
            ,xtype: 'datetimefield'
            ,cls:'extContainer'
            ,fieldLabel: 'Date'
            ,name: 'Date'
        });

        EHR.ext.DateTimeField.superclass.initComponent.call(this, arguments);
    }
});
Ext.reg('ehr-datetime', EHR.ext.DateTimeField);


EHR.ext.AnimalField = Ext.extend(Ext.form.TextField,
{
    initComponent: function(){
        Ext.apply(this, {
            labelAlign: 'top'
            ,fieldLabel: 'Id'
            ,allowBlank: false
            //,bubbleEvents: ['valid', 'invalid', 'added']
            ,validationDelay: 1000
            ,validationEvent: 'blur'
            ,validator: function(val, field)
            {
                if (!val)
                {
                    return 'This field is required';
                }

                var species;
                if (val.match(/(^rh([0-9]{4})$)|(^r([0-9]{5})$)/))
                    species = 'Rhesus';
                else if (val.match(/^cy([0-9]{4})$/))
                    species = 'Cynomolgus';
                else if (val.match(/^ag([0-9]{4})$/))
                    species = 'Vervet';
                else if (val.match(/^cj([0-9]{4})$/))
                    species = 'Marmoset';
                else if (val.match(/^so([0-9]{4})$/))
                    species = 'Cotton-top Tamarin';
                else if (val.match(/^pt([0-9]{4})$/))
                    species = 'Pigtail';

                return species ? true : 'Invalid Id Format';

            }
        });

        EHR.ext.AnimalField.superclass.initComponent.call(this, arguments);

    }
});
Ext.reg('ehr-animal', EHR.ext.AnimalField);


EHR.ext.ProjectField = Ext.extend(LABKEY.ext.ComboBox,
{
    initComponent: function(){

        Ext.apply(this, {
            fieldLabel: 'Project'
            ,width: 140
            ,name: this.name || 'Project'
            ,emptyText:''
            ,displayField:'project'
            ,valueField: 'project'
            ,typeAhead: true
            ,triggerAction: 'all'
            ,forceSelection: true
            ,mode: 'local'
            ,disabled: true
            //NOTE: unless i have this empty store an error is thrown
            ,store: new Ext.data.Store()
        });

        EHR.ext.ProjectField.superclass.initComponent.call(this, arguments);
//
        if (this.parent){
            this.parent.on('animalvalid', function(c){
                //if (c.getValue())
                    this.getProjects(c.getValue());
            }, this)
            this.parent.on('animalinvalid', function(c){
                this.store = new Ext.data.Store();
                this.setDisabled(true);
                this.setValue(null);
                this.emptyText = '';                
            }, this)
        }
    },
    getProjects : function(id){
        this.store = new LABKEY.ext.Store({
                containerPath: 'WNPRC/EHR/',
                schemaName: 'study',
                queryName: 'assignment',
                viewName: 'Active Assignments',
                filterArray: [LABKEY.Filter.create('Id', id, LABKEY.Filter.Types.EQUAL)],
                autoLoad: true
            });
        this.emptyText = 'Select project...';
        this.setDisabled(false);
    }
    //TODO: apply filters on allowable projects

});
Ext.reg('ehr-project', EHR.ext.ProjectField);


EHR.ext.ProtocolField = Ext.extend(LABKEY.ext.ComboBox,
{
    initComponent: function(){
        Ext.apply(this, {
            fieldLabel: 'Protocol'
            ,name: this.name || 'Protocol'
            ,emptyText:'Select protocol...'
            ,displayField:'protocol'
            ,valueField: 'protocol'
            ,forceSelection: true
            ,triggerAction: 'all'
            ,typeAhead: true
            ,mode: 'local'
            ,store: EHR.ext.getLookupStore({                
                containerPath: 'WNPRC/EHR/',
                schemaName: 'lists',
                queryName: 'protocol',
                sort: 'protocol'
            })
        });

        EHR.ext.ProjectField.superclass.initComponent.call(this, arguments);
    }
});
Ext.reg('ehr-protocol', EHR.ext.ProtocolField);


EHR.ext.BooleanCombo = Ext.extend(LABKEY.ext.ComboBox,
{
    initComponent: function(){
        Ext.apply(this, {
            displayField: 'name',
            valueField: 'value',
            store: new Ext.data.ArrayStore({
                fields: ['name', 'value'],
                data: [['N/A',null], ['No',false], ['Yes',true]]
            }),
            forceSelection:true,
            typeAhead: false,
            lazyInit: false,
            mode: 'local',
            triggerAction: 'all'

        });

        EHR.ext.BooleanCombo.superclass.initComponent.call(this, arguments);
    }
});
Ext.reg('ehr-booleancombo', EHR.ext.BooleanCombo);


EHR.ext.FormPanel = Ext.extend(Ext.FormPanel,
{
    initComponent: function(){
        Ext.applyIf(this, {
            autoHeight: true
            ,width: 'auto'
            ,items: {xtype: 'displayfield', value: 'Loading...'}
            ,id: this.queryName
            ,bodyBorder: true
            ,bodyStyle: 'padding:5px 5px 5px 5px'
            //,style: 'margin-bottom: 5px;border-style:solid;border-width:1px'
            ,ref: '../forms/'+this.queryName
            ,plugins: [new EHR.ext.plugins.DataBind()]
            ,deferredRender: false
            ,monitorValid: true
            ,trackResetOnLoad: true
        });

        if(this.isChild){
            var parent = this.ownerCt.ownerCt;
            
            this.store = new LABKEY.ext.Store({
                xtype: 'labkey-store',
                containerPath: 'WNPRC/EHR/',
                schemaName: this.schemaName,
                queryName: this.queryName,
                viewName: this.viewName,
                columns: '*',                
                filterArray: [LABKEY.Filter.create('parentid', parent.uuid, LABKEY.Filter.Types.EQUAL)],
                autoLoad: true,
                storeId: [this.schemaName,this.queryName,this.viewName].join('||'),
                parent: this,
                noValidationCheck: true,
                listeners: {
                    scope: this,
                    load: this.loadQuery
                }
            });

            parent.store.addStore(this.store);

            if(this.ownerCt instanceof Ext.TabPanel){
                this.on('clientvalidation', this.markTabs);
            }
        }

        EHR.ext.FormPanel.superclass.initComponent.call(this);

        this.addEvents('beforesubmit');

    },
    loadQuery: function(store){
        this.removeAll();

        Ext.each(store.fields.items, function(c){
            EHR.UTILITIES.rApply(c, {
                fieldLabel: c.label,
                queryName: this.queryName,
                schemaName: this.schemaName,
                ext: {
                    name: this.queryName+'.'+c.name,
                    fieldLabelTip: 'Type: '+c.type+'<br>'+c.name,
                    dataIndex: c.name
                }
            });

            if(this.metadata && this.metadata[c.name])
                EHR.UTILITIES.rApply(c, this.metadata[c.name]);
            
            if ((!c.isHidden && c.shownInInsertView) || c.parentField){

                if (c.inputType == 'textarea')
                    EHR.UTILITIES.rApply(c, {ext: {height: 100, width: '90%'}});
                else
                    EHR.UTILITIES.rApply(c, {ext: {width: 200}});

                if (c.parentField){
                    EHR.UTILITIES.rApply(c, {ext: {
                        xtype: (debug ? 'displayfield': 'hidden')
                    }});
                }
                var theField = LABKEY.ext.FormHelper.getFieldEditor(c);

                //this is separated so that we dont accidentally replace another onValid handler
                //TODO: should maybe be a plugin?
                if (c.parentField){
                    theField.parent = this.parent[c.parentField.queryName][c.parentField.field];

                    theField.parent.on('change', function(c){
                        this.setValue(c.getValue());
                        this.fireEvent('change', this);
                    }, theField);

                    theField.on('render', function(c){
                        c.setValue(c.parent.getValue());
                        this.fireEvent('change', this);
                    }, theField)
                }

                this.add(theField);
            }
        }, this);

        //TODO: move to plugin as an add listener?
        this.addFieldListeners();
        this.doLayout();
    },
    markTabs : function(o, v){
        if (!o.tabEl)
            return;
        
        var t = Ext.fly(o.tabEl);
        if (!t.isFlyweight)
            return;

        var y = t.child('span.x-tab-strip-inner');
        var z = t.child('a.x-tab-right');

        if(!v){
            z.addClass('x-form-invalid');
            z.addClass('x-form-invalid-tab');
            y.addClass('x-form-invalid-tab');
        }
        else {
            z.removeClass('x-form-invalid');
            z.removeClass('x-form-invalid-tab');
            y.removeClass('x-form-invalid-tab');
        }
    },
    updateInherited : function()
    {
        if (!this.internalUpdate)
        {
            this.cascade(function(f)
            {
                if (f instanceof Ext.form.Field && f.dataIndex)
                {
                    this.internalUpdate = true;
                    if (f.parent)
                        f.setValue(f.parent.getValue());

                    this.internalUpdate = false;
                }
            }, this);
        }
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
           for(var i = 0, len = errors.length; i < len; i++)
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

Ext.override(Ext.Component, {
    initRef: function(r)
    {
        if (this.ref && !this.refOwner)
        {
            var levels = this.ref.split('/'),
                    last = levels.length - 1,
                    i = 0,
                    t = this.ownerCt || this;

            while (t && i < last)
            {
                if (levels[i] == '..')
                    t = t.ownerCt;
                else
                {
//                    if(t instanceof Ext.Component)
//                        console.log('ext container');
                    
                    if (!this.refOwner)
                        this.refOwner = t;

                    if (!t[levels[i]])
                    {
                        t[levels[i]] = {};
                    }

                    t = t[levels[i]];
                }
                ++i;
            }

            if (t)
            {
                t[this.refName = levels[i]] = this;

                /**
                 * @type Ext.Container
                 * @property refOwner
                 * The ancestor Container into which the {@link #ref} reference was inserted if this Component
                 * is a child of a Container, and has been configured with a ref.
                 */
                if (!this.refOwner)
                    this.refOwner = t;
            }
        }
    }
});

EHR.ext.StatusArea = Ext.extend(Ext.Panel, {
    initComponent: function(){
        Ext.apply(this, {
            layout: 'form',
            bodyBorder: true,
            bodyStyle: 'padding:5px 5px 5px 5px',
            items: [{
                xtype: 'displayfield',
                ref: '../../status',
                fieldLabel: 'Status',
                value: 'Unsaved'
            }]
        });
        
        EHR.ext.StatusArea.superclass.initComponent.call(this, arguments);

    },
    setStatus: function(){

    }
});


EHR.ext.GridFormPanel = Ext.extend(Ext.Panel,
{
    initComponent: function(){
        this.store = this.store || new LABKEY.ext.Store({
            xtype: 'labkey-store',
            containerPath: 'WNPRC/EHR/',
            schemaName: this.schemaName,
            queryName: this.queryName,
            viewName: this.viewName,
            columns: '*',
            filterArray: (this.parent ? [LABKEY.Filter.create('parentid', this.parent.uuid, LABKEY.Filter.Types.EQUAL)] : []),
            autoLoad: false,
            storeId: [this.schemaName,this.queryName,this.viewName].join('||'),
            parent: this,
            noValidationCheck: true
        });

        Ext.apply(this, {
            autoHeight: true
            ,width: 'auto'
            ,id: this.queryName
            //,bodyStyle: 'padding:5px 5px 5px 5px'
            //,style: 'margin-bottom: 5px;border-style:solid;border-width:1px'
            ,ref: '../grids/'+this.queryName
            //,plugins: [new EHR.ext.plugins.DataBind()]
            ,deferredRender: false
            ,items: [{
//                xtype: 'ehr-formpanel',
//                name: this.queryName,
//                ref: 'theForm',
//                metadata: this.metadata,
//                containerPath: 'WNPRC/EHR/',
//                schemaName: this.schemaName,
//                queryName: this.queryName,
//                viewName: this.viewName,
//                parent: this.parent || this.refOwner || this,
//                items: {xtype: 'displayfield', value: 'Loading...'}
//            },{
                //title: 'Records',
                xtype: 'ehr-editorgrid',
                store: this.store,
                metadata: this.metadata,
                ref: 'theGrid',
                parent: this.parent || this.refOwner || this,
                sm: new Ext.grid.RowSelectionModel({
                    listeners: {
                        scope: this
//                        rowselect: function(sm, row, rec) {
//                            this.theForm.getForm().loadRecord(rec);
//                        }
                    }
                })
            }]

        });

        if(this.parent){
            this.parent.store.addStore(this.store);

            if(this.ownerCt instanceof Ext.TabPanel){
                this.on('clientvalidation', this.markTabs);
            }
        }

        EHR.ext.GridFormPanel.superclass.initComponent.call(this);

        //this.store.on('load', this.theForm.loadQuery, this.theForm);
        this.store.load();

        this.addEvents('beforesubmit');
    }
});

Ext.reg('ehr-gridformpanel', EHR.ext.GridFormPanel);