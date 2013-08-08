/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @class
 * This panel provides the UI that allows the user to apply a saved template to the current form.  It also provides UI to let the user
 * override existing values on this saved template.
 *
 * @cfg targetGrid
 * @cfg formType
 */
Ext4.define('EHR.window.ApplyTemplateWindow', {
    extend: 'Ext.window.Window',

    initComponent: function(){
        LABKEY.ExtAdapter.applyIf(this, {
            modal: true,
            border: true,
            bodyStyle: 'padding:5px',
            defaults: {
                width: 400,
                labelWidth: 130,
                border: false,
                bodyBorder: false
            },
            items: [{
                xtype: 'combo',
                displayField: 'title',
                valueField: 'entityid',
                queryMode: 'local',
                fieldLabel: 'Template Name',
                itemId: 'templateName',
                store: {
                    type: 'labkey-store',
                    schemaName: 'ehr',
                    queryName: 'my_formtemplates',
                    sort: 'title',
                    autoLoad: true,
                    filterArray: [LABKEY.Filter.create('formtype', this.formType, LABKEY.Filter.Types.EQUAL)]
                }
            },{
                xtype: 'checkbox',
                fieldLabel: 'Customize Values',
                itemId: 'customizeValues',
                checked: false
            }],
            buttons: [{
                text:'Submit',
                scope: this,
                handler: this.onSubmit
            },{
                text: 'Close',
                handler: function(btn){
                    btn.up('window').close();
                }
            }]
        });

        this.callParent(arguments);
    },

    onSubmit: function(){
        var templateId = this.down('#templateName').getValue();
        if (!templateId){
            Ext4.Msg.alert('Error', 'Must choose a template');
            return;
        }

        this.hide();
        this.loadTemplate(templateId);
    },

    loadTemplate: function(templateId){
        if(!templateId)
            return;

        LABKEY.Query.selectRows({
            schemaName: 'ehr',
            queryName: 'formtemplaterecords',
            filterArray: [
                LABKEY.Filter.create('templateId', templateId, LABKEY.Filter.Types.EQUAL)
            ],
            sort: '-rowid',
            success: this.onLoadTemplate,
            failure: LDK.Utils.getErrorCallback(),
            scope: this
        });

        Ext4.Msg.wait("Loading Template...");
    },

    onLoadTemplate: function(data){
        if(!data || !data.rows.length){
            Ext4.Msg.hide();
            return;
        }

        var toAdd = {};
        Ext4.Array.forEach(data.rows, function(row){
            var data = Ext4.decode(row.json);
            var store = Ext4.StoreMgr.get(row.storeid);

            //verify store exists
            if (!store){
                Ext4.StoreMgr.on('add', function(){
                    this.onLoadTemplate(data);
                }, this, {single: true, delay: 200});
                return;
            }

            //also verify it is loaded
            if (!store.getFields() || !store.getFields().getCount()){
                store.on('load', function(){
                    this.onLoadTemplate(data);
                }, this, {single: true, delay: 200});
                return false;
            }

            if (!toAdd[store.storeId])
                toAdd[store.storeId] = [];

            toAdd[store.storeId].push(data);
        });

        if (this.down('#customizeValues').checked)
            this.customizeData(toAdd);
        else
            this.loadTemplateData(toAdd);
    },

    customizeData: function(toAdd){
        Ext4.Msg.hide();

        //create window
        this.theWindow = Ext4.create('Ext.window.Window', {
            closeAction:'hide',
            title: 'Customize Values',
            width: 350,
            items: [{
                xtype: 'tabpanel',
                itemId: 'theForm',
                activeTab: 0
            }],
            scope: this,
            buttons: [{
                text:'Submit',
                disabled:false,
                scope: this,
                handler: this.onCustomize
            },{
                text: 'Close',
                scope: this,
                handler: function(){
                    this.theWindow.hide();
                }
            }]
        });

        for (var i in toAdd){
            this.addStore(i, toAdd[i]);
        }

        this.theWindow.show();
    },

    addStore: function(storeId, records){
        var store = Ext4.StoreMgr.get(storeId);
        if(!store){
            alert('ERROR: Store not found');
            return;
        }

        var toAdd = {
            xtype: 'form',
            ItemId: 'thePanel',
            storeId: storeId,
            records: records,
            items: []
        };

        store.getFields().each(function(f){
            if(!f.hidden && f.shownInInsertView && f.allowSaveInTemplate !== false && f.allowDuplicate !== false){
                var editor = EHR.DataEntryUtils.getFormEditorConfig(f);
                editor.width= 350;
                if (f.inputType == 'textarea')
                    editor.height = 100;

                var values = [];
                Ext4.Array.forEach(records, function(data){
                    if(data[f.dataIndex]!==undefined){
                        values.push(f.convert(data[f.dataIndex], data));
                    }
                }, this);

                values = Ext4.unique(values);

                if(values.length==1)
                    editor.value=values[0];
                else if (values.length > 1){
                    editor.xtype = 'displayfield';
                    editor.store = null;
                    editor.value = values.join('/');
                }

                toAdd.items.push(editor);
            }
        }, this);

        this.theWindow.down('#theForm').add({
            bodyStyle: 'padding: 5px;',
            title: store.queryName,
            defaults: {
                border: false,
                bodyStyle: 'padding: 5px;'
            },
            items: [{
                html: '<b>'+records.length+' Record'+(records.length==1 ? '' : 's')+' will be added.</b><br>If you enter values below, these will be applied to all new records, overriding any saved values.'
            },
                toAdd
            ]
        });
    },

    loadTemplateData: function(toAdd){
        for (var i in toAdd){
            var store = Ext4.StoreMgr.get(i);
            var recs = [];
            Ext4.Array.forEach(toAdd[i], function(data){
                recs.push(store.createModel(data));
            }, this);
            store.add(recs)
        }

        Ext4.Msg.hide();
    },

    onCustomize: function(){
        var toAdd = {};
        this.theWindow.down('#theForm').items.each(function(tab){
            var panel = tab.down('#thePanel');
            var values = panel.getForm().getFieldValues(true);
            toAdd[panel.storeId] = panel.records;
            Ext4.Array.forEach(panel.records, function(r){
                LABKEY.ExtAdapter.apply(r, values);
            }, this);
        }, this);

        this.loadTemplateData(toAdd);
        this.theWindow.close();
    }
});