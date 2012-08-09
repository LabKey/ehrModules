/*
 * Copyright (c) 2010-2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.namespace('EHR.ext');
LABKEY.requiresScript("/ehr/utils.js");


/**
 * Constructs a new EHR DetailsView using the supplied configuration.
 * @class
 * EHR extension to the Ext.Panel class, which is designed to display one or multiple records, creating a details view (essentially a read-only form) per record.
 *
 * <p>If you use any of the LabKey APIs that extend Ext APIs, you must either make your code open source or
 * <a href="https://www.labkey.org/wiki/home/Documentation/page.view?name=extDevelopment">purchase an Ext license</a>.</p>
 *            <p>Additional Documentation:
 *              <ul>
 *                  <li><a href="https://www.labkey.org/wiki/home/Documentation/page.view?name=javascriptTutorial">LabKey JavaScript API Tutorial</a></li>
 *                  <li><a href="https://www.labkey.org/wiki/home/Documentation/page.view?name=labkeyExt">Tips for Using Ext to Build LabKey Views</a></li>
 *              </ul>
 *           </p>
 *
 * @constructor
 * @augments Ext.Panel
 * @param config Configuration properties. This may contain any of the configuration properties supported by Ext.Panel, plus those listed here.
 * @param {String} [config.containerPath] The container path from which to query the server. If not specified, the current container is used.
 * @param {String} [config.schemaName] The LabKey schema to query.
 * @param {String} [config.queryName] The query name within the schema to fetch.
 * @param {String} [config.viewName] A saved custom view of the specified query to use if desired.
 * @param {Array} [config.filterArray] An array filter objected created using LABKEY.Filter.create().
 * @param {String} [config.titleField] If supplied, then the value of this field will be appended to the title of each DetailsView that is created (normally 1 per record)
 * @param {Boolean} [config.multiToGrid] If true and more than 1 record is returned, the records will be displayed in a QueryWebPart instead of one panel per record
 * @param {Object} [config.qwpConfig] A config object for a LABKEY.QueryWebPart.  If multiToGrid is true and more than 1 record is returned, this config object will be passed to the LABKEY.QueryWebPart
 *
 * @example &lt;script type="text/javascript"&gt;
    Ext.onReady(function(){
        //create a grid using that store as the data source
        new EHR.ext.DetailsView({
            schemaName: 'core',
            schemaName: 'users',
            filterArray: [LABKEY.Filter.create('UserId', LABKEY.Security.currentUser.id, LABKEY.Filter.Types.EQUAL)],
            renderTo: 'grid',
            width: 800,
            title: 'Example'
        });
    });


&lt;/script&gt;
&lt;div id='grid'/&gt;
 */
EHR.ext.DetailsView = Ext.extend(Ext.Panel, {
    initComponent: function(){
        this.title = Ext.isDefined(this.title) ?  this.title : 'Details';

        Ext.apply(this, {
            items: [{html: 'Loading...'}],
            layout: 'form',
            bodyStyle: 'padding:5px',
            autoHeight: true,
            bodyBorder: false,
            //cls: 'x-labkey-wp',
            border: true,
            frame: false,
            labelWidth: this.labelWidth || 150,
            style: 'margin-bottom:20px',
            defaults: {
                labelStyle: 'padding: 0px;',
                border: false
            }
        });

        EHR.ext.DetailsView.superclass.initComponent.call(this, arguments);

        var required = ['schemaName', 'queryName'];
        for (var i=0;i<required.length;i++){
            if (!this[required[i]]){
                alert('Required: '+required[i]);
                return false;
            }
        }

        this.queryConfig = {
            requiredVersion: 9.1,
            queryName: this.queryName,
            schemaName: this.schemaName,
            viewName: this.viewName,
            filterArray: this.filterArray,
            success: function(data){
                this.queryData = data;
                this.loadQuery();
            },
            failure: EHR.Utils.onError,
            scope: this,
            maxRows: 100
        };

        if (!this.fields){
            LABKEY.Query.selectRows(this.queryConfig);
        }
    },

    //private
    loadQuery: function(){
        if(!this.rendered){
            this.on('render', this.loadQuery, this, {single: true});
            return;
        }

        var data = this.queryData;
        this.removeAll();

        if (!data.rows.length){
            this.add({html: 'No records found'});
            this.doLayout();
            return;
        }
        else if (data.rows.length > 1 && this.multiToGrid){
            Ext.applyIf(this.queryConfig, {
                allowChooseQuery: false,
                allowChooseView: true,
                showInsertNewButton: false,
                showDeleteButton: false,
                showDetailsColumn: true,
                showUpdateColumn: false,
                showRecordSelectors: true,
                buttonBarPosition: 'top',
                title: this.title,
                suppressRenderErrors: true,
                //frame: 'none',
                timeout: 0
            });

            if (this.viewName){
                this.queryConfig.viewName = this.viewName;
            }

            this.queryConfig.success = null;

            if(this.qwpConfig){
                Ext.apply(this.queryConfig, this.qwpConfig);
            }

            var theDiv = this.add({tag: 'span'});
            this.doLayout();
            new LABKEY.QueryWebPart(this.queryConfig).render(theDiv.id);
            return;
        }

        for (var j=0;j<data.rows.length;j++){
            var thePanel = this;

            var row = data.rows[j];
            for (var i=0;i<data.columnModel.length;i++){
                var col = data.columnModel[i];
                var meta = data.metaData.fields[i];

                if (!meta.hidden){
                    var value = row[col.dataIndex].displayValue || row[col.dataIndex].value;
                    thePanel.add({
                        fieldLabel: col.header,
                        xtype: 'displayfield',
                        value: (row[col.dataIndex].url ? '<a href="'+row[col.dataIndex].url+'" target="new">'+value+'</a>' : value)
                    });

                    if (this.titleField == col.dataIndex){
                        thePanel.title += ': '+value;
                    }
                }
            }

            this.doLayout()
        }
    }

});
Ext.reg('ehr-detailsview', EHR.ext.DetailsView);