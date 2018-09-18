/*
 * Copyright (c) 2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

Ext4.define('EHR.panel.SearchWithQWPPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ehr-searchwithqwppanel',

    style: 'margin-bottom: 5px',
    width: 672,
    resultsDataRegionName: 'results_qwp',

    initComponent: function(){
        LDK.Assert.assertNotEmpty('Schema must be specified', this.schemaName);
        LDK.Assert.assertNotEmpty('Query must be specified', this.queryName);

        this.items = [this.getSearchPanel()];
        this.callParent(arguments);

        this.on('afterrender', function() {
            if (this.schemaName && this.queryName) {
                var regionElId = Ext4.id();
                this.getEl().insertHtml('afterEnd', '<div id="' + regionElId + '"></div>');

                new LABKEY.QueryWebPart({
                    title: 'Search Results',
                    renderTo: regionElId,
                    containerPath: this.containerPath,
                    schemaName: this.schemaName,
                    queryName: this.queryName,
                    dataRegionName: this.resultsDataRegionName
                });
            }
        }, this, {single: true});
    },

    getSearchPanel: function() {
        return Ext4.create('LABKEY.ext4.SearchPanel', {
            title: 'Search Criteria',
            width: 660,
            schemaName: this.schemaName,
            queryName: this.queryName,
            viewName: this.searchViewName,
            defaultViewName: this.searchDefaultViewName || '',
            style: 'margin: 5px;',
            showContainerFilter: this.showContainerFilter,
            allowSelectView: this.allowSelectView,
            onSubmit: function() {
                // the this object is the SearchPanel, we need to get the resultsDataRegionName from the SearchWithQWPPanel
                var dataRegionName = this.up('panel').resultsDataRegionName;

                var params = {};
                Ext4.apply(params, this.getBaseParams(dataRegionName));
                Ext4.apply(params, this.getParams(dataRegionName));

                // overriding onSubmit() to change the location here
                window.location = LABKEY.ActionURL.buildURL(
                        LABKEY.ActionURL.getController(),
                        LABKEY.ActionURL.getAction(),
                        LABKEY.ActionURL.getContainer(),
                        params
                );
            }
        });
    }
});