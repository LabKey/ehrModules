/*
 * Copyright (c) 2010-2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.namespace('EHR.ext');

/**
 * Constructs a new EHR SingleAnimalReport
 * @class
 * An EHR class that provides a data-driven tabbed report panel.  It is used on the AnimalHistory page, and a subclass defined in participantView.js is used as the participant details page.
 * The set of reports is determined by the records in ehr.reports.  Each record supplies a schema/query and report type, along with other options.
 *
 */
Ext4.define('EHR.ext.SingleAnimalReport', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ehr-singleanimalreport',

    initComponent: function(){
        Ext4.apply(this, {
            tabsReady: false,
            border: false,
            bodyStyle: 'background-color : transparent;',
            reportMap: {},
            defaults: {
                border: false
            },
            items: [{
                layout: 'hbox',
                defaults: {
                    border: false
                },
                items: [{
                    xtype: 'panel',
                    defaults: {
                        border: false
                    },
                    items: [{
                        xtype: 'panel',
                        defaults: {
                            border: false
                        },
                        itemId: 'togglePanel',
                        style: 'margin-bottom:20px;',
                        layout: 'hbox',
                        items: this.getFilterOptionsItems()
                    },{
                        xtype: 'panel',
                        defaults: {
                            border: false
                        },
                        itemId: 'filterPanel',
                        layout: 'hbox'
                    }]
                },{
                    itemId: 'idPanel',
                    border: false,
                    defaults: {
                        border: false
                    }
                }]
            },{
                xtype: 'button',
                border: true,
                text: 'Refresh',
                handler: this.onSubmit,
                forceRefresh: true,
                itemId: 'submitBtn',
                disabled: true,
                scope: this,
                style:'margin-left:200px;margin-top: 10px;'
            },{
                tag: 'span',
                style: 'padding: 10px'
            },{
                xtype: 'tabpanel',
                itemId: 'tabPanel',
                activeTab: 0
            }]
        });

        this.callParent(arguments);

        this.reportStore = Ext4.create('LABKEY.ext4.Store', {
            schemaName: 'ehr',
            queryName: 'reports',
            filterArray: [LABKEY.Filter.create('visible', true, LABKEY.Filter.Types.EQUAL)],
            sort: 'category,sort_order,reporttitle',
            autoLoad: true,
            listeners: {
                scope: this,
                load: this.createTabPanel
            },
            failure: LDK.Utils.getErrorCallback()
        });

        this.on('afterrender', this.onAfterRender);
    },

    onAfterRender: function(panel){
        this.originalWidth = this.getWidth();
    },

    getFilterOptionsItems: function(){
        var inputType = LABKEY.ActionURL.getParameter('_inputType') || 'renderSingleSubject';
//console.log(inputType)
        return [{
            width: 200,
            html: '<p>Type of Search:</p>'
        },{
            xtype: 'radiogroup',
            itemId: 'inputType',
            labelWidth: 200,
            //fieldLabel: 'Type of Search',
            defaults: {
                width: 200
            },
            columns: 1,
            listeners: {
                scope: this,
                change: function(field, val){
                    val = val.selector;
                    this.processSubj();
                    this[val]();
                }
            },
            items: [{
                name: 'selector',
                boxLabel: 'Single Animal',
                inputValue: 'renderSingleSubject',
                itemId: 'renderSingleSubject',
                checked: inputType == 'renderSingleSubject'
            },{
                name: 'selector',
                boxLabel: 'Multiple Animals',
                inputValue: 'renderMultiSubject',
                itemId: 'renderMultiSubject',
                checked: inputType == 'renderMultiSubject'
            },{
                name: 'selector',
                boxLabel: 'Current Location',
                inputValue: 'renderRoomCage',
                itemId: 'renderRoomCage',
                checked: inputType == 'renderRoomCage'
            },{
                name: 'selector',
                boxLabel: 'Entire Database',
                inputValue: 'renderColony',
                itemId: 'renderColony',
                checked: inputType == 'renderColony'
            }]
        }]
    },

    renderColony: function(){
        var target = this.down('#filterPanel');
        target.removeAll();
    },

    renderSingleSubject: function(){
        var target = this.down('#filterPanel');
        target.removeAll();

        target.add({
            width: 200,
            html: 'Enter Subject Id:',
            style: 'margin-bottom:10px'
        });

        target.add({
            xtype: 'panel',
            items: [{
                //TODO
                //xtype: 'ehr-participant',
                xtype: 'textfield',
                name: 'subjectBox',
                width: 165,
                itemId: 'subjArea',
                value: (this.subjectArray && this.subjectArray.length ? this.subjectArray.join(';') : ''),
                keys: [{
                    key: Ext4.EventObject.ENTER,
                    handler: this.onSubmit,
                    scope: this
                }]
            }],
            keys: [{
                key: Ext4.EventObject.ENTER,
                handler: this.onSubmit,
                scope: this
            }]
        });
    },

    renderMultiSubject: function(){
        var target = this.down('#filterPanel');
        target.removeAll();
        target.add({
            width: 200,
            html: 'Enter Subject Id(s):<br><i>(Separated by commas, semicolons, space or line breaks)</i>'
        });

        target.add({
            xtype: 'panel',
            layout: 'hbox',
            items: [{
                xtype: 'panel',
                width: 200,
                border: false,
                items: [{
                    name: 'subjectBox',
                    xtype: 'textarea',
                    width: 200,
                    height: 100,
                    itemId: 'subjArea'
                },{
                    xtype: 'labkey-linkbutton',
                    text: '[Search By Room/Cage]',
                    minWidth: 80,
                    handler: function(c){
                        Ext4.create('Ext.window.Window', {
                            width: 330,
                            closeAction: 'destroy',
                            keys: [{
                                key: Ext4.EventObject.ENTER,
                                handler: this.loadRoom,
                                scope: this
                            }],
                            title: 'Search By Room/Cage',
                            items: [{
                                xtype: 'form',
                                bodyStyle:'padding:5px',
                                items: [{
                                    fieldLabel: 'Room',
                                    emptyText: '',
                                    itemId: 'room',
                                    name: 'roomField',
                                    xtype: 'combo',
                                    displayField:'room',
                                    valueField: 'room',
                                    typeAhead: true,
                                    queryMode: 'local',
                                    width: 300,
                                    store: Ext4.create('LABKEY.ext4.Store', {
                                        schemaName: 'ehr_lookups',
                                        queryName: 'rooms',
                                        sort: 'room',
                                        //filterArray: [LABKEY.Filter.create('TotalAnimals', 0, LABKEY.Filter.Types.NOT_EQUAL)],
                                        autoLoad: true
                                    })
                                },{
                                    xtype: 'numberfield',
                                    fieldLabel: 'Cage',
                                    name: 'cageField',
                                    itemId: 'cage',
                                    width: 300
                                }]
                            }],
                            buttons: [{
                                text:'Submit',
                                disabled:false,
                                itemId: 'submit',
                                scope: this,
                                handler: this.loadRoom
                            },{
                                text: 'Close',
                                scope: this,
                                handler: function(btn){
                                    btn.up('window').hide();
                                }
                            }]
                        }).show();
                    },
                    scope: this
                },{
                    xtype: 'labkey-linkbutton',
                    text: '[Search By Project/Protocol]',
                    minWidth: 80,
                    scope: this,
                    handler: function(c){
                        Ext4.create('Ext.window.Window', {
                            width: 330,
                            closeAction: 'destroy',
                            keys: [{
                                key4: Ext4.EventObject.ENTER,
                                handler: this.loadProject,
                                scope: this
                            }],
                            title: 'Search By Project/Protocol',
                            items: [{
                                xtype: 'form',
                                bodyStyle:'padding:5px',
                                items: [{
                                    xtype: 'labkey-combo',
                                    fieldLabel: 'Project',
                                    emptyText:'',
                                    itemId: 'project',
                                    displayField: 'project',
                                    valueField: 'project',
                                    typeAhead: true,
                                    queryMode: 'local',
                                    width: 300,
                                    editable: true,
                                    store: Ext4.create('LABKEY.ext4.Store', {
                                        schemaName: 'ehr',
                                        queryName: 'project',
                                        viewName: 'Projects With Active Assignments',
                                        sort: 'project',
                                        autoLoad: true
                                    })
                                },{
                                    fieldLabel: 'Protocol',
                                    emptyText:'',
                                    itemId: 'protocol',
                                    xtype: 'labkey-combo',
                                    displayField: 'protocol',
                                    valueField: 'protocol',
                                    typeAhead: true,
                                    width: 300,
                                    editable: true,
                                    queryMode: 'local',
                                    store: Ext4.create('LABKEY.ext4.Store', {
                                        schemaName: 'ehr',
                                        queryName: 'protocol',
                                        viewName: 'Protocols With Active Assignments',
                                        sort: 'protocol',
                                        autoLoad: true
                                    })
                                }]
                            }],
                            buttons: [{
                                text:'Submit',
                                disabled:false,
                                itemId: 'submit',
                                scope: this,
                                handler: this.loadProject
                            },{
                                text: 'Close',
                                scope: this,
                                handler: function(btn){
                                    btn.up('window').close();
                                }
                            }]
                        }).show();

                    },
                    style: 'margin-bottom:10px'
                }]
            },{
                xtype: 'panel',
                layout: 'vbox',
                bodyStyle: 'padding-left: 10px;padding-right: 10px',
                border: false,
                defaults: {
                    xtype: 'button',
                    width: 90,
                    buttonAlign: 'center',
                    bodyStyle:'align: center',
                    style: 'margin-bottom: 8px;'
                },
                items: [{
                    text: '  Append -->',
                    handler: this.processSubj,
                    scope: this
                },{
                    text: '  Replace -->',
                    handler: function(){
                        this.subjectArray = [];
                        this.processSubj()
                    },
                    scope: this
                },{
                    text: ' Clear ',
                    handler: function(c){
                        this.subjectArray = [];
                        this.down('#idPanel').removeAll();
                    },
                    scope: this
                }]
            }]
        });
    },

    renderRoomCage: function(){
        var target = this.down('#filterPanel');
        target.removeAll();

        this.subjectArray = [];

        target.add({
            width: 200,
            html: 'Search By Location:<br><i>(enter multiple rooms by separating with commas or whitespace. Note: you must enter the entire cage #, such as 0001)</i>'
        });

        target.add({
            xtype: 'panel',
            //bodyStyle:'padding: 10px;',
            defaults: {
                border: false,
                width: 200,
                labelWidth: 90,
                labelAlign: 'top'
            },
            keys: [{
                key: Ext4.EventObject.ENTER,
                handler: this.onSubmit,
                scope: this
            }],
            items: [{
                xtype: 'labkey-combo',
                emptyText:'',
                fieldLabel: 'Area',
                displayField:'area',
                valueField: 'area',
                typeAhead: true,
                queryMode: 'local',
                editable: false,
                triggerAction: 'all',
                store: Ext4.create('LABKEY.ext4.Store', {
                    schemaName: 'ehr_lookups',
                    queryName: 'areas',
                    sort: 'area',
                    autoLoad: true
                }),
                itemId: 'areaField'
            },{
                xtype: 'textfield',
                itemId: 'roomField',
                fieldLabel: 'Room',
                listeners: {
                    render: function(field){
                        field.el.set({autocomplete: 'off'});
                    }
                }
            },{
                xtype: 'textfield',
                itemId: 'cageField',
                fieldLabel: 'Cage',
                listeners: {
                    scope: this,
                    change: function(field, val){
                        if(val && !isNaN(val)){
                            var newVal = EHR.Utils.padDigits(val, 4);
                            if(val != newVal)
                                field.setValue(newVal);
                        }
                    },
                    render: function(field){
                        field.el.set({autocomplete: 'off'});
                    }
                }
            }]
        });
    },

    loadProject: function(btn){
        var win = btn.up('window');
        var project = win.down('#project').getValue();
        var protocol = win.down('#protocol').getValue();
        win.down('#project').reset();
        win.down('#protocol').reset();

        win.close();
        
        Ext4.Msg.wait("Loading...");

        if(!project && !protocol){
            Ext4.Msg.hide();
            return;
        }

        var filters = [];

        if(project){
            filters.push(LABKEY.Filter.create('project', project, LABKEY.Filter.Types.EQUAL))
        }

        if(protocol){
            protocol = protocol.toLowerCase();
            filters.push(LABKEY.Filter.create('project/protocol', protocol, LABKEY.Filter.Types.EQUAL))
        }

        LABKEY.Query.selectRows({
            schemaName: 'study',
            queryName: 'ActiveAssignments',
            sort: 'Id',
            filterArray: filters,
            scope: this,
            success: function(rows){
                var subjectArray = [];
                Ext4.each(rows.rows, function(r){
                    subjectArray.push(r.Id);
                }, this);
                subjectArray = Ext4.unique(subjectArray);
                if(subjectArray.length){
                    this.subjectArray = subjectArray;
                    this.makeSubjGrid();
                }
                Ext4.Msg.hide();
            },
            failure: function(e){
                console.log(e);
                Ext4.Msg.hide();
            }
        });
    },

    loadRoom: function(btn){
        var housingWin = btn.up('window');
        var room = housingWin.down('#room').getValue();
        var cage = housingWin.down('#cage').getValue();
        housingWin.down('#room').reset();
        housingWin.down('#cage').reset();
        
        housingWin.close();
        
        Ext4.Msg.wait("Loading...");

        if(!room && !cage){
            Ext4.Msg.hide();
            return;
        }

        var filters = [];

        if(room){
            room = room.toLowerCase();
            filters.push(LABKEY.Filter.create('room', room, LABKEY.Filter.Types.STARTS_WITH))
        }

        if(cage){
            filters.push(LABKEY.Filter.create('cage', cage, LABKEY.Filter.Types.EQUAL))
        }

        LABKEY.Query.selectRows({
            schemaName: 'study',
            queryName: 'housing',
            viewName: 'Current Housing',
            sort: 'Id',
            filterArray: filters,
            scope: this,
            success: function(rows){
                var subjectArray = [];
                Ext4.each(rows.rows, function(r){
                    subjectArray.push(r.Id);
                }, this);
                subjectArray = Ext4.unique(subjectArray);
                if(subjectArray.length){
                    this.subjectArray = subjectArray;
                    this.makeSubjGrid();
                }
                Ext4.Msg.hide();
            },
            failure: LDK.Utils.getErrorCallback()
        });
    },

    restoreUrl: function(){
        if(document.location.hash){
            var token = document.location.hash.split('#');
            token = token[1].split('&');
            for (var i=0;i<token.length;i++){
                var t = token[i].split(':');
                switch(t[0]){
                    case '_inputType':
                        this.down('#inputType').setValue({selector: t[1]});
                        break;
                    case 'subject':
                        if(this.down('#subjArea')){
                            this.down('#subjArea').setValue(t[1]);
                        }
                        break;
                    case '_showReport':
                        this.doLoad = (t[1] == 1);
                        break;
                    case 'activeReport':
                        this.report = t[1];
                            var tab = this.reportMap[t[1]];
                            if (tab){
                                this.activeReport = tab;
                                this.silentlySetActiveTab(this.activeReport);
                                this.onSubmit();
                            }
                        break;
                    case 'room':
                        if(this.down('#roomField')){
                            this.down('#roomField').setValue(t[1]);
                        }
                        break;
                    case 'cage':
                        if(this.down('#cageField')){
                            this.down('#cageField').setValue(t[1]);
                        }
                        break;
                    case 'area':
                        if(this.down('#areaField')){
                            this.down('#areaField').setValue(t[1]);
                        }
                        break;
                }
            }
        }
    },

    processSubj: function(){
        var type = this.down('#inputType').getValue().selector;
        if(!this.down('#subjArea')){
            this.subjectArray = [];
            this.down('#idPanel').removeAll();
            return;
        }

        //we clean up, combine, then split the subjectBox and subject inputs
        var subjectArray = this.down('#subjArea').getValue();
        
        subjectArray = subjectArray.replace(/[\s,;]+/g, ';');
        subjectArray = subjectArray.replace(/(^;|;$)/g, '');
        subjectArray = subjectArray.toLowerCase();

        if(subjectArray)
            subjectArray = subjectArray.split(';');
        else
            subjectArray = new Array();

        if (type == 'renderMultiSubject' && this.subjectArray && this.subjectArray.length){ 
            subjectArray = subjectArray.concat(this.subjectArray);
        }

        if (subjectArray.length != 0){
            subjectArray = Ext4.unique(subjectArray);
            subjectArray.sort();
        }

        this.subjectArray = subjectArray;

        if(type == 'renderMultiSubject'){
            this.down('#subjArea').setValue(null);

            //we display the result
            this.makeSubjGrid();
        }
        else {
            this.down('#subjArea').setValue(subjectArray);
            this.down('#idPanel').removeAll();
        }
    },

    makeSubjGrid: function(){
        var target = this.down('#idPanel');
        target.removeAll();

        target.add({
            tag: 'div',
            html: 'Total IDs: '+this.subjectArray.length
        });

        var thePanel = target.add({
            xtype: 'panel',
            layout: {
                type: 'table',
                columns: 4
            }
        });
        
        for (var i = 0; i < this.subjectArray.length; i++){
            thePanel.add({
                xtype: 'button',
                border: true,
                minWidth: 80,
                text: this.subjectArray[i]+' (X)',
                subjectID: this.subjectArray[i],
                style: 'margin: 2px;',
                handler: function(button){
                    var subject = button.subjectID;

                    //we find the subjectArray
                    this.subjectArray.remove(subject);

                    //we rebuild the table
                    this.makeSubjGrid()
                },
                scope: this
            });

        }
        target.add(thePanel);
    },

    onSubmit: function(btn){
        if (!this.checkValid())
            return;

        if(btn)
            this.forceRefresh = btn.forceRefresh;

        if(!this.activeReport){
            var parentTab = this.down('#tabPanel').down('#General');
            this.activeReport = parentTab.down('#abstract');
            parentTab.setActiveTab(this.activeReport);
            this.down('#tabPanel').setActiveTab(parentTab);
        }
        else {
            this.loadTab(this.activeReport);
        }

    },

    //separated so subclasses can override as needed
    checkValid: function(){
        this.processSubj();
        var type = this.down('#inputType').getValue().selector;

        switch (type){
        case 'renderRoomCage':
            if(!this.down('#roomField').getValue() && !this.down('#areaField').getValue()){
                alert('Error: Must Enter A Room or Area');
                return false;
            }
            break;
        case 'renderColony':
            break;
        default:
            if(!this.subjectArray.length){
                alert('Error: Must Enter At Least 1 Animal ID');
                return false;
            }
        }
        return true
    },

    displayReport: function(tab){
//        this.addHeader(tab);

        if(tab.subjectArray.length){
            //we handle differently depending on whether we combine subjects
            if (!tab.combineSubj){
                for (var i = 0; i < tab.subjectArray.length; i++){
                    var subject = [tab.subjectArray[i]];
                    this.renderReport(tab, subject);
                }
            }
            else {
                this.renderReport(tab, tab.subjectArray);
            }
        }
        else {          
            this.renderReport(tab);
        }
    },

    renderReport: function(tab, subject){
        switch (tab.rowData.get("reporttype")){
            case 'query':
                this.loadQuery(tab, subject);
                break;
//            case 'webpart':
//                this.loadWebPart(tab, subject);
//                break;
            case 'details':
                this.loadDetails(tab, subject);
                break;
            case 'multi':
                alert("Error: Child Report Cannot Be a Multipart Report");
                break;
            case 'report':
                this.loadReport(tab, subject);
                break;
            case 'js':
                this.loadJS(tab, subject);
                break;
            default:
                LDK.Utils.getErrorCallback()({message: 'Improper Report Type'});
        }
    },

    getFilterArray: function(tab, subject){
        var rowData = tab.rowData;
        var filterArray = {
            removable: [],
            nonRemovable: []
        };

        var roomField = this.down('#roomField');
        var room = roomField ? roomField.getValue() : null;

        if(room){
            room = room.replace(/[\s,;]+/g, ';');
            room = room.replace(/(^;|;$)/g, '');
            room = room.toLowerCase();
            roomField.setValue(room);
        }

        var cageField = this.down('#cageField');
        var cage = cageField ? cageField.getValue() : null;

        var areaField = this.down('#areaField');
        var area = areaField ? areaField.getValue() : null;

        if(tab.subjectArray && tab.subjectArray.length){
            filterArray.nonRemovable.push(LABKEY.Filter.create('Id', subject.join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF));
        }

        if(area){
            if(rowData.get("queryhaslocation")){
                filterArray.nonRemovable.push(LABKEY.Filter.create('room/area', area, LABKEY.Filter.Types.STARTS_WITH));
            }
            else {
                filterArray.nonRemovable.push(LABKEY.Filter.create('Id/curLocation/area', area, LABKEY.Filter.Types.EQUAL));
            }
        }

        if(room){
            if(rowData.get("queryhaslocation")){
                filterArray.nonRemovable.push(LABKEY.Filter.create('room', room, LABKEY.Filter.Types.EQUALS_ONE_OF));
            }
            else {
                filterArray.nonRemovable.push(LABKEY.Filter.create('Id/curLocation/room', room, LABKEY.Filter.Types.EQUALS_ONE_OF));
            }

        }

        if(cage){
            if(rowData.get("queryhaslocation")){
                filterArray.nonRemovable.push(LABKEY.Filter.create('cage', cage, LABKEY.Filter.Types.STARTS_WITH));
            }
            else {
                filterArray.nonRemovable.push(LABKEY.Filter.create('Id/curLocation/cage', cage, LABKEY.Filter.Types.EQUAL));
            }
        }

        //we handle date
        if (rowData.get("datefieldname") && rowData.get("todayonly"))
        {
            filterArray.removable.push(LABKEY.Filter.create(rowData.get("datefieldname"), (new Date()).format('Y-m-d'), LABKEY.Filter.Types.DATE_EQUAL));
        }

        tab.filterArray = filterArray;
        return filterArray;
    },

    makeTitle: function(tab, subject){
        var title = [];

        var roomField = this.down('#roomField');
        var room = roomField ? roomField.getValue() : null;

        var cageField = this.down('#cageField');
        var cage = cageField ? cageField.getValue() : null;

        var areaField = this.down('#areaField');
        var area = areaField ? areaField.getValue() : null;

        if(subject && subject.length)
            title.push(subject.join("; "));

        if (area)
            title.push('Area: '+area);

        if (room)
            title.push('Room: '+room);

        if (cage)
            title.push('Cage: '+cage);

        return title.join(', ');
    },

    loadQuery: function(tab, subject){
        var filterArray = this.getFilterArray(tab, subject);
        var title = this.makeTitle(tab, subject);

        var queryConfig = {
            title: tab.rowData.get("reporttitle") + ": " + title,
            schemaName: tab.rowData.get("schemaname"),
            queryName: tab.rowData.get("queryname"),
            suppressRenderErrors: true,
            allowChooseQuery: false,
            allowChooseView: true,
            showInsertNewButton: false,
            showDeleteButton: false,
            showDetailsColumn: true,
            showUpdateColumn: false,
            showRecordSelectors: true,
            showReports: false,
            tab: tab,
            frame: 'portal',            
            buttonBarPosition: 'top',
            timeout: 0,
            filters: filterArray.nonRemovable,
            removeableFilters: filterArray.removable,
            linkTarget: '_blank',
            success: this.onDataRegionLoad,
            failure: LDK.Utils.getErrorCallback(),
            scope: this
        };

        if (tab.rowData.get("viewname")){
            queryConfig.viewName = tab.rowData.get("viewname")
        }

        if (tab.rowData.get("containerpath")){
            queryConfig.containerPath = tab.rowData.get("containerpath");
        }

        tab.add({
            xtype: 'ldk-querypanel',
            itemId: 'queryPanel',
            queryConfig: queryConfig
        });
    },

    onDataRegionLoad: function(dr){
        var width1 = Ext4.get('dataregion_'+dr.id).getSize().width + 100;
        var width2 = this.getWidth();
        if(width1 > width2){
            this.setWidth(width1);
        }
        else if (width1 < width2) {
            if(this.originalWidth && width2 != this.originalWidth){
                this.setWidth(Math.max(this.originalWidth, width1));
                this.doLayout();
            }
        }
    },

    getQWPConfig: function(config){
        return Ext4.apply({
            allowChooseQuery: false,
            allowChooseView: true,
            showInsertNewButton: false,
            showDeleteButton: false,
            showDetailsColumn: true,
            showUpdateColumn: false,
            showRecordSelectors: true,
            suppressRenderErrors: true,
            showReports: false,
            frame: 'portal',
            linkTarget: '_blank',
            buttonBarPosition: 'top',
            timeout: 0,
            success: this.onDataRegionLoad,
            failure: LDK.Utils.getErrorCallback()
        }, config);
    },

    loadReport: function(tab, subject){
        var filterArray = this.getFilterArray(tab, subject);
        filterArray = filterArray.nonRemovable.concat(filterArray.removable);
        var target = tab.add({
            xtype: 'ldk-contentresizingpanel'
        });

        var title = (subject ? subject.join("; ") : '');

        var queryConfig = {
            partName: 'Report',
            renderTo: target.renderTarget,
            suppressRenderErrors: true,
            partConfig: {
                title: tab.rowData.get("reporttitle") + ": " + title,
                schemaName: tab.rowData.get("schemaname"),
                reportId : tab.rowData.get("report"),
                'query.queryName': tab.rowData.get("queryname")
            },
            filters: filterArray,
            success: function(result){
                target.createListeners.defer(200, target);
            },
            failure: LDK.Utils.getErrorCallback(),
            scope: this
        };

        if (subject){
            queryConfig.partConfig['query.Id~in'] = Ext4.isArray(subject) ? subject.join(";") : 'subject';
        }

        if (tab.rowData.get("containerpath")){
            queryConfig.containerPath = tab.rowData.get("containerpath");
        }

        if (tab.rowData.get("viewname")){
            queryConfig.partConfig.showSection = tab.rowData.get("viewname");
        }

        new LABKEY.WebPart(queryConfig).render();
    },

    loadJS: function(tab, subject, target){
        EHR.reports[tab.rowData.get('queryname')](this, tab, subject, target);
    },

//    loadWebPart: function(tab, subject, target){
//        var filterArray = this.getFilterArray(tab, subject);
//        filterArray = filterArray.nonRemovable.concat(filterArray.removable);
//        target = target || tab.add({tag: 'span', html: 'Loading...', cls: 'loading-indicator'});
//        var title = (subject ? subject.join("; ") : '');
//
//        this.params = {};
//        this.subject = subject;
//        this.params.rowData = rowData;
//
//        var WebPartRenderer = new LABKEY.WebPart({
//            partName: tab.rowData.get("queryname"),
//            title: tab.rowData.get("reporttitle") + ": " + title,
//            suppressRenderErrors: true,
//            renderTo: target,
////            config: tab.rowData.get("config"),
//            //success: this.endMsg,
//            failure: LDK.Utils.getErrorCallback(),
//            scope: this
//        });
//        WebPartRenderer.render(target);
//    },

    loadDetails: function(tab, subject, target){
        var filterArray = this.getFilterArray(tab, subject);
        filterArray = filterArray.nonRemovable.concat(filterArray.removable);
        target = target || tab.add({tag: 'span', html: 'Loading...', cls: 'loading-indicator'});
        var title = (subject ? subject.join("; ") : '');

        var config = {
            schemaName: tab.rowData.get("schemaname"),
            queryName: tab.rowData.get("queryname"),
            title: tab.rowData.get("reporttitle") + ":",
            titleField: 'Id',
            renderTo: target.id,
            filterArray: filterArray,
            multiToGrid: this.multiToGrid
        };

        if (tab.rowData.get("viewname")){
            config.viewName = tab.rowData.get("viewname");
        }

        Ext4.create('LDK.ext.MultiDetailsPanel', config);
    },

    createTabPanel: function(){
        var tabPanel = this.down('#tabPanel');

        this.reportStore.each(function(c){
            var category = c.get('category');

            //create top-level tab
            if(!tabPanel.down('panel[itemId="' + category + '"]')){
                tabPanel.add({
                    xtype: 'tabpanel',
                    itemId: category,
                    title: category,
                    enableTabScroll: true,
                    activeTab: 0
                });
            }

            var subTab = tabPanel.down('panel[itemId="' + category + '"]');
            var report = c.get('reportname');

            //create 2nd tier tab
            if(!subTab.down('panel[itemId="' + report + '"]')){
                var theTab = subTab.add({
                    xtype: 'panel',
                    title: c.get('reporttitle'),
                    itemId: report,
                    rowData: c,
                    bodyStyle:'padding:5px',
                    border: false,
                    subjectArray: [],
                    filterArray: {},
                    tbar: {
                        style: 'padding-left:10px'
                    },
                    combineSubj: true,
                    listeners: {
                        scope: this,
                        activate: function(t){
                            this.activeReport = t;
                            t.ownerCt.setActiveTab(t);
                            this.onSubmit();
                        }
                    }
                });

                if(this.report == report){
                    this.activeReport = theTab;
                }

                this.reportMap[c.get('reportname')] = theTab;
            }
        }, this);

        if(this.activeReport){
            this.silentlySetActiveTab(this.activeReport);

            if(this.doLoad)
                this.onSubmit();
        }
        else {
            this.silentlySetActiveTab(tabPanel.down('#General').down('#abstract'));
        }

        //populate initial fields
        this[this.down('#inputType').getValue().selector]();
        this.restoreUrl();

        if(this.down('#submitBtn')){
            this.tabsReady = true;
            this.down('#submitBtn').setDisabled(false);
        }
    },

    silentlySetActiveTab: function(tab){
        var tabPanel = this.down('#tabPanel');

        tabPanel.suspendEvents();
        tab.suspendEvents();
        tab.ownerCt.suspendEvents();

        tab.ownerCt.setActiveTab(tab);
        tabPanel.setActiveTab(tab.ownerCt);

        tab.resumeEvents();
        tab.ownerCt.resumeEvents();
        tabPanel.resumeEvents();
    },

    loadTab: function(o){
        this.setFilters(o);

        var reload = 0;
        for (var i in this.filters){
            if(!o.filters || this.filters[i] !== o.filters[i]){
                reload = 1;
                continue;
            }
        }
                
        //indicates tab already has up to date content
        if(reload == 0 && !this.forceRefresh){
            //console.log('no reload needed');
            return;
        }
        this.forceRefresh = null;


        o.filters = this.filters;
        o.subjectArray = this.subjectArray;
        
        o.removeAll();

        this.displayReport(o);
        this.activeReport = o;
    },

    setFilters: function(tab){
        this.filters = {
            _inputType : this.down('#inputType').getValue().selector,
            _showReport: 1,
            room: (this.down('#roomField') ? this.down('#roomField').getValue() : null),
            cage : (this.down('#cageField') ? this.down('#cageField').getValue() : null),
            area : (this.down('#areaField') ? this.down('#areaField').getValue() : null),
            subject : this.subjectArray.join(';'),
            combineSubj : tab.combineSubj,
            activeReport: tab.rowData.get('reportname')
        };

        this.processSubj();
        var token = [];
        for (var i in this.filters){
            if(this.filters[i]){
                token.push(i+':'+this.filters[i]);
            }
        }
        Ext4.History.add(token.join('&'));
    },

    addHeader: function(tab, items){
        var tb = tab.getDockedItems('toolbar[dock="top"]')[0];
        tb.removeAll();

        //cannot separate subjects if filtering by room
        if(!this.down('#subjArea')){
            return;
        }

        tb.add({
            xtype: 'radiogroup',
            fieldLabel: 'Combine Subjects',
            itemId: 'combine',
            tab: tab,
            //style: 'padding-left:5px;padding-top:0px;margin-bottom:2px;',
            listeners: {
                scope: this,
                change: function(o, s){
                    var val = o.getValue();

                    if(o.tab.combineSubj != val && o.tab.subjectArray.length!=1){
                        o.tab.combineSubj = val.inputValue;
                        this.loadTab(tab)
                    }
                }
            },
            defaults: {
                width: 100
            },
            items: [{
                name: 'combine',
                boxLabel: 'No',
                inputValue: false,
                ref: 'combine',
                checked: !tab.combineSubj
            },{
                name: 'combine',
                boxLabel: 'Yes',
                inputValue: true,
                ref: 'separate',
                checked: tab.combineSubj
            }]
        },
            '-'
        );

        if(items){
            tb.add(items);
        }
    }
});


