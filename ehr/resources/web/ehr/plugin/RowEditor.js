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

    getPanel: function(){
        var fields = this.cmp.getStore().getFields();

        var panelItems = [], i, cfg;
        Ext4.Array.each(this.cmp.formConfig.fieldConfigs, function(field){
            var meta = fields.get(field.name);
            cfg = this.getFieldConfig(meta);

            if(cfg){
                panelItems.push(cfg);
            }
        }, this);

        this.formPanel = Ext4.create('Ext.form.Panel', {
            width: '100%',
            bodyStyle: 'padding: 5px;',
            items: panelItems,
            trackResetOnLoad: true
        });

        return this.formPanel;
    },

    createWindow: function(){
        this.editorWindow = Ext4.create('Ext.window.Window', {
            modal: true,
            items: this.getPanel(),
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
        //TODO: some sort of static helper for this
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