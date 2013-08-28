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
 * @param {object} [config.showFilterCombo] Defaults to true
 *
 */
Ext4.define('EHR.form.field.SnomedCombo', {
    extend: 'Ext.form.FieldContainer',
    alias: 'widget.ehr-snomedcombo',

    showFilterCombo: null,
    //defaultSubset: '',

    initComponent: function(){
        this.getSnomedStore();
        this.comboWidth = this.width - this.labelWidth - 5;

        LABKEY.ExtAdapter.apply(this, {
            items: [this.getFilterCombo(), this.getSnomedCombo()]
        });

        this.callParent(arguments);

        this.on('render', this.toggleFilterCombo, this);

//        this.mon(Ext4.getBody(), 'click', this.onBodyClick, this);
    },

    shouldShowFilterCombo: function(){
        if (this.showFilterCombo === null){
            if (this.up('editor'))
                return false;
            else
                return true;
        }
        else {
            return this.showFilterCombo;
        }
    },

    toggleFilterCombo: function(){
        this.filterCombo.setVisible(this.shouldShowFilterCombo());
    },

//    onBodyClick: function(event){
//        var editor = this.up('editor');
//        if (!editor)
//            return;
//
//        if (!editor.rendered || !editor.isVisible())
//            return;
//
//        var cx = event.getX(), cy = event.getY(), box = editor.getBox();
//
//        if (cx < box.x || cx > box.x + box.width || cy < box.y || cy > box.y + box.height) {
//            console.log('blur');
//            this.fireEvent('blur', this, event);
//        }
//    },

    getSnomedStore: function(){
        if (this.snomedStore)
            return this.snomedStore;

        this.snomedStore = EHR.DataEntryUtils.getSnomedStore();

        if (!this.snomedStore.loading){
            if (this.filterCombo && this.filterCombo.getValue())
                this.applyFilter(this.filterCombo.getValue());
        }

        this.mon(this.snomedStore, 'load', function(){
            if (this.filterCombo && this.filterCombo.getValue())
                this.applyFilter(this.filterCombo.getValue());
        }, this);

        return this.snomedStore;
    },

    getSnomedCombo: function(){
        this.snomedCombo = Ext4.widget({
            xtype: 'labkey-combo',
            itemId: 'snomedCombo',
            queryMode: 'local',
            name: this.name,
            snomedStore: this.snomedStore,
            displayField: 'meaning',
            valueField: 'code',
            width: this.comboWidth,
            forceSelection: true,
            caseSensitive: false,
            anyMatch: true,
            store: {
                type: 'labkey-store',
                schemaName: 'ehr_lookups',
                storeId: 'snomedStore_' + this.id,
                queryName: 'snomed_combo_list',
                columns: 'code,meaning,categories',
                sort: 'meaning',
                maxRows: 0,
                autoLoad: true,
                listeners: {
                    scope: this,
                    load: function(s){
                        if (this.filterCombo && this.filterCombo.getValue())
                            this.applyFilter(this.filterCombo.getValue());
                    }
                }
            },
            listConfig: {
                innerTpl: '{[ (values["meaning"] || values["code/meaning"]) ? (values["meaning"] || values["code/meaning"])+" ("+values["code"]+")" : ' +
                        'values["code"]]}',
                getInnerTpl: function(){
                    return this.innerTpl;
                },
                style: 'border-top-width: 1px;' //this was added in order to restore the border above the boundList if it is wider than the field
            },
            ensureRecord: function(val){
                var recIdx = this.store.find('code', val);
                if (recIdx == -1){
                    recIdx = this.snomedStore.find('code', val);

                    if (recIdx != -1){
                        this.store.add(this.snomedStore.getAt(recIdx));
                    }
                }
            },
            listeners: {
                scope: this,
                blur: function(field, e){
                    if (!this.filterCombo.hasFocus && !this.snomedCombo.hasFocus){
                        this.fireEvent('blur', field, e);
                    }
                }
            }
        });

        Ext4.override(this.snomedCombo, {
            setValue: function(val){
                if (Ext4.isString(val))
                    this.ensureRecord(val);

                this.callOverridden(arguments);
            }
        });

        return this.snomedCombo;
    },

    getFilterCombo: function(){
        this.filterCombo = Ext4.widget({
            xtype: 'combo',
            itemId: 'filterCombo',
            hidden: !this.shouldShowFilterCombo(),
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
                        s.add({subset: 'All'});
                    }
                }
            },
            listeners: {
                scope: this,
                change: function(field, val){
                    this.applyFilter(val);
                },
                blur: function(field, e){
                    if (!this.filterCombo.hasFocus && !this.snomedCombo.hasFocus){
                        this.fireEvent('blur', field, e);
                    }
                }
            }
        });

        return this.filterCombo;
    },

    applyFilter: function(subset){
        var snomedCombo = this.down('#snomedCombo');
        var code = snomedCombo.getValue();

        if (this.snomedStore.loading){
            return;
        }

        snomedCombo.store.removeAll();

        var records = [];
        if (!subset || subset == 'All'){
            records = this.snomedStore.getRange();
        }
        else {
            var re = new RegExp('(,|^)' + subset + '(,|$)');
            this.snomedStore.each(function(r){
                if (r.get('categories') && r.get('categories').match(re))
                    records.push(r);
            }, this);
        }

        snomedCombo.store.add(records);
        if (code)
            snomedCombo.ensureRecord(code);
    },

    reset: function(){
        this.snomedCombo.reset();
        if (this.filterCombo)
            this.filterCombo.reset();
    },

    setValue: function(val){
        this.snomedCombo.setValue(val);
    },

    getValue: function(){
        return this.snomedCombo.getValue();
    },

    isValid: function(){
        return this.snomedCombo.isValid();
    },

    validate: function(){
        return this.snomedCombo.validate();
    },

    focus: function(selectText, delay, callback, scope){
        this.snomedCombo.focus(selectText, delay, callback, scope);
    }
});
