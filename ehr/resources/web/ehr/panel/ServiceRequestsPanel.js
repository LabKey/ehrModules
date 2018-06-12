/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.panel.ServiceRequestsPanel', {
    extend: 'LABKEY.ext4.BootstrapTabPanel',

    initComponent: function(){
        this.items = this.getItems();

        this.callParent();

        this.loadData();
    },

    loadData: function(){
        EHR.Utils.getDataEntryItems({
            includeFormElements: false,
            scope: this,
            success: this.onLoad
        });
    },

    onLoad: function(results){
        var formMap = {};
        Ext4.each(results.forms, function(form){
            if (form.canInsert && form.category == 'Requests'){
                formMap[form.category] = formMap[form.category] || [];
                formMap[form.category].push({
                    name: form.label,
                    url: LABKEY.ActionURL.buildURL('ehr', 'dataEntryForm', null, {formType: form.name})
                });
            }
        }, this);

        var sections = [];
        for (var i in formMap){
            var items = formMap[i];
            items = LDK.Utils.sortByProperty(items, 'name', false);

            if (items.length){
                sections.push({
                    //header: i,
                    items: items
                });
            }
        }

        this.getNewRequestPanel().removeAll();
        if (sections.length){
            this.getNewRequestPanel().add({
                xtype: 'ldk-navpanel',
                sections: sections
            });
        }
        else {
            this.getNewRequestPanel().add({
                html: 'You do not have permission to submit any types of requests.  Please contact your administrator if you believe this is an error.',
                border: false
            });
        }
    },

    getPendingRequestsTables : function() {
        return [
            {title: 'Blood', queryName: 'blood', viewName: 'Requests'},
            {title: 'Treatment', queryName: 'drug', viewName: 'Requests'},
            {title: 'Labwork', queryName: 'Clinpath Runs', viewName: 'Requests'},
            {title: 'Procedure', queryName: 'encounters', viewName: 'Requests'},
            {title: 'Transfer', queryName: 'housing_transfer_requests'}
        ];
    },

    getNewRequestPanel: function() {
        if (!this.newRequestPanel) {
            this.newRequestPanel = Ext4.create('Ext.panel.Panel', {
                border: false,
                items: [{
                    border: false,
                    bodyStyle: 'background-color: transparent;',
                    html: '<i class="fa fa-spinner fa-pulse"></i> loading...'
                }]
            });
        }

        return this.newRequestPanel;
    },

    getPendingRequestsPanel: function() {
        if (!this.pendingRequestsPanel) {
            var items = [];
            Ext4.each(this.getPendingRequestsTables(), function(requestTable) {
                var filters = [];
                if (!requestTable.excludeUserFilter) {
                    filters.push(LABKEY.Filter.create('requestid/createdby/DisplayName', LABKEY.Security.currentUser.displayName, LABKEY.Filter.Types.EQUAL));
                }

                if (requestTable.explicitQCStateFilter) {
                    filters.push(LABKEY.Filter.create('QCState/Label', requestTable.explicitQCStateFilter, LABKEY.Filter.Types.EQUAL));
                }
                else {
                    filters.push(LABKEY.Filter.create('QCState/Label', 'Request', LABKEY.Filter.Types.STARTS_WITH));
                }

                var schemaName = requestTable.schemaName || 'study';

                items.push({
                    title: LABKEY.Utils.encodeHtml(requestTable.title),
                    items: [{
                        xtype: 'ldk-querycmp',
                        queryConfig:  {
                            dataRegionName: schemaName + '|' + requestTable.queryName,
                            schemaName: schemaName,
                            queryName: requestTable.queryName,
                            viewName: requestTable.viewName,
                            removeableFilters: filters
                        }
                    }]
                });
            }, this);

            this.pendingRequestsPanel = Ext4.create('LABKEY.ext4.BootstrapTabPanel', {
                usePills: true,
                items: items
            });
        }

        return this.pendingRequestsPanel;
    },

    getQueueSections: function(){
        return [];
    },

    getItems: function(){
        var items = [{
            title: 'New Request',
            itemId: 'newRequest',
            items: [this.getNewRequestPanel()]
        },{
            title: 'My Pending Requests',
            itemId: 'myPendingRequests',
            items: [this.getPendingRequestsPanel()]
        }];

        var queueSections = this.getQueueSections();
        if (queueSections != null && Ext4.isArray(queueSections) && queueSections.length > 0) {
            items.push({
                title: 'Queues',
                itemId: 'queues',
                items: [{
                    xtype: 'ldk-navpanel',
                    sections: queueSections
                }]
            });
        }

        return items;
    }
});