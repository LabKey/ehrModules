/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


Ext.namespace('EHR.ext', 'EHR.Utils', 'EHR.DatasetButtons');

LABKEY.requiresScript("/ehr/ehrAPI.js");


/**
 * This class holds methods or factories related to creating the buttons that appear on DataRegion button bars in the EHR.
 * It follows the convention that handlers called directly are suffixed with 'Handler'.  Factories to create and add a button
 * to a dataRegion are named addXXXXBtn (ie. addChangeQCStateBtn).  Note that any handlers should store the string DataRegionName,
 * and not a reference to the DataRegion object.  The handler can identify the DataRegion object from the name using a line of code
 * along the lines of:
 * <br>var dataRegion = LABKEY.DataRegions[dataRegionName];
 * <br>
 * @name EHR.DatasetButtons
 * @class
 */
EHR.DatasetButtons = new function(){
    return {

        /**
         * This is the onRender handler that should be used by all datasets.  It will modify the More Actions button and add
         * menu items.  Different items are added depending on the identity of the query and permissions of the current user.
         * These buttons are added here, as opposed to coding the XML metadata, because we needed code to run to manage these permissions.
         * If a new button or action is to be added to the More Actions button, it should be added here.
         * @param dataRegion
         */
        moreActionsHandler: function(dataRegion){
            //first we get the permission map
            EHR.Security.init({
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
        //            if(EHR.Security.hasPermission('Completed', 'insert', t))
        //                addFormButton(dataRegion, t, menu);
        //        }, this);

                if(dataRegion.schemaName.match(/^study$/i) && dataRegion.queryName.match(/^weight$/i))
                    EHR.DatasetButtons.addWeightCompareBtn(dataRegion.name, menu);

        //        if(dataRegion.schemaName.match(/^study$/i) && dataRegion.queryName.match(/^treatmentSchedule$/i)){
        //            if(EHR.Security.hasPermission('Completed', 'insert', 'Drug Administration')){
        //                EHR.DatasetButtons.addTreatmentCompleteBtn(dataRegion, menu);
        //            }
        //        }

                if(dataRegion.schemaName.match(/^study$/i) && dataRegion.queryName.match(/^Problem List$/i)){
                    if(EHR.Security.hasPermission('Completed', 'update', {queryName: 'Problem List', schemaName: 'study'})){
                        EHR.DatasetButtons.addMarkCompleteBtn(dataRegion.name, menu, 'study', 'Problem List', {xtype: 'datefield'});
                    }
                }

                if(dataRegion.schemaName.match(/^study$/i) && dataRegion.queryName.match(/^Treatment Orders$/i)){
                    if(EHR.Security.hasPermission('Completed', 'update', {queryName: 'Treatment Orders', schemaName: 'study'})){
                        EHR.DatasetButtons.addMarkCompleteBtn(dataRegion.name, menu, 'study', 'Treatment Orders');
                    }
                }

                if(dataRegion.schemaName.match(/^study$/i) && (dataRegion.queryName.match(/^Assignment$/i) || dataRegion.queryName.match(/^ActiveAssignments$/i))){
                    if(EHR.Security.hasPermission('Completed', 'update', {queryName: 'Assignment', schemaName: 'study'})){
                        EHR.DatasetButtons.addMarkCompleteBtn(dataRegion.name, menu, 'study', 'Assignment', {xtype: 'datefield'});
                        EHR.DatasetButtons.addAssignmentTaskBtn(dataRegion.name, menu);
                    }
                }

                if(dataRegion.schemaName.match(/^study$/i) && dataRegion.queryName.match(/^Feeding$/i)){
                    if(EHR.Security.hasPermission('Completed', 'update', {queryName: 'Feeding', schemaName: 'study'})){
                        EHR.DatasetButtons.addFeedingTaskBtn(dataRegion.name, menu);
                    }
                }

        //        if(dataRegion.schemaName.match(/^study$/i) && dataRegion.queryName.match(/^treatmentSchedule$/i)){
        //            if(EHR.Security.hasPermission('Completed', 'insert', {queryName: 'Drug Administration', schemaName: 'study'})){
        //                EHR.DatasetButtons.addTreatmentCompleteBtn(dataRegion.name, menu);
        //            }
        //        }

        //        if(dataRegion.schemaName.match(/^study$/i) && dataRegion.queryName.match(/^Notes$/i)){
        //            if(EHR.Security.hasPermission('Completed', 'update', {queryName: 'Notes', schemaName: 'study'})){
        //                EHR.DatasetButtons.addMarkCompleteBtn(dataRegion.name, menu, 'study', 'Notes');
        //            }
        //        }


                if(dataRegion.schemaName.match(/^study$/i) && dataRegion.queryName.match(/^Demographics$/i)){
                    if(EHR.Security.hasPermission('Scheduled', 'insert', {queryName: 'Weight', schemaName: 'study'})){
                        EHR.DatasetButtons.addCreateTaskFromIdsBtn(dataRegion.name, menu, {queries: [{schemaName: 'study', queryName: 'Weight'}], formType: 'Weight'});
                    }
                }

                if(LABKEY.ActionURL.getAction().match(/^dataEntry$/i) && dataRegion.schemaName.match(/^study$/i) && dataRegion.queryName.match(/^Clinpath Runs$/i)){
                    if(EHR.Security.hasPermission('Scheduled', 'insert', {queryName: 'Clinpath Runs', schemaName: 'study'})){
                        EHR.DatasetButtons.addCreateTaskBtn(dataRegion.name, menu, {queries: [{schemaName: 'study', queryName: 'Clinpath Runs'}], formType: 'Clinpath'});
                        EHR.DatasetButtons.addChangeQCStateBtn(dataRegion.name, menu);
                    }
                }

                if(dataRegion.schemaName.match(/^study$/i) && dataRegion.queryName.match(/^Clinpath Runs$/i)){
                    if(EHR.Security.hasPermission('Completed', 'update', {queryName: 'Clinpath Runs', schemaName: 'study'})){
                        EHR.DatasetButtons.addMarkReviewedBtn(dataRegion.name, menu);
                    }
                }

                if(LABKEY.ActionURL.getAction().match(/^dataEntry$/i) && dataRegion.schemaName.match(/^study$/i) && dataRegion.queryName.match(/^Blood Draws$/i)){
                    if(EHR.Security.hasPermission('Scheduled', 'insert', {queryName: 'Blood Draws', schemaName: 'study'})){
                        EHR.DatasetButtons.addCreateTaskBtn(dataRegion.name, menu, {queries: [{schemaName: 'study', queryName: 'Blood Draws'}], formType: 'Blood Draws'});
                        EHR.DatasetButtons.addChangeBloodQCStateBtn(dataRegion.name, menu);
                        //EHR.DatasetButtons.addBloodToTaskBtn(dataRegion.name, menu);
                    }
                }

                if(LABKEY.ActionURL.getAction().match(/^dataEntry$/i) && dataRegion.schemaName.match(/^study$/i) && dataRegion.queryName.match(/^Study( )*Data$/i)){
                    if(EHR.Security.hasPermission('Scheduled', 'insert', {queryName: 'Blood Draws', schemaName: 'study'})){
                        //EHR.DatasetButtons.addCreateTaskBtn(dataRegion.name, menu, {queries: [{schemaName: 'study', queryName: 'Blood Draws'}], formType: 'Blood Draws'});
                        EHR.DatasetButtons.addChangeQCStateBtn(dataRegion.name, menu);
                    }
                }
            }
        },

        /**
         * This helper will find the distinct IDs from the currently selected rows, then load the animal history page filtered on these IDs.
         * @param dataRegion
         * @param dataRegionName
         * @param queryName
         * @param schemaName
         */
        historyHandler: function(dataRegion, dataRegionName, queryName, schemaName){
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
                    var ctx = EHR.Utils.getEHRContext();
                    if(!ctx)
                        return;

                    var hash = 'inputType:multiSubject&showReport:1&subjects:'+ids.join(',');
                    window.location = LABKEY.ActionURL.buildURL(
                        'ehr'
                        ,'animalHistory.view#'+hash
                        ,ctx['EHRStudyContainer']

                    );

                    //force reload if on same page
                    if(LABKEY.ActionURL.getAction() == 'animalHistory'){
                        Ext.History.add(hash);
                        window.location.reload();
                    }

                }
            }
        },

        /**
         * This button should appear on all datasets and will allow the user to load the audit history of the selected record(s).  NOTE: because LabKey's PKs
         * (lsid) are based on Id + Date, they can change.  As a result, this helper first queries the DB to find the objectId of the selected records, then loads
         * the audit table filted on "lsid LIKE objectId".  This removes the need to include Id/Date in the search.  It's awkward and slow, but will give you the
         * correct history of a record, even if the Id or date changed.
         * @param dataRegion
         * @param dataRegionName
         */
        showAuditHistoryHandler: function(dataRegion, dataRegionName){

            var checked = dataRegion.getChecked();
            if(!checked || !checked.length){
                alert('No records selected');
                return;
            }

        //    if(checked.length!=1){
        //        alert('Can only select 1 record at a time');
        //        return;
        //    }

            Ext.Msg.wait('Loading...');

            LABKEY.Query.selectRows({
                schemaName: 'study',
                queryName: 'StudyData',
                columns: 'lsid,objectid',
                filterArray: [
                    LABKEY.Filter.create('lsid', checked.join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF)
                ],
                scope: this,
                success: function(data){
                    Ext.Msg.hide();

                    if(data.rows.length){
                        var items = [{
                            html: 'New browser windows or tabs should have opened to load the history of these records.  If this did not happen, please be sure popups are enabled.  You can also click the following links to view those records:',
                            bodyStyle: 'padding: 5px;',
                            border: false
                        }];

                        var url;
                        Ext.each(data.rows, function(row, idx){
                            url = LABKEY.ActionURL.buildURL("query", "executeQuery", null, {
                                schemaName: 'auditLog',
                                'query.queryName': 'DatasetAuditEvent',
                                'query.viewName': 'Detailed',
                                'query.key1~contains': row.objectid
                            });

                            items.push({
                                html: '<a target="_blank" href="'+url+'">'+'Record '+(idx+1)+'</a>',
                                border: false
                            })

                            window.open(url);
                        }, this);




                        this.selectorWin = new Ext.Window({
                            closeAction:'hide',
                            title: 'Record History',
                            width: 350,
                            items: items,
                            buttons: [{
                                text: 'Close',
                                handler: function(b){
                                    b.ownerCt.ownerCt.hide();
                                }
                            }]
                        }).show();

                    }
                    else {
                        alert('Record not found');
                    }
                },
                failure: EHR.Utils.onError
            });

        },

        /**
         * This is a helper that appears on all datasets, which will allow the user to jump from the current dataset to any other dataset, filtered based
         * on the distinct set of currently checked IDs.  The purpose is similar to 'Jump To History'.  It allows you to take a single set of IDs and jump
         * across different types of data.  Can be useful for certain cross-colony queries.
         * @param dataRegion
         * @param dataRegionName
         * @param queryName
         * @param schemaName
         */
        datasetHandler: function(dataRegion, dataRegionName, queryName, schemaName){
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
                keys: [{
                    key: Ext.EventObject.ENTER,
                    handler: runSQL,
                    scope: this
                }],
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
        },

        /**
         * This a adds a button to More Actions that will generate a popup window allowing the user to enter a single record into a single dataset.
         * It was originally created to allows vets and others to directly enter clinical remarks from any page, without the overhead of needing
         * to create a new task for each single remark.  The concept should work; however, it was removed because there were advantages to forcing
         * all records to go through the task pathway.  In practice, most comments were too involved for the popup to be effective.  Most vets have
         * ended up opening 2 browser windows: one for entering the remarks and one to browser Animal History or other records.
         * @param dataRegionName
         * @param config
         * @param menu
         */
        addFormButton: function(dataRegionName, config, menu){
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
                        ,items: [new EHR.ext.ImportPanel.SimpleImportPanel({
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
                                        var dataRegion = LABKEY.DataRegions[dataRegionName];
                                        this.ownerCt.hide();

                                        dataRegion.selectNone();
                                        dataRegion.refresh();
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
                                ,columns: EHR.Metadata.Columns[config.queryName]
                                ,collapsible: false
                                ,metadata: EHR.Metadata.getTableMetadata(config.queryName, ['SimpleForm'])
                                ,keyField: 'lsid'
                                ,keyValue: null
                            }]
                        })]
                        ,scope: this
                    }).show();
                }
            })
        },

        /**
         * This adds a button that allows the user to pick 2 arbitrary weights and it will calculate
         * the percent difference between the two.  Appears on weight dataRegions.
         * @param dataRegionName
         * @param menu
         */
        addWeightCompareBtn: function(dataRegionName, menu){
            menu.add({
                    text: 'Compare Weights',
                    dataRegionName: dataRegionName,
                    handler: function(){
                        var dataRegion = LABKEY.DataRegions[this.dataRegionName];
                        var checked = dataRegion.getChecked();
                        if(!checked || !checked.length){
                            alert('No records selected');
                            return;
                        }

                        if(checked.length>2){
                            Ext.Msg.alert('Error', 'More than 2 weights are checked.  Using the first 2.', doSelectRows, this);
                        }
                        else {
                            doSelectRows();
                        }

                        function doSelectRows(){
                            LABKEY.Query.selectRows({
                                schemaName: 'study',
                                queryName: 'weight',
                                filterArray: [
                                    LABKEY.Filter.create('lsid', checked.join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF)
                                ],
                                scope: this,
                                maxRows: 2,
                                success: onSuccess
                                //failure: EHR.Utils.onError
                            });
                        }

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

                                var pct = EHR.Utils.roundNumber((((weight2-row.weight) / row.weight) * 100), 2);
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
        },

        /**
         * Add a button originally designed to allows users to mark scheduled treatments 'complete' from the dataregion.  However,
         * it was ultimately decided to let the user do this through a task instead.  This button is not used.
         * @param dataRegionName
         * @param menu
         * @depreciated
         */
        addTreatmentCompleteBtn: function(dataRegionName, menu){
            menu.add({
                    text: 'Mark Treatment(s) Complete',
                    dataRegionName: dataRegionName,
                    handler: function(){
                        var dataRegion = LABKEY.DataRegions[this.dataRegionName];
                        var checked = dataRegion.getChecked();
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
                            failure: EHR.Utils.onError
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
        },

        /**
         * This is a helper used by the 'Get Distinct' button, which will return the distinct Animal IDs, project, etc,
         * based on the rows checked on a dataregion.
         * @param dataRegion
         * @param dataRegionName
         * @param queryName
         * @param schemaName
         */
        getDistinctHandler: function(dataRegion, dataRegionName, queryName, schemaName){
            var checked = dataRegion.getChecked();
            if(!checked || !checked.length){
                alert('No records selected');
                return;
            }

            //NOTE: this allows queries to redirect to a query other than themselves (ie. if a query is a derivative of a dataset)
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
        },

        /**
         * This adds a button that will allow the user to set the end date on records.  It is used by Treatments, Problem List and Assignments.
         * @param dataRegionName
         * @param menu
         * @param schemaName
         * @param queryName
         * @param config
         */
        addMarkCompleteBtn: function(dataRegionName, menu, schemaName, queryName, config){
            config = config || {};

            menu.add({
                text: 'Set End Date',
                dataRegionName: dataRegionName,
                handler: function(){
                    var dataRegion = LABKEY.DataRegions[this.dataRegionName];
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
                                xtype: (config.xtype || 'xdatetime'),
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
                                    return;
                                }

                                o.ownerCt.ownerCt.hide();

                                LABKEY.Query.selectRows({
                                    schemaName: schemaName,
                                    queryName: queryName,
                                    filterArray: [
                                        LABKEY.Filter.create('lsid', checked.join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF)
                                    ],
                                    scope: this,
                                    success: function(data){
                                        var toUpdate = [];
                                        var skipped = [];

                                        if(!data.rows || !data.rows.length){
                                            Ext.Msg.hide();
                                            dataRegion.selectNone();
                                            dataRegion.refresh();
                                            return;
                                        }

                                        Ext.each(data.rows, function(row){
                                            if(!row.enddate)
                                                toUpdate.push({lsid: row.lsid, enddate: date});
                                            else
                                                skipped.push(row.lsid)
                                        }, this);

                                        if(toUpdate.length){
                                            LABKEY.Query.updateRows({
                                                schemaName: schemaName,
                                                queryName: queryName,
                                                rows: toUpdate,
                                                scope: this,
                                                success: function(){
                                                    Ext.Msg.hide();
                                                    dataRegion.selectNone();
                                                    dataRegion.refresh();
                                                },
                                                failure: EHR.Utils.onError
                                            });
                                        }
                                        else {
                                            Ext.Msg.hide();
                                            dataRegion.selectNone();
                                            dataRegion.refresh();
                                        }

                                        if(skipped.length){
                                            alert('One or more rows was skipped because it already has an end date');
                                        }
                                    },
                                    failure: EHR.Utils.onError
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
        },

        /**
         * Adds a button to a dataRegion that will allow the user to mark Clinpath Runs records as 'reviewed' (which means updating the reviewedBy field).
         * This was intended as a mechanism for vets to indicate that they have viewed clinpath results.
         * @param dataRegionName
         * @param menu
         * @param schemaName
         * @param queryName
         * @param config
         */
        addMarkReviewedBtn: function(dataRegionName, menu, schemaName, queryName, config){
            config = config || {};

            menu.add({
                text: 'Mark Reviewed',
                dataRegionName: dataRegionName,
                handler: function(){
                    var dataRegion = LABKEY.DataRegions[this.dataRegionName];
                    var checked = dataRegion.getChecked();
                    if(!checked || !checked.length){
                        alert('No records selected');
                        return;
                    }

                    new Ext.Window({
                        title: 'Mark Reviewed',
                        width: 330,
                        autoHeight: true,
                        items: [{
                            xtype: 'form',
                            ref: 'theForm',
                            bodyStyle: 'padding: 5px;',
                            items: [{
                                xtype: 'textfield',
                                fieldLabel: 'Initials',
                                width: 200,
                                value: LABKEY.Security.currentUser.displayName,
                                ref: 'initials'
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
                                var initials = o.ownerCt.ownerCt.theForm.initials.getValue();
                                if(!initials){
                                    alert('Must enter initials');
                                    return;
                                }

                                o.ownerCt.ownerCt.hide();

                                LABKEY.Query.selectRows({
                                    schemaName: 'study',
                                    queryName: 'Clinpath Runs',
                                    filterArray: [
                                        LABKEY.Filter.create('lsid', checked.join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF)
                                    ],
                                    scope: this,
                                    success: function(data){
                                        var toUpdate = [];
                                        var skipped = [];

                                        if(!data.rows || !data.rows.length){
                                            Ext.Msg.hide();
                                            dataRegion.selectNone();
                                            dataRegion.refresh();
                                            return;
                                        }

                                        Ext.each(data.rows, function(row){
                                            if(!row.dateReviewed)
                                                toUpdate.push({lsid: row.lsid, dateReviewed: new Date(), reviewedBy: initials});
                                            else
                                                skipped.push(row.lsid)
                                        }, this);

                                        if(toUpdate.length){
                                            LABKEY.Query.updateRows({
                                                schemaName: 'study',
                                                queryName: 'Clinpath Runs',
                                                rows: toUpdate,
                                                scope: this,
                                                success: function(){
                                                    Ext.Msg.hide();
                                                    dataRegion.selectNone();
                                                    dataRegion.refresh();
                                                },
                                                failure: EHR.Utils.onError
                                            });
                                        }
                                        else {
                                            Ext.Msg.hide();
                                            dataRegion.selectNone();
                                            dataRegion.refresh();
                                        }

                                        if(skipped.length){
                                            alert('One or more rows was skipped because it already has been reviewed');
                                        }
                                    },
                                    failure: EHR.Utils.onError
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
        },

        /**
         * This add a button that allows the user to create a task from a list of IDs, that contains one record per ID.  It was originally
         * created to allow users to create a weight task based on a list of IDs (like animals needed weights).
         * @param dataRegion
         * @param menu
         * @param config
         * @param [config.formType]
         */
        addCreateTaskFromIdsBtn: function(dataRegionName, menu, config){
            menu.add({
                text: 'Schedule '+config.formType,
                dataRegionName: dataRegionName,
                handler: function(){
                    var dataRegion = LABKEY.DataRegions[this.dataRegionName];
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

                                EHR.Utils.createTask({
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
                                                dataRegion.refresh();
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
        },

        /**
         * This add a button that allows the user to create a task from requested records.  It was originally created to allow users to create Blood Draw or ClinPath
         * tasks from requested records.
         * @param dataRegionName
         * @param menu
         * @param config
         * @param [config.formType]
         */
        addCreateTaskBtn: function(dataRegionName, menu, config){
            config = config || {};

            menu.add({
                text: 'Schedule '+config.formType+' Task',
                dataRegionName: dataRegionName,
                handler: function(){
                    var dataRegion = LABKEY.DataRegions[this.dataRegionName];
                    var checked = dataRegion.getChecked();
                    if(!checked || !checked.length){
                        alert('No records selected');
                        return;
                    }

                    //NOTE: it might be a good idea to check that the dates match on input records and enforce this when making a task
        //            if(config.enforceDate){
        //
        //            }
        //            else {
        //                createWindow();
        //            }

                    createWindow();

                    function createWindow(){
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

                                EHR.Utils.createTask({
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
                                                dataRegion.refresh();
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
                    }

                    function onSuccess(data){
                        if(!data || !data.rows){
                            return;
                        }

                        Ext.Msg.hide();

                    }
                }
            });
        },

        /**
         * This add a button to a dataset that allows the user to change the QCState of the records, designed to approve or deny blood requests.
         * It also captures values for 'billedBy' and 'instructions'.
         * @param dataRegionName
         * @param menu
         */
        addChangeBloodQCStateBtn: function(dataRegionName, menu){
            menu.add({
                text: 'Change Request Status',
                dataRegionName: dataRegionName,
                handler: function(){
                    var dataRegion = LABKEY.DataRegions[this.dataRegionName];
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
                        failure: EHR.Utils.onError
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
                            },{
                                xtype: 'combo',
                                width: 200,
                                triggerAction: 'all',
                                mode: 'local',
                                fieldLabel: 'Billed By (for blood only)',
                                store: new LABKEY.ext.Store({
                                    xtype: 'labkey-store',
                                    schemaName: 'ehr_lookups',
                                    queryName: 'blood_billed_by',
                                    columns: 'code,title',
                                    sort: 'title',
                                    autoLoad: true
                                }),
                                displayField: 'title',
                                valueField: 'code',
                                ref: 'billedby'
                            },{
                                xtype: 'textarea',
                                ref: 'instructions',
                                fieldLabel: 'Instructions',
                                width: 200
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
                                var billedby = o.ownerCt.ownerCt.theForm.billedby.getValue();
                                var instructions = o.ownerCt.ownerCt.theForm.instructions.getValue();

                                if(!qc && !billedby && !instructions){
                                    alert('Must enter either status, billed by or instructions');
                                    return;
                                }

                                Ext.Msg.wait('Loading...');

                                var multi = new LABKEY.MultiRequest();

                                var toUpdate = {};
                                var obj;
                                Ext.each(records, function(rec){
                                    if(!toUpdate[rec['dataset/Label']])
                                        toUpdate[rec['dataset/Label']] = [];

                                    obj = {lsid: rec.lsid};
                                    if(qc)
                                        obj.QCState = qc;
                                    if(billedby)
                                        obj.billedby = billedby;
                                    if(instructions)
                                        obj.instructions = instructions;

                                    toUpdate[rec['dataset/Label']].push(obj)
                                }, this);

                                for(var i in toUpdate){
                                    multi.add(LABKEY.Query.updateRows, {
                                        schemaName: 'study',
                                        queryName: i,
                                        rows: toUpdate[i],
                                        scope: this,
                                        failure: EHR.Utils.onError
                                    });
                                }

                                multi.send(function(){
                                    Ext.Msg.hide();
                                    dataRegion.selectNone();

                                    o.ownerCt.ownerCt.hide();
                                    dataRegion.refresh();
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
        },

        /**
         * This add a button to a dataset that allows the user to change the QCState of the records, designed to approve or deny clinpath requests.
         * @param dataRegionName
         * @param menu
         */
        addChangeQCStateBtn: function(dataRegionName, menu){
            menu.add({
                text: 'Change Request Status',
                dataRegionName: dataRegionName,
                handler: function(){
                    var dataRegion = LABKEY.DataRegions[this.dataRegionName];
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
                        failure: EHR.Utils.onError
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
                                    alert('Must choose a status');
                                    return;
                                }

                                Ext.Msg.wait('Loading...');

                                var multi = new LABKEY.MultiRequest();

                                var toUpdate = {};
                                var obj;
                                Ext.each(records, function(rec){
                                    if(!toUpdate[rec['dataset/Label']])
                                        toUpdate[rec['dataset/Label']] = [];

                                    obj = {lsid: rec.lsid};
                                    if(qc)
                                        obj.QCState = qc;

                                    toUpdate[rec['dataset/Label']].push(obj)
                                }, this);

                                for(var i in toUpdate){
                                    multi.add(LABKEY.Query.updateRows, {
                                        schemaName: 'study',
                                        queryName: i,
                                        rows: toUpdate[i],
                                        scope: this,
                                        failure: EHR.Utils.onError
                                    });
                                }

                                multi.send(function(){
                                    Ext.Msg.hide();
                                    dataRegion.selectNone();

                                    o.ownerCt.ownerCt.hide();
                                    dataRegion.refresh();
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
        },

        /**
         * This button will shift the user to a Task page for assignments, allowing them to enter a batch of assignments at once.
         * @param dataRegion
         * @param menu
         */
        addAssignmentTaskBtn: function(dataRegionName, menu){
            menu.add({
                text: 'Add Batch of Assignments',
                dataRegionName: dataRegionName,
                handler: function(){
                    window.location = LABKEY.ActionURL.buildURL("ehr", "manageTask", null, {formtype: 'Assignment'});
                }
            });
        },

        /**
         * This button will shift the user to a Feeding task, allowing them to add a batch of records.
         * @param dataRegionName
         * @param menu
         */
        addFeedingTaskBtn: function(dataRegionName, menu){
            menu.add({
                text: 'Add Batch of Records',
                dataRegionName: dataRegionName,
                handler: function(){
                    window.location = LABKEY.ActionURL.buildURL("ehr", "manageTask", null, {formtype: 'Feeding'});
                }
            });
        },

        /**
         * Designed to duplicate a previously saved task.  It appears on the Task dataregions of the data entry page.
         * It allows the user to pick a default date for all new records.  If the task type is an encounter (ie. one animal per form)
         * then it will let the user enter a list of animals and one task will be created per animal.  If not, then all animal IDs will be copied
         * exactly from the previous task.
         *
         * @param dataRegionName
         */
        duplicateTaskHandler: function(dataRegion){
            var checked = dataRegion.getChecked();
            if(!checked || !checked.length){
                alert('No records selected');
                return;
            }
            else if (checked.length > 1) {
                alert('Can only select 1 task at a time');
                return;
            }

            var existingQueries = [];
            var existingRecords = {};
            var pendingRequests = -1;
            var taskid = checked[0];

            LABKEY.Query.selectRows({
                schemaName: 'ehr',
                queryName: 'tasks',
                columns: 'taskid,qcstate,title,formtype,formtype/category,formtype/permitsSingleIdOnly',
                filterArray: [
                    LABKEY.Filter.create('taskid', taskid, LABKEY.Filter.Types.EQUAL)
                    //LABKEY.Filter.create('category', 'Task', LABKEY.Filter.Types.EQUAL)
                ],
                scope: this,
                success: onSuccess,
                failure: EHR.Utils.onError
            });

            function onSuccess(data){

                if(!data || data.rows.length!=1){
                    alert('Task not found');
                    return;
                }

                var row = data.rows[0];
                var oldDate = row.duedate;

                LABKEY.Query.selectRows({
                    schemaName: 'ehr',
                    queryName: 'formpanelsections',
                    columns: 'schemaName,queryName',
                    filterArray: [
                        LABKEY.Filter.create('formtype', row.formtype, LABKEY.Filter.Types.EQUAL)
                    ],
                    scope: this,
                    success: function(data){
                        pendingRequests = 0;
                        Ext.each(data.rows, function(r){
                            if(r.schemaName && r.schemaName.match(/study/i)){
                                pendingRequests++;
                                LABKEY.Query.selectRows({
                                    schemaName: 'study',
                                    queryName: r.queryName,
                                    columns: EHR.Metadata.Columns[r.queryName] || null,
                                    filterArray: [
                                        LABKEY.Filter.create('taskid', taskid, LABKEY.Filter.Types.EQUAL)
                                    ],
                                    scope: this,
                                    success: function(data){
                                        if(data.rows.length){
                                            existingRecords[r.queryName] = [];
                                            Ext.each(data.rows, function(rec){
                                                delete rec.lsid;
                                                delete rec.objectid;
                                                delete rec.taskid;
                                                delete rec.requestid;
                                                delete rec.performedby;

                                                existingRecords[r.queryName].push(rec);
                                            }, this);
                                        }
                                        pendingRequests--;
                                    },
                                    failure: EHR.Utils.onError
                                });
                            }
                        });
                    },
                    failure: EHR.Utils.onError
                });

                new Ext.Window({
                    title: 'Duplicate Task',
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
                            xtype: 'textfield',
                            fieldLabel: 'Title',
                            width: 200,
                            value: row.formtype,
                            ref: 'titleField'
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
                        },{
                            xtype: 'textarea',
                            fieldLabel: 'ID(s)',
                            ref: 'ids',
                            width: 200,
                            hidden: !row['formtype/permitsSingleIdOnly']
                        },{
                            xtype: 'xdatetime',
                            fieldLabel: 'Date',
                            width: 200,
                            //value: new Date(),
                            ref: 'date'
                        },{
                            xtype: 'displayfield',
                            value: '**Leave date blank to copy from existing records'
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

                            var assignedTo = o.ownerCt.ownerCt.theForm.assignedTo.getValue();
                            if(!assignedTo){
                                alert('Must assign to someone');
                                Ext.Msg.hide();
                                return;
                            }
                            var title = o.ownerCt.ownerCt.theForm.titleField.getValue();
                            if(!title){
                                alert('Must enter a title');
                                Ext.Msg.hide();
                                return;
                            }

                            var date = o.ownerCt.ownerCt.theForm.date.getValue();

                            var subjectArray = o.ownerCt.ownerCt.theForm.ids.getValue();
                            if(subjectArray){
                                subjectArray = subjectArray.replace(/[\s,;]+/g, ';');
                                subjectArray = subjectArray.replace(/(^;|;$)/g, '');
                                subjectArray = subjectArray.toLowerCase();
                                subjectArray = subjectArray.split(';');
                            }

                            o.ownerCt.ownerCt.hide();

                            LABKEY.Utils.onTrue({
                                testCallback: function(){
                                    return pendingRequests==0;
                                },
                                success: onTrue,
                                scope: this,
                                //successArguments: ['FileUploadField is ready to use!'],
                                failure: EHR.Utils.onError,
                                maxTests: 1000
                            });

                            function onTrue(){
                                var toUpdate = [];
                                var obj;
                                for(var query in existingRecords){
                                    obj = {
                                        schemaName: 'study',
                                        queryName: query,
                                        rows: []
                                    }
                                    Ext.each(existingRecords[query], function(record){
                                        if(date)
                                            record.date = date;

                                        obj.rows.push(record);
                                    }, this);
                                    if(obj.rows.length)
                                        toUpdate.push(obj);
                                }

                                var duedate = date || oldDate;
                                if(duedate){ duedate = duedate.toGMTString()};

                                var taskConfig = {
                                    initialQCState: 'Scheduled',
                                    childRecords: toUpdate,
                                    existingRecords: null,
                                    taskRecord: {duedate: duedate, assignedTo: assignedTo, category: 'task', title: title, formType: row.formtype},
                                    success: function(response, options, config){
                                        Ext.Msg.hide();
                                        Ext.Msg.confirm('View Task Now?', 'Do you want to view the task now?', function(btn){
                                            if(btn == 'yes'){
                                                window.location = LABKEY.ActionURL.buildURL("ehr", "manageTask", null, {taskid: config.taskId, formtype: config.taskRecord.formType});
                                            }
                                            else {
                                                dataRegion.refresh();
                                            }
                                        }, this)
                                    },
                                    failure: function(error){
                                        console.log('failure');
                                        console.log(error);
                                        Ext.Msg.hide();
                                    }
                                }

                                if(subjectArray.length){

                                    Ext.each(subjectArray, function(id){
                                       var cfg = Ext.apply({}, taskConfig);
                                       cfg.taskRecord.title = title + ': ' + id;
                                       Ext.each(cfg.childRecords, function(tableRecords){
                                            Ext.each(tableRecords.rows, function(record){
                                                record.Id = id;
                                            }, this);
                                        }, this);
                                        EHR.Utils.createTask(cfg);
                                    }, this);
                                }
                                else {
                                    EHR.Utils.createTask(taskConfig);
                                }
                            }
                        }
                    },{
                        text: 'Close',
                        handler: function(o){
                            o.ownerCt.ownerCt.hide();
                        }
                    }]
                }).show();
            }
        },

        /**
         * Originally created for the purpose of allowing users to append blood to an existing task.  There were enough complexities to this (for example, what if that
         * task is completed?), that rather than 'pushing' blood to tasks, we allow users to 'pull' records into a task from that form.  This side-stepped
         * many potential issues.
         * @depreciated
         * @param dataRegionName
         * @param menu
         */
        addBloodToTaskBtn: function(dataRegionName, menu){
            menu.add({
                text: 'Add To Existing Task',
                dataRegionName: dataRegionName,
                handler: function(){
                    var dataRegion = LABKEY.DataRegions[this.dataRegionName];
                    var checked = dataRegion.getChecked();
                    if(!checked || !checked.length){
                        alert('No records selected');
                        return;
                    }

                    new Ext.Window({
                        title: 'Add To Existing Task',
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
                                fieldLabel: 'Select Task',
                                width: 200,
                                triggerAction: 'all',
                                mode: 'local',
                                store: new LABKEY.ext.Store({
                                    xtype: 'labkey-store',
                                    schemaName: 'ehr',
                                    sql: "select t.taskid, t.rowid, t.title from ehr.tasks t where t.formtype IN ('Blood Draws','MPR') AND t.qcstate.label!='Completed'",
                                    sort: 'rowid',
                                    autoLoad: true
                                }),
                                displayField: 'rowid',
                                valueField: 'rowid',
                                ref: 'taskField',
                                tpl: function(){var tpl = new Ext.XTemplate(
                                    '<tpl for=".">' +
                                    '<div class="x-combo-list-item">{[values["rowid"] +" - "+ values["title"]]}' +'&nbsp;</div>' +
                                    '</tpl>'
                                    );return tpl.compile()}() //FIX: 5860
                            }]
                        }],
                        buttons: [{
                            text:'Submit',
                            disabled:false,
                            formBind: true,
                            ref: '../submit',
                            scope: this,
                            handler: function(o){
                                Ext.Msg.wait('Saving...');

                                var taskId = o.ownerCt.ownerCt.theForm.taskField.getValue();
                                if(!taskId){
                                    alert('You must pick a task');
                                    Ext.Msg.hide();
                                    return;
                                }

                                var rec = o.ownerCt.ownerCt.theForm.taskField.getStore().find('rowid', taskId);
                                rec = o.ownerCt.ownerCt.theForm.taskField.getStore().getAt(rec);

                                o.ownerCt.ownerCt.hide();

                                var records = [];
                                Ext.each(checked, function(r){
                                    records.push({lsid: r, taskid: rec.get('taskid'), QCStateLabel: 'Scheduled'});
                                }, this);

                                LABKEY.Query.updateRows({
                                    schemaName: 'study',
                                    queryName: 'Blood Draws',
                                    rows: records,
                                    scope: this,
                                    success: function(data){
                                        Ext.Msg.hide();
                                        dataRegion.refresh();
                                    },
                                    failure: EHR.Utils.onError
                                });

                            }
                        },{
                            text: 'Close',
                            handler: function(o){
                                o.ownerCt.ownerCt.hide();
                            }
                        }]
                    }).show();
                }
            });
        },

        perDiemCopyHandler: function(dataRegionName){
            var dataRegion = LABKEY.DataRegions[dataRegionName];
            var checked = dataRegion.getChecked()
            if(!checked || !checked.length){
                alert('No records selected');
                return;
            }


            Ext.Msg.confirm('Save Per Diems', 'This will save these charges, replacing any existing per diems during the same date range.  Do you want to proceed?', function(btn){
                if(btn == 'yes'){
                    var params = dataRegion.getParameters();

                    LABKEY.Query.selectRows({
                        schemaName: dataRegion.schemaName,
                        queryName: dataRegion.queryName,
                        parameters: dataRegion.getParameters()
                    });
                }
            }, this);
        }
    }
}


