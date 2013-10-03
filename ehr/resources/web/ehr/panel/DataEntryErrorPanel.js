/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.panel.DataEntryErrorPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ehr-dataentryerrorpanel',

    initComponent: function(){
        Ext4.apply(this, {
            border: false,
            defaults: {
                border: false
            }
        });

        this.callParent(arguments);

        this.mon(this.storeCollection, 'validation', this.updateErrorMessages, this, {buffer: 200});
        this.mon(this.storeCollection, 'commitcomplete', this.updateErrorMessages, this, {buffer: 200});
        this.mon(this.storeCollection, 'commitexception', this.updateErrorMessages, this, {buffer: 200});
    },

    updateErrorMessages: function(sc){
        var errorObj = sc.getErrorMessages(true);

        var items = [];
        for (var storeLabel in errorObj){
            var arr = [{
                html: '<i>' + storeLabel + ':</i>',
                style: 'padding-top: 5px;'
            }];

            Ext4.Array.forEach(errorObj[storeLabel], function(i){
                arr.push({
                    html: i,
                    style: 'padding-left: 5px;'
                });
            }, this);

            items = items.concat(arr);
        }

        this.removeAll();
        if (items.length){
            items.unshift({
                html: 'The form has the following errors and warnings:',
                style: 'padding-bottom: 10px;padding-top: 10px;'
            });

            this.add(items)
        }
    }
});