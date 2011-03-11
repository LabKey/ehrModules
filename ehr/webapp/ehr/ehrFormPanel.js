/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

Ext.namespace('EHR.ext');

LABKEY.requiresScript("/ehr/ehrAPI.js");


EHR.ext.FormPanel = function(config){
    EHR.ext.FormPanel.superclass.constructor.call(this, config);
};

Ext.extend(EHR.ext.FormPanel, Ext.FormPanel,
{
    initComponent: function()
    {
        this.storeConfig = this.storeConfig || {};
        if(!this.storeConfig.filterArray){
            this.storeConfig.maxRows = 0;
            this.on('load', function(){
                delete this.maxRows;
            }, this, {single: true});
        }

        this.store = this.store || new EHR.ext.AdvancedStore(Ext.applyIf(this.storeConfig, {
            //xtype: 'ehr-store',
            containerPath: this.containerPath,
            schemaName: this.schemaName,
            queryName: this.queryName,
            viewName: this.viewName,
            columns: this.columns || EHR.ext.FormColumns[this.queryName] || '',
            storeId: [this.schemaName,this.queryName,this.viewName].join('||'),
            filterArray: this.filterArray || [],
            metadata: this.metadata,
            autoLoad: true
        }));

        this.store.importPanel = this.importPanel || this;

        Ext.apply(this, {
            plugins: ['databind']
            ,trackResetOnLoad: true
            ,bubbleEvents: ['added']
            ,buttonAlign: 'left'
            ,monitorValid: true
        });

        Ext.applyIf(this, {
            autoHeight: true
            ,autoWidth: true
            ,labelWidth: 125
            ,items: {xtype: 'displayfield', value: 'Loading...'}
            //,name: this.queryName
            ,bodyBorder: false
            ,border: false
            ,bodyStyle: 'padding:5px'
            ,style: 'margin-bottom: 15px'
            ,bindConfig: {
                disableUnlessBound: true,
                bindOnChange: false,
                showDeleteBtn: true
            }
            //,deferredRender: true
            ,bbar: this.showStatus ? {
                xtype: 'statusbar',
                defaultText: 'Default text',
                text: 'No Records',
                statusAlign: 'left',
                buttonAlign: 'left',
                iconCls: 'x-status-valid'
            } : null
        });

        //a test for whether the store is loaded
        if(!this.store.fields){
            this.mon(this.store, 'load', this.loadQuery, this, {single: true});
        }
        else {
            this.loadQuery(this.store);
        }

        EHR.ext.FormPanel.superclass.initComponent.call(this);
        this.addEvents('beforesubmit', 'participantchange');

        if(this.showStatus){
            this.on('recordchange', this.onRecordChange, this, {buffer: 100, delay: 100});
            this.mon(this.store, 'validation', this.onStoreValidate, this);
        }

        this.on('recordchange', this.markInvalid, this, {buffer: 100, delay: 100});

//        this.on('clientvalidation', function(){
//            console.log('client validation')
//        }, this);
    },
    loadQuery: function(store)
    {
        this.removeAll();

        var previousField;
        store.fields.each(function(c){
            var config = {
                queryName: this.queryName,
                schemaName: this.schemaName
//                msgTarget: 'side'
            };

            if (!c.hidden && c.shownInInsertView)
            {
                var theField = this.store.getFormEditorConfig(c.name, config);

                if(!c.width){
                    theField.width= 200
                };

                if (c.inputType == 'textarea' && !c.height){
                    Ext.apply(theField, {height: 100});
                }

                if(theField.xtype == 'combo'){
                    theField.lazyInit = false;
                    theField.store.autoLoad = true;
                }

                if(this.readOnly){
                    theField.xtype = 'ehr-displayfield';
                    console.log('is read only: '+this.queryName)
                }

                if(c.combineWithNext)
                    previousField = theField;
                else {
                    if(previousField){
                        previousField.width = (previousField.width-5)/2;
                        theField.width = (theField.width-5)/2;
                        var composite = this.add({
                            layout: 'column',
                            fieldLabel: previousField.fieldLabel,
                            border: false,
                            padding: '0px',
                            defaults: {
                                border: false,
                                bodyBorder: false,
                                padding: '0px 2px 0px 0px'
                            },
                            items: [{
                                items: [previousField]
                            },{
                                items: [theField]
                            }]
                        });
                        var msgTarget = this.add({
                            tag: 'div',
                            border: false
                        });
                        composite.ownerCt = this;
                        previousField.msgTarget = msgTarget.id;
                        theField.msgTarget = msgTarget.id;
                        previousField = null;
                    }
                    else
                        theField = this.add(theField);
                }
            }
        }, this);

        //create a placeholder for error messages
        this.add({
            tag: 'div',
            ref: 'errorEl',
            border: false,
            width: 350,
            style: 'padding:5px;text-align:center;'
        });

        if(this.rendered){
            this.doLayout();
        }

//        if(this.readOnly)
//            this.setReadOnly(true)
    },

    onRecordChange: function(theForm){
        if(!this.boundRecord)
            this.getBottomToolbar().setStatus({text: 'No Records'});
    },

    onStoreValidate: function(store, records){
        if(store.errors.getCount())
            this.getBottomToolbar().setStatus({text: 'ERRORS', iconCls: 'x-status-error'});
        else
            this.getBottomToolbar().setStatus({text: 'Section OK', iconCls: 'x-status-valid'});
console.log('onStore validate')
        this.markInvalid();
    },

    markInvalid : function()
    {
        var formMessages = [];
        var toMarkInvalid = {};
        var errorsInHiddenRecords = false;

        if(!this.boundRecord)
            return;

        this.store.errors.each(function(error){
            var meta = error.record.fields.get(error.field);

            if(meta && meta.hidden)
                return;

            if(error.record===this.boundRecord){
                if ("field" in error){
                    //these are generic form-wide errors
                    if ("_form" == error.field){
                        formMessages.push(error.message);
                    }
                }
                else {
                    formMessages.push(error.message);
                }
            }
            else {
                errorsInHiddenRecords = true;
            }
        }, this);

        if(errorsInHiddenRecords)
            formMessages.push('There are errors in one or more records.  Problem records should be highlighted in red.');

        if (this.errorEl){
            formMessages = Ext.util.Format.htmlEncode(formMessages.join('\n'));
            this.errorEl.update(formMessages);
        }

        this.getForm().items.each(function(f){
            f.isValid(false);
        }, this);

    }
});
Ext.reg('ehr-formpanel', EHR.ext.FormPanel);


