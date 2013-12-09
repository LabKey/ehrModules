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
 * @cfg defaultTemplate
 */
Ext4.define('EHR.window.ApplyTemplateWindow', {
    extend: 'Ext.window.Window',

    initComponent: function(){
        LABKEY.ExtAdapter.applyIf(this, {
            modal: true,
            closeAction: 'destroy',
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
                value: this.defaultTemplate,
                forceSelection: true,
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
                fieldLabel: 'Bulk Edit Before Applying',
                helpPopup: 'If checked, you will be prompted with a screen that lets you bulk edit the records that will be created.  This is often very useful when adding many similar records.',
                itemId: 'customizeValues',
                checked: false
            },{
                xtype: 'textarea',
                fieldLabel: 'Animal Ids (optional)',
                helpPopup: 'If provided, this template will be applied once per animal Id.  Otherwise the template will be added once with a blank Id',
                itemId: 'subjectIds'
            },{
                xtype: 'xdatetime',
                fieldLabel: 'Date (optional)',
                itemId: 'dateField',
                value: new Date()
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
        if (!templateId)
            return;

        LABKEY.Query.selectRows({
            schemaName: 'ehr',
            queryName: 'formtemplaterecords',
            filterArray: [
                LABKEY.Filter.create('templateId', templateId, LABKEY.Filter.Types.EQUAL)
            ],
            sort: 'rowid',
            success: this.onLoadTemplate,
            failure: LDK.Utils.getErrorCallback(),
            scope: this
        });

        Ext4.Msg.wait("Loading Template...");
    },

    onLoadTemplate: function(data){
        if (!data || !data.rows.length){
            Ext4.Msg.hide();
            return;
        }

        //find subjectIds and date
        var date = this.down('#dateField').getValue();
        var subjectArray = this.down('#subjectIds').getValue();
        if (subjectArray){
            subjectArray = Ext4.String.trim(subjectArray);
            subjectArray = subjectArray.replace(/[\s,;]+/g, ';');
            subjectArray = subjectArray.replace(/(^;|;$)/g, '');
            subjectArray = subjectArray.toLowerCase();

            if (subjectArray){
                subjectArray = subjectArray.split(';');
            }
        }
        subjectArray = subjectArray || [];

        var toAdd = {};
        if (!subjectArray.length){
            subjectArray.push(null);
        }

        Ext4.Array.forEach(subjectArray, function(subjectId){
            Ext4.Array.forEach(data.rows, function(row){
                var data = Ext4.decode(row.json);
                var store = this.targetGrid.store.storeCollection.getClientStoreByName(row.storeid);

                //verify store exists
                if (!store){
                    Ext4.StoreMgr.on('add', function(){
                        this.onLoadTemplate(data);
                    }, this, {single: true, delay: 200});
                    return;
                }

                //also verify it is loaded
                if (store.loading || !store.getFields() || !store.getFields().getCount()){
                    store.on('load', function(){
                        this.onLoadTemplate(data);
                    }, this, {single: true, delay: 200});
                    return false;
                }

                if (!toAdd[store.storeId])
                    toAdd[store.storeId] = [];

                if (date){
                    data.date = date;
                }

                var newData = LABKEY.ExtAdapter.apply({}, data);
                if (subjectId)
                    newData.Id = subjectId;

                toAdd[store.storeId].push(newData);
            }, this);
        }, this);

        if (this.down('#customizeValues').checked)
            this.customizeData(toAdd);
        else
            this.loadTemplateData(toAdd);
    },

    customizeData: function(toAdd){
        Ext4.Msg.hide();

        //TODO
        var recMap = this.getRecordMap(toAdd);
        var storeIds = Ext4.Object.getKeys(recMap);
        LDK.Assert.assertEquality('Attempt to customize values on a template with more than 1 store.  The UI should prevent this.', 1, storeIds.length);
        if (storeIds.length != 1){
            Ext4.Msg.alert('Error', 'This type of template cannot be customized');
            this.loadTemplateData(toAdd);
            return;
        }

        //create window
        var records = recMap[storeIds[0]];
        Ext4.create('EHR.window.BulkEditWindow', {
            suppressConfirmMsg: true,
            records: records,
            targetStore: this.targetGrid.store,
            formConfig: this.targetGrid.formConfig
        }).show();
        
        this.close();
    },

    addStore: function(storeId, records){
        var store = Ext4.StoreMgr.get(storeId);
        if (!store){
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
            if (!f.hidden && f.shownInInsertView && f.allowSaveInTemplate !== false && f.allowDuplicate !== false){
                var editor = EHR.DataEntryUtils.getFormEditorConfig(f);
                editor.width= 350;
                if (f.inputType == 'textarea')
                    editor.height = 100;

                var values = [];
                Ext4.Array.forEach(records, function(data){
                    if (data[f.dataIndex]!==undefined){
                        values.push(f.convert(data[f.dataIndex], data));
                    }
                }, this);

                values = Ext4.unique(values);

                if (values.length==1)
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
        var recMap = this.getRecordMap(toAdd);
        for (var i in toAdd){
            var store = Ext4.StoreMgr.get(i);            
            store.add(toAdd[i]);            
        }

        Ext4.Msg.hide();
    },
    
    getRecordMap: function(toAdd){
        var recMap = {};

        for (var i in toAdd){
            var store = Ext4.StoreMgr.get(i);
            var recs = [];
            Ext4.Array.forEach(toAdd[i], function(data){
                recs.push(store.createModel(data));
            }, this);
            recMap[store.storeId] = recs;
        }

        return recMap;        
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