/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.namespace('EHR.ext.customPanels');

LABKEY.requiresScript("/ehr/utilities.js");

EHR.ext.customPanels.searchForm = Ext.extend(Ext.Panel, {

    constructor: function(config){

        var defaults = {
            allowSelectView: true
            ,excludeAll: false
            ,showHidden: false
            //default labkey fields not terribly useful to end users
            ,metadata: {
                QCState: {isHidden: true}
                ,created: {isHidden: true}
                ,modified: {isHidden: true}
                ,SequenceNum: {isHidden: true}
                ,AnimalVisit: {isHidden: true}
                ,EntityId: {isHidden: true}
            }
            ,newFields: []
        };

        //allow config by URL
        var urlParams = ['queryName', 'schemaName', 'title'];
        for (var i=0;i<urlParams.length;i++){
            if (LABKEY.ActionURL.getParameter(urlParams[i])){
                this.config.schemaName = LABKEY.ActionURL.getParameter(urlParams[i])
            }    
        }

        this.config = EHR.UTILITIES.rApply(defaults, config);

        var queryDetailsCfg = {
            queryName: this.config.queryName
            ,schemaName: this.config.schemaName
            ,successCallback: function(data){this.queryDetails = data}
            ,errorCallback: EHR.UTILITIES.onError
            ,scope: this
        };

        var queryDetailsCfg2 = {
            queryName: 'test'
            ,schemaName: 'lists'
            ,successCallback: function(data){this.queryDetails2 = data}
            ,errorCallback: EHR.UTILITIES.onError
            ,scope: this
        };

        var querySelectCfg = {
            queryName: 'test'
            ,schemaName: 'lists'
            ,successCallback: function(data){this.selectRows = data}
                //this.onFinalRender
            ,errorCallback: EHR.UTILITIES.onError
            ,maxRows: 0
            ,scope: this
        };

        if (this.config.defaultView){
            queryDetailsCfg.viewName = this.config.defaultView;
            querySelectCfg.viewName = this.config.defaultView;
        }

        var getViewCfg = {
            queryName: this.config.queryName
            ,schemaName: this.config.schemaName
            ,successCallback: function(data){this.viewCfg = data}
            ,errorCallback: EHR.UTILITIES.onError
            ,scope: this
        };

        var request = new LABKEY.MultiRequest({listeners: {'done': this.onFinalRender, scope: this}});
        request.add(LABKEY.Query.getQueryDetails, queryDetailsCfg);
        request.add(LABKEY.Query.getQueryViews, getViewCfg);

        Ext.Ajax.timeout = 120000; //in milliseconds
        request.send({});

        EHR.ext.customPanels.searchForm.superclass.constructor.call(this, {
            items: [{html: 'Loading...'}],
            border: true,
            bodyBorder: false,
            defaults: {
                border: false
                ,bodyBorder: false
            },
            width: 492,
            //width: 1200,
            forceLayout: true,
            autoHeight: true,
            keys: [
                {
                    key: Ext.EventObject.ENTER,
                    handler: this.onSubmit,
                    scope: this
                }
            ]
        });

    },

    onFinalRender: function(){
        
        if (!this.queryDetails || !this.queryDetails.columns){
            this.remove(this.items.items[0]);
            this.add({tag: 'div', html: 'Error loading data'});
            this.doLayout();            
            return;
        }

        this.panelConfig = {
            frame: false,
//            border: true,
            padding: '5px',            
            bodyBorder: false,
            border: false,
            cls: 'x-labkey-wp',
            title: this.config.title,
            forceLayout: true,
            layout: 'table',
            layoutConfig: {columns: 3},
            items: [],
            buttons: [
                {text: 'Submit', scope: this, handler: this.onSubmit}
            ],
            defaults: {
                border: false,
                bodyBorder: false
            }

        };

        for (var i=0;i<this.queryDetails.columns.length;i++){
            this.addRow(this.queryDetails.columns[i]);
        }

        //append user-defined fields
        for (var i=0;i<this.config.newFields.length;i++){
            this.addRow(this.config.newFields[i]);
        }

        if (this.config.allowSelectView){
            this.appendViews(this.queryDetails);
        }

        this.remove(this.items.items[0]);
        this.add(new Ext.Panel(this.panelConfig));
        this.doLayout();

    },
    onSubmit: function(){
        var params = {schemaName: this.config.schemaName, 'query.queryName': this.config.queryName};
        var thePanel = this.items.items[0];
        var loops = (thePanel.items.items.length - 2) /3;

        for (var i=0;i<loops;i++){
            var op;
            if (thePanel.items.items[(i*3)+1].getValue){
                op = thePanel.items.items[(i*3)+1].getValue();
            }
            else {
                op = 'eq';
            }

            //TODO: .selectText() for select menus?
            var field = thePanel.items.items[(i*3)+2];

            if (i == (loops - 1) && thePanel.items.items[(i*3)+4].getValue() != null){
                params['query.viewName'] = thePanel.items.items[(i*3)+4].getValue();
            }

            if (field.getValue() || op == 'isblank' || op == 'isnonblank'){
                var val = field.getValue();
                //NOTE: a hack to get about the null record display field of comboboxes
                if (val != '[none]')
                    params[('query.' + field.originalConfig.name + '~' + op)] = val;
            }
        }

        var url = LABKEY.ActionURL.buildURL(
            'query',
            'executeQuery.view',
            (this.config.containerPath || LABKEY.ActionURL.getContainer()),
            params
            );

        //TODO: Maybe load a QWP instead??
        window.location = url

    },
    addRow: function(meta){
        Ext.apply(meta, {ext: {width: 150, lazyInit: false, editable: false, type: 'formField'}});
        if(meta.inputType == 'textarea')
            meta.inputType = 'textbox';

        //allow metadata override
        if (this.config.metadata && this.config.metadata[meta.name]){
            EHR.UTILITIES.rApply(meta, this.config.metadata[meta.name])
        }

        if (!meta.isHidden){
            //TODO: can I make the cell autoWidth instead of using a fixed value?
            this.panelConfig.items.push({html: meta.caption+':', width: 150});

            if (!meta.lookup || false === meta.lookups){
                switch(meta.jsonType){
                    case 'int':
                    case 'float':
                        this.panelConfig.items.push({xtype: 'OperatorComboNum', type: 'operator'});
                        break;
                    case 'date':
                        this.panelConfig.items.push({xtype: 'OperatorComboDate', type: 'operator'});
                        break;
                    case 'boolean':
                        this.panelConfig.items.push({});
                        break;
                    default:
                        this.panelConfig.items.push({xtype: 'OperatorCombo', type: 'operator'});
                        break;
                    }
            }
            else {this.panelConfig.items.push({})}

            this.panelConfig.items.push(LABKEY.ext.FormHelper.getFieldEditor(meta));
        }
    },

    appendViews: function(){
        var views = [];
        if (this.viewCfg.views.length > 0){

            for (var i=0;i<this.viewCfg.views.length;i++){
                views.push([this.viewCfg.views[i].name, this.viewCfg.views[i].name||'Default']);
            }

            this.panelConfig.items.push(
                {html: 'View:', width: 125},
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
                    ,value: this.config.defaultView || ''
                    ,store: new Ext.data.SimpleStore({
                        fields: [
                            'value',
                            'displayText'
                        ],
                        data: views
                    })
                })
            );
        }
    }

});

Ext.reg('EHR_searchForm', EHR.ext.customPanels.searchForm);
