/*
 * Copyright (c) 2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

resultsDataRegionName = 'results_qwp';

Ext4.define('EHR.panel.SearchWithQWPPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ehr-searchwithqwppanel',
    id: 'search_with_qwp_panel',
    style: 'margin-bottom: 5px',
    width: 672,

    initComponent: function(){
        LDK.Assert.assertNotEmpty('Schema must be specified', this.schemaName);
        LDK.Assert.assertNotEmpty('Query must be specified', this.queryName);

        this.items = [this.getSearchPanel()];
        this.callParent(arguments);

        this.on('afterrender', function() {
            if (this.schemaName && this.queryName) {
                var regionElId = Ext4.id();

                Ext4.get('search_with_qwp_panel').insertHtml('afterEnd', '<div id="' + regionElId + '"></div>');

                new LABKEY.QueryWebPart({
                    title: 'Search Results',
                    renderTo: regionElId,
                    containerPath: this.containerPath,
                    schemaName: this.schemaName,
                    queryName: this.queryName,
                    dataRegionName: resultsDataRegionName
                });
            }
        }, this, {single: true});
    },

    getSearchPanel: function() {
        var searchPanel = Ext4.create('LABKEY.ext4.SearchPanel', {
            title: 'Search Criteria',
            width: 660,
            schemaName: this.schemaName,
            queryName: this.queryName,
            viewName: this.searchViewName,
            defaultViewName: this.searchDefaultViewName || '',
            style: 'margin: 5px;',
            allowSelectView: this.searchAllowSelectView !== undefined ? this.searchAllowSelectView : false,
            onSubmit: function() {
                var params = {};

                var cf = this.down('#containerFilterName');
                if (cf && cf.getValue()){
                    params[resultsDataRegionName + '.containerFilterName'] = cf.getValue();
                }
                else if (this.defaultContainerFilter){
                    params[resultsDataRegionName + '.containerFilterName'] = this.defaultContainerFilter;
                }

                var vf = this.down('#viewNameField');
                if (vf && vf.getValue()){
                    params[resultsDataRegionName + '.viewName'] = vf.getValue();
                }

                Ext4.apply(params, this.getParams(resultsDataRegionName));

                // overriding onSubmit() to change the location here
                window.location = LABKEY.ActionURL.buildURL(
                        LABKEY.ActionURL.getController(),
                        LABKEY.ActionURL.getAction(),
                        LABKEY.ActionURL.getContainer(),
                        params
                );
            }
        });
        return searchPanel;
    }
});