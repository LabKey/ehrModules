/*
 * Copyright (c) 2018-2025 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg targetStore
 */
Ext4.define('EHR.window.FormBulkAddWindow', {
    extend: 'Ext.window.Window',

    modal: true,
    closeAction: 'destroy',
    title: 'Bulk Add Data',
    bodyStyle: 'padding: 5px;',
    width: 1000,
    defaults: {
        border: false
    },

    fieldConfigs: [],
    fieldNames: [],
    requiredFieldConfigs: [],
    requiredFieldNames: [],
    upperCaseAnimalId: false,

    initComponent: function(){
        const section = this.targetStore?.sectionCfg;
        if (!section) {
            Ext4.Msg.alert('Error', 'Unable to find form section. Check that the form is configured correctly.');
            return;
        }
        const allConfigs = EHR.model.DefaultClientModel.getFieldConfigs(section.fieldConfigs, section.configSources, this.extraMetaData);
        this.fieldConfigs = allConfigs.filter((f) => {
            return !f.hidden && !f.isHidden && f.name.toLowerCase() !== 'taskid' && f.name.toLowerCase() !== "qcstate";
        });
        if (!this.fieldConfigs) {
            Ext4.Msg.alert('Error', 'Unable to find fields in target store. Check that the form is configured correctly.');
            return;
        }

        this.fieldNames = this.fieldConfigs.map((f) => {
            const alias = f.importAliases?.[0]; // If the import alias matches the label, use that in the template
            if (alias?.toLowerCase() === f.label?.toLowerCase()) {
                return alias;
            }
            return f.name;
        });

        this.requiredFieldConfigs = this.fieldConfigs.filter((f) => {
            return f.required;
        });

        this.requiredFieldNames = this.requiredFieldConfigs.map((f) => {
            return f.name;
        });

        this.items = [{
            html : 'This allows you to import data using a simple Excel or TSV file.  To import, cut/paste the contents of the Excel or TSV file (Ctl + A is a good way to select all) into the box below and hit submit. The limit for import is 250 rows.',
            style: 'padding-bottom: 10px;'
        },{
            xtype: 'ldk-linkbutton',
            text: '[Download Template]',
            scope: this,
            linkTarget: '_blank',
            handler: function(){
                LABKEY.Utils.convertToExcel({
                    fileName: this.targetStore.sectionCfg.label + '.xlsx',
                    sheets: [{
                        name: 'Requests',
                        data: [
                            this.fieldNames
                        ]
                    }]
                });
            }
        },{
            xtype: 'textarea',
            width: 970,
            height: 400,
            itemId: 'textField'
        }];

        this.buttons = [{
            text: 'Submit',
            scope: this,
            handler: this.onSubmit
        },{
            text: 'Cancel',
            handler: function(btn){
                btn.up('window').close();
            }
        }];

        this.projectStore = EHR.DataEntryUtils.getProjectStore();

        this.callParent(arguments);
    },

    onSubmit: function(){
        const text = this.down('#textField').getValue();
        if (!text){
            Ext4.Msg.alert('Error', 'Must paste the records into the text area');
            return;
        }

        const parsed = LDK.Utils.CSVToArray(Ext4.String.trim(text), '\t');
        if (!parsed){
            Ext4.Msg.alert('Error', 'There was an error parsing the data.');
            return;
        }

        if (parsed.length < 2){
            Ext4.Msg.alert('Error', 'There are not enough rows in the text, there was an error parsing the data.');
            return;
        }

        this.doParse(parsed);
    },

    doParse: function(parsed){
        const errors = [];
        const records = [];

        //first get global values:
        Ext4.Msg.wait('Processing...');

        const dataRowCount = parsed.length - 1;
        if (dataRowCount > 250) {
            errors.push('Row Count - ' + dataRowCount + ': Import maximum is 250 rows.  Please split your import into multiple uploads and submit the form between each upload.');
        }
        else {

            for (let i = 1; i < parsed.length; i++) {
                const row = parsed[i];
                if (!row || row.length < this.requiredFieldNames.length) {
                    errors.push('Row ' + i + ': not enough items in row');
                    continue;
                }

                const newRow = this.processRow(parsed[0], row, errors, i);
                if (newRow) {
                    records.push(this.targetStore.createModel(newRow));
                }
            }

            Ext4.Msg.hide();
        }

        if (errors.length){
            Ext4.Msg.alert('Error', 'There following errors were found:<p>' + errors.join('<br>'));
            return;
        }

        if (records.length){
            this.targetStore.add(records);
        }

        this.close();
    },

    resolveLookup: function(field, value, errors){
        if (!field || !field.lookup)
            return value;

        if (!field.lookup.store) {
            const storeId = LABKEY.ext4.Util.getLookupStoreId(field);

            field.lookup.store = Ext4.StoreMgr.get(storeId);
            if (!field.lookup.store) {
                console.log('Unable to find lookup store for ' + storeId);

                return value;
            }
        }

        const lookupRecord = field.lookup.store.findRecord(field.lookup.displayColumn, value);
        if (lookupRecord) {
            return lookupRecord.data[field.lookup.keyColumn];
        }

        return value;
    },

    processRow: function(headers, row, errors, rowIdx){
        const obj = {
            Id: this.upperCaseAnimalId ? row[headers.indexOf('Id')].toUpperCase() : row[headers.indexOf('Id')],
            date: LDK.ConvertUtils.parseDate(row[headers.indexOf('date')]),
            project: this.resolveProjectByName(row[headers.indexOf('project')], errors, rowIdx)
        }

        Ext4.each(this.fieldConfigs, function(field) {
            if (!obj[field.name]) {
                let index = headers.indexOf(field.name);
                if (index === -1 && field.importAliases?.[0]) {
                    index = headers.indexOf(field.importAliases?.[0]);
                }
                if (index !== -1) {
                    obj[field.name] = this.resolveLookup(field, row[index], errors);
                }
            }
        }, this);

        if (!this.checkRequired(this.requiredFieldNames, obj, errors, rowIdx)){
            return obj;
        }
    },

    checkRequired: function(fields, row, errors, rowIdx){
        let hasErrors = false, fieldName;

        for (let i=0;i<fields.length;i++){
            fieldName = fields[i];
            if (Ext4.isEmpty(row[fieldName])){
                errors.push('Row ' + rowIdx + ': missing required field ' + fieldName);
                hasErrors = true;
            }
        }

        return hasErrors;
    },

    resolveProjectByName: function(projectName, errors, rowIdx){
        if (!projectName){
            return null;
        }

        projectName = Ext4.String.leftPad(projectName, 4, '0');

        const recIdx = this.projectStore.find('name', projectName);
        if (recIdx === -1){
            errors.push('Row ' + rowIdx + ': unknown project ' + projectName);
            return null;
        }

        return this.projectStore.getAt(recIdx).get('project');
    }
});

EHR.DataEntryUtils.registerGridButton('FORM_BULK_ADD', function(config){
    return Ext4.Object.merge({
        text: 'Add From File',
        tooltip: 'Click to bulk import records from an Excel or TSV file.',
        handler: function(btn){
            const grid = btn.up('grid');
            LDK.Assert.assertNotEmpty('Unable to find grid in FORM_BULK_ADD button', grid);

            Ext4.create('EHR.window.FormBulkAddWindow', {
                targetStore: grid.store
            }).show();
        }
    });
});
