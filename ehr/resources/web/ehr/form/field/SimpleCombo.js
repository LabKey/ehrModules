/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.form.field.SimpleCombo', {
    extend: 'LABKEY.ext4.ComboBox',
    alias: 'widget.ehr-simplecombo',

    initComponent: function(){
        Ext4.apply(this, {
            store: {
                type: 'labkey-store',
                schemaName: this.schemaName,
                queryName: this.queryName,
                viewName: this.viewName,
                columns: this.columns,
                filterArray: this.filterArray,
                autoLoad: true
            }
        });

        this.callParent();
    }
});