

Ext4.define('EHR.window.CreateFormTemplateWindow', {
    extend: 'Ext.window.Window',

    formType: undefined,
    records: undefined,
    parent: undefined,

    initComponent: function () {
        Ext4.apply(this, {
            title: 'Create Form Template',
            modal: true,
            closeAction: 'destroy',
            width: 600,
            bodyStyle: 'padding: 5px;',
            items: [{
                html: 'This will create a template for the whole form using the section templates selected.',
                border: false,
                style: 'padding-bottom: 10px;'
            }, {
                xtype: 'textfield',
                itemId: 'formTemplateName',
                fieldLabel: 'Template Name',
                allowBlank: false,
                width: 500,
                labelWidth: 120
            }],
            buttons: [{
                text: 'Submit',
                scope: this,
                disabled: !this.formType,
                handler: this.onSubmit
            }, {
                text: 'Close',
                handler: function (btn) {
                    btn.up('window').close();
                }
            }]
        });

        this.callParent(arguments);
    },

    makeObject: function(config, data, fields){
        Ext4.each(data, function(row){
            var record = {};
            Ext4.each(fields, function(f, idx){
                record[f] = row[idx];
            }, this);
            config.rows.push(record);
        }, this);

        config.scope = config.scope || this;

        return config;
    },

    onError: function(e){
        console.log('Error saving template.');
        console.log(e);
        Ext4.Msg.alert('Error saving template', e.exception);
    },

    onSubmit: function(btn){
        var templateName = this.down('#formTemplateName').getValue();
        var templateRows = [{
            template: [templateName, 'Form', this.formType, '', ''],
            records: this.records
        }];

        var config = {
            schemaName: 'ehr',
            queryName: 'formtemplates',
            rows: [],
            failure: this.onError
        };
        var fields = ('title,category,formtype,userid,description').split(',');

        var toInsert = [];
        var data = [];
        Ext4.Array.forEach(templateRows, function(r){
            data.push(r.template);
        }, this);

        var queryConfig = this.makeObject(config, data, fields);
        queryConfig.success = function(results){
            var templateMap = [];
            Ext4.Array.forEach(results.rows, function(row, idx){
                if (row.category == 'Section'){
                    templateMap[[row.formtype, row.title].join('||')] = row.entityid;
                }
            }, this);

            Ext4.Array.forEach(results.rows, function(row, idx){
                var entityId = row.entityid;

                Ext4.Array.forEach(templateRows[idx].records, function(r){
                    if (!r){
                        console.error(templateRows[idx]);
                    }

                    r.push(entityId);
                    toInsert.push(r);
                }, this);
            }, this);

            if (toInsert.length){
                var config2 = {
                    schemaName: 'ehr',
                    queryName: 'formtemplaterecords',
                    rows: [],
                    success: this.onSuccess,
                    failure: this.onError
                };
                var fields2 = ('storeid,json,targettemplate,templateid').split(',');
                LABKEY.Query.insertRows(this.makeObject(config2, toInsert, fields2));
            }
            else {
                console.log('nothing to insert');
            }
        };

        LABKEY.Query.insertRows(queryConfig);
    },

    onSuccess: function(){
        this.hide();
        if (this.parent)
            this.parent.hide();

        Ext4.Msg.alert('Success', 'Template saved.');
    }
});