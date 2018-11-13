/*
 * Copyright (c) 2013-2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg taskId
 * @cfg requestId
 */
Ext4.define('EHR.panel.DataEntryFormDetailsPanel', {
    extend: 'Ext.panel.Panel',

    border: false,
    bodyStyle: 'background-color: transparent;',
    defaults: {
        border: false,
        bodyStyle: 'background-color: transparent;'
    },

    initComponent: function(){
        this.items = [{
            html: '<i class="fa fa-spinner fa-pulse"></i> loading...'
        }];

        this.dockedItems = [{
            xtype: 'toolbar',
            dock: 'bottom',
            ui: 'footer',
            style: 'background-color: transparent;',
            padding: '20px 0 0 0',
            items: [{
                text: 'Edit',
                disabled: true,
                hidden: true,
                scope: this,
                itemId: 'editBtn',
                handler: function(){
                    var url = window.location.href;
                    url = url.replace('dataEntryFormDetails', 'dataEntryForm');
                    window.location = url;
                }
            }]
        }];

        this.callParent();

        this.loadData();
    },

    loadData: function(){
        LABKEY.Ajax.request({
            url: LABKEY.ActionURL.buildURL('ehr', 'getDataEntryFormDetails', null, {
                taskId: this.taskId,
                requestId: this.requestId,
                formType: this.formType
            }),
            scope: this,
            failure: LDK.Utils.getErrorCallback(),
            success: LABKEY.Utils.getCallbackWrapper(this.onLoad, this)
        });
    },

    onLoad: function(results){
        if (results.canRead === false){
            this.removeAll();
            this.add({
                html: 'You do not have permission to read this type of form.',
                border: false
            });
            return;
        }

        var queries = [];
        var queryMap = {};
        Ext4.Array.forEach(results.form.sections, function(section){
            if (section.queries){
                Ext4.Array.forEach(section.queries, function(query){
                    var key = query.schemaName + '.' + query.queryName;
                    if (!queryMap[key]){
                        query.label = section.label;
                        query.serverStoreSort = section.serverStoreSort;
                        queries.push(query);
                        queryMap[key] = true;
                    }
                }, this);
            }
        }, this);

        var filterArray = [];
        var viewName =  undefined;
        var navTitle = 'Details';

        if (this.taskId) {
            filterArray.push(LABKEY.Filter.create('taskid', this.taskId, LABKEY.Filter.Types.EQUAL));
            navTitle = 'Task Details';
        }
        if (this.requestId) {
            filterArray.push(LABKEY.Filter.create('requestid', this.requestId, LABKEY.Filter.Types.EQUAL));
            viewName = 'Requests';
            navTitle = 'Request Details';

            // for a request, show the edit button based on the QC status of the parent ehr.request record
            this.getParentRequestStatus(function(qcStateId, qcStateLabel) {
                this.showEditBtn(qcStateLabel, results.form.permissions);
            });
        }

        LDK.Assert.assertTrue('No filter array applied in DataEntryFormDetailsPanel', filterArray.length > 0);
        LABKEY.NavTrail.setTrail(navTitle, null, navTitle, true, false);

        var toAdd = [];
        Ext4.Array.forEach(queries, function(q){
            var id = LABKEY.Utils.id();
            var isPrimaryCmp = q.schemaName === 'ehr' && (q.queryName === 'requests' || q.queryName === 'tasks');

            toAdd.push({
                xtype: 'ldk-querycmp',
                id: 'ldk-querycmp-' + id,
                style: 'margin-bottom: 20px;',
                queryConfig: {
                    id: id,
                    title: LABKEY.Utils.encodeHtml(q.label),
                    frame: isPrimaryCmp ? 'portal' : 'dialog',
                    schemaName: q.schemaName,
                    queryName: q.queryName,
                    viewName: viewName,
                    filters: filterArray,
                    //note: changed to removeableSort so it will take priority over any view-based sorts
                    removeableSort: viewName === undefined ? q.serverStoreSort : undefined,
                    success: this.onDataRegionLoad,
                    scope: this
                }
            });
        }, this);

        this.showEditBtn('Completed', results.form.permissions);

        this.removeAll();
        this.add(toAdd);
    },

    getParentRequestStatus: function(callback) {
        LABKEY.Query.selectRows({
            schemaName: 'ehr',
            queryName: 'requests',
            columns: 'qcstate,qcstate/label',
            filterArray: [LABKEY.Filter.create('requestid', this.requestId)],
            scope: this,
            success: function(data) {
                if (data.rows && data.rows.length === 1 && callback) {
                    callback.call(this, data.rows[0]['qcstate'], data.rows[0]['qcstate/label'])
                }
            }
        });
    },

    showEditBtn: function(qcStateLabelToCheck, permissions) {
        if (qcStateLabelToCheck && permissions) {
            var hasPermissions = EHR.DataEntryUtils.hasPermission(qcStateLabelToCheck, 'update', permissions, null);
            if (hasPermissions){
                var btn = this.down('#editBtn');
                btn.setVisible(true);
                btn.setDisabled(false);
            }
        }
    },

    onDataRegionLoad: function(dr){
        var drEl = Ext4.get(dr.domId);
        LDK.Assert.assertNotEmpty('Unable to find dataRegion element in DataEntryFormDetailsPanel', drEl);

        if (drEl) {
            if (dr.totalRows > 0) {
                var itemWidth = drEl.getSize().width + 100;
                if (itemWidth > this.getWidth()){
                    this.setWidth(itemWidth + 20);
                }
            }
            else {
                Ext4.getCmp('ldk-querycmp-' + dr.id).hide();
            }
        }
    }
});
