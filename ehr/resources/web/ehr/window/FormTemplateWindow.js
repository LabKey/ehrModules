/**
 * @cfg dataEntryPanel
 */
Ext4.define('EHR.window.FormTemplateWindow', {
    extend: 'Ext.window.Window',

    initComponent: function(){
        LABKEY.ExtAdapter.apply(this, {
            modal: true,
            closeAction: 'destroy',
            width: 500,
            minHeight: 300,
            bodyStyle: 'padding: 5px;',
            title: 'Apply Template To Form',
            defaults: {
                border: false
            },
            items: [{
                html: 'Loading...'
            }],
            buttons: [{
                text: 'Submit',
                scope: this,
                handler: this.onSubmit
            },{
                text: 'Close',
                scope: this,
                handler: function(btn){
                    btn.up('window').close();
                }
            }]
        });

        this.callParent(arguments);

        LABKEY.Query.selectRows({
            schemaName: 'ehr',
            queryName: 'formtemplaterecords',
            columns: '*',
            filterArray: [
                LABKEY.Filter.create('templateid/category', 'Form')
            ],
            scope: this,
            error: LDK.Utils.getErrorCallback(),
            success: this.onLoad
        });
    },

    onLoad: function(results){
        this.templateRecordMap = {};
        Ext4.Array.forEach(results.rows, function(row){
            var template = row.templateid;
            if (template){
                if (!this.templateRecordMap[template]){
                    this.templateRecordMap[template] = [];
                }

                this.templateRecordMap[template].push(row);
            }
        }, this);

        this.removeAll();
        this.add(this.getItems());
        this.center();
    },

    getItems: function(){
        var items = [{
            html: 'This helper allows you to apply a set of templates to all sections of this form.  You can pick a form template using the first combo, and/or select templates for each section individually.<br><br>' +
                '<b>NOTE: This will remove all existing records from the affected sections</b>',
            style: 'padding-bottom: 10px;'
        },{
            xtype: 'labkey-combo',
            fieldLabel: 'Choose Template',
            labelWidth: 150,
            width: 400,
            valueField: 'entityid',
            displayField: 'title',
            store: {
                type: 'labkey-store',
                schemaName: 'ehr',
                queryName: 'my_formtemplates',
                sort: 'title',
                autoLoad: true,
                filterArray: [
                    LABKEY.Filter.create('formtype', this.dataEntryPanel.formConfig.name, LABKEY.Filter.Types.EQUAL),
                    LABKEY.Filter.create('category', 'Form', LABKEY.Filter.Types.EQUAL)
                ]
            },
            listeners: {
                scope: this,
                change: function(field, val){
                    if(this.templateRecordMap[val]){
                        var combos = this.query('combo[section]');
                        Ext4.Array.forEach(this.templateRecordMap[val], function(row){
                            var found = false;
                            Ext4.Array.forEach(combos, function(combo){
                                if (combo.section.name == row.storeid){
                                    combo.setValue(row.targettemplate);
                                    found = true;
                                }
                            }, this);

                            LDK.Assert.assertTrue('Unable to find matching combo for store: ' + row.storeid, found);
                        }, this);
                    }
                }
            }
        },{
            xtype: 'xdatetime',
            itemId: 'dateField',
            fieldLabel: 'Date',
            timeFormat: 'H:i',
            labelWidth: 150,
            width: 400,
            value: new Date()
        },{
            html: 'Sections:',
            style: 'padding-top: 10px;padding-bottom: 10px;'
        }];

        var sorted = Ext4.Array.clone(this.dataEntryPanel.formConfig.sections);
        sorted = LDK.Utils.sortByProperty(sorted, 'label', false);
        Ext4.Array.forEach(sorted, function(section){
            if (!section.supportsTemplates){
                return;
            }

            items.push({
                xtype: 'combo',
                labelWidth: 150,
                fieldLabel: section.label,
                width: 400,
                section: section,
                valueField: 'entityid',
                displayField: 'title',
                sort: 'title',
                store: {
                    type: 'labkey-store',
                    autoLoad: true,
                    schemaName: 'ehr',
                    queryName: 'my_formtemplates',
                    sort: 'title',
                    filterArray: [
                        LABKEY.Filter.create('formtype', section.name, LABKEY.Filter.Types.EQUAL),
                        LABKEY.Filter.create('category', 'Section', LABKEY.Filter.Types.EQUAL)
                    ]
                }
            });
        }, this);

        return items;
    },

    onSubmit: function(btn){
        Ext4.Msg.wait('Loading...');

        var combos = this.query('combo[section]');
        var date = this.down('#dateField').getValue();
        Ext4.Array.forEach(combos, function(combo){
            if (combo.getValue()){
                EHR.window.ApplyTemplateWindow.loadTemplateRecords(this.afterLoadTemplate, this, this.dataEntryPanel.storeCollection, combo.getValue(), [{
                    date: date
                }]);
            }
        }, this);

    },

    afterLoadTemplate: function(recMap){
        if (!recMap || LABKEY.Utils.isEmptyObj(recMap)){
            Ext4.Msg.hide();
            return;
        }

        for (var i in recMap){
            var store = Ext4.StoreMgr.get(i);

            //NOTE: removeAll() doesnt seem to fire the right events
            store.each(function(r){
                store.remove(r);
            }, this);

            store.add(recMap[i]);
        }

        this.close();
        Ext4.Msg.hide();
    }
});

EHR.DataEntryUtils.registerDataEntryFormButton('APPLYFORMTEMPLATE', {
    text: 'Apply Template',
    tooltip: 'Click to apply a template to all sections of this form',
    itemId: 'formTemplatesBtn',
    scope: this,
    handler: function(btn){
        var panel = btn.up('ehr-dataentrypanel');
        LDK.Assert.assertNotEmpty('Unable to find dataEntryPanel', panel);

        Ext4.create('EHR.window.FormTemplateWindow', {
            dataEntryPanel: panel
        }).show();
    }
});
