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
            },
            tpl : [
                '<tpl for=".">' +
                    '<div class="x-combo-list-item">' +
                    '{[ values["secondaryCategory"] ? "<b>"+values["secondaryCategory"]+":</b> "  : "" ]}' +
                    '{[ (values["meaning"] || values["code/meaning"]) ? (values["meaning"] || values["code/meaning"])+" ("+values["code"]+")" : ' +
                    'values["code"]]}' +
                '&nbsp;</div></tpl>']
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
        return;

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
                        s.addRecord({subset: 'SNOMED Codes'})
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
        delete this.store.baseParams['query.maxRows'];

        if(!subset || subset == 'All'){
            this.store.baseParams['query.queryName'] = 'snomed';
            this.store.baseParams['query.columns'] = 'code,meaning';
            this.store.baseParams['query.sort'] = 'meaning';
            if(this.store.sortInfo){
                this.store.sortInfo.field = 'meaning';
                delete this.store.baseParams['query.primaryCategory~eq'];
            }
            this.displayField = 'meaning';
        }
        else if (subset == 'SNOMED Codes'){
            this.store.baseParams['query.queryName'] = 'snomed';
            this.store.baseParams['query.columns'] = 'code';
            this.store.baseParams['query.sort'] = 'code';
            if(this.store.sortInfo){
                this.store.sortInfo.field = 'code';
                delete this.store.baseParams['query.primaryCategory~eq'];
            }
            this.displayField = 'code';
        }
        else {
            delete this.store.baseParams['query.primaryCategory~eq'];
            LABKEY.Filter.appendFilterParams(this.store.baseParams, [LABKEY.Filter.create('primaryCategory', subset, LABKEY.Filter.Types.EQUAL)]);
            this.store.baseParams['query.queryName'] = 'snomed_subset_codes';
            this.store.baseParams['query.columns'] = 'secondaryCategory,code,code/meaning';
            this.store.baseParams['query.sort'] = 'secondaryCategory,code/meaning';
            if(this.store.sortInfo){
                this.store.sortInfo.field = 'meaning';
                this.store.sortInfo.field = 'secondaryCategory,code/meaning';
            }
            this.displayField = 'code/meaning';
        }

        this.store.load();

        if(this.view)
            this.view.setStore(this.store);
    },

    setDisabled: function(val){
        this.callParent(arguments);

        if(this.filterCombo)
            this.filterCombo.setDisabled(val);
    },

    setVisible: function(val){
        this.callParent(arguments);

        if(this.filterCombo)
            this.filterCombo.setVisible(val);
    },

    reset: function(){
        this.callParent(arguments);

        if(this.filterCombo)
            this.filterCombo.reset();
    }
});
