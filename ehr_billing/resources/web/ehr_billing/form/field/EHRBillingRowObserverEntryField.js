/*
 * Copyright (c) 2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


Ext4.define('EHR_Billing.form.field.EHRBillingRowObserverEntryField', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.ehr_billingRowObserverEntryField',

    typeAhead: true,
    forceSelection: true,
    emptyText: '',
    disabled: false,
    matchFieldWidth: false,
    containerPath: null,

    initComponent: function () {

        if (!this.originalConfig || !this.originalConfig.lookup) {
            Ext4.Msg.alert('Error', 'Lookup not defined for combo box');
        }

        if (!this.originalConfig.lookup.schemaName) {
            Ext4.Msg.alert('Error', 'Lookup schema not defined for combo box');
        }

        if (!this.originalConfig.lookup.queryName) {
            Ext4.Msg.alert('Error', 'Lookup query not defined for combo box');
        }
        var ctx = LABKEY.moduleContext.ehr_billing;

        Ext4.applyIf(this, {
            expandToFitContent: true,
            queryMode: 'local',
            anyMatch: true,
            schemaName: this.originalConfig.lookup.schemaName,
            queryName: this.originalConfig.lookup.queryName,
            store: {
                type: 'labkey-store',
                containerPath: this.containerPath ? this.containerPath : (ctx ? ctx['BillingContainer'] : null),
                schemaName: this.originalConfig.lookup.schemaName,
                sql: this.makeSql(),
                sort: this.originalConfig.lookup.sort,
                autoLoad: false,
                loading: true,
                listeners: {
                    scope: this,
                    delay: 50,
                    load: function(store){
                        this.getPicker().refresh();
                    }
                }
            },
            valueField: this.valueField,
            displayField: this.displayField,
            listeners: {
                scope: this,
                beforerender: function (field) {
                    this.getOptions();
                }
            }
        });

        this.callParent(arguments);

        this.on('focus', function() {
            if (!this.observedField) {
                Ext4.Msg.alert('Error', 'Observed field not provided.');
                return;
            }

            this.getOptions();
        }, this);
    },

    getOptions: function () {
        var boundRecord, val, label;
        if (this.column.initialConfig) {
            if (this.column.initialConfig.header) {
                label = this.column.initialConfig.header;
            }
            else if (this.column.initialConfig.name) {
                label = this.column.initialConfig.name;
            }
        }
        else {
            label = this.name;
        }
        this.emptyText = "Select " + label + "...";

        if (this.observedField) {
            boundRecord = EHR.DataEntryUtils.getBoundRecord(this);
            if (!boundRecord) {
                console.warn('no bound record found');
            }

            if (boundRecord)
                val = boundRecord.get(this.observedField);

        }

        var sql = this.makeSql(val);
        if (sql) {
            this.store.loading = true;
            this.store.sql = sql;
            this.store.removeAll();
            this.store.load();
        }
    },

    makeSql: function (val) {
        //avoid unnecessary reloading
        if (val && this.loadedVal === val) {
            return;
        }
        this.loadedVal = val;

        var sql = "SELECT DISTINCT " + this.originalConfig.lookup.columns
                + " FROM " + this.schemaName + "." + this.queryName;
        if (val) {
            sql += " WHERE " + this.observerLookupField + " = '" + val + "'";
        }

        return sql;
    }
});

