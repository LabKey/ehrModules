/*
 * Copyright (c) 2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

Ext4.define('EHR.panel.StudyDatasetsPanel', {
    extend: 'Ext.panel.Panel',

    border: false,
    bodyStyle: 'background-color: transparent;',
    defaults: {
        border: false,
        bodyStyle: 'background-color: transparent;'
    },

    displayField: 'Label',
    headerField: 'categoryId/label',
    showBrowseAliveAtCenter: false,
    showLabelQueryName: false,
    showSearch: false,
    labelWidth: null,

    initComponent: function () {
        this.items = [{
            html: '<i class="fa fa-spinner fa-pulse"></i> loading...'
        }];

        this.callParent();

        EHR.Security.init({
            success: function(){
                LABKEY.Query.selectRows({
                    schemaName: 'study',
                    queryName: 'DataSets',
                    columns: 'categoryId/label,name,label,ShowByDefault',
                    success: this.onSuccess,
                    scope: this,
                    failure: EHR.Utils.onError,
                    sort: this.headerField + ',' + this.displayField,
                    filterArray: this.filterArray
                });
            },
            scope: this
        });
    },

    onSuccess: function(data) {
        var me = this;

        var menuCfg = {
            sections: [],
            sectionHeaderCls: 'class',
            renderer: function(record){
                var item = {
                    schemaName: 'study',
                    queryName: record.data.Name,
                    label: record.data.Label
                };

                var items = [this.getLabelItemCfg(item, {showQueryName: me.showLabelQueryName, width: me.labelWidth})];

                if (me.showBrowseAliveAtCenter) {
                    items.push(this.getBrowseItemCfg(item, {
                        browseTooltip: 'Browse All Alive at Center',
                        url: LABKEY.ActionURL.buildURL("query", "executeQuery", null, {
                            schemaName: item.schemaName,
                            'query.queryName': item.queryName,
                            'query.Id/Demographics/calculated_status/meaning~eq': 'Alive'
                        })
                    }));
                }

                items.push(this.getBrowseItemCfg(item, {
                    url: LABKEY.ActionURL.buildURL("query", "executeQuery", null, {schemaName: item.schemaName, 'query.queryName': item.queryName})
                }));

                if (me.showSearch) {
                    items.push(this.getSearchItemCfg(item, {
                        url: LABKEY.ActionURL.buildURL("query", "searchPanel", null, {schemaName: item.schemaName, queryName: item.queryName})
                    }));
                }

                //NOTE: disabled because there is now a menu item on each dataset under 'more actions' that toggles to the edit UI.  that link will retain filters, and is accessible from all pages
                //if (EHR.Security.hasPermission('Completed', 'admin', {schemaName: 'study', queryName: item.queryName})){
                //    items.push({
                //        xtype: 'ldk-linkbutton',
                //        tooltip: item.searchTooltip || 'Click to update records',
                //        href: LABKEY.ActionURL.buildURL('ehr', 'updateQuery', null, {schemaName: 'study', 'query.queryName': item.queryName, 'keyField': 'lsid'}),
                //        text: 'Update Records'
                //    });
                //}

                return {
                    layout: 'hbox',
                    bodyStyle: 'background-color: transparent;',
                    defaults: LDK.panel.NavPanel.ITEM_DEFAULTS,
                    items: items
                };
            }
        };

        var sections = {};
        var section;
        for (var i=0;i<data.rows.length;i++){
            var row = data.rows[i];
            if(!row.ShowByDefault){
                continue;
            }

            var sectionName = row[this.headerField] || '';
            if (!sections[sectionName]){
                section = {header: sectionName, items: []};
                sections[sectionName] = section;

                menuCfg.sections.push(section);
            }
            else
                section = sections[sectionName];

            section.items.push({name: row[this.displayField], data: row})

        }

        this.removeAll();
        this.add(Ext4.create('LDK.panel.NavPanel', menuCfg));
    }
});