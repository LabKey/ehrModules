/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.panel.EnterDataPanel', {
    extend: 'LABKEY.ext4.BootstrapTabPanel',

    additionalEnterNewSections:[],

    initComponent: function(){
        this.items = this.getItems();

        this.callParent();

        this.loadData();
    },

    loadData: function(){
        EHR.Utils.getDataEntryItems({
            includeFormElements: false,
            success: this.onLoad,
            scope: this
        });
    },

    onLoad: function(results){
        var formMap = {};
        Ext4.each(results.forms, function(form){
            if (form.isAvailable && form.isVisible && form.canInsert){
                formMap[form.category] = formMap[form.category] || [];
                formMap[form.category].push({
                    name: form.label,
                    url: LABKEY.ActionURL.buildURL('ehr', 'dataEntryForm', null, {formType: form.name})
                });
            }
        }, this);

        var sectionNames = Ext4.Object.getKeys(formMap);
        sectionNames = sectionNames.sort();

        var sections = [];
        Ext4.Array.forEach(sectionNames, function(section){
            var items = formMap[section];
            items = LDK.Utils.sortByProperty(items, 'name', false);
            sections.push({
                header: section,
                items: items
            });
        }, this);

        sections = sections.concat(this.additionalEnterNewSections);

        this.getEnterNewPanel().removeAll();
        this.getEnterNewPanel().add({
            xtype: 'ldk-navpanel',
            sections: sections
        });
    },

    getEnterNewPanel: function() {
        if (!this.enterNewPanel) {
            this.enterNewPanel = Ext4.create('Ext.panel.Panel', {
                border: false,
                items: [this.getLoadingConfig()]
            });
        }

        return this.enterNewPanel;
    },

    getLoadingConfig: function() {
        return {
            border: false,
            bodyStyle: 'background-color: transparent;',
            html: '<i class="fa fa-spinner fa-pulse"></i> loading...'
        };
    },

    getItems: function(){
        return [{
            title: 'Enter New Data',
            itemId: 'enterNew',
            items: [
                this.getEnterNewPanel()
            ]
        },{
            title: 'My Tasks',
            itemId: 'myTasks',
            items: [{
                xtype: 'ldk-querycmp',
                queryConfig:  {
                    schemaName: 'ehr',
                    queryName: 'my_tasks',
                    viewName: 'Active Tasks'
                }
            }]
        },{
            title: 'All Tasks',
            itemId: 'allTasks',
            items: [{
                xtype: 'ldk-querycmp',
                queryConfig:  {
                    schemaName: 'ehr',
                    queryName: 'tasks',
                    viewName: 'Active Tasks'
                }
            }]
        },{
            title: 'Queues',
            itemId: 'queues',
            items: [{
                xtype: 'ldk-navpanel',
                sections: this.getQueueSections()
            }]
        }]
    },

    getQueueSections: function() {
        return [{
            header: 'Reports',
            renderer: function (item) {
                return item;
            },
            items: [{
                xtype: 'ldk-linkbutton',
                text: 'Service Request Summary',
                linkCls: 'labkey-text-link',
                href: LABKEY.ActionURL.buildURL('ldk', 'runNotification', null, {key: 'org.labkey.onprc_ehr.notification.RequestAdminNotification'})
            }]
        },{
            header: 'Blood Draw Requests',
            renderer: function(item){
                return {
                    layout: 'hbox',
                    bodyStyle: 'padding: 2px;background-color: transparent;',
                    defaults: {
                        border: false,
                        bodyStyle: 'background-color: transparent;'
                    },
                    items: [{
                        html: LABKEY.Utils.encodeHtml(item.name) + ':',
                        width: 200
                    },{
                        xtype: 'ldk-linkbutton',
                        text: 'Unapproved Requests',
                        linkCls: 'labkey-text-link',
                        href: LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {schemaName: 'study', 'query.queryName': 'Blood Draws', 'query.viewName': 'Requests', 'query.QCState/Label~eq': 'Request: Pending', 'query.chargetype~eq': item.chargeType})
                    },{
                        xtype: 'ldk-linkbutton',
                        text: 'Approved Requests',
                        linkCls: 'labkey-text-link',
                        style: 'padding-left: 5px;',
                        href: LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {schemaName: 'study', 'query.queryName': 'Blood Draws', 'query.viewName': 'Requests', 'query.QCState/Label~eq': 'Request: Approved', 'query.chargetype~eq': item.chargeType})
                    },{
                        xtype: 'ldk-linkbutton',
                        text: 'Scheduled Today',
                        linkCls: 'labkey-text-link',
                        style: 'padding-left: 5px;',
                        href: LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {schemaName: 'study', 'query.queryName': 'Blood Draws', 'query.viewName': 'Requests', 'query.QCState/Label~eq': 'Request: Approved', 'query.chargetype~eq': item.chargeType, 'query.date~dateeq': (new Date()).format('Y-m-d')})
                    }]
                }
            },
            items: [{
                name: 'ASB Services',
                chargeType: 'DCM: ASB Services'
            },{
                name: 'Colony Services',
                chargeType: 'DCM: Colony Services'
            }]
        },{
            header: 'Treatment Requests',
            renderer: function(item){
                return {
                    layout: 'hbox',
                    bodyStyle: 'padding: 2px;background-color: transparent;',
                    defaults: {
                        border: false,
                        bodyStyle: 'background-color: transparent;'
                    },
                    items: [{
                        html: LABKEY.Utils.encodeHtml(item.name) + ':',
                        width: 200
                    },{
                        xtype: 'ldk-linkbutton',
                        text: 'Unapproved Requests',
                        linkCls: 'labkey-text-link',
                        href: LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {schemaName: 'study', 'query.queryName': 'drug', 'query.viewName': 'Requests', 'query.QCState/Label~eq': 'Request: Pending', 'query.chargetype~eq': item.chargeType})
                    },{
                        xtype: 'ldk-linkbutton',
                        text: 'Approved Requests',
                        linkCls: 'labkey-text-link',
                        style: 'padding-left: 5px;',
                        href: LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {schemaName: 'study', 'query.queryName': 'drug', 'query.viewName': 'Requests', 'query.QCState/Label~eq': 'Request: Approved', 'query.chargetype~eq': item.chargeType})
                    },{
                        xtype: 'ldk-linkbutton',
                        text: 'Scheduled Today',
                        linkCls: 'labkey-text-link',
                        style: 'padding-left: 5px;',
                        href: LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {schemaName: 'study', 'query.queryName': 'drug', 'query.viewName': 'Requests', 'query.QCState/Label~eq': 'Request: Approved', 'query.chargetype~eq': item.chargeType, 'query.date~dateeq': (new Date()).format('Y-m-d')})
                    }]
                }
            },
            items: [{
                name: 'ASB Services',
                chargeType: 'DCM: ASB Services'
            },{
                name: 'Colony Services',
                chargeType: 'DCM: Colony Services'
            }]
        },{
            header: 'Procedure Requests',
            renderer: function(item){
                return {
                    layout: 'hbox',
                    bodyStyle: 'padding: 2px;background-color: transparent;',
                    defaults: {
                        border: false,
                        bodyStyle: 'background-color: transparent;'
                    },
                    items: [{
                        html: LABKEY.Utils.encodeHtml(item.name) + ':',
                        width: 200
                    },{
                        xtype: 'ldk-linkbutton',
                        text: 'Unapproved Requests',
                        linkCls: 'labkey-text-link',
                        href: LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {schemaName: 'study', 'query.queryName': 'encounters', 'query.viewName': 'Requests', 'query.QCState/Label~eq': 'Request: Pending', 'query.chargetype~eq': item.chargeType})
                    },{
                        xtype: 'ldk-linkbutton',
                        text: 'Approved Requests',
                        linkCls: 'labkey-text-link',
                        style: 'padding-left: 5px;',
                        href: LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {schemaName: 'study', 'query.queryName': 'encounters', 'query.viewName': 'Requests', 'query.QCState/Label~eq': 'Request: Approved', 'query.chargetype~eq': item.chargeType})
                    },{
                        xtype: 'ldk-linkbutton',
                        text: 'Scheduled Today',
                        linkCls: 'labkey-text-link',
                        style: 'padding-left: 5px;',
                        href: LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {schemaName: 'study', 'query.queryName': 'encounters', 'query.viewName': 'Requests', 'query.QCState/Label~eq': 'Request: Approved', 'query.chargetype~eq': item.chargeType, 'query.date~dateeq': (new Date()).format('Y-m-d')})
                    }]
                }
            },
            items: [{
                name: 'ASB Services',
                chargeType: 'DCM: ASB Services'
            },{
                name: 'Colony Services',
                chargeType: 'DCM: Colony Services'
            }]
        },{
            header: 'Lab Tests',
            renderer: function(item){
                return item;
            },
            items: [{
                layout: 'hbox',
                bodyStyle: 'padding: 2px;background-color: transparent;',
                defaults: {
                    border: false,
                    bodyStyle: 'background-color: transparent;'
                },
                items: [{
                    html: 'Clinpath:',
                    width: 200
                },{
                    xtype: 'ldk-linkbutton',
                    text: 'Requests With Manual Results',
                    linkCls: 'labkey-text-link',
                    href: LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {schemaName: 'study', 'query.queryName': 'Clinpath Runs', 'query.viewName': 'Requests', 'query.QCState/Label~startswith': 'Request:', 'query.servicerequested/chargetype~eq': 'Clinpath', 'query.mergeSyncInfo/automaticresults~eq': false})
                },{
                    xtype: 'ldk-linkbutton',
                    text: 'Requests With Automatic Results',
                    linkCls: 'labkey-text-link',
                    href: LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {schemaName: 'study', 'query.queryName': 'Clinpath Runs', 'query.viewName': 'Requests', 'query.QCState/Label~startswith': 'Request:', 'query.servicerequested/chargetype~eq': 'Clinpath', 'query.mergeSyncInfo/automaticresults~eq': true})
                }]
            },{
                layout: 'hbox',
                bodyStyle: 'padding: 2px;background-color: transparent;',
                defaults: {
                    border: false,
                    bodyStyle: 'background-color: transparent;'
                },
                items: [{
                    html: 'SPF Surveillance:',
                    width: 200
                },{
                    xtype: 'ldk-linkbutton',
                    text: 'All Requests',
                    linkCls: 'labkey-text-link',
                    href: LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {schemaName: 'study', 'query.queryName': 'Clinpath Runs', 'query.QCState/Label~startswith': 'Request:', 'query.servicerequested/chargetype~eq': 'SPF Surveillance Lab'})
                }]
            }]
        },{
            header: 'Transfer Requests',
            renderer: function(item){
                return {
                    layout: 'hbox',
                    bodyStyle: 'padding: 2px;background-color: transparent;',
                    defaults: {
                        border: false,
                        bodyStyle: 'background-color: transparent;'
                    },
                    items: [{
                        html: LABKEY.Utils.encodeHtml(item.name) + ':',
                        width: 200
                    },{
                        xtype: 'ldk-linkbutton',
                        text: 'Unapproved Requests',
                        linkCls: 'labkey-text-link',
                        href: LABKEY.ActionURL.buildURL('query', 'executeQuery', null, Ext4.apply({schemaName: 'onprc_ehr', 'query.queryName': 'housing_transfer_requests', 'query.viewName': 'Unapproved Requests'}, item.areaFilter))
                    },{
                        xtype: 'ldk-linkbutton',
                        text: 'Approved Requests',
                        linkCls: 'labkey-text-link',
                        href: LABKEY.ActionURL.buildURL('query', 'executeQuery', null, Ext4.apply({schemaName: 'onprc_ehr', 'query.queryName': 'housing_transfer_requests', 'query.viewName': 'Approved Requests'}, item.areaFilter))
                    },{
                        xtype: 'ldk-linkbutton',
                        text: 'Transfers Today',
                        linkCls: 'labkey-text-link',
                        href: LABKEY.ActionURL.buildURL('query', 'executeQuery', null, Ext4.apply({schemaName: 'onprc_ehr', 'query.queryName': 'housing_transfer_requests', 'query.viewName': 'Approved Requests', 'query.date~dateeq': (new Date()).format('Y-m-d')}, item.areaFilter))
                    }]
                }
            },
            items: [{
                name: 'Corral',
                chargeType: 'DCM: Colony Services',
                areaFilter: {
                    'query.room/area~eq': 'Corral'
                }
            },{
                name: 'PENS/Shelters',
                chargeType: 'DCM: ASB Services',
                areaFilter: {
                    'query.room/area~in': 'PENS;Shelters'
                }
            },{
                name: 'All Other',
                areaFilter: {
                    'query.room/area~notin': 'Corral;PENS;Shelters'
                }
            }]
        }];
    }
});