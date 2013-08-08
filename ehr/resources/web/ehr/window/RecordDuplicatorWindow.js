/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * This provides the UI to duplicate one or more records from an EHR.ext.GridFormPanel.  It allows the user to pick the number of copies
 * per record and which fields to copy
 *
 * @cfg targetGrid
 */
Ext4.define('EHR.window.RecordDuplicatorWindow', {
    extend: 'Ext.window.Window',

    initComponent: function(){
        LABKEY.ExtAdapter.applyIf(this, {
            modal: true,
            border: true,
            bodyStyle: 'padding:5px',
            defaults: {
                border: false,
                bodyBorder: false
            },
            items: [{
                xtype: 'numberfield',
                labelWidth: 150,
                fieldLabel: 'Number of Copies',
                itemId: 'newRecs',
                value: 1
            },{
                html: 'Choose Fields to Copy:',
                style: 'padding-top: 10px;padding-bottom: 5px;'
            },{
                xtype: 'form',
                items: [{
                    xtype: 'checkboxgroup',
                    columns: 2,
                    labelAlign: 'top',
                    defaults: {
                        width: 200
                    },
                    items: this.getCheckboxes()
                }]
            }],
            buttons: [{
                text: 'Submit',
                scope: this,
                handler: function(btn){
                    this.duplicate();
                    this.close();
                }
            },{
                text: 'Close',
                handler: function(btn){
                    btn.up('window').close();
                }
            }]
        });

        this.callParent(arguments);
    },

    getCheckboxes: function(){
        var items = [];
        this.targetGrid.store.getFields().each(function(f){
            if (!f.hidden && f.shownInInsertView && f.allowDuplicateValue!==false){
                items.push({
                    xtype: 'checkbox',
                    dataIndex: f.dataIndex || f.name,
                    name: f.dataIndex || f.name,
                    boxLabel: f.fieldLabel || f.caption,
                    checked: !f.noDuplicateByDefault
                });
            }
        }, this);

        return items;
    },

    duplicate: function(){
        var toAdd = [];
        var selected = this.targetGrid.getSelectionModel().getSelection();

        for (var i=0;i<this.down('#newRecs').getValue();i++){
            LABKEY.ExtAdapter.each(selected, function(rec){
                var data = {};
                this.down('form').getForm().getFields().each(function(f){
                    if(f.checked){
                        data[f.dataIndex] = rec.get(f.dataIndex);
                    }
                }, this);

                toAdd.push(this.targetGrid.store.createModel(data));
            }, this);

            if (toAdd.length){
                this.targetGrid.store.add(toAdd);
            }
        }
    }
});
