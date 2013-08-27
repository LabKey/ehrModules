/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * This creates a combobox suitable to display SNOMED results.  It is a 2-part field, where the top combo allows you to
 * select the 'snomed subset'.  When a subset is picked, the bottom combo loads that subset of codes.  This is designed as
 * a mechanism to support more managable sets of allowable values for SNOMED entry.  It is heavily tied to ehr_lookups.snomed_subsets
 * and ehr_lookups.snomed_subset_codes.
 * @param {object} config The configuation object.
 * @param {string} [config.defaultSubset] The default SNOMED subset to load
 * @param {object} [config.filterComboCfg] An Ext ComboBox config object that will be used when creating the top-combo of this field.
 *
 */
Ext4.define('EHR.form.field.SnomedCombo', {
    extend: 'Ext.form.FieldContainer',
    alias: 'widget.ehr-snomedcombo',

    //defaultSubset: '',

    initComponent: function(){
        this.comboWidth = this.width - this.labelWidth - 5;

        LABKEY.ExtAdapter.apply(this, {
            items: [this.getFilterComboCfg(), this.getSnomedComboCfg()]
        });

        this.callParent(arguments);
    },

    getSnomedComboCfg: function(){
        return {
            xtype: 'labkey-combo',
            itemId: 'snomedCombo',
            queryMode: 'local',
            displayField: 'code/meaning',
            valueField: 'code',
            width: this.comboWidth,
            forceSelection: true,
            caseSensitive: false,
            anyMatch: true,
            store: {
                type: 'labkey-store',
                schemaName: 'ehr_lookups',
                queryName: 'snomed_subset_codes',
                columns: 'secondaryCategory,code,code/meaning',
                sort: 'secondaryCategory,code/meaning',
                storeId: ['ehr_lookups', 'snomed', 'code', 'meaning', (this.dataIndex || this.name), this.id].join('||'),
                filterArray: this.getFilterArray(this.defaultSubset),
                autoLoad: true
            },
            listConfig: {
                innerTpl: '{[ values["secondaryCategory"] ? "<b>"+values["secondaryCategory"]+":</b> "  : "" ]}' +
                        '{[ (values["meaning"] || values["code/meaning"]) ? (values["meaning"] || values["code/meaning"])+" ("+values["code"]+")" : ' +
                        'values["code"]]}',
                getInnerTpl: function(){
                    return this.innerTpl;
                },
                style: 'border-top-width: 1px;' //this was added in order to restore the border above the boundList if it is wider than the field
            }
        }
    },

    getFilterArray: function(subset){
        if (!subset){
            if (this.rendered)
                subset = this.down('#filterCombo').getValue();
        }

        if (subset){
            return [LABKEY.Filter.create('primaryCategory', subset, LABKEY.Filter.Types.EQUAL)];
        }
    },

    getFilterComboCfg: function(){
        return {
            xtype: 'combo',
            itemId: 'filterCombo',
            emptyText: 'Pick subset...',
            typeAhead: true,
            isFormField: false,
            width: this.comboWidth,
            valueField: 'subset',
            displayField: 'subset',
            queryMode: 'local',
            initialValue: this.defaultSubset,
            value: this.defaultSubset,
            nullCaption: 'All',
            store: {
                type: 'labkey-store',
                schemaName: 'ehr_lookups',
                queryName: 'snomed_subsets',
                sort: 'subset',
                autoLoad: true,
                listeners: {
                    scope: this,
                    load: function(s){
                        s.add({subset: 'SNOMED Codes'})
                    }
                }
            },
            listeners: {
                scope: this,
                change: this.applyFilter
            }
        };
    },

    applyFilter: function(combo, subset){
        var snomedCombo = this.down('#snomedCombo');
console.log('applying filter: ' + subset);

        if(!subset || subset == 'All' || subset == 'SNOMED Codes'){
            snomedCombo.store.queryName = 'snomed';
            snomedCombo.store.columns = 'code,meaning';
            snomedCombo.store.initialConfig.sort = 'meaning';
            delete snomedCombo.store.filterArray;

            if (subset == 'SNOMED Codes')
                snomedCombo.displayField = 'code';
            else
                snomedCombo.displayField = 'meaning';
        }
        else {
            snomedCombo.store.filterArray = this.getFilterArray(subset);
            snomedCombo.store.queryName = 'snomed_subset_codes';
            snomedCombo.store.columns = 'secondaryCategory,code,code/meaning';
            snomedCombo.store.initialConfig.sort = 'secondaryCategory,code/meaning';

            snomedCombo.displayField = 'code/meaning';
        }

        snomedCombo.store.load();
    }
});
