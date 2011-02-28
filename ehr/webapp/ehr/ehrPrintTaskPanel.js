/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

Ext.namespace('EHR.ext');

LABKEY.requiresScript("/ehr/ehrFormPanel.js");



EHR.ext.PrintTaskPanel = Ext.extend(Ext.Panel, {
    initComponent: function(){
        this.storeConfig = this.storeConfig || {};
        if(!this.storeConfig.filterArray){
            this.storeConfig.maxRows = 0;
            this.on('load', function(){
                delete this.maxRows;
            }, this, {single: true});
        }

        this.store = this.store || new EHR.ext.AdvancedStore(Ext.applyIf(this.storeConfig, {
            //xtype: 'ehr-store',
            containerPath: this.containerPath,
            schemaName: this.schemaName,
            queryName: this.queryName,
            viewName: this.viewName,
            columns: this.columns || EHR.ext.FormColumns[this.queryName] || '',
            storeId: [this.schemaName,this.queryName,this.viewName].join('||'),
            filterArray: this.filterArray || [],
            metadata: this.metadata
        }));

        if(this.store && this.queryName && this.schemaName){
            this.store.load();

            //a test for whether the store is loaded
            if(!this.store.fields){
                this.mon(this.store, 'load', this.loadQuery, this, {single: true});
            }
            else {
                this.loadQuery(this.store);
            }
        }
        else {
            //NOTE: inelegant
            this.hidden = true;
        }

        Ext.applyIf(this, {
            autoHeight: true
            ,autoWidth: true
            ,bodyBorder: false
            ,border: false
            ,bodyStyle: 'padding:5px'
            ,style: 'margin-bottom: 15px'
        });

        EHR.ext.PrintTaskPanel.superclass.initComponent.call(this);
    },
    loadQuery: function(store){
        var fields = [];

        var rows = [{tag: 'tr', children: []}];
        store.fields.each(function(field){
            //TODO: better flags on whether to show in print
            if(field.shownInInsertView && !field.hidden){
                fields.push({
                    meta: field,
                    renderer: EHR.ext.metaHelper.getDefaultRenderer({}, field),
                    editor: EHR.ext.metaHelper.getFormEditorConfig(field)
                });
                rows[0].children.push({tag: 'td', html: field.caption});
            }
        }, this);
        rows[0].children.push({tag: 'td', html: 'Notes'});

        store.each(function(rec){
            var row = {tag: 'tr', children: []};
            Ext.each(fields, function(field){
                var html = field.renderer(rec.get(field.meta.name), {}, rec);
                row.children.push({tag: 'td', html: html});

                //TODO: min width

            }, this);
            row.children.push({tag: 'td', html: ''});
            rows.push(row);
        }, this);

        this.body.createChild({
            tag: 'table',
            border: 1,
            //style: 'border-width:1px;',
            children: rows
        });
        this.doLayout();
    }
});
Ext.reg('ehr-printtaskpanel', EHR.ext.PrintTaskPanel);