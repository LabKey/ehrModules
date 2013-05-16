/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
(function(){
	Ext4.define('EHR.RowEditorPlugin', {
		extend: 'Ext.AbstractPlugin',

        editorWindow: null,

		constructor: function(config){
            Ext4.apply(this, config);
		},

		init: function(cmp){
			this.cmp = cmp;
            this.initListeners(cmp);
		},

		destroy: function(){
            this.editorWindow.destroy();
            delete this.editorWindow();
		},

        getFieldConfig: function(field){
            var cfg = {};

            if (field.userEditable && !field.hidden)
            {
                if (this.fieldConfigs && this.fieldConfigs != null && this.fieldConfigs[field.dataIndex])
                {
                    // If the user has specified a custom config for this column then push that instead of the default.
                    Ext4.apply(cfg, this.fieldConfigs[field.dataIndex]);

                    cfg.name = field.dataIndex; // Set the name to the dataIndex so we properly set the value when we
                                                // Load a record.

                    return cfg;
                } else {
                    cfg = {
                        name: field.dataIndex,
                        fieldLabel: field.fieldLabel
                    };


                    switch (field.extType){
                        case "INT":
                            cfg.xtype = 'numberfield';
                            cfg.allowDecimals = false;
                            cfg.hideTrigger = true;
                            cfg.keyNavEnabled = false;
                            cfg.spinUpEnabled = false;
                            cfg.spinDownEnabled = false;
                            break;
                        case "FLOAT":
                            cfg.xtype = 'numberfield';
                            cfg.allowDecimals = true;
                            cfg.hideTrigger = true;
                            cfg.keyNavEnabled = false;
                            cfg.spinUpEnabled = false;
                            cfg.spinDownEnabled = false;
                            break;
                        case "DATE":
                            cfg.xtype = 'datefield';
                            cfg.format = field.extFormat;
                            break;
                        default:
                            cfg.xtype = 'textfield';
                    }

                    return cfg;
                }
            }

            return null;
        },

        getPanel: function(fields){
            var panelItems = [], i, cfg;

            for (i = 0; i < fields.length; i++)
            {
                cfg = this.getFieldConfig(fields[i]);

                if(cfg){
                    panelItems.push(cfg);
                }
            }

            this.formPanel = Ext4.create('Ext.form.Panel', {
                width: '100%',
                items: panelItems,
                trackResetOnLoad: true
            });

            return this.formPanel;
        },

        createWindow: function(fields){
            this.editorWindow = Ext4.create('Ext.window.Window', {
                items: this.getPanel(fields),
                closeAction: 'hide',
                buttons: [{text: 'save', handler: this.saveCurrentRecord, scope:this}, {text: 'cancel', handler: this.onCancel, scope: this}],
                listeners: {
                    scope: this,
                    afterrender: function(editorWin){
                        this.keyNav = new Ext4.util.KeyNav({
                            target: editorWin.getId(),
                            scope: this,
                            up: function(){
                                this.saveCurrentRecord();
                                this.loadPreviousRecord();
                            },
                            down: function (){
                                this.saveCurrentRecord();
                                this.loadNextRecord();
                            }
//                           enter: this.saveCurrentRecord
                        });
                    }
                }
            });
        },

        onCellClick: function(view, cell, colIdx, record){
            if(!this.editorWindow){
                this.createWindow(this.cmp.getStore().getFields().items);
            }

            this.loadRecord(record);

            this.editorWindow.show();
        },

        loadRecord: function(record){
            this.formPanel.loadRecord(record);
        },

        initListeners: function(grid){
            grid.mon(grid.view, {
                scope: this,
                'celldblclick': this.onCellClick
            });
        },

        loadPreviousRecord: function(){
            var currentRec = this.cmp.getSelectionModel().getSelection()[0], prevRec;
            if(currentRec){
                prevRec = this.cmp.getStore().getAt(currentRec.index - 1);
                if(prevRec){
                    this.loadRecord(prevRec);
                    this.cmp.getSelectionModel().select([prevRec]);
                }
            }
        },

        loadNextRecord: function(){
            var currentRec = this.cmp.getSelectionModel().getSelection()[0], nextRec;
            if (currentRec)
            {
                nextRec = this.cmp.getStore().getAt(currentRec.index + 1);
                if (nextRec)
                {
                    this.loadRecord(nextRec);
                    this.cmp.getSelectionModel().select([nextRec]);
                }
            }
        },

        saveCurrentRecord: function(){
            var currentRec = this.cmp.getSelectionModel().getSelection()[0], form = this.formPanel.getForm(), fieldName,
                    formValues = form.getValues();

            if(form.isDirty() && form.isValid()){
                currentRec.beginEdit();
                for(fieldName in formValues){
                    if(formValues.hasOwnProperty(fieldName)){
                        currentRec.set(fieldName, formValues[fieldName]);
                    }
                }
                currentRec.endEdit();
            }
        },

        onCancel: function(){
            this.editorWindow.close();
        },

        commitChanges: function(){
            this.cmp.getStore().commitChanges();
        }
	});

})();