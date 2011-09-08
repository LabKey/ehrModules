/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.namespace('EHR.ext');

LABKEY.requiresScript("/ehr/utils.js");

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
//        labelStyle: 'background: red',
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
        queryName: this.queryName,
        schemaName: this.schemaName,
        viewName: this.viewName,
        filterArray: this.filterArray,
        success: function(data){
            this.queryData = data;
            this.loadQuery();
        },
        failure: EHR.utils.onError,
        scope: this,
        maxRows: 100
    };

    if (!this.fields){
        LABKEY.Query.selectRows(this.queryConfig);
    }
},

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
            var url = row['_labkeyurl_'+col.dataIndex];

            if (!meta.hidden){
                var value = row[col.dataIndex];

                thePanel.add({
                    fieldLabel: col.header,
                    xtype: 'displayfield',
                    value: (url ? '<a href="'+url+'" target="new">'+value+'</a>' : value)
                });

                if (this.titleField == col.dataIndex){
                    thePanel.title += ': '+row[col.dataIndex];
                }
            }
        }

        //this.add(thePanel);
        this.doLayout()
    };
}

});
Ext.reg('ehr-detailsview', EHR.ext.DetailsView);