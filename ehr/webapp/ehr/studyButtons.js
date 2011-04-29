/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

Ext.namespace('EHR.ext', 'EHR.utils');

LABKEY.requiresScript("/ehr/utils.js");

function historyHandler(dataRegion, dataRegionName)
{
    var checked = dataRegion.getChecked();
    if(!checked || !checked.length){
        alert('No records selected');
        return;
    }

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
            var hash = '_inputType:renderMultiSubject&showReport:1&subject:'+ids.join(',');
            window.location = LABKEY.ActionURL.buildURL(
                'ehr'
                ,'animalHistory.view#'+hash
                ,'WNPRC/EHR/'

            );

            //force reload if on same page
            if(LABKEY.ActionURL.getAction() == 'animalHistory'){
                Ext.History.add(hash)
                window.location.reload();
            }

        }
    }




}

function datasetHandler(dataRegion, dataRegionName)
{
    var checked = dataRegion.getChecked();
    if(!checked || !checked.length){
        alert('No records selected');
        return;
    }

    var theWindow = new Ext.Window({
        width: 280,
        autoHeight: true,
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
            ,fieldLabel: 'Filter On'
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
        },{
            xtype: 'panel',
            html: 'This will allow you to jump to a different dataset, filtered on the rows you checked.  For example, if you pick the dataset Blood Draws and \'Filter on Animal Id\', then you will be transported to the Blood Draw table, showing blood draws from all the distinct animals in the rows you selected.',
            frame : false,
            border: false,
            cls: 'x-window-mc',
            bodyCssClass: 'x-window-mc'
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

    if(dataRegion.schemaName.match(/^study$/i) && dataRegion.queryName.match(/^weight$/i))
        addWeightCompareBtn(dataRegion, menu);


}

function addWeightCompareBtn(dataRegion, menu){
    menu.add({
            text: 'Compare Weights',
            dataRegion: dataRegion,
            handler: function(){
                var checked = this.dataRegion.getChecked();
                if(!checked || !checked.length){
                    alert('No records selected');
                    return;
                }

                if(checked.length>2){
                    Ext.Msg.alert('Error', 'More than 2 weights are checked.  Using the first 2.');
                }

                LABKEY.Query.selectRows({
                    schemaName: 'study',
                    queryName: 'weight',
                    filterArray: [
                        LABKEY.Filter.create('lsid', checked.join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF)
                    ],
                    scope: this,
                    maxRows: 2,
                    success: onSuccess
                    //failure: EHR.utils.onError
                });

                function onSuccess(data){
                    if(!data || !data.rows){
                        return;
                    }

                    //while we currently only allow 2 rows
                    //this is written to support more

                    var rows = ['<tr><td>'+['Weight1', 'Weight2', 'Pct Change'].join('</td><td>')+'</td></tr>'];
                    var theRow;
                    Ext.each(data.rows, function(row, idx){
                        theRow = [row.weight];
                        //get the next element
                        var index = (idx+1) % data.rows.length;
                        var weight2 = data.rows[index].weight;
                        theRow.push(weight2);

                        var pct = EHR.utils.roundNumber((((weight2-row.weight) / row.weight) * 100), 2);
                        theRow.push(pct+'%');

                        rows.push('<tr><td>'+theRow.join('</td><td>')+'</td></tr>');
                    }, this);

                    Ext.Msg.hide();
                    new Ext.Window({
                        title: 'Weights',
                        width: 200,
                        //autoWidth: true,
                        items: [{
                            xtype: 'panel',
                            html: '<table border=1>'+rows.join('')+'</table>'
                        }],
                        buttonAlign: 'center',
                        buttons: [{
                            text: 'OK',
                            handler: function(win, button){
                                win.ownerCt.ownerCt.hide();
                            }
                        }]

                    }).show();



                }
            }
        })
}

function getDistinct(dataRegion)
{
    var checked = dataRegion.getChecked();
    if(!checked || !checked.length){
        alert('No records selected');
        return;
    }

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
        title: 'Return Distinct Values',
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



