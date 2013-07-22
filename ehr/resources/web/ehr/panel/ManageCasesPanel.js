/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg {String} animalId
 */
Ext4.define('EHR.panel.ManageCasesPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ehr-managecasespanel',

    initComponent: function(){
        Ext4.apply(this, {
            border: false,
            defaults: {
                border: false
            },
            items: [{
                html: 'Loading...'
            }]
        });

        this.callParent();

        this.loadData();
    },

    loadData: function(){
        this.store = Ext4.create('LABKEY.ext4.Store', {
            schemaName: 'study',
            queryName: 'Cases',
            columns: 'Id,date,enddate,category,remark,performedby',
            filterArray: [
                LABKEY.Filter.create('Id', this.subjectId, LABKEY.Filter.Types.EQUAL),
                LABKEY.Filter.create('isActive', true, LABKEY.Filter.Types.EQUAL)
            ],
            scope: this,
            listeners: {
                scope: this,
                load: this.onStoreLoad
            },
            autoLoad: true
        });
    },

    onStoreLoad: function(store){
        console.log(store);

        var toAdd = [];
        if (results && results.rows && results.rows.length){
            Ext4.Array.forEach(results.rows, function(row){
                var sr = new LDK.SelectRowsRow(row);

            }, this);
        }
        else {
            toAdd.push({
                html: 'No active cases'
            });
        }

        this.removeAll();
        this.add(toAdd);
    }
});