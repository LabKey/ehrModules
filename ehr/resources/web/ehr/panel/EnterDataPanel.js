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
            bodyStyle: 'padding: 5px;',
            title: 'My Tasks',
            queryConfig:  {
                schemaName: 'ehr',
                queryName: 'my_tasks',
                viewName: 'Active Tasks'
            }
        },{
            xtype: 'ldk-querypanel',
            bodyStyle: 'padding: 5px;',
            title: 'All Tasks',
            queryConfig:  {
                schemaName: 'ehr',
                queryName: 'tasks',
                viewName: 'Active Tasks'
            }
        },{
            xtype: 'panel',
            bodyStyle: 'padding: 5px;',
            title: 'Enter New Data',
            itemId: 'enterNew',
            defaults: {
                border: false
            },
            items: [{
                html: 'Loading...'
            }]
        },{
            title: 'Manage Requests',
            bodyStyle: 'padding: 5px;',
            items: [{
                xtype: 'ldk-navpanel',
                sections: [{
                    header: 'Blood Draws',
                    items: [{
                        name: 'Unapproved Requests',
                        url: LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {schemaName: 'study', 'query.queryName': 'Blood Draws', 'query.viewName': 'Blood Requests', 'query.QCState/Label~eq': 'Request: Pending'})
                    },{
                        name: 'Approved Requests',
                        url: LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {schemaName: 'study', 'query.queryName': 'Blood Draws', 'query.viewName': 'Blood Schedule', 'query.QCState/Label~eq': 'Request: Approved'})
                    }]
                },{
                    header: 'Lab Tests',
                    items: [{
                        name: 'Unapproved Requests',
                        url: LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {schemaName: 'study', 'query.queryName': 'Clinpath Runs', 'query.QCState/Label~eq': 'Request: Pending'})
                    },{
                        name: 'Approved Requests',
                        url: LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {schemaName: 'study', 'query.queryName': 'Clinpath Runs', 'query.QCState/Label~eq': 'Request: Approved'})
                    }]
                }]
            }]
        }]
    }
});