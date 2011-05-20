/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.namespace('EHR.ext');

LABKEY.requiresScript("/ehr/ehrAPI.js");

EHR.ext.SearchPanel = Ext.extend(Ext.Panel, {

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
            items: [{html: 'Loading...'}, {}, {}],
            border: true,
            bodyBorder: false,
            width: 492,
            //forceLayout: true,
            autoHeight: true,
            keys: [
                {
                    key: Ext.EventObject.ENTER,
                    handler: this.onSubmit,
                    scope: this
                }
            ]
        });

        EHR.ext.SearchPanel.superclass.initComponent.call(this);

//        //default labkey fields that are not terribly useful to end users
//        var metaDefaults = {
//            metadata: {}
//            ,newFields: []
//        };
//        EHR.utils.rApplyIf(this, metaDefaults);

//        LABKEY.Query.getQueryDetails({
//            containerPath: this.containerPath
//            ,queryName: this.queryName
//            ,schemaName: this.schemaName
//            ,viewName: this.viewName
//            ,maxRows: 0
////            ,successCallback: this.onLoad
//            ,successCallback: function(results){
//                console.log(results)
//            }
//            ,errorCallback: EHR.utils.onError
//            ,scope: this
//        });

        this.store = new EHR.ext.AdvancedStore({
            containerPath: this.containerPath
            ,queryName: this.queryName
            ,schemaName: this.schemaName
            ,viewName: this.viewName
            ,maxRows: 0
            ,successCallback: this.onLoad
            ,errorCallback: EHR.utils.onError
            ,scope: this
            ,autoLoad: true
            ,metadata: this.metadata
            ,columns: this.columns
        });

        this.store.on('load', this.onLoad, this);

        Ext.Ajax.timeout = 120000; //in milliseconds
    },

    onLoad: function(store){
        this.removeAll();

        if (!store || !store.fields){
            this.add({tag: 'div', html: 'Error loading data'});
            this.doLayout();            
            return;
        }

        store.fields.each(function(f){
            this.createRow(f);
        }, this);

//        //append user-defined fields
//        Ext.each(this.newFields, function(c){
//            if(!c.jsonType)
//                c.jsonType = 'string';
//            this.createRow(c);
//        }, this);

        if (this.useContainerFilter){
            this.add({
                html: 'Container Filter:', width: 125
            },{
                xtype: 'ehr-containerfiltercombo'
                ,width: 165
                ,value: this.defaultContainerFilter || ''
                ,fieldType: 'containerFilterName'
                ,ref: 'containerFilterName'
            });
            this.add({html: ''});
        }

        if (this.allowSelectView!==false){
            this.add({
                html: 'View:', width: 125
            },{
                xtype: 'ehr-viewcombo'
                ,containerPath: this.containerPath
                ,queryName: this.queryName
                ,schemaName: this.schemaName
                ,width: 165
                ,initialValue: this.defaultView || ''
                ,fieldType: 'viewName'
                ,ref: 'viewNameField'
            });
            this.add({html: ''});
        }

        this.doLayout();
    },

   createRow: function(meta){
        if(meta.inputType == 'textarea')
            meta.inputType = 'textbox';

       //TODO: hack way to avoid snomed lookup combos
        if(meta.lookup && meta.lookup.queryName == 'snomed'){
            meta.lookups = false;
        }

        if (!meta.hidden && meta.selectable !== false){
            var replicates = 1;
            if(meta.duplicate)
                replicates = 2;

            for(var i=0;i<replicates;i++)
                this.addRow(meta);

        }
   },

   addRow: function(meta){
            //the label
            this.add({html: meta.caption+':', width: 150});

            if (meta.lookup && meta.lookups!==false){
                meta.xtype = 'lovcombo';
                meta.editorConfig = meta.editorConfig || {};
                meta.editorConfig.tpl = null;
                meta.editorConfig.separator = ';';
            }

            //create the field
            var theField = EHR.ext.metaHelper.getFormEditorConfig(meta);

            Ext.apply(theField, {
                nullable: true,
                allowBlank: true,
                width: 150,
                isSearchField: true
            });

            //the operator
            if(meta.jsonType=='boolean')
                this.add({});
            else if (theField.xtype == 'lovcombo'){
                theField.opField = this.add({
                    xtype: 'displayfield',
                    value: 'in',
                    hidden: true
                });
            }
            else
                theField.opField = this.add({
                    xtype: 'ehr-operatorcombo',
                    meta: meta,
                    width: 165
                });

            //the field itself
            this.add(theField);
    },
    onSubmit: function(){
        var params = {
            schemaName: this.schemaName,
            'query.queryName': this.queryName
        };

//        if(this.schemaName=='study'){
//            params['qcstate/publicdata~eq'] = true;
//        }

        if (this.containerFilterName && this.containerFilterName.getValue()){
            params['query.containerFilterName'] = this.containerFilterName.getValue();
        }

        if (this.viewNameField && this.viewNameField.getValue()){
            params['query.viewName'] = this.viewNameField.getValue();
        }

        this.items.each(function(item){
            if(!item.isSearchField)
                return;

            var op;
            if (item.opField && item.opField.getValue()){
                op = item.opField.getValue();
            }
            else {
                op = 'eq';
            }

            //TODO: .selectText() for select menus?
            var val = item.getValue();
            if (val || op == 'isblank' || op == 'isnonblank'){
                //NOTE: a hack to get around the null record display field of comboboxes
                if (val != '[none]')
                    params[('query.' + item.dataIndex + '~' + op)] = val;
            }
        }, this);

//        console.log(params)
        window.location = LABKEY.ActionURL.buildURL(
            'query',
            'executeQuery.view',
            (this.containerPath || LABKEY.ActionURL.getContainer()),
            params
        );
    }
});

Ext.reg('ehr-searchform', EHR.ext.SearchPanel);



