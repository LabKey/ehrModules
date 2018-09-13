/*
 * Copyright (c) 2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

Ext4.define('EHR.panel.SearchWithQWPPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ehr-searchwithqwppanel',
    id: 'search_with_qwp_panel',
    style: 'bottom: 5px;',

    initComponent: function(){
        var resultsDataRegionName = 'results_qwp';

        Ext4.apply(this, {
            minHeight: 200,
            width: 672,
            items: [this.getSearchPanel()]
        });
        LDK.Assert.assertNotEmpty('Schema must be specified', this.schemaName);
        LDK.Assert.assertNotEmpty('Query must be specified', this.queryName);

        this.callParent(arguments);

        this.regionElId = Ext4.id();

        this.on('afterrender', function() {
            Ext4.get('search_with_qwp_panel').insertHtml('afterEnd', '<div id="' + this.regionElId + '"></div>');

            new LABKEY.QueryWebPart({
                title: 'Search Results',
                renderTo: this.regionElId,
                containerPath: this.containerPath,
                schemaName: this.schemaName,
                queryName: this.queryName,
                dataRegionName: resultsDataRegionName
            });
        }, this, {single: true});
    },

    getSearchPanel: function() {
        var resultsDataRegionName = 'results_qwp';

        var searchPanel = Ext4.create('LABKEY.ext4.SearchPanel', {
            title: 'Search Criteria',
            LABEL_WIDTH: 200,
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