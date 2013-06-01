/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg subjectId
 * @cfg minDate
 * @cfg maxDate
 * @cfg maxGridHeight
 * @cfg autoLoadRecords
 */
Ext4.define('EHR.panel.ClinicalHistoryExportPanel', {
    extend: 'Ext.panel.Panel',

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

        this.createStore();
        this.store.on('datachanged', this.onStoreLoad, this);

        this.store.reloadData({
            subjectIds: this.subjectIds,
            caseId: this.caseId,
            minDate: this.minDate,
            maxDate: this.maxDate
        });
    },

    createStore: function(){
        this.store = Ext4.create('EHR.data.ClinicalHistoryStore', {
            type: 'ehr-clinicalhistorystore'
        });
    },

    onStoreLoad: function(store){
        var toAdd = [];
        //store.sort('group');

        var oldGroup = null;
        store.each(function(r){
            if (oldGroup != r.get('group')){
                if (oldGroup)
                    toAdd.push('<br>');

                var date = LDK.ConvertUtils.parseDate(r.get('date'));
                toAdd.push('<h2>' + r.get('id') + ': ' + date.format('Y-m-d') + '</h2><br>');
            }
            oldGroup = r.get('group');

            toAdd.push(r.get('category') + '<br>' + r.get('html') + '<br>');
        }, this);

        this.removeAll();
        this.add({
            html: toAdd.join('').replace(/\n/g, '<br>')
        });
    }
});