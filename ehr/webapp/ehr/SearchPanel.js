/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.namespace('EHR.ext', 'EHR.searchMetadata');

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
                ,dam: {lookups: false}
                ,sire: {lookups: false}
                ,code: {lookups: false}
                ,snomed: {lookups: false}
            }
            ,newFields: []
        };
        EHR.utils.rApplyIf(this, metaDefaults);

        if(EHR.searchMetadata[this.queryName]){
            EHR.utils.rApply(this, EHR.searchMetadata[this.queryName]);
        }

        LABKEY.Query.getQueryDetails({
            containerPath: this.containerPath
            ,queryName: this.queryName
            ,schemaName: this.schemaName
            ,viewName: this.viewName
            ,maxRows: 0
            ,successCallback: this.onLoad
            ,errorCallback: EHR.utils.onError
            ,scope: this
        });

        Ext.Ajax.timeout = 120000; //in milliseconds
    },

    onLoad: function(results){
        this.removeAll();

        if (!results || !results.columns){
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
            },{
                xtype: 'ehr-viewcombo'
                ,containerPath: this.containerPath
                ,queryName: this.queryName
                ,schemaName: this.schemaName
                ,width: 165
                ,initialValue: this.defaultView || ''
            });
        }

        this.doLayout();
    },

   addRow: function(meta){
        Ext.apply(meta, {lookupNullCaption: '', ext: {width: 150, lazyInit: false, editable: false, type: 'formField'}});
        if(meta.inputType == 'textarea')
            meta.inputType = 'textbox';

        //allow metadata override
        if (this.metadata && this.metadata[meta.name]){
            EHR.utils.rApply(meta, this.metadata[meta.name])
        }

       //TODO: hack way to avoid snomed lookup combos
        if(meta.lookup && meta.lookup.queryName == 'snomed'){
            meta.lookups = false;
        }

        if (!meta.hidden && meta.selectable !== false){
            //the label
            this.add({html: meta.caption+':', width: 150});

            //the operator
            if ((!meta.lookup || false === meta.lookups)){
                this.add(meta.jsonType=='boolean' ? {} : new EHR.ext.OperatorCombo({
                    meta: meta,
                    width: 165
                }));
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

Ext.reg('ehr-searchform', EHR.ext.SearchPanel);



EHR.searchMetadata = {
    Animal: {
        defaultView: 'Alive, at WNPRC'
        ,metadata: {
            Surgery: {hidden: true}
            ,activeAssignments: {hidden: true}
            ,curLocation: {hidden: true}
            ,numRoommates: {hidden: true}
            ,MostRecentWeight: {hidden: true}
            ,Species: {hidden: true}
            ,Status: {hidden: true}
            ,totalOffspring: {hidden: true}
            ,MostRecentTB: {hidden: true}
            ,MostRecentArrival: {hidden: true}
            ,MostRecentDeparture: {hidden: true}
            ,MHCtyping: {hidden: true}
            ,CageClass: {hidden: true}
            ,AvailBlood: {hidden: true}
            ,DaysAlone: {hidden: true}
            ,AgeClass: {hidden: true}
            ,totalAssignments: {hidden: true}
            ,ViralLoad: {hidden: true}
        }
        ,newFields: [
            {caption: 'Cohort', name: 'Cohort/label'}
            ,{caption: 'Age', name: 'age/AgeInYearsRounded', jsonType: 'int'}
            ,{caption: 'Age', name: 'age/AgeInYearsRounded', jsonType: 'int'}
            ,{caption: 'Current Room', name: 'curLocation/room'}
            //,{caption: 'Last TB Date', name: 'mostRecentTB'}
            //,{caption: 'Num. of Active Assignments', name: 'activeProjects/ActiveProjects (avail=all)'}
            ,{caption: 'Num. of Offspring', name: 'totalOffspring/TotalOffspring', jsonType: 'int'}
            ,{caption: 'Num. of Roommates', name: 'numRoommates/numRoommates', jsonType: 'int'}
            ,{caption: 'Species', name: 'Species/species', lookup: {schemaName: 'ehr_lookups', queryName: 'species', displayColumn: 'common', keyColumn: 'common'}
            }
            ,{caption: 'Gender', name: 'DataSet/Demographics/gender', lookup: {schemaName: 'ehr_lookups', queryName: 'gender_codes', displayColumn: 'meaning', keyColumn: 'code'}}
            ,{caption: 'Dam', name: 'DataSet/Demographics/dam'}
            ,{caption: 'Sire', name: 'DataSet/Demographics/sire'}
            ,{caption: 'Availability', name: 'DataSet/Demographics/avail'}
            ,{caption: 'Hold', name: 'DataSet/Demographics/hold'}
            ,{caption: 'Birth', name: 'DataSet/Demographics/birth', jsonType: 'date'}
            ,{caption: 'Origin', name: 'DataSet/Demographics/origin', lookup: {schemaName: 'ehr_lookups', queryName: 'origin_codes', displayColumn: 'code', keyColumn: 'code'}}
            ,{caption: 'Death', name: 'DataSet/Demographics/death', jsonType: 'date'}
            ,{caption: 'Viral Status', name: 'DataSet/Demographics/v_status', lookup: {schemaName: 'ehr_lookups', queryName: 'viral_status', displayColumn: 'viral_status', keyColumn: 'viral_status'}}
            ,{caption: 'Latest Weight', name: 'MostRecentWeight/MostRecentWeight', jsonType: 'float'}
            ,{caption: 'Latest Weight', name: 'MostRecentWeight/MostRecentWeight', jsonType: 'float'}
            //,{caption: 'Most Recent Weight Date', name: 'MostRecentWeight/MostRecentWeightDate', jsonType: 'date'}
            //major surgery
            //blood summary
            //mhc
         ]
    },
    Housing: {
        defaultView: 'Current Housing'
        ,metadata: {
            isTemp: {hidden: true}
        }
    },
    Alopecia: {
        metadata: {
            head: {lookups: false}
        }
    },
    'Clinical Remarks': {
        metadata: {
            qualifier: {hidden: true}
        }
    }
}