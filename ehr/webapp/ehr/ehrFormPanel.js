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
            ,monitorValid: false
        });

        Ext.applyIf(this, {
            autoHeight: true
            //,autoWidth: true
            ,labelWidth: 125
            ,defaultFieldWidth: 200
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
            this.mon(this.store, 'validation', this.onStoreValidate, this, {delay: 100});
        }

        this.on('recordchange', this.markInvalid, this, {delay: 100});

    },
    loadQuery: function(store)
    {
        this.removeAll();
        var toAdd = this.configureForm(store, this);
        Ext.each(toAdd, function(item){
            this.add(item);
        }, this);

        //create a placeholder for error messages
        this.add({
            tag: 'div',
            ref: 'errorEl',
            border: false,
            width: 350,
            style: 'padding:5px;text-align:center;'
        });

        if(this.rendered)
            this.doLayout();

    },
    configureForm: function(store, formPanel){
        var toAdd = [];
        var compositeFields = {};
        store.fields.each(function(c){
            var config = {
                queryName: store.queryName,
                schemaName: store.schemaName
            };

            if (!c.hidden && c.shownInInsertView)
            {
                var theField = this.store.getFormEditorConfig(c.name, config);

                if(!c.width){
                    theField.width = formPanel.defaultFieldWidth;
                }

                if (c.inputType == 'textarea' && !c.height){
                    Ext.apply(theField, {height: 100});
                }

                if(theField.xtype == 'combo'){
                    theField.lazyInit = false;
                    theField.store.autoLoad = true;
                }

                if(this.readOnly){
                    theField.xtype = 'ehr-displayfield';
                    console.log('is read only: '+store.queryName)
                }

                if(!c.compositeField)
                    toAdd.push(theField);
                else {
                    theField.fieldLabel = undefined;
                    if(!compositeFields[c.compositeField]){
                        compositeFields[c.compositeField] = {
                            xtype: 'panel',
                            autoHeight: true,
                            layout: 'hbox',
                            border: false,
                            fieldLabel: c.compositeField,
                            defaults: {
                                border: false,
                                margins: '0px 4px 0px 0px '
                            },
                            width: formPanel.defaultFieldWidth,
                            items: [theField]
                        };
                        toAdd.push(compositeFields[c.compositeField]);

                        //create a div to hold error messages
                        compositeFields[c.compositeField].msgTargetId = Ext.id();
                        toAdd.push({
                            tag: 'div',
                            fieldLabel: null,
                            border: false,
                            id: compositeFields[c.compositeField].msgTargetId
                        });
                    }
                    else {
                        compositeFields[c.compositeField].items.push(theField);
                    }
//                    theField.msgTarget = compositeFields[c.compositeField].msgTargetId;
                }
            }
        }, this);

        //distribute width for compositeFields
        for (var i in compositeFields){
            var compositeField = compositeFields[i];
            var toResize = [];
            //this leaves a 2px buffer between each field
            var availableWidth = formPanel.defaultFieldWidth - 4*(compositeFields[i].items.length-1);
            for (var j=0;j<compositeFields[i].items.length;j++){
                var field = compositeFields[i].items[j];
                //if the field isnt using the default width, we assume it was deliberately customized
                if(field.width && field.width!=formPanel.defaultFieldWidth){
                    availableWidth = availableWidth - field.width;
                }
                else {
                    toResize.push(field)
                }
            }

            if(toResize.length){
                var newWidth = availableWidth/toResize.length;
                for (var j=0;j<toResize.length;j++){
                    toResize[j].width = newWidth;
                }
            }
        }

        return toAdd;
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
            f.validate();
        }, this);

    }
});
Ext.reg('ehr-formpanel', EHR.ext.FormPanel);


