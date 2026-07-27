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

        // Header resolution needs both halves of the section separately: the importable fields decide first,
        // and the ones the importer skips (hidden, taskid, qcstate) are consulted only to tell a header this
        // form knows but will not import from one it does not recognize at all.
        this.allFieldConfigs = allConfigs;
        this.skippedFieldConfigs = allConfigs.filter((f) => {
            return this.fieldConfigs.indexOf(f) === -1;
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

        // Spaces and line endings are trimmed off the block, but never tabs. Ext4.String.trim() counts a tab
        // as whitespace, so it stripped the last row's trailing tabs along with them, dropping that row's empty
        // final cells and leaving it narrower than the rest -- which then read as a truncated row even though
        // every value in it was correct. Spaces still have to go: a stray one after the final newline would
        // otherwise parse as a junk one-cell row, and one on a leading blank line would be read as the header
        // row itself. Individual cells are trimmed downstream by normalizeValue() and buildHeaderMap().
        const parsed = LDK.Utils.CSVToArray(text.replace(/^[ \r\n]+|[ \r\n]+$/g, ''), '\t');
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
            const headerMap = this.buildHeaderMap(parsed[0], errors);

            // Only parse rows once the header row is sound. A misspelled header for a required column
            // otherwise reports as a missing value on every one of up to 250 rows, burying the one error
            // that explains all of them.
            if (!errors.length) {
                const columnCount = this.getRequiredColumnCount(headerMap);

                for (let i = 1; i < parsed.length; i++) {
                    const row = parsed[i];
                    if (!row || row.length < columnCount) {
                        errors.push('Row ' + i + ': not enough items in row -- has ' + (row ? row.length : 0) + ', needs at least ' + columnCount);
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

    // Identifies the field a pasted header names, which is what LABKEY.ext4.Util.resolveFieldNameFromLabel()
    // exists for: it compares case-insensitively against a field's name, the display names the UI shows for it
    // (label, caption, shortCaption) and every one of its import aliases. Matching only the name and the first
    // alias, as this window used to, drops the column for any other spelling.
    //
    // Two things are decided here rather than left to the helper, because it breaks out of its search on the
    // first name or display-name hit: it cannot distinguish one match from several, and so resolves a shared
    // display name to whichever field is declared first.
    resolveHeaderToFieldName: function(header){
        // An exact name match wins outright, so the field this header actually names cannot lose to another
        // field that merely shares its display name. Importable fields are searched first here for the same
        // reason they are below: a section can declare one name in two queries, and letting the skipped copy
        // win would drop the column in silence.
        const exact = this.findFieldByExactName(this.fieldConfigs, header)
                || this.findFieldByExactName(this.skippedFieldConfigs, header);
        if (exact) {
            return exact.name;
        }

        // Several fields answering to one display name is undecidable, and guessing is how a column lands in
        // the wrong field. Report it instead by resolving to nothing.
        if (this.countDisplayNameClaimants(this.fieldConfigs, header) > 1) {
            return null;
        }

        // Importable fields resolve before the skipped ones so a header cannot be captured by a field the
        // importer ignores that happens to share its display name -- that would drop the column silently,
        // since a header resolving to a skipped field is deliberately not reported.
        return LABKEY.ext4.Util.resolveFieldNameFromLabel(header, this.fieldConfigs)
                || LABKEY.ext4.Util.resolveFieldNameFromLabel(header, this.skippedFieldConfigs);
    },

    findFieldByExactName: function(configs, header){
        const lower = header.toLowerCase();

        return configs.find((f) => {
            return Ext4.isString(f.name) && f.name.toLowerCase() === lower;
        });
    },

    // Counts the fields answering to this header by one of the names the helper treats as identifying. Import
    // aliases are deliberately excluded: the helper does gather every alias match and rejects an ambiguous one
    // on its own, so only the display names need counting here.
    countDisplayNameClaimants: function(configs, header){
        const lower = header.toLowerCase();

        return configs.filter((f) => {
            return [f.name, f.label, f.caption, f.shortCaption].some((n) => {
                return Ext4.isString(n) && n.toLowerCase() === lower;
            });
        }).length;
    },

    // Maps each field named by the header row to the column holding its values, and reports any header that
    // resolves to no field or to a field another header already claimed -- either way a column would be read
    // from the wrong place or not at all. Keyed on the resolved field name rather than the pasted text, so
    // this is the single answer to "which column holds this field" that processRow() then reads.
    //
    // Reported without a row number, since each is a property of the header row as a whole.
    buildHeaderMap: function(headers, errors){
        const map = {};
        const claimedBy = {};

        Ext4.each(headers, function(header, idx){
            const text = Ext4.isString(header) ? Ext4.String.trim(header) : '';
            // A spreadsheet copy routinely leaves empty cells past the last real column.
            if (!text) {
                return;
            }

            const encoded = Ext4.util.Format.htmlEncode(text);
            const fieldName = this.resolveHeaderToFieldName(text);
            if (!fieldName) {
                // The helper reports nothing both for a header no field claims and for an alias several
                // fields share, so the message cannot promise which of the two it was.
                errors.push('Unrecognized column: ' + encoded + '. It matches no field in this form, or matches more than one.');
                return;
            }

            if (Object.prototype.hasOwnProperty.call(claimedBy, fieldName)) {
                errors.push('Duplicate column: ' + encoded + ' names the same field as ' + Ext4.util.Format.htmlEncode(claimedBy[fieldName]) + '. Remove one so it is unambiguous which is imported.');
                return;
            }

            claimedBy[fieldName] = text;
            map[fieldName] = idx;
        }, this);

        if (!Object.keys(map).length) {
            // Every cell of an entirely blank header row was skipped above without comment, so say what is
            // wrong rather than reporting a missing value on all 250 rows that follow.
            if (!errors.length) {
                errors.push('The first row must name the columns being imported.');
            }

            return map;
        }

        // A required field with no column at all is a property of the header row, not of each row, so report it
        // once here rather than as a missing value repeated down every row.
        Ext4.each(this.requiredFieldNames, function(fieldName){
            if (this.getFieldIndex(map, fieldName) === -1) {
                errors.push('Missing required column: ' + Ext4.util.Format.htmlEncode(fieldName) + '.');
            }
        }, this);

        return map;
    },

    getFieldIndex: function(headerMap, fieldName){
        return Object.prototype.hasOwnProperty.call(headerMap, fieldName) ? headerMap[fieldName] : -1;
    },

    // How wide a data row has to be: far enough to reach the last column a REQUIRED field was mapped to.
    // Measuring against every mapped column instead would reject a row whose only absent cells were empty in
    // the source anyway, which is an ordinary shape -- the last row of a spreadsheet selection often leaves an
    // optional trailing cell blank.
    getRequiredColumnCount: function(headerMap){
        return this.requiredFieldNames.reduce((count, fieldName) => {
            const idx = this.getFieldIndex(headerMap, fieldName);

            return idx === -1 ? count : Math.max(count, idx + 1);
        }, 0);
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
        // left for the loop below.
        const idIdx = this.getFieldIndex(headerMap, 'Id');
        if (idIdx !== -1) {
            // A row shorter than the header row leaves this undefined, which checkRequired() reports.
            obj.Id = this.upperCaseAnimalId && Ext4.isString(row[idIdx]) ? row[idIdx].toUpperCase() : row[idIdx];
        }

        const dateIdx = this.getFieldIndex(headerMap, 'date');
        if (dateIdx !== -1) {
            obj.date = this.resolveDate('date', row[dateIdx], errors, rowIdx);
        }

        const projectIdx = this.getFieldIndex(headerMap, 'project');
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

            // Every spelling the header row might have used was resolved to a field name up front, so a
            // label or any import alias the user pasted is already accounted for by this one lookup.
            const index = this.getFieldIndex(headerMap, field.name);
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
