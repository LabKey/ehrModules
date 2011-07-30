/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

Ext.namespace('EHR.ext', 'EHR.utils');

LABKEY.requiresScript("/ehr/utils.js");
LABKEY.requiresScript("/ehr/ehrAPI.js");

function moreActionsHandler(dataRegion){
    //first we get the permission map
    EHR.utils.getDatasetPermissions({
        success: onSuccess,
        failure: function(error){
            console.log(error)
        },
        scope: this
    });

    function onSuccess(){
        var menu = Ext.menu.MenuMgr.get(dataRegion.name + '.Menu.More Actions');

        var tables = [
            {queryName: 'Behavior Remarks', schemaName: 'study'}
//            ,{queryName: 'Clinical Remarks', schemaName: 'study'},
//            ,{queryName: 'Notes', schemaName: 'study', title: 'Note'},
//            ,{queryName: 'Problem List', schemaName: 'study', title: 'Problem'}
//            ,{queryName: 'Treatment Orders', schemaName: 'study'}
        ];
//        Ext.each(tables, function(t){
//            if(EHR.permissionMap.hasPermission('Completed', 'insert', t))
//                addFormButton(dataRegion, t, menu);
//        }, this);

        if(dataRegion.schemaName.match(/^study$/i) && dataRegion.queryName.match(/^weight$/i))
            addWeightCompareBtn(dataRegion, menu);

//        if(dataRegion.schemaName.match(/^study$/i) && dataRegion.queryName.match(/^treatmentSchedule$/i)){
//            if(EHR.permissionMap.hasPermission('Completed', 'insert', 'Drug Administration')){
//                addTreatmentCompleteBtn(dataRegion, menu);
//            }
//        }

        if(dataRegion.schemaName.match(/^study$/i) && dataRegion.queryName.match(/^Problem List$/i)){
            if(EHR.permissionMap.hasPermission('Completed', 'update', {queryName: 'Problem List', schemaName: 'study'})){
                markComplete(dataRegion, menu, 'study', 'Problem List');
            }
        }

        if(dataRegion.schemaName.match(/^study$/i) && dataRegion.queryName.match(/^Treatment Orders$/i)){
            if(EHR.permissionMap.hasPermission('Completed', 'update', {queryName: 'Treatment Orders', schemaName: 'study'})){
                markComplete(dataRegion, menu, 'study', 'Treatment Orders');
            }
        }

        if(dataRegion.schemaName.match(/^study$/i) && dataRegion.queryName.match(/^Assignment$/i)){
            if(EHR.permissionMap.hasPermission('Completed', 'update', {queryName: 'Assignment', schemaName: 'study'})){
                markComplete(dataRegion, menu, 'study', 'Assignment');
            }
        }

//        if(dataRegion.schemaName.match(/^study$/i) && dataRegion.queryName.match(/^treatmentSchedule$/i)){
//            if(EHR.permissionMap.hasPermission('Completed', 'insert', {queryName: 'Drug Administration', schemaName: 'study'})){
//                addTreatmentCompleteBtn(dataRegion, menu);
//            }
//        }

//        if(dataRegion.schemaName.match(/^study$/i) && dataRegion.queryName.match(/^Notes$/i)){
//            if(EHR.permissionMap.hasPermission('Completed', 'update', {queryName: 'Notes', schemaName: 'study'})){
//                markComplete(dataRegion, menu, 'study', 'Notes');
//            }
//        }


        if(dataRegion.schemaName.match(/^study$/i) && dataRegion.queryName.match(/^Demographics$/i)){
            if(EHR.permissionMap.hasPermission('Scheduled', 'insert', {queryName: 'Weight', schemaName: 'study'})){
                createTaskFromIdsBtn(dataRegion, menu, {queries: [{schemaName: 'study', queryName: 'Weight'}], formType: 'Weight'});
            }
        }

        if(LABKEY.ActionURL.getAction().match(/^dataEntry$/i) && dataRegion.schemaName.match(/^study$/i) && dataRegion.queryName.match(/^Clinpath Runs$/i)){
            if(EHR.permissionMap.hasPermission('Scheduled', 'insert', {queryName: 'Clinpath Runs', schemaName: 'study'})){
                createTaskBtn(dataRegion, menu, {queries: [{schemaName: 'study', queryName: 'Clinpath Runs'}], formType: 'Clinpath'});
                changeQCStateBtn(dataRegion, menu);
            }
        }

        if(LABKEY.ActionURL.getAction().match(/^dataEntry$/i) && dataRegion.schemaName.match(/^study$/i) && dataRegion.queryName.match(/^Blood Draws$/i)){
            if(EHR.permissionMap.hasPermission('Scheduled', 'insert', {queryName: 'Blood Draws', schemaName: 'study'})){
                createTaskBtn(dataRegion, menu, {queries: [{schemaName: 'study', queryName: 'Blood Draws'}], formType: 'Blood Draws'});
                changeQCStateBtn(dataRegion, menu);
            }
        }

        if(LABKEY.ActionURL.getAction().match(/^dataEntry$/i) && dataRegion.schemaName.match(/^study$/i) && dataRegion.queryName.match(/^Study( )*Data$/i)){
            if(EHR.permissionMap.hasPermission('Scheduled', 'insert', {queryName: 'Blood Draws', schemaName: 'study'})){
                //createTaskBtn(dataRegion, menu, {queries: [{schemaName: 'study', queryName: 'Blood Draws'}], formType: 'Blood Draws'});
                changeQCStateBtn(dataRegion, menu);
            }
        }
    }
}

