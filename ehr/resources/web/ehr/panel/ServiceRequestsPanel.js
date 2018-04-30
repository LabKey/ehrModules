/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.panel.ServiceRequestsPanel', {
    extend: 'Ext.tab.Panel',

    minHeight: 300,

    initComponent: function(){
        Ext4.apply(this, {
            items: this.getItems()
        });

        this.loadData();

        this.callParent();
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
                    header: i,
                    items: items
                });
            }
        }

        var tab = this.down('#enterNew');
        tab.removeAll();

        if (sections.length){
            tab.add({
                xtype: 'ldk-navpanel',
                sections: sections
            });
        }
        else {
            tab.add({
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

    getItems: function(){
        var items = [{
            xtype: 'panel',
            style: 'padding: 5px;',
            title: 'New Request',
            itemId: 'enterNew',
            defaults: {
                border: false
            },
            items: [{
                html: '<i class="fa fa-spinner fa-pulse"></i> loading...'
            }]
        }];

        Ext4.each(this.getPendingRequestsTables(), function(requestTable) {
            items.push({
                xtype: 'ldk-querypanel',
                title: 'My Pending ' + requestTable.title + ' Requests',
                style: 'padding: 5px;',
                queryConfig:  {
                    schemaName: 'study',
                    queryName: requestTable.queryName,
                    viewName: requestTable.viewName,
                    removeableFilters: [
                        LABKEY.Filter.create('requestid/createdby/DisplayName', LABKEY.Security.currentUser.displayName, LABKEY.Filter.Types.EQUAL),
                        LABKEY.Filter.create('QCState/Label', 'Request', LABKEY.Filter.Types.STARTS_WITH)
                    ]
                }
            });
        }, this);

        return items;
    }
});