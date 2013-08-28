/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.panel.EnterDataPanel', {
    extend: 'Ext.tab.Panel',

    initComponent: function(){
        LABKEY.ExtAdapter.apply(this, {
            items: this.getItems()
        });

        this.loadData();

        this.callParent();
    },

    loadData: function(){
        EHR.Utils.getDataEntryItems({
            scope: this,
            success: this.onLoad
        });
    },

    onLoad: function(results){
        var formMap = {};
        Ext4.each(results.forms, function(form){
            if (form.isAvailable){
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
            sections.push({
                header: i,
                items: items
            });
        }

        var tab = this.down('#enterNew');
        tab.removeAll();
        tab.add({
            xtype: 'ldk-navpanel',
            sections: sections
        });
    },

    getItems: function(){
        return [{
            xtype: 'ldk-querypanel',
            bodyStyle: 'margin: 5px;',
            title: 'My Tasks',
            queryConfig:  {
                schemaName: 'ehr',
                queryName: 'my_tasks',
                viewName: 'Active Tasks'
            }
        },{
            xtype: 'ldk-querypanel',
            bodyStyle: 'margin: 5px;',
            title: 'All Tasks',
            queryConfig:  {
                schemaName: 'ehr',
                queryName: 'tasks',
                viewName: 'Active Tasks'
            }
        },{
            xtype: 'panel',
            bodyStyle: 'margin: 5px;',
            title: 'Enter New Data',
            itemId: 'enterNew',
            defaults: {
                border: false
            },
            items: [{
                html: 'Loading...'
            }]
        },{
            title: 'Queues',
            bodyStyle: 'margin: 5px;',
            items: [{
                xtype: 'ldk-navpanel',
                sections: [{
                    header: 'Blood Draws',
                    items: [{
                        name: 'Requests for CMU',
                        url: LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {schemaName: 'study', 'query.queryName': 'Blood Draws', 'query.viewName': 'Requests', 'query.QCState/Label~startswith': 'Request:', 'query.chargetype~eq': 'DCM: CMU'})
                    },{
                        name: 'Requests for RFO',
                        url: LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {schemaName: 'study', 'query.queryName': 'Blood Draws', 'query.viewName': 'Requests', 'query.QCState/Label~startswith': 'Request:', 'query.chargetype~eq': 'DCM: RFO'})
                    },{
                        name: 'Requests for Surgery',
                        url: LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {schemaName: 'study', 'query.queryName': 'Blood Draws', 'query.viewName': 'Requests', 'query.QCState/Label~startswith': 'Request:', 'query.chargetype~eq': 'DCM: Surgery'})
                    },{
                        name: 'Requests for Research Staff',
                        url: LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {schemaName: 'study', 'query.queryName': 'Blood Draws', 'query.viewName': 'Requests', 'query.QCState/Label~startswith': 'Request:', 'query.chargetype~eq': 'Research Staff'})
                    }]
                },{
                    header: 'Lab Tests',
                    items: [{
                        name: 'Clinpath Requests',
                        url: LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {schemaName: 'study', 'query.queryName': 'Clinpath Runs', 'query.QCState/Label~startswith': 'Request:', 'query.servicerequested/chargetype~eq': 'Clinpath'})
                    },{
                        name: 'SPF Surveillance Requests',
                        url: LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {schemaName: 'study', 'query.queryName': 'Clinpath Runs', 'query.QCState/Label~startswith': 'Request:', 'query.servicerequested/chargetype~eq': 'SPF Surveillance'})
                    }]
                },{
                    header: 'Procedures',
                    items: [{
                        name: 'Surgery Requests',
                        url: LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {schemaName: 'study', 'query.queryName': 'encounters', 'query.QCState/Label~startswith': 'Request:', 'query.type~eq': 'Surgery'})
                    }]
                }]
            }]
        }]
    }
});