function historyHandler(dataRegion, dataRegionName, queryName, schemaName)
{
    var checked = dataRegion.getChecked();
    if(!checked || !checked.length){
        alert('No records selected');
        return;
    }

    queryName = queryName || dataRegion.queryName;
    schemaName = schemaName || dataRegion.schemaName;

    var sql = "SELECT DISTINCT s.Id FROM "+schemaName+".\""+queryName+"\" s WHERE s.LSID IN ('" + checked.join("', '") + "')";

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
                Ext.History.add(hash);
                window.location.reload();
            }

        }
    }




}


function showAuditHistory(dataRegion, dataRegionName){

    var checked = dataRegion.getChecked();
    if(!checked || !checked.length){
        alert('No records selected');
        return;
    }

    window.location = LABKEY.ActionURL.buildURL("query", "executeQuery", null, {
        schemaName: 'auditLog',
        'query.queryName': 'DatasetAudits',
        'query.lsid~in': checked.join(';')
    });
}

function datasetHandler(dataRegion, dataRegionName, queryName, schemaName)
{
    var checked = dataRegion.getChecked();
    if(!checked || !checked.length){
        alert('No records selected');
        return;
    }

    queryName = queryName || dataRegion.queryName;
    schemaName = schemaName || dataRegion.schemaName;

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
            ,mode: 'local'
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
                theWindow.destroy();
            }
        }]
    });
    theWindow.show();
    
    function runSQL(){
        var checked = dataRegion.getChecked();
        var dataset = theWindow.dataset.getValue();
        var theField = theWindow.theField.getValue();

        if(!dataset || !theField){
            alert('You must pick a dataset and the field to filter');
            return;
        }

        var sql = "SELECT DISTINCT s."+theField+" as field FROM "+schemaName+".\""+queryName+"\" s WHERE s.LSID IN ('" + checked.join("', '") + "')";

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
                //NOTE: this uses a custom page with a QWP in order to support POST params
                //might revisit at some future time if executeQuery is improved
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

function addFormButton(dataRegion, config, menu){
    menu.add({
        text: 'Enter '+(config.title || config.queryName),
        handler: function(){
            new Ext.Window({
                closeAction:'hide'
                ,title: 'Enter '+(config.title || config.queryName)
                ,xtype: 'panel'
                ,autoScroll: true
                ,autoHeight: true
                ,width: 400
                ,boxMaxHeight: 600
                ,defaults: {
                    border: false
                    ,bodyStyle: 'padding: 5px;'
                }
                ,items: [new EHR.ext.SimpleImportPanel({
                    showStatus: false,
                    allowableButtons: [{
                        text: 'Submit',
                        name: 'submit',
                        requiredQC: 'Completed',
                        targetQC: 'Completed',
                        errorThreshold: 'INFO',
                        disabled: true,
                        ref: 'submitBtn',
                        handler: function(o){
                            function onComplete(){
                                this.ownerCt.hide();

                                dataRegion.selectNone();
                                refreshDataRegion(dataRegion);
                            }

                            function onException(error){
                                console.log(error)
                                alert(error.exception);
                            }

                            this.store.on('commitcomplete', onComplete, this, {single: true});
                            this.store.on('commitexception', onException, this, {single: true});
                            this.onSubmit(o);
                            window.onbeforeunload = Ext.emptyFn;
                        },
                        disableOn: 'WARN',
                        scope: this
                    },{
                        text: 'Close',
                        name: 'close',
                        ref: 'closeBtn',
                        handler: function(o){
                            Ext.Msg.confirm('Close Form', 'Closing this form will discard changes.  Do you want to do this?', function(v){
                                if(v=='yes'){
                                    o.ownerCt.ownerCt.ownerCt.hide();
                                    window.onbeforeunload = Ext.emptyFn;
                                }
                            }, this);
                        }
                    }],
                    formType: config.queryName,
                    formSections: [{
                        xtype: 'ehr-formpanel'
                        ,showStatus: false
                        ,schemaName: config.schemaName
                        ,queryName: config.queryName
                        ,columns: EHR.ext.FormColumns[config.queryName]
                        ,collapsible: false
                        ,metadata: EHR.ext.getTableMetadata(config.queryName, ['SimpleForm'])
                        ,keyField: 'lsid'
                        ,keyValue: null
                    }]
                })]
                ,scope: this
            }).show();
        }
    })
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
                                win.ownerCt.ownerCt.destroy();
                            }
                        }]
                    }).show();
                }
            }
        })
}

