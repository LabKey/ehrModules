/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg subjectId
 * @cfg minDate
 * @cfg maxDate
 * @cfg maxGridHeight
 * @cfg autoLoadRecords
 * @cfg hideExportBtn
 * @cfg sortMode
 */
Ext4.define('EHR.panel.ClinicalHistoryPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ehr-clinicalhistorypanel',

    initComponent: function(){
        this.sortMode = this.sortMode || 'date';

        Ext4.apply(this, {
            border: false,
            items: [
                this.getGridConfig()
            ]
        });

        this.callParent();

        var grid = this.down('grid');
        if (grid.rendered){
            grid.setLoading(true);
        }
        else {
            grid.on('afterrender', function(grid){
                if (grid.store.isLoadingData){
                    grid.setLoading(true);
                }
            }, this, {delay: 120, single: true});
        }

        if(this.subjectId || this.caseId){
            var store = this.down('#gridPanel').store;
            store.on('datachanged', function(){
                if (!store.isLoadingData)
                    this.down('grid').setLoading(false);
            }, this);

            store.on('exception', function(store){
                this.down('grid').setLoading(false);
            }, this);

            if (this.autoLoadRecords){
                store.reloadData({
                    subjectIds: [this.subjectId],
                    caseId: this.caseId,
                    minDate: this.minDate,
                    maxDate: this.maxDate
                });
            }
        }
        else {
            Ext4.Msg.alert('Error', 'Must supply at least 1 subject Id or a caseId')
        }
    },

    getGridConfig: function(){
        return {
            xtype: 'grid',
            border: true,
            minHeight: 100,
            cls: 'ldk-grid',
            maxHeight: this.maxGridHeight,
            height: this.gridHeight,
            hideHeaders: true,
            viewConfig : {
                emptyText: 'There are no records to display',
                derferEmptyText: false,
                enableTextSelection: true,
                border: false,
                stripeRows : true
            },
            columns: this.getColumnConfig(),
            features: [this.getGroupingFeature()],
            store: this.getStoreConfig(),
            itemId: 'gridPanel',
            width: this.width,
            subjectId: this.subjectId,
            caseId: this.caseId,
            minDate: this.minDate,
            maxDate: this.maxDate,
            tbar: {
                border: true,
                items: [{
                    xtype: 'datefield',
                    fieldLabel: 'Min Date',
                    itemId: 'minDate',
                    labelWidth: 80,
                    width: 200,
                    value: this.minDate
                },{
                    xtype: 'datefield',
                    fieldLabel: 'Max Date',
                    itemId: 'maxDate',
                    labelWidth: 80,
                    width: 200,
                    value: this.maxDate
                },{
                    xtype: 'button',
                    text: 'Reload',
                    handler: function(btn){
                        var panel = btn.up('ehr-clinicalhistorypanel');
                        var minDateField = panel.down('#minDate');
                        var maxDateField = panel.down('#maxDate');
                        if (!minDateField.isValid()){
                            Ext4.Msg.alert('Error', 'Invalid value for min date');
                            return;
                        }
                        if (!maxDateField.isValid()){
                            Ext4.Msg.alert('Error', 'Invalid value for max date');
                            return;
                        }

                        panel.minDate = minDateField.getValue();
                        panel.maxDate = maxDateField.getValue();

                        panel.reloadData({
                            minDate: panel.minDate,
                            maxDate: panel.maxDate
                        });
                    }
                },{
                    text: 'Collapse All',
                    collapsed: false,
                    handler: function(btn){
                        var grid = btn.up('grid');
                        var feature = grid.getView().getFeature('historyGrouping');

                        if (btn.collapsed){
                            feature.expandAll();
                            btn.setText('Collapse All');
                        }
                        else {
                            feature.collapseAll();
                            btn.setText('Expand All')
                        }

                        btn.collapsed = !btn.collapsed;
                    }
                },{
                    text: (this.sortMode == 'type' ? 'Sort By Date' : 'Sort By Type'),
                    sortMode: this.sortMode == 'type' ? 'date' : 'type',
                    scope: this,
                    handler: function(btn){
                        //toggle the button
                        if (btn.sortMode == 'type'){
                            btn.setText('Sort By Date');
                            btn.sortMode = 'date';
                            this.changeMode('type');
                        }
                        else {
                            btn.setText('Sort By Type');
                            btn.sortMode = 'type';
                            this.changeMode('date');
                        }
                    }
                },{
                    text: 'Print Version',
                    hidden: this.hideExportBtn,
                    scope: this,
                    handler: function(btn){
                        var params = {};
                        if (this.subjectId)
                            params.subjectId = [this.subjectId];
                        if (this.caseId)
                            params.caseId = this.caseId;
                        if (this.minDate)
                            params.minDate = this.minDate.format('Y-m-d');
                        if (this.maxDate)
                            params.maxDate = this.maxDate.format('Y-m-d');
                        if (this.sortMode)
                            params.sortMode = this.sortMode;

                        var url = LABKEY.ActionURL.buildURL('ehr', 'clinicalHistoryExport', null, params);
                        window.open(url, '_blank');
                    }
                }]
            }
        };
    },

    reloadData: function(config){
        var grid = this.down('grid');

        grid.setLoading(true);
        grid.store.reloadData({
            minDate: config.minDate,
            maxDate: config.maxDate,
            subjectIds: [this.subjectId],
            caseId: this.caseId,
            sortMode: this.sortMode
        });
    },

    getStoreConfig: function(){
        return {
            type: 'ehr-clinicalhistorystore',
            sortMode: this.sortMode
        };
    },

    getColumnConfig: function(){
        return [{
            text: 'Category',
            dataIndex: 'category',
            width: 180
        },{
            text: 'Date',
            xtype: 'datecolumn',
            dataIndex: 'date',
            format: 'Y-m-d h:i',
            hidden: (this.sortMode == 'date'),
            width: 180
        },{
            text: '',
            dataIndex: 'timeString',
            hidden: (this.sortMode != 'date'),
            width: 80
        },{
            text: 'Description',
            dataIndex: 'html',
            minWidth: 300,
            tdCls: 'ldk-wrap-text',
            flex: 10
        }];
    },

    getGroupingFeature: function(){
        return Ext4.create('Ext.grid.feature.Grouping', {
            groupHeaderTpl: [
                '<div>{name:this.formatName}</div>', {
                    formatName: function(name) {
                        name = name.split('_');
                        var date = name.shift();
                        name = name.join('_');
                        return date + ' (' + name + ')';
                    }
                }
            ],
            hideGroupedHeader: true,
            startCollapsed: false,
            id: 'historyGrouping'
        });
    },

    changeMode: function(mode){
        this.sortMode = mode;
        var grid = this.down('grid');

        var columns = this.getColumnConfig();
        Ext4.Array.forEach(columns, function(col){
            if (col.dataIndex == 'date'){
                col.hidden = (mode == 'date');
            }
            else if (col.dataIndex == 'timeString'){
                col.hidden = (mode == 'type');
            }
        }, this);

        grid.on('reconfigure', function(){
            grid.store.changeMode(mode);
        }, this, {single: true});
        grid.reconfigure(null, columns);
    }
});