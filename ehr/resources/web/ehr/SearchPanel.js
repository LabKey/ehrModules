/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.namespace('EHR.ext');

LABKEY.requiresScript("/ehr/ehrAPI.js");

/**
 * Constructs a new EHR SearchPanel using the supplied configuration.
 * @class
 * EHR extension to Ext.Panel, which constructs a search page for a single query, based on the query's metadata.
 *
 * <p>If you use any of the LabKey APIs that extend Ext APIs, you must either make your code open source or
 * <a href="https://www.labkey.org/wiki/home/Documentation/page.view?name=extDevelopment">purchase an Ext license</a>.</p>
 *            <p>Additional Documentation:
 *              <ul>
 *                  <li><a href="https://www.labkey.org/wiki/home/Documentation/page.view?name=javascriptTutorial">LabKey JavaScript API Tutorial</a></li>
 *                  <li><a href="https://www.labkey.org/wiki/home/Documentation/page.view?name=labkeyExt">Tips for Using Ext to Build LabKey Views</a></li>
 *              </ul>
 *           </p>
 * @constructor
 * @augments Ext.Panel
 * @param config Configuration properties. This may contain any of the configuration properties supported by the Ext.Panel, plus those listed here.
 * @param {String} [config.containerPath] The container path from which to query the server. If not specified, the current container is used.
 * @param {String} [config.schemaName] The LabKey schema to query.
 * @param {String} [config.queryName] The query name within the schema to fetch.
 * @param {String} [config.viewName] A saved custom view of the specified query to use if desired.
 * @param {Object} [config.metadata] A metadata object that will be applied to the default metadata returned by the server.  See EHR.Metadata or EHR.ext.AdvancedStore for more information.
 * @param {String} [config.columns] A comma separated list of columns to display.
 * @param (boolean) [config.useContainerFilter] Dictates whether a combobox appears to let the user pick a container filter when searching.
 * @param (string) [config.defaultContainerFilter] The default container filter in the combo.  If provided, but showContainerFilter is false, this container filter will be silently applied to the search.
 * @param (boolean) [config.allowSelectView] Dictates whether a combobox appears to let the user pick a view.
 * @param (string) [config.defaultView] If provided, this view will be initially selected in the views combo.
 * @example &lt;script type="text/javascript"&gt;
    var panel;
    Ext.onReady(function(){
        var panel = new EHR.ext.SearchPanel({
            schemaName: 'core',
            queryName: 'users'
            renderTo: 'targetDiv',
            width: 800,
            autoHeight: true,
            title: 'Search Users'
        });
    });


&lt;/script&gt;
&lt;div id='targetDiv'/&gt;
 */
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

        this.store = new EHR.ext.AdvancedStore({
            containerPath: this.containerPath
            ,queryName: this.queryName
            ,schemaName: this.schemaName
            ,viewName: this.viewName
            ,maxRows: 0
            ,includeTotalCount: false
            ,timeout: 0
            ,scope: this
            ,autoLoad: true
            ,metadata: this.metadata
            ,columns: this.columns
        });

        this.store.on('load', this.onLoad, this);
        this.store.on('commitexception', EHR.Utils.onError, this);

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
            if (meta.lookup && meta.lookups!==false){
                meta.xtype = 'lovcombo';
                meta.editorConfig = meta.editorConfig || {};
                meta.editorConfig.tpl = null;
                meta.editorConfig.separator = ';';
            }

            //create the field
            var theField = EHR.ext.metaHelper.getFormEditorConfig(meta);

            //difficult to differentiate between false and null.
            //the former indicates user input, in which case a filter should be applied.
            // the latter indicates the user did nothing and this field should be ignored
            //for ease, we just skip them for now.  a future solution might use a combo instead
            if(theField.xtype == 'checkbox')
                return;

            //the label
            this.add({html: meta.caption+':', width: 150});

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
            if (!Ext.isEmpty(val) || op == 'isblank' || op == 'isnonblank'){
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