function addTreatmentCompleteBtn(dataRegion, menu){
    menu.add({
            text: 'Mark Treatment(s) Complete',
            dataRegion: dataRegion,
            handler: function(){
                var checked = this.dataRegion.getChecked();
                if(!checked || !checked.length){
                    alert('No records selected');
                    return;
                }

//                if(checked.length>2){
//                    Ext.Msg.alert('Error', 'More than 1 treatments are checked.  Using the first 2.');
//                }

                var lsids = [];
                var map = {};
                Ext.each(checked, function(item){
                    var i = item.split('||');
                    if(i.length == 2){
                        lsids.push(i[0]);
                        map[item] = {lsid: i[0], date: i[1]};
                    }
                    else {
                        console.log('ERROR: improper keyField')
                    }
                }, this);
                Ext.Msg.wait('Loading...');
                LABKEY.Query.selectRows({
                    schemaName: 'study',
                    queryName: 'Treatment Orders',
                    filterArray: [
                        LABKEY.Filter.create('lsid', lsids.join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF)
                    ],
                    scope: this,
                    //maxRows: 2,
                    success: onSuccess,
                    failure: EHR.utils.onError
                });

                function onSuccess(data){
                    if(!data || !data.rows){
                        return;
                    }

                    Ext.Msg.hide();
                    new Ext.Window({
                        title: 'Mark Treatments Complete',
                        width: 330,
                        autoHeight: true,
                        items: [{
                            xtype: 'form',
                            ref: 'theForm',
                            bodyStyle: 'padding: 5px;',
                            items: [{
                                xtype: 'xdatetime',
                                fieldLabel: 'Date',
                                width: 200,
                                value: new Date(),
                                ref: 'date'
                            },{
                                xtype: 'textfield',
                                fieldLabel: 'Performed By',
                                width: 200,
                                value: LABKEY.Security.currentUser.displayName,
                                ref: 'performedby'
                            },{
                                xtype: 'combo',
                                fieldLabel: 'Restraint',
                                width: 200,
                                ref: 'restraint',
                                displayField:'type',
                                valueField: 'type',
                                typeAhead: true,
                                mode: 'local',
                                editable: true,
                                triggerAction: 'all',
                                store: new LABKEY.ext.Store({
                                    containerPath: 'WNPRC/EHR/',
                                    schemaName: 'ehr_lookups',
                                    queryName: 'restraint_type',
                                    sort: 'type',
                                    autoLoad: true
                                })
                            },{
                                xtype: 'numberfield',
                                fieldLabel: 'Time Restrainted',
                                width: 200,
                                ref: 'timeRestrainted'
                            }]
                        }],
                        //buttonAlign: 'center',
                        buttons: [{
                            text:'Submit',
                            disabled:false,
                            formBind: true,
                            ref: '../submit',
                            scope: this,
                            handler: function(o){
                                o.ownerCt.ownerCt.hide();
                            }
                        },{
                            text: 'Close',
                            handler: function(o){
                                o.ownerCt.ownerCt.hide();
                            }
                        }]

                    }).show();
                }
            }
        })
}

