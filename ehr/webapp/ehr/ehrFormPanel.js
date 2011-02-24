/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

Ext.namespace('EHR.ext');

LABKEY.requiresScript("/ehr/ehrAPI.js");



EHR.ext.FormPanel = Ext.extend(Ext.FormPanel,
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

        Ext.apply(this, {
            plugins: ['databind']
            ,trackResetOnLoad: true
            ,bubbleEvents: ['added']
            ,buttonAlign: 'left'
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
            ,monitorValid: false
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
        this.addEvents('beforesubmit', 'participantvalid', 'participantinvalid');

        if(this.showStatus){
            this.on('recordchange', this.onRecordChange, this, {buffer: 100});
            this.mon(this.store, 'validation', this.onStoreValidate, this);
        }

    },
    loadQuery: function(store)
    {
        this.removeAll();

        //create a placeholder for error messages
        this.add({
            tag: 'div',
            ref: 'errorEl',
            border: false,
            style: 'padding:5px;text-align:center;'
        });

        var previousField;
        store.fields.each(function(c){
            var config = {
                queryName: this.queryName,
                schemaName: this.schemaName
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

                if(this.readOnly)
                    theField.xtype = 'ehr-displayfield';

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
                        composite.ownerCt = this;
                        previousField = null;
                    }
                    else
                        theField = this.add(theField);
                }
            }
        }, this);

        if(this.rendered){
            this.doLayout();
        }

//        if(this.readOnly)
//            this.setReadOnly(true)
    },

    onRecordChange: function(theForm){
        if(!this.boundRecord)
            this.getBottomToolbar().setStatus({text: 'No Records'})
    },

    onStoreValidate: function(store, errors){
        if(errors.length)
            this.getBottomToolbar().setStatus({text: 'ERRORS', iconCls: 'x-status-error'});
        else
            this.getBottomToolbar().setStatus({text: 'Section OK', iconCls: 'x-status-valid'});

        this.markInvalid(errors);
    },

    markInvalid : function(errors)
    {
        var formMessages = [];
        var toMarkInvalid = {};

        if (typeof errors == "string")
        {
            formMessages.push(errors);
            errors = null;
        }
        else if (Ext.isArray(errors))
        {
            for (var i = 0, len = errors.length; i < len; i++)
            {
                var fieldError = errors[i];
                var meta = fieldError.record.fields.get(fieldError.field);

                if(meta && meta.hidden)
                    continue;

                if(this.boundRecord && fieldError.record===this.boundRecord){
                    if ("field" in fieldError){
                        if(toMarkInvalid[fieldError.field])
                            toMarkInvalid[fieldError.field] += '<br>'+fieldError.message;
                        else
                            toMarkInvalid[fieldError.field] = fieldError.message;
                    }
                    else if ("_form" == fieldError.field){
                        formMessages.push(fieldError.message);
                    }
                }
//                else {
//                    formMessages.push(fieldError.field+': '+fieldError.message);
//                }
            }
        }

        if (!EHR.UTILITIES.isEmptyObj(toMarkInvalid)){
            this.getForm().markInvalid(toMarkInvalid);
        }

        formMessages = Ext.util.Format.htmlEncode(formMessages.join('\n'));
        if (this.errorEl)
            this.errorEl.update(formMessages);
    }

});
Ext.reg('ehr-formpanel', EHR.ext.FormPanel);


