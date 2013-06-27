/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.plugin.RowEditor', {
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

        if (this.keyNav){
            this.keyNav.destroy();
        }

        this.callParent(arguments);
    },

    getFieldConfig: function(field){
        var cfg = EHR.DataEntryUtils.getFormEditorConfig(field);
        LABKEY.ExtAdapter.apply(cfg, {
            width: 400
        });

        if (cfg.height && cfg.height > 100){
            cfg.height = 100;
        }

        return cfg;
    },

    getFormPanelCfg: function(){
        var fields = this.cmp.getStore().getFields();

        var panelItems = [], i, cfg;
        Ext4.Array.forEach(this.cmp.formConfig.fieldConfigs, function(field){
            var meta = fields.get(field.name);
            cfg = this.getFieldConfig(meta);

            if(cfg){
                panelItems.push(cfg);
            }
        }, this);

        return {
            xtype: 'ehr-formpanel',
            itemId: 'formPanel',
            width: '100%',
            bodyStyle: 'padding: 5px;',
            items: panelItems,
            store: this.cmp.getStore(),
            trackResetOnLoad: true
        };
    },

    getDetailsPanelCfg: function(){
        return {
            xtype: 'ehr-animaldetailspanel',
            itemId: 'detailsPanel'
        }
    },

    createWindow: function(){
        this.editorWindow = Ext4.create('Ext.window.Window', {
            modal: true,
            width: 600,
            items: [{
                //layout: 'vbox',
                items: [this.getDetailsPanelCfg(), this.getFormPanelCfg()],
                buttons: [{
                    text: 'Save and Close',
                    handler: function(){
                        this.saveCurrentRecord(true);
                    },
                    scope: this
                },{
                    text: 'Previous',
                    handler: function(){
                        this.saveCurrentRecord();
                        this.loadPreviousRecord();
                    },
                    scope: this
                },{
                    text: 'Next',
                    handler: function(){
                        this.saveCurrentRecord();
                        this.loadNextRecord();
                    },
                    scope: this
                },{
                    text: 'Cancel',
                    handler: this.onCancel,
                    scope: this
                }]
            }],
            closeAction: 'hide',
            listeners: {
                scope: this,
                afterrender: function(editorWin){
                    this.keyNav = new Ext4.util.KeyNav({
                        target: editorWin.getId(),
                        scope: this,
                        up: function(e){
                            if (e.ctrlKey){
                                this.saveCurrentRecord();
                                this.loadPreviousRecord();
                            }
                        },
                        down: function (e){
                            if (e.ctrlKey){
                                this.saveCurrentRecord();
                                this.loadNextRecord();
                            }
                        }
//                           enter: this.saveCurrentRecord
                    });
                }
            }
        });
    },

    onCellClick: function(view, cell, colIdx, record){
        this.editRecord(record);
    },

    editRecord: function(record){
        if(!this.editorWindow){
            this.createWindow();
        }

        this.loadRecord(record);

        this.editorWindow.show();
    },

    loadRecord: function(record){
        //TODO: some sort of static helper for this?
        this.editorWindow.down('#formPanel').loadRecord(record);
        this.editorWindow.down('#detailsPanel').loadAnimal(record.get('Id'));

        var sm = this.cmp.getSelectionModel();
        if (!sm.hasSelection()){
            sm.setCurrentPosition(sm.getCurrentPosition());
        }

        sm.select([record]);
    },

    initListeners: function(grid){
        grid.mon(grid.view, {
            scope: this,
            celldblclick: this.onCellClick
        });
    },

    loadPreviousRecord: function(){
        var currentRec = this.editorWindow.down('#formPanel').getForm().getRecord(), prevRec;
        if(currentRec){
            prevRec = this.cmp.getStore().getAt(this.cmp.getStore().indexOf(currentRec) - 1);
            if(prevRec){
                this.loadRecord(prevRec);
            }
            else {
                Ext4.Msg.alert('', 'You have selected the first record, there are no previous records');
            }
        }
    },

    loadNextRecord: function(){
        var currentRec = this.editorWindow.down('#formPanel').getForm().getRecord(), nextRec;
        if (currentRec){
            nextRec = this.cmp.getStore().getAt(this.cmp.getStore().indexOf(currentRec) + 1);
            if (nextRec){
                this.loadRecord(nextRec);
            }
            else {
                Ext4.Msg.confirm('', 'You have selected the last record.  Do you want to add another?', function(val){
                    if (val == 'yes'){
                        var r = this.cmp.getStore().createModel({});
                        this.cmp.getStore().add(r);
                        this.loadRecord(r);
                    }
                }, this);
            }
        }
    },

    saveCurrentRecord: function(closeWindow){
        var form = this.editorWindow.down('#formPanel').getForm(), currentRec = form.getRecord(), fieldName,
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

        if (closeWindow)
            this.editorWindow.close();
    },

    onCancel: function(){
        this.editorWindow.close();
    }
});