function getDistinct(dataRegion, dataRegionName, queryName, schemaName)
{
    var checked = dataRegion.getChecked();
    if(!checked || !checked.length){
        alert('No records selected');
        return;
    }

    queryName = queryName || dataRegion.queryName;
    schemaName = schemaName || dataRegion.schemaName;

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
                theWindow.destroy();
            }
        }]
    });
    theWindow.show();

    function runSQL(a,b){
        var checked = dataRegion.getChecked();
        var field = theWindow.field.getValue();
        var sql = "SELECT DISTINCT s."+field+" as field FROM "+schemaName+".\""+queryName+"\" s WHERE s.LSID IN ('" + checked.join("', '") + "')";
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
            var total = 0;
            for(var j in ids){
                result += j + "\n";
                total++;
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
                    html: 'Total: '+total
                },{
                    xtype: 'textarea',
                    name: 'distinctValues',
                    width: 260,
                    height: 350,
                    value: result
                }],
                buttons: [{
                    text: 'Close',
                    scope: this,
                    handler: function(){
                        win.destroy();
                    }
                }]
            });
            win.show();
        }
    }
};



function markComplete(dataRegion, menu, schemaName, queryName){
    menu.add({
        text: 'Set End Date',
        dataRegion: dataRegion,
        handler: function(){
            var checked = dataRegion.getChecked();
            if(!checked || !checked.length){
                alert('No records selected');
                return;
            }

            new Ext.Window({
                title: 'Set End Date',
                width: 330,
                autoHeight: true,
                items: [{
                    xtype: 'form',
                    ref: 'theForm',
                    bodyStyle: 'padding: 5px;',
                    items: [{
                        xtype: 'xdatetime',
                        fieldLabel: 'Date',
                        width: 200,
                        value: new Date(),
                        ref: 'date'
                    }]
                }],
                buttons: [{
                    text:'Submit',
                    disabled:false,
                    formBind: true,
                    ref: '../submit',
                    scope: this,
                    handler: function(o){
                        Ext.Msg.wait('Loading...');
                        var date = o.ownerCt.ownerCt.theForm.date.getValue();
                        if(!date){
                            alert('Must enter a date');
                            o.ownerCt.ownerCt.hide();
                        }
                        var toUpdate = [];
                        Ext.each(checked, function(item){
                            toUpdate.push({lsid: item, enddate: date});
                        }, this);

                        o.ownerCt.ownerCt.hide();

                        LABKEY.Query.updateRows({
                            schemaName: schemaName,
                            queryName: queryName,
                            rows: toUpdate,
                            scope: this,
                            success: function(){
                                Ext.Msg.hide();
                                dataRegion.selectNone();

                                refreshDataRegion(dataRegion);
                            },
                            failure: EHR.utils.onError
                        });
                    }
                },{
                    text: 'Close',
                    handler: function(o){
                        o.ownerCt.ownerCt.hide();
                    }
                }]
            }).show();



            function onSuccess(data){
                if(!data || !data.rows){
                    return;
                }

                Ext.Msg.hide();

            }
        }
    })
}

