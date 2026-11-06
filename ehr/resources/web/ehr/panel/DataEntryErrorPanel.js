/*
 * Copyright (c) 2013-2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.panel.DataEntryErrorPanel', {
    extend: 'Ext.container.Container',
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
        this.mon(this.storeCollection, 'validationcomplete', this.updateErrorMessages, this, {buffer: 50});
        this.mon(this.storeCollection, 'commitcomplete', this.updateErrorMessages, this, {buffer: 200});
        this.mon(this.storeCollection, 'commitexception', this.updateErrorMessages, this, {buffer: 200});

        // TEMP DEBUG: trace error panel refreshes on TeamCity
        Ext4.each(['validation', 'validationcomplete'], function(ev){
            this.mon(this.storeCollection, ev, function(){ this.debugLog('event ' + ev); }, this);
        }, this);
    },

    debugLog: function(msg){
        var editing = Ext4.Array.map(this.dataEntryPanel.query('[isDataEntrySection]'), function(s){
            return (s.title || s.id) + '=' + !!(s.editingPlugin && s.editingPlugin.editing);
        }).join(',');
        LDK.Utils.logToServer({level: 'INFO', includeContext: false, message: 'DEBUG DataEntryErrorPanel ' + Date.now() + ' ' + msg + ' | editing: ' + editing});
    },

    cachedText: null,

    updateErrorMessages: function(){
        if (this.dataEntryPanel.isEditing(this.updateErrorMessages, this)){
            this.debugLog('update deferred, isEditing');
            return;
        }

        if (!this.rendered){
            LDK.Utils.logToServer({
                level: 'ERROR',
                message: 'DataEntryErrorPanel.updateErrorMessages() was called even though it is not rendered'
            });

            return;
        }

        var errorObj = this.storeCollection.getErrorMessages(true);

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
        this.debugLog('update run, changed=' + (texts !== this.cachedText) + ' texts=' + texts);
        if (texts !== this.cachedText){
            if (this.dataEntryPanel.isEditing(this.updateErrorMessages, this)){
                this.debugLog('update aborted late, isEditing');
                console.log('is editing, aborting error message update');
                return;
            }
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