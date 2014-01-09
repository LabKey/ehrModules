/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.panel.DataEntryErrorPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ehr-dataentryerrorpanel',

    initComponent: function(){
        Ext4.apply(this, {
            minHeight: 200,
            border: false,
            defaults: {
                border: false
            }
        });

        this.callParent(arguments);

        this.mon(this.storeCollection, 'validation', this.updateErrorMessages, this, {buffer: 1000});
        this.mon(this.storeCollection, 'commitcomplete', this.updateErrorMessages, this, {buffer: 200});
        this.mon(this.storeCollection, 'commitexception', this.updateErrorMessages, this, {buffer: 200});
    },

    cachedText: null,

    updateErrorMessages: function(sc){
        var errorObj = sc.getErrorMessages(true);

        var items = [];
        var texts = [];
        for (var storeLabel in errorObj){
            var arr = [{
                xtype: 'container',
                html: '<i>' + storeLabel + ':</i>',
                style: 'padding-top: 5px;'
            },{
                xtype: 'container',
                html: errorObj[storeLabel].join('<br>'),
                style: 'padding-left: 5px;'
            }];
            items = items.concat(arr);

            texts.push(storeLabel + '||' + errorObj[storeLabel].join('||'));
        }

        texts = texts.join('<>');
        if (texts !== this.cachedText){
            this.removeAll();
            if (items.length){
                items.unshift({
                    xtype: 'container',
                    html: 'The form has the following errors and warnings:',
                    style: 'padding-bottom: 10px;padding-top: 10px;'
                });

                this.add(items);
            }

            this.cachedText = texts;
        }
    }
});