function createTaskFromIdsBtn(dataRegion, menu, config){
    menu.add({
        text: 'Schedule '+config.formType,
        dataRegion: dataRegion,
        handler: function(){
            var checked = dataRegion.getChecked();
            if(!checked || !checked.length){
                alert('No records selected');
                return;
            }

            var ids = [];
            Ext.each(checked, function(item){
                item = item.split('.');
                ids.push(item[item.length-1]);
            }, this);

            new Ext.Window({
                title: 'Schedule '+config.formType,
                width: 330,
                autoHeight: true,
                items: [{
                    xtype: 'form',
                    ref: 'theForm',
                    bodyStyle: 'padding: 5px;',
                    defaults: {
                        border: false
                    },
                    items: [{
                        html: 'Total IDs: '+checked.length+'<br><br>',
                        tag: 'div'
                    },{
                        xtype: 'textfield',
                        fieldLabel: 'Title',
                        width: 200,
                        value: config.formType,
                        ref: 'titleField'
                    },{
                        xtype: 'xdatetime',
                        fieldLabel: 'Date',
                        width: 200,
                        value: new Date(),
                        ref: 'date'
                    },{
                        xtype: 'combo',
                        fieldLabel: 'Assigned To',
                        width: 200,
                        value: LABKEY.Security.currentUser.id,
                        triggerAction: 'all',
                        mode: 'local',
                        store: new LABKEY.ext.Store({
                            xtype: 'labkey-store',
                            schemaName: 'core',
                            queryName: 'PrincipalsWithoutAdmin',
                            columns: 'userid,name',
                            sort: 'type,name',
                            autoLoad: true
                        }),
                        displayField: 'name',
                        valueField: 'UserId',
                        ref: 'assignedTo'
                    }]
                }],
                buttons: [{
                    text:'Submit',
                    disabled:false,
                    formBind: true,
                    ref: '../submit',
                    scope: this,
                    handler: function(o){
                        Ext.Msg.wait('Loading...');
                        var date = o.ownerCt.ownerCt.theForm.date.getValue();
                        date = date.toGMTString();
                        if(!date){
                            alert('Must enter a date');
                            o.ownerCt.ownerCt.hide();
                        }

                        var assignedTo = o.ownerCt.ownerCt.theForm.assignedTo.getValue();
                        if(!assignedTo){
                            alert('Must assign to someone');
                            o.ownerCt.ownerCt.hide();
                        }
                        var title = o.ownerCt.ownerCt.theForm.titleField.getValue();
                        if(!title){
                            alert('Must enter a title');
                            o.ownerCt.ownerCt.hide();
                        }

                        var toUpdate = [];
                        Ext.each(config.queries, function(q){
                            var obj = {
                                schemaName: q.schemaName,
                                queryName: q.queryName,
                                rows: []
                            };

                            Ext.each(ids, function(id){
                                obj.rows.push({Id: id, date: date});
                            }, this);

                            toUpdate.push(obj);
                        }, this);

                        o.ownerCt.ownerCt.hide();

                        EHR.utils.createTask({
                            initialQCState: 'Scheduled',
                            childRecords: toUpdate,
                            taskRecord: {date: date, assignedTo: assignedTo, category: 'task', title: title, formType: config.formType},
                            success: function(response, options, config){
                                Ext.Msg.hide();
                                Ext.Msg.confirm('View Task Now?', 'Do you want to view the task now?', function(btn){
                                    if(btn == 'yes'){
                                        window.location = LABKEY.ActionURL.buildURL("ehr", "manageTask", null, {taskid: config.taskId, formtype: config.taskRecord.formType});
                                    }
                                    else {
                                        refreshDataRegion(dataRegion);
                                    }
                                }, this)
                            },
                            failure: function(){
                                console.log('failure');
                                Ext.Msg.hide();
                            }
                        });
                    }
                },{
                    text: 'Close',
                    handler: function(o){
                        o.ownerCt.ownerCt.hide();
                    }
                }]
            }).show();



            function onSuccess(data){
                if(!data || !data.rows){
                    return;
                }

                Ext.Msg.hide();

            }
        }
    });
}


function createTaskBtn(dataRegion, menu, config){
    menu.add({
        text: 'Schedule '+config.formType+' Task',
        dataRegion: dataRegion,
        handler: function(){
            var checked = dataRegion.getChecked();
            if(!checked || !checked.length){
                alert('No records selected');
                return;
            }

            new Ext.Window({
                title: 'Schedule '+config.formType,
                width: 330,
                autoHeight: true,
                items: [{
                    xtype: 'form',
                    ref: 'theForm',
                    bodyStyle: 'padding: 5px;',
                    defaults: {
                        border: false
                    },
                    items: [{
                        html: 'Total Records: '+checked.length+'<br><br>',
                        tag: 'div'
                    },{
                        xtype: 'textfield',
                        fieldLabel: 'Title',
                        width: 200,
                        value: config.formType,
                        ref: 'titleField'
                    },{
                        xtype: 'xdatetime',
                        fieldLabel: 'Date',
                        width: 200,
                        value: new Date(),
                        ref: 'date'
                    },{
                        xtype: 'combo',
                        fieldLabel: 'Assigned To',
                        width: 200,
                        value: LABKEY.Security.currentUser.id,
                        triggerAction: 'all',
                        mode: 'local',
                        store: new LABKEY.ext.Store({
                            xtype: 'labkey-store',
                            schemaName: 'core',
                            queryName: 'PrincipalsWithoutAdmin',
                            columns: 'userid,name',
                            sort: 'type,name',
                            autoLoad: true
                        }),
                        displayField: 'name',
                        valueField: 'UserId',
                        ref: 'assignedTo'
                    }]
                }],
                buttons: [{
                    text:'Submit',
                    disabled:false,
                    formBind: true,
                    ref: '../submit',
                    scope: this,
                    handler: function(o){
                        Ext.Msg.wait('Loading...');
                        var date = o.ownerCt.ownerCt.theForm.date.getValue();
                        date = date.toGMTString();
                        if(!date){
                            alert('Must enter a date');
                            o.ownerCt.ownerCt.hide();
                        }

                        var assignedTo = o.ownerCt.ownerCt.theForm.assignedTo.getValue();
                        if(!assignedTo){
                            alert('Must assign to someone');
                            o.ownerCt.ownerCt.hide();
                        }
                        var title = o.ownerCt.ownerCt.theForm.titleField.getValue();
                        if(!title){
                            alert('Must enter a title');
                            o.ownerCt.ownerCt.hide();
                        }

                        o.ownerCt.ownerCt.hide();

                        var existingRecords = {};
                        existingRecords[dataRegion.queryName] = checked;

                        EHR.utils.createTask({
                            initialQCState: 'Scheduled',
                            childRecords: null,
                            existingRecords: existingRecords,
                            taskRecord: {date: date, assignedTo: assignedTo, category: 'task', title: title, formType: config.formType},
                            success: function(response, options, config){
                                Ext.Msg.hide();
                                Ext.Msg.confirm('View Task Now?', 'Do you want to view the task now?', function(btn){
                                    if(btn == 'yes'){
                                        window.location = LABKEY.ActionURL.buildURL("ehr", "manageTask", null, {taskid: config.taskId, formtype: config.taskRecord.formType});
                                    }
                                    else {
                                        refreshDataRegion(dataRegion);
                                    }
                                }, this)
                            },
                            failure: function(){
                                console.log('failure');
                                Ext.Msg.hide();
                            }
                        });
                    }
                },{
                    text: 'Close',
                    handler: function(o){
                        o.ownerCt.ownerCt.hide();
                    }
                }]
            }).show();



            function onSuccess(data){
                if(!data || !data.rows){
                    return;
                }

                Ext.Msg.hide();

            }
        }
    });
}



function changeQCStateBtn(dataRegion, menu){
    menu.add({
        text: 'Change Request Status',
        dataRegion: dataRegion,
        handler: function(){
            var checked = dataRegion.getChecked();
            if(!checked || !checked.length){
                alert('No records selected');
                return;
            }

            Ext.Msg.wait('Loading...');
            LABKEY.Query.selectRows({
                schemaName: dataRegion.schemaName,
                queryName: dataRegion.queryName,
                columns: 'lsid,dataset/Label,Id,date,requestid,taskid',
                filterArray: [LABKEY.Filter.create('lsid', checked.join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF)],
                scope: this,
                success: onSuccess,
                failure: EHR.utils.onError
            });

            function onSuccess(data){
                var records = data.rows;

                if(!records || !records.length){
                    Ext.Msg.hide();
                    alert('No records found');
                    return;
                }

                Ext.Msg.hide();
                new Ext.Window({
                title: 'Change Request Status',
                width: 330,
                autoHeight: true,
                items: [{
                    xtype: 'form',
                    ref: 'theForm',
                    bodyStyle: 'padding: 5px;',
                    defaults: {
                        border: false
                    },
                    items: [{
                        html: 'Total Records: '+checked.length+'<br><br>',
                        tag: 'div'
                    },{
                        xtype: 'combo',
                        fieldLabel: 'Status',
                        width: 200,
                        triggerAction: 'all',
                        mode: 'local',
                        store: new LABKEY.ext.Store({
                            xtype: 'labkey-store',
                            schemaName: 'study',
                            queryName: 'qcstate',
                            columns: 'rowid,label',
                            sort: 'label',
                            filterArray: [LABKEY.Filter.create('label', 'Request', LABKEY.Filter.Types.STARTS_WITH)],
                            autoLoad: true
                        }),
                        displayField: 'Label',
                        valueField: 'RowId',
                        ref: 'qcstate'
                    }]
                }],
                buttons: [{
                    text:'Submit',
                    disabled:false,
                    formBind: true,
                    ref: '../submit',
                    scope: this,
                    handler: function(o){
                        var qc = o.ownerCt.ownerCt.theForm.qcstate.getValue();
                        if(!qc){
                            alert('Must [pick a status');
                        }

                        Ext.Msg.wait('Loading...');

                        var multi = new LABKEY.MultiRequest();

                        var toUpdate = {};
                        Ext.each(records, function(rec){
                            if(!toUpdate[rec['dataset/Label']])
                                toUpdate[rec['dataset/Label']] = [];

                            toUpdate[rec['dataset/Label']].push({lsid: rec.lsid, QCState: qc})
                        }, this);

                        for(var i in toUpdate){
                            multi.add(LABKEY.Query.updateRows, {
                                schemaName: 'study',
                                queryName: i,
                                rows: toUpdate[i],
                                scope: this,
                                failure: EHR.utils.onError
                            });
                        }

                        multi.send(function(){
                            Ext.Msg.hide();
                            dataRegion.selectNone();

                            o.ownerCt.ownerCt.hide();
                            refreshDataRegion(dataRegion);
                        }, this);
                    }
                },{
                    text: 'Close',
                    handler: function(o){
                        o.ownerCt.ownerCt.hide();
                    }
                }]
            }).show();
            }
        }
    })
}

function refreshDataRegion(dataRegion){
    if(dataRegion.qwp){
        dataRegion.qwp.render();
    }
    else if (LABKEY.ActionURL.getController() == 'executeQuery'){
        window.location.reload( false );
    }
}