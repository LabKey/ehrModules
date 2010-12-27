/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.namespace('EHR.ext.customPanels');

LABKEY.requiresScript("/ehr/utilities.js");

EHR.ext.customPanels.searchForm = Ext.extend(Ext.Panel, {

    initComponent: function(){
        Ext.applyIf(this, {
            padding: '5px',
            title: this.title,
            layout: 'table',
            layoutConfig: {columns: 3},
            buttons: [
                {text: 'Submit', scope: this, handler: this.onSubmit}
            ],
            defaults: {
                border: false,
                bodyBorder: false
            },
            //items: [{html: 'Loading...'}],
            border: true,
            bodyBorder: false,
            width: 492,
//            forceLayout: true,
            autoHeight: true,
            keys: [
                {
                    key: Ext.EventObject.ENTER,
                    handler: this.onSubmit,
                    scope: this
                }
            ]
        });

        EHR.ext.customPanels.searchForm.superclass.initComponent.call(this);

        //default labkey fields that are not terribly useful to end users
        var metaDefaults = {
            metadata: {
                Id: {lookups: false}
                ,TotalRoommates: {hidden: true}
                ,Created: {hidden: true}
                ,CreatedBy: {hidden: true}
                ,Modified: {hidden: true}
                ,ModifiedBy: {hidden: true}
                ,objectid: {hidden: true}
                ,ts: {hidden: true}
                ,Dataset: {hidden: true}
                ,AgeAtTime: {hidden: true}
                ,QCState: {hidden: true}
                ,created: {hidden: true}
                ,modified: {hidden: true}
                ,SequenceNum: {hidden: true}
                ,AnimalVisit: {hidden: true}
                ,EntityId: {hidden: true}
                ,Notes: {hidden: true}
            }
            ,newFields: []
        };
        EHR.UTILITIES.rApplyIf(this, metaDefaults);

        LABKEY.Query.getQueryDetails({
            queryName: this.queryName
            ,schemaName: this.schemaName
            ,viewName: this.viewName
            ,maxRows: 0
            ,successCallback: this.onLoad
            ,errorCallback: EHR.UTILITIES.onError
            ,scope: this
        });

        this.viewStore = new Ext.data.ArrayStore({
            fields: [
                'value',
                'displayText'
            ],
            idIndex: 0,
            data: []
        });

        LABKEY.Query.getQueryViews({
            queryName: this.queryName
            ,schemaName: this.schemaName
            ,successCallback: function(data){
                if(!data || !data.views) return;

                var recs = [];
                Ext.each(data.views, function(s){
                    recs.push([s.name, s.name || 'Default']);
                }, this);
                this.viewStore.loadData(recs);
                this.viewStore.sort('value');
            }
            ,errorCallback: EHR.UTILITIES.onError
            ,scope: this
        });

        Ext.Ajax.timeout = 120000; //in milliseconds
    },

    onLoad: function(results){
        if (!results || !results.columns){
            this.removeAll();
            this.add({tag: 'div', html: 'Error loading data'});
            this.doLayout();            
            return;
        }

        Ext.each(results.columns, function(c){
            this.addRow(c);
        }, this);

        //append user-defined fields
        Ext.each(this.newFields, function(c){
            this.addRow(c);
        }, this);

        if (this.allowSelectView!==false){
            this.add({
                html: 'View:', width: 125
            },
                new Ext.form.ComboBox({
                    valueField:'value'
                    ,typeAhead: false
                    ,mode: 'local'
                    ,width: 165
                    ,triggerAction: 'all'
                    ,editable: false
                    ,lazyRender: false
                    ,lazyInit: false
                    ,displayField:'displayText'
                    ,value: this.defaultView || ''
                    ,store: this.viewStore
                })
            );
        }

        this.doLayout();
    },

   addRow: function(meta){
        Ext.apply(meta, {lookupNullCaption: '', ext: {width: 150, lazyInit: false, editable: false, type: 'formField'}});
        if(meta.inputType == 'textarea')
            meta.inputType = 'textbox';

        //allow metadata override
        if (this.metadata && this.metadata[meta.name]){
            EHR.UTILITIES.rApply(meta, this.metadata[meta.name])
        }

        if (!meta.hidden && meta.selectable !== false){
            //the label
            this.add({html: meta.caption+':', width: 150});

            //the operator
            if ((!meta.lookup || false === meta.lookups)){
                this.add(EHR.ext.customFields.OperatorCombo(meta));
            }
            else {
                this.add({html: ''})
            }
            //the field itself
            this.add(LABKEY.ext.FormHelper.getFieldEditor(meta));
        }
    },
    
    onSubmit: function(){
        var params = {
            schemaName: this.schemaName,
            'query.queryName': this.queryName
        };

        var loops = (this.items.items.length - 2) /3;

        for (var i=0;i<loops;i++){
            var op;
            if (this.items.items[(i*3)+1].getValue){
                op = this.items.items[(i*3)+1].getValue();
            }
            else {
                op = 'eq';
            }

            //TODO: .selectText() for select menus?
            var field = this.items.items[(i*3)+2];

            if (i == (loops - 1) && this.items.items[(i*3)+4].getValue() != null){
                params['query.viewName'] = this.items.items[(i*3)+4].getValue();
            }

            var val = field.getValue();
            if (val || op == 'isblank' || op == 'isnonblank'){
                //NOTE: a hack to get around the null record display field of comboboxes
                if (val != '[none]')
                    params[('query.' + field.originalConfig.name + '~' + op)] = val;
            }
        }

        window.location = LABKEY.ActionURL.buildURL(
            'query',
            'executeQuery.view',
            (this.containerPath || LABKEY.ActionURL.getContainer()),
            params
        );
    }
});

Ext.reg('EHR_searchForm', EHR.ext.customPanels.searchForm);
