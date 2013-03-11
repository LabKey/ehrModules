/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.data.ClinicalHistoryStore', {
    extend: 'Ext.data.Store',
    alias: 'store.ehr-clinicalhistorystore',

    constructor: function(config){
        Ext4.apply(this, {
            proxy: {
                type: 'memory'
            },
            fields: ['group', 'id', 'date', 'timeString', 'category', 'html', 'lsid'],
            groupField: 'group',
            sorters: [{property: 'group', direction: 'DESC'}, {property: 'timeString'}]
        });

        this.callParent(config);
    },

    /**
     *
     * @param config.subjectIds
     * @param config.minDate
     * @param config.maxDate
     */
    reloadData: function(config){
        this.removeAll();
        this.isLoadingData = true;

        LABKEY.Ajax.request({
            url: LABKEY.ActionURL.buildURL('ehr', 'getClinicalHistory'),
            params: {
                subjectIds: config.subjectIds,
                minDate: config.minDate,
                maxDate: config.maxDate
            },
            scope: this,
            failure: LDK.Utils.getErrorCallback(),
            success: LABKEY.Utils.getCallbackWrapper(this.onLoad, this)
        });
    },

    onLoad: function(results){
        var toAdd = [];
        for (var id in results.results){
            Ext4.each(results.results[id], function(row){
                row.date = new Date(row.date);
                row.group = row.date.format('Y-m-d') + '_' + row.id;
                row.html = row.html ? row.html.replace(/\n/g, '<br>') : null;
                toAdd.push(this.createModel(row));
            }, this);
        }

        this.isLoadingData = false;
        if(toAdd.length)
            this.add(toAdd);
        else
            this.fireEvent('datachanged', this);
    }
});