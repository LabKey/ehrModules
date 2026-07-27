/*
 * Copyright (c) 2025-2026 LabKey Corporation
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

        // A header matching no field silently drops its whole column, so keep the full set of recognized
        // names to check the pasted header row against. Built from allConfigs rather than fieldConfigs so
        // the fields the importer itself skips (hidden, taskid, qcstate) count as known but not importable
        // and are passed over without complaint.
        this.knownHeaders = {};
        const addKnownHeader = (name) => {
            const key = this.normalizeHeader(name);
            if (key) {
                this.knownHeaders[key] = true;
            }
        };
        allConfigs.forEach((f) => {
            addKnownHeader(f.name);
            (Ext4.isArray(f.importAliases) ? f.importAliases : []).forEach(addKnownHeader);
        });
        // processRow() handles these directly, whether or not the section declares them.
        ['Id', 'date', 'project'].forEach(addKnownHeader);

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
            const headerMap = this.buildHeaderMap(parsed[0]);
            this.checkHeaders(parsed[0], errors);

            // Only parse rows once the header row is sound. A misspelled header for a required column
            // otherwise reports as a missing value on every one of up to 250 rows, burying the one error
            // that explains all of them.
            if (!errors.length) {
                for (let i = 1; i < parsed.length; i++) {
                    const row = parsed[i];
                    if (!row || row.length < this.requiredFieldNames.length) {
                        errors.push('Row ' + i + ': not enough items in row');
                        continue;
                    }

                    const newRow = this.processRow(headerMap, row, errors, i);
                    if (newRow) {
                        records.push(this.targetStore.createModel(newRow));
                    }
                }
            }

            Ext4.Msg.hide();
        }

        if (errors.length){
            // A condition that holds for a whole column rather than a single row is reported without a
            // row number, so the identical copy pushed by every row collapses to one line here.
            Ext4.Msg.alert('Error', 'There following errors were found:<p>' + Ext4.Array.unique(errors).join('<br>'));
            return;
        }

        if (records.length){
            this.targetStore.add(records);
        }

        this.close();
    },

    // Cells pasted out of a spreadsheet routinely carry stray whitespace, which no exact match would
    // survive. Trim before parsing or matching so a padded cell resolves and a blank one reads as empty.
    normalizeValue: function(value){
        return Ext4.isString(value) ? Ext4.String.trim(value) : value;
    },

    // Header cells carry the same stray whitespace and casing drift as any other pasted cell, and a header
    // that fails to match drops its whole column, so normalize both sides before comparing them.
    normalizeHeader: function(header){
        return Ext4.isString(header) ? Ext4.String.trim(header).toLowerCase() : '';
    },

    // Maps each normalized header to its column index, first occurrence winning as indexOf() did. Keyed on
    // pasted text, so membership is tested against own properties only rather than anything Object supplies.
    buildHeaderMap: function(headers){
        const map = {};
        Ext4.each(headers, function(header, idx){
            const key = this.normalizeHeader(header);
            if (key && !Object.prototype.hasOwnProperty.call(map, key)) {
                map[key] = idx;
            }
        }, this);

        return map;
    },

    getHeaderIndex: function(headerMap, name){
        const key = this.normalizeHeader(name);

        return key && Object.prototype.hasOwnProperty.call(headerMap, key) ? headerMap[key] : -1;
    },

    // A header the form does not recognize, or two headers naming the same field, means a column is either
    // dropped or read from the wrong place. Report both rather than importing part of the source silently.
    // Reported without a row number, since each is a property of the header row as a whole.
    checkHeaders: function(headers, errors){
        const seen = {};
        Ext4.each(headers, function(header){
            const key = this.normalizeHeader(header);
            // Trailing empty cells are a routine artifact of a spreadsheet copy and name no column.
            if (!key) {
                return;
            }

            const encoded = Ext4.util.Format.htmlEncode(Ext4.String.trim(header));
            if (seen[key] === true) {
                errors.push('Duplicate column: ' + encoded + '. Remove one so it is unambiguous which is imported.');
            }
            else {
                seen[key] = true;
                if (this.knownHeaders[key] !== true) {
                    errors.push('Unrecognized column: ' + encoded + '. It matches no field in this form and would not be imported.');
                }
            }
        }, this);
    },

    resolveDate: function(fieldName, value, errors, rowIdx){
        value = this.normalizeValue(value);

        const parsed = LDK.ConvertUtils.parseDate(value);

        // parseDate returns null for anything it cannot match. Report it rather than letting the
        // column silently arrive empty, which only surfaces at all when the field is required.
        if (Ext4.isEmpty(parsed) && !Ext4.isEmpty(value)) {
            errors.push('Row ' + rowIdx + ': unable to parse date for ' + fieldName + ': ' + Ext4.util.Format.htmlEncode(value));
        }

        return parsed;
    },

    resolveLookup: function(field, value, errors, rowIdx){
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

        value = this.normalizeValue(value);
        if (Ext4.isEmpty(value)) {
            return value;
        }

        // Some client-side lookup configs declare only a key column, so neither of these is guaranteed.
        // With nothing to match on, pass the value through as the missing-store case above does.
        const columns = Ext4.Array.unique([field.lookup.displayColumn, field.lookup.keyColumn]).filter(function(c){
            return !Ext4.isEmpty(c);
        });
        if (!columns.length) {
            return value;
        }

        // A store holding no records cannot resolve anything, so say so rather than writing the raw text
        // through as though it had resolved. getCount() on its own is not a load-state check -- it reads
        // 0 both while records are still in flight and for a store that loaded no rows, and neither can
        // produce a match. Reported without a row number so every row's copy collapses to one line.
        if (field.lookup.store.isLoading() || !field.lookup.store.getCount()) {
            errors.push('No lookup values are loaded for ' + field.name + '. Please retry the import.');
            return value;
        }

        // findRecord(fieldName, value, startIndex, anyMatch, caseSensitive, exactMatch) defaults to a
        // PREFIX match, which silently resolves a code to any record whose display value merely starts
        // with it -- e.g. source 'LABS' matched the record whose meaning is 'LABSINDO' and stored
        // 'LABSINDO'. Require an exact (still case-insensitive) match.
        //
        // Try the display value first, then the key. A pasted cell legitimately holds either, and before
        // an exact match was required a pasted key still resolved by falling through as raw text.
        // EHR.form.field.ProjectEntryField resolves the same two ways.
        for (let i = 0; i < columns.length; i++) {
            const lookupRecord = field.lookup.store.findRecord(columns[i], value, 0, false, false, true);
            if (lookupRecord) {
                return lookupRecord.data[field.lookup.keyColumn];
            }
        }

        // Report rather than silently storing the raw text in place of the lookup's key.
        errors.push('Row ' + rowIdx + ': unrecognized value for ' + field.name + ': ' + Ext4.util.Format.htmlEncode(value));

        return value;
    },

    processRow: function(headerMap, row, errors, rowIdx){
        const obj = {};

        // Seeded only when the column was actually pasted, so that a field this method does not handle is
        // left for the loop below to match on its own name or import alias.
        const idIdx = this.getHeaderIndex(headerMap, 'Id');
        if (idIdx !== -1) {
            // A row shorter than the header row leaves this undefined, which checkRequired() reports.
            obj.Id = this.upperCaseAnimalId && Ext4.isString(row[idIdx]) ? row[idIdx].toUpperCase() : row[idIdx];
        }

        const dateIdx = this.getHeaderIndex(headerMap, 'date');
        if (dateIdx !== -1) {
            obj.date = this.resolveDate('date', row[dateIdx], errors, rowIdx);
        }

        const projectIdx = this.getHeaderIndex(headerMap, 'project');
        if (projectIdx !== -1) {
            obj.project = this.resolveProjectByName(row[projectIdx], errors, rowIdx);
        }

        Ext4.each(this.fieldConfigs, function(field) {
            // Skip by name rather than by truthiness: a column handled above whose value came back null --
            // an unknown project, an unparsable date -- must not be resolved a second time here, or the one
            // cell is reported twice by two paths that match on different columns and disagree.
            if (obj.hasOwnProperty(field.name)) {
                return;
            }

            let index = this.getHeaderIndex(headerMap, field.name);
            if (index === -1 && field.importAliases?.[0]) {
                index = this.getHeaderIndex(headerMap, field.importAliases?.[0]);
            }
            if (index !== -1) {
                // Every date column needs parseDate, not just the one named 'date'. Left to the
                // raw string, an Ext date field applies JS new Date() semantics, and ES5+ parses a
                // bare yyyy-MM-dd as UTC -- so '1965-04-01' lands as the previous day in any
                // negative-offset timezone, and '1970-01-01' becomes 0 and is discarded as empty.
                obj[field.name] = field.jsonType === 'date'
                    ? this.resolveDate(field.name, row[index], errors, rowIdx)
                    : this.resolveLookup(field, row[index], errors, rowIdx);
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
        projectName = this.normalizeValue(projectName);
        if (!projectName){
            return null;
        }

        // Same load-state check as resolveLookup(): an unloaded store matches nothing, and blaming the
        // pasted value for that sends the user looking for a problem their source file does not have. The
        // store is autoLoad, so a submit can race it. Reported without a row number so every row's copy
        // collapses to one line.
        if (this.projectStore.isLoading() || !this.projectStore.getCount()){
            errors.push('No projects are loaded yet. Please retry the import.');
            return null;
        }

        // find() shares findRecord()'s prefix-match default, so '0123' would otherwise resolve to an
        // unrelated project named '01234'. Require an exact (still case-insensitive) match.
        const recIdx = this.projectStore.find('name', Ext4.String.leftPad(projectName, 4, '0'), 0, false, false, true);
        if (recIdx === -1){
            // Echo what was pasted rather than the zero-padded form, so the message names something the
            // user can find in their source file.
            errors.push('Row ' + rowIdx + ': unknown project ' + Ext4.util.Format.htmlEncode(projectName));
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
