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
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.ehr-snomedcombo',

    initComponent: function(){
        LABKEY.ExtAdapter.apply(this, {
            queryMode: 'local',
            displayField: 'code/meaning',
            valueField: 'code',
            listWidth: 300,
            allowAnyValue: true,
            store: {
                type: 'labkey-store',
                schemaName: 'ehr_lookups',
                queryName: 'snomed_subset_codes',
                columns: 'secondaryCategory,code,code/meaning',
                sort: 'secondaryCategory,code/meaning',
                storeId: ['ehr_lookups', 'snomed', 'code', 'meaning', this.queryName, (this.dataIndex || this.name)].join('||'),
                maxRows: 0,
                autoLoad: false
            }
        });

        this.listConfig = this.listConfig || {};
        Ext4.apply(this.listConfig, {
            innerTpl: '{[ values["secondaryCategory"] ? "<b>"+values["secondaryCategory"]+":</b> "  : "" ]}' +
                '{[ (values["meaning"] || values["code/meaning"]) ? (values["meaning"] || values["code/meaning"])+" ("+values["code"]+")" : ' +
                'values["code"]]}',
            getInnerTpl: function(){
                return this.innerTpl;
            },
            style: 'border-top-width: 1px;' //this was added in order to restore the border above the boundList if it is wider than the field
        });

        this.callParent(arguments);

        this.filterComboCfg = {};
    },

    onRender: function(){
        this.callParent(arguments);

        //if there is a storeCfg property, we render a combo with common remarks
        if(this.filterComboCfg){
            this.addCombo();
        }

    },

    addCombo: function(){
        var div = this.container.insertFirst({
            tag: 'div',
            style: 'padding-bottom: 5px;'
        });

        if(LABKEY.ActionURL.getParameter('useSnomedCodes')){
            this.defaultSubset = 'SNOMED Codes';
        }

        var config = LABKEY.ExtAdapter.applyIf(this.filterComboCfg, {
            xtype: 'combo',
            renderTo: div,
            width: this.width,
            disabled: this.disabled,
            emptyText: 'Pick subset...',
            typeAhead: true,
            mode: 'local',
            isFormField: false,
            boxMaxWidth: 200,
            valueField: 'subset',
            displayField: 'subset',
            triggerAction: 'all',
            initialValue: this.defaultSubset,
            value: this.defaultSubset,
            nullCaption: 'All',
            store: {
                type: 'labkey-store',
                schemaName: 'ehr_lookups',
                queryName: 'snomed_subsets',
                sort: 'subset',
                //NOTE: this can potentially be a lot of records, so we initially load with zero
                //maxRows: 0,
                autoLoad: true,
                listeners: {
                    scope: this,
                    load: function(s){
                        s.add({subset: 'SNOMED Codes'})
                    }
                },
                nullRecord: {
                    displayColumn: 'subset',
                    nullCaption: 'All'
                }
            },
            listeners: {
                scope: this,
                change: this.applyFilter
            }
        });

        this.filterCombo = Ext4.ComponentMgr.create(config);
        if(this.defaultSubset){
            this.applyFilter(this.filterCombo, this.defaultSubset)
        }
    },

    applyFilter: function(combo, subset){
        this.store.removeAll();
        delete this.store.maxRows;

        if(!subset || subset == 'All' || subset == 'SNOMED Codes'){
            this.store.queryName = 'snomed';
            this.store.columns = 'code,meaning';
            this.store.initialConfig.sort = 'meaning';
            delete this.store.filterArray;

            if (subset == 'SNOMED Codes')
                this.displayField = 'code';
            else
                this.displayField = 'meaning';
        }
        else {
            this.store.filterArray = [LABKEY.Filter.create('primaryCategory', subset, LABKEY.Filter.Types.EQUAL)];
            this.store.queryName = 'snomed_subset_codes';
            this.store.columns = 'secondaryCategory,code,code/meaning';
            this.store.initialConfig.sort = 'secondaryCategory,code/meaning';

            this.displayField = 'code/meaning';
        }

        this.store.load();

        if(this.view)
            this.view.setStore(this.store);
    },

    setDisabled: function(val){
        if(this.filterCombo)
            this.filterCombo.setDisabled(val);

        this.callParent(arguments);
    },

    setVisible: function(val){
        if(this.filterCombo)
            this.filterCombo.setVisible(val);

        this.callParent(arguments);
    },

    reset: function(){
        if(this.filterCombo)
            this.filterCombo.reset();

        this.callParent(arguments);
    },

    destroy: function(){
        if(this.filterCombo)
            this.filterCombo.destroy();

        this.callParent(arguments);
    }
});
