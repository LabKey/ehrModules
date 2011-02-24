/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
function historyHandler(dataRegion, dataRegionName)
{
    var checked = dataRegion.getChecked();
    var sql = "SELECT DISTINCT s.Id FROM study.\""+dataRegion.queryName+"\" s WHERE s.LSID IN ('" + checked.join("', '") + "')";

    LABKEY.Query.executeSql({
         schemaName: 'study',
         sql: sql,
         successCallback: changeLocation
         });

    function changeLocation(data){
        var ids = new Array();
        for (var i = 0; i < data.rows.length; i++)
            ids.push(data.rows[i].Id);

        if (ids.length){
            window.location = LABKEY.ActionURL.buildURL(
                'ehr'
                ,'animalHistory.view#_inputType:renderMultiSubject&showReport:1&subject:'+ids.join(',')
                ,'WNPRC/EHR/'

            );

            //force reload if on same page
            if(LABKEY.ActionURL.getAction() == 'animalHistory')
                location.reload( true );
        }
    }




}

function datasetHandler(dataRegion, dataRegionName)
{

    var theWindow = new Ext.Window({
        width: 280,
        height: 130,
        bodyStyle:'padding:5px',
        closeAction:'hide',
        plain: true,
        keys: [
            {
                key: Ext.EventObject.ENTER,
                handler: runSQL,
                scope: this
            }
        ],
        title: 'Jump To Other Dataset',
        layout: 'form',
        items: [{
            emptyText:''
            ,fieldLabel: 'Dataset'
            ,ref: 'dataset'
            ,xtype: 'combo'
            ,displayField:'Label'
            ,valueField: 'Label'
            ,typeAhead: true
            ,triggerAction: 'all'
            ,width: 150
            ,required: true
            ,editable: true
            ,store: new LABKEY.ext.Store({
                containerPath: 'WNPRC/EHR/',
                schemaName: 'study',
                queryName: 'datasets',
                sort: 'label',
                filterArray: [LABKEY.Filter.create('ShowByDefault', true, LABKEY.Filter.Types.EQUAL)],
                autoLoad: true
            })
        },{
            emptyText:''
            ,fieldLabel: 'Select Field'
            ,ref: 'theField'
            ,xtype: 'combo'
            ,displayField:'name'
            ,valueField: 'value'
            ,typeAhead: true
            ,triggerAction: 'all'
            ,mode: 'local'
            ,width: 150
            ,editable: false
//            ,value: 'id'
            ,required: true
            ,store: new Ext.data.ArrayStore({
                fields: ['name', 'value'],
                data: [['Animal Id','id'], ['Project','project'], ['Date','date']]
            })
        }],
        buttons: [{
            text:'Submit',
            disabled:false,
            formBind: true,
            ref: '../submit',
            scope: this,
            handler: runSQL
        },{
            text: 'Close',
            scope: this,
            handler: function(){
                theWindow.hide();
            }
        }]
    });
    theWindow.show();
    
    function runSQL(){
        var checked = dataRegion.getChecked();
        var dataset = theWindow.dataset.getValue();
        var theField = theWindow.theField.getValue();
        var sql = "SELECT DISTINCT s."+theField+" as field FROM study.\""+dataRegion.queryName+"\" s WHERE s.LSID IN ('" + checked.join("', '") + "')";

        LABKEY.Query.executeSql({
             schemaName: 'study',
             sql: sql,
             successCallback: changeLocation
             });

        function changeLocation(data){
            var ids = new Array();
            for (var i = 0; i < data.rows.length; i++){
                if(data.rows[i].field)
                    ids.push(data.rows[i].field);
            }

            if (ids.length){
                var fieldFilter = LABKEY.Filter.create(theField, ids.join(';'), LABKEY.Filter.Types.IN);
                var baseParams = {
                    'query.queryName': dataset,
                    schemaName: 'study'

                };

                baseParams[fieldFilter.getURLParameterName()] = fieldFilter.getURLParameterValue();

                var el = document.body.appendChild(document.createElement('form'));
                el.setAttribute('method', 'POST');
                el.setAttribute('action', LABKEY.ActionURL.buildURL('ehr', 'executeQuery'));
                var theElement = Ext.get(el);

                for (var j in baseParams) {
                    var field = document.createElement('input');
                    field.setAttribute('type', 'hidden');
                    field.setAttribute('name', j);
                    field.setAttribute('value', baseParams[j]);
                    theElement.appendChild(field);
                }    
                el.submit();
            }
        }
    }
}

function moreActionsHandler(dataRegion){
    var menu = Ext.menu.MenuMgr.get(dataRegion.name + '.Menu.More Actions');

    LABKEY.Security.getSecurableResources({
        includeEffectivePermissions: true,
        successCallback: function(data){
            console.log('securable resources:')
            console.log(data);
        }
    });

    
}

//EHR.buttons.bindManager = Ext.extend(Ext.Observable, {
//
//})

function getDistinct(dataRegion)
{

    var theWindow = new Ext.Window({
        width: 280,
        height: 130,
        bodyStyle:'padding:5px',
        closeAction:'hide',
        plain: true,
        keys: [
            {
                key: Ext.EventObject.ENTER,
                handler: runSQL,
                scope: this
            }
        ],
        title: 'Select Field',
        layout: 'form',
        items: [{
            emptyText:''
            ,fieldLabel: 'Select Field'
            ,ref: 'field'
            ,xtype: 'combo'
            ,displayField:'name'
            ,valueField: 'value'
            ,typeAhead: true
            ,triggerAction: 'all'
            ,mode: 'local'
            ,width: 150
            ,editable: true
            ,value: 'id'
            ,required: true
            ,store: new Ext.data.ArrayStore({
                fields: ['name', 'value'],
                data: [['Animal Id','id'], ['Project','project'], ['Date','date']]
            })
        }],
        buttons: [{
            text:'Submit',
            disabled:false,
            formBind: true,
            ref: '../submit',
            scope: this,
            handler: runSQL
        },{
            text: 'Close',
            scope: this,
            handler: function(){
                theWindow.hide();
            }
        }]
    });
    theWindow.show();

    function runSQL(a,b){
        var checked = dataRegion.getChecked();
        var field = theWindow.field.getValue();
        var sql = "SELECT DISTINCT s."+field+" as field FROM study.\""+dataRegion.queryName+"\" s WHERE s.LSID IN ('" + checked.join("', '") + "')";
        theWindow.hide();
        
        LABKEY.Query.executeSql({
             schemaName: 'study',
             sql: sql,
             successCallback: changeLocation
             });

        function changeLocation(data){
            var ids = {};
            for (var i = 0; i < data.rows.length; i++){
                if (!data.rows[i].field)
                    continue;

                if (data.rows[i].field && !ids[data.rows[i].field])
                    ids[data.rows[i].field] = 0;

                ids[data.rows[i].field] += 1;

            }

            var result = '';
            for(var j in ids){
                result += j + "\n";
            }

            var win = new Ext.Window({
                width: 280,
                autoHeight: true,
                bodyStyle:'padding:5px',
                closeAction:'hide',
                plain: true,
                title: 'Distinct Values',
                //layout: 'form',
                items: [{
                    xtype: 'textarea',
                    width: 260,
                    height: 350,
                    value: result
                }],
                buttons: [{
                    text: 'Close',
                    scope: this,
                    handler: function(){
                        win.hide();
                    }
                }]
            });
            win.show();
        }
    }
};



