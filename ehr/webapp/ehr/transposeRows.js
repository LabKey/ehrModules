/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.namespace('EHR.ext.customPanels');

LABKEY.requiresScript("/ehr/utilities.js");

EHR.ext.customPanels.detailsView = function(config)
{

    var required = ['schemaName', 'queryName', 'renderTo'];
    for (var i=0;i<required.length;i++){
        if (!config[required[i]]){
            alert('Required: '+required[i]);
            return false;
        }
    }

    this.config = config;

    switch (typeof(config.renderTo)){
        case 'object':
            break;
        case 'string':
            this.config.renderTo = document.getElementById(config.renderTo);
            break;
    }

    config.renderTo.innerHTML = 'Loading...<p>';

    var queryConfig = {
            queryName: this.config.queryName,
            schemaName: this.config.schemaName,
            filterArray: this.config.filterArray,
            successCallback: onFinalRender,
            errorCallback: EHR.UTILITIES.onError,
            scope: this,
            maxRows: 100
        };

    if (this.config.viewName){
        queryConfig.viewName = this.config.viewName;
    }

    if (!this.config.fields){
        LABKEY.Query.selectRows(queryConfig);
    }

    function onFinalRender(data){
        var target = config.renderTo;

        if (!data.rows.length){
            var header = document.createElement('span');
            header.innerHTML = '<table class="labkey-wp"><tbody><tr class="labkey-wp-header"><th class="labkey-wp-title-left">' +
            (this.config.title || 'Details:')+ '</th><th class="labkey-wp-title-right">&nbsp;</th></tr></tbody></table>No Records Found<p>';
            target.innerHTML = '';
            target.appendChild(header);

            return;
        }
        else if (data.rows.length > 1 && this.config.multiToGrid){
            Ext.applyIf(queryConfig, {
                allowChooseQuery: false,
                allowChooseView: false,
                showInsertNewButton: false,
                showDeleteButton: false,
                showDetailsColumn: true,
                showUpdateColumn: false,
                showRecordSelectors: true,
                buttonBarPosition: 'top',
                title: this.config.title,
                //TODO: switch to 0 once bug is fixed
                timeout: 3000000
            })

            queryConfig.successCallback = queryConfig.success = null;

            new LABKEY.QueryWebPart(queryConfig).render(target);
            return;
        }

        target.innerHTML = '';
        var title = '';
        
        for (var j=0;j<data.rows.length;j++){

            var table = document.createElement('table');

            for (var i=0;i<data.columnModel.length;i++){
                var col = data.columnModel[i];
                var meta = data.metaData.fields[i];
                var row = data.rows[j];
                var url = row['_labkeyurl_'+col.dataIndex];


                if (!meta.hidden){
                    var r = table.insertRow(i);
                    var c0 = r.insertCell(0);
                    //c0.setAttribute('class', 'labkey-form-label');
                    c0.className = 'labkey-form-label';
                    c0.innerHTML = '<b>'+col.header+':</b>';
                    
                    var c1 = r.insertCell(1);

                    var value = row[col.dataIndex];
                    if (url){
                        value = '<a href="'+url+'">'+value+'</a>';                        
                    }
                    c1.innerHTML = value;

                    if (this.config.titleField == col.dataIndex){
                        title = row[col.dataIndex];
                    }
                }
            }

            var header = document.createElement('span');
            header.innerHTML = '<table class="labkey-wp"><tbody><tr class="labkey-wp-header"><th class="labkey-wp-title-left">' +
            (this.config.title || 'Details:')+ ' ' + title +'</th><th class="labkey-wp-title-right">&nbsp;</th></tr></tbody></table>';

            target.appendChild(header);
            target.appendChild(table);
            target.appendChild(document.createElement('br'));
            
            if (j == data.rows.length-1){
                //target.appendChild(document.createElement('br'));
                //target.appendChild(document.createElement('br'));
                //target.appendChild(document.createElement('hr'));
            }

        };

       //this.doLayout();
    }

};

Ext.reg('EHR_detailsView', EHR.ext.customPanels.detailsView);