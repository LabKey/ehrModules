/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.namespace('EHR.DatasetButtons');


/**
 * This class holds methods or factories related to buttons that appear on DataRegion button bars in the EHR.
 * It follows the convention that handlers called directly are suffixed with 'Handler'.
 * @name EHR.DatasetButtons
 * @class
 */
EHR.DatasetButtons = new function(){
    var customizers = [];

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
                success: function(){
                    // NOTE: we have deprecated all core client-side code, but allow modules to register customizers that can add buttons
                    Ext4.each(customizers, function(fn){
                        fn.call(this, dataRegion.name);
                    }, this);
                },
                failure: LDK.Utils.getErrorCallback(),
                scope: this
            });
        },

        registerMoreActionsCustomizer: function(fn){
            customizers.push(fn);
        },

        /**
         * This helper will find the distinct IDs from the currently selected rows, then load the animal history page filtered on these IDs.
         * @param dataRegion
         * @param dataRegionName
         * @param queryName
         * @param schemaName
         */
        historyHandler: function(dataRegion, dataRegionName, queryName, schemaName){
            dataRegion = LABKEY.DataRegions[dataRegionName];
            var checked = dataRegion.getChecked();
            if (!checked || !checked.length){
                alert('No records selected');
                return;
            }

            queryName = queryName || dataRegion.queryName;
            schemaName = schemaName || dataRegion.schemaName;

            var sql = "SELECT DISTINCT s.Id FROM "+schemaName+".\""+queryName+"\" s " + LDK.DataRegionUtils.getDataRegionWhereClause(dataRegion, 's');

            LABKEY.Query.executeSql({
                method: 'POST',
                schemaName: 'study',
                sql: sql,
                failure: LDK.Utils.getErrorCallback(),
                success: function(data){
                    var ids = new Array();
                    for (var i = 0; i < data.rows.length; i++)
                        ids.push(data.rows[i].Id);

                    LDK.Assert.assertTrue('No animals found in more actions handler.', ids.length > 0);

                    if (ids.length){
                        var ctx = EHR.Utils.getEHRContext();
                        LDK.Assert.assertNotEmpty('EHRContext not loaded.  This might indicate a ClientDependency issue', ctx);
                        if (!ctx){
                            return;
                        }

                        var hash = 'inputType:multiSubject&showReport:1&subjects:'+ids.join(',');
                        window.location = LABKEY.ActionURL.buildURL('ehr', 'animalHistory.view#'+hash, ctx['EHRStudyContainer']);

                        //force reload if on same page
                        if (LABKEY.ActionURL.getAction() == 'animalHistory'){
                            Ext4.History.add(hash);
                            window.location.reload();
                        }
                    }
                    else {
                        Ext4.Msg.alert('Error', 'No animals were found for your selection.  Either no rows were checked or there is a bug.');
                    }
                }
            });
        },

        /**
         * This button should appear on all datasets and will allow the user to load the audit history of the selected record(s).  NOTE: because LabKey's PKs
         * (lsid) are based on Id + Date, they can change.  As a result, this helper first queries the DB to find the objectId of the selected records, then loads
         * the audit table filted on "lsid LIKE objectId".  This removes the need to include Id/Date in the search.  It's awkward and slow, but will give you the
         * correct history of a record, even if the Id or date changed.
         * @param dataRegionName
         */
        showAuditHistoryHandler: function(dataRegionName){
            var dataRegion = LABKEY.DataRegions[dataRegionName];
            var checked = dataRegion.getChecked();
            if (!checked || !checked.length){
                alert('No records selected');
                return;
            }

            Ext4.Msg.wait('Loading...');

            LABKEY.Query.selectRows({
                schemaName: dataRegion.schemaName,
                queryName: dataRegion.queryName,
                columns: 'lsid,objectid',
                filterArray: [
                    LABKEY.Filter.create('lsid', checked.join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF)
                ],
                scope: this,
                success: function(data){
                    Ext4.Msg.hide();

                    if (data.rows.length){
                        var items = [{
                            html: 'New browser windows or tabs should have opened to load the history of these records.  If this did not happen, please be sure popups are enabled.  You can also click the following links to view those records:',
                            bodyStyle: 'padding: 5px;',
                            border: false
                        }];

                        var url;
                        Ext4.Array.forEach(data.rows, function(row, idx){
                            url = LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {
                                schemaName: 'auditLog',
                                'query.queryName': 'DatasetAuditEvent',
                                'query.viewName': 'Detailed',
                                'query.key1~contains': row.objectid
                            });

                            items.push({
                                html: '<a target="_blank" href="'+url+'">' + 'Record '+(idx+1) + '</a>',
                                border: false
                            });

                            window.open(url);
                        }, this);

                        Ext4.create('Ext.window.Window', {
                            closeAction:'destroy',
                            title: 'Record History',
                            modal: true,
                            width: 350,
                            items: items,
                            buttons: [{
                                text: 'Close',
                                handler: function(btn){
                                    btn.up('window').close();
                                }
                            }]
                        }).show();
                    }
                    else {
                        alert('Record not found');
                    }
                },
                failure: LDK.Utils.getErrorCallback()
            });
        },

        /**
         * Button handler that allows the user to pick 2 arbitrary weights and it will calculate
         * the percent difference between the two.  Appears on weight dataRegions.
         * @param dataRegionName
         * @param menu
         */
        compareWeightsHandler: function(dataRegionName){
            var dataRegion = LABKEY.DataRegions[dataRegionName];
            var checked = dataRegion.getChecked();
            if (!checked || !checked.length){
                alert('No records selected');
                return;
            }

            if (checked.length > 2){
                Ext4.Msg.alert('Error', 'More than 2 weights are checked.  Using the first 2.', showWindow, this);
            }
            else {
                showWindow();
            }

            function showWindow(){
                Ext4.create('EHR.window.CompareWeightsWindow', {
                    dataRegionName: dataRegionName
                }).show();
            }
        },

        discardTasks: function(dataRegionName){
            var dataRegion = LABKEY.DataRegions[dataRegionName];
            var checked = dataRegion.getChecked();
            if (!checked || !checked.length){
                alert('No records selected');
                return;
            }

            Ext4.Msg.confirm('Discard Tasks', 'You are about to permanently delete the selected tasks.  Do you want to do this?', function(val){
                if (val == 'yes'){
                    Ext4.Msg.wait('Deleting...');
                    LABKEY.Ajax.request({
                        url: LABKEY.ActionURL.buildURL('ehr', 'discardForm', null, {taskIds: checked}),
                        success: function(response, options){
                            Ext4.Msg.hide();
                            Ext4.Msg.alert('Success', 'Tasks discarded');
                            dataRegion.refresh();
                        },
                        failure: LDK.Utils.getErrorCallback({
                            callback: function(response){
                                console.log(arguments)
                                Ext4.Msg.hide();
                                Ext4.Msg.alert('Error', 'There was an error deleting one or more tasks');
                            },
                            scope: this
                        }),
                        scope: this
                    });
                }
            }, this);
        },

        /**
         * This add a button that allows the user to create a task from a list of IDs, that contains one record per ID.  It was originally
         * created to allow users to create a weight task based on a list of IDs (like animals needed weights).
         */
        createTaskFromIdsHandler: function(dataRegionName, formType, taskLabel, dataSets){
            var dataRegion = LABKEY.DataRegions[dataRegionName];
            var checked = dataRegion.getChecked();
            if (!checked || !checked.length){
                Ext4.Msg.alert('Error', 'No records selected');
                return;
            }

            Ext4.create('EHR.window.CreateTaskFromIdsWindow', {
                dataRegionName: dataRegionName,
                title: 'Schedule ' + taskLabel,
                taskLabel: taskLabel,
                formType: formType,
                dataSets: dataSets
            }).show();
        },

        /**
         * This add a button that allows the user to create a task from a list of IDs, that contains one record per ID.  It was originally
         * created to allow users to create a weight task based on a list of IDs (like animals needed weights).
         */
        createTaskFromRecordHandler: function(dataRegionName, formType, taskLabel){
            var dataRegion = LABKEY.DataRegions[dataRegionName];
            var checked = dataRegion.getChecked();
            if (!checked || !checked.length){
                Ext4.Msg.alert('Error', 'No records selected');
                return;
            }

            Ext4.create('EHR.window.CreateTaskFromRecordsWindow', {
                dataRegionName: dataRegionName,
                title: 'Schedule ' + taskLabel + " For Selected Rows",
                formType: formType,
                taskLabel: taskLabel
            }).show();
        },

        /**
         * This add a button to a dataset that allows the user to change the QCState of the records, designed to approve or deny clinpath requests.
         * @param dataRegionName
         * @param menu
         */
        changeQCStateHandler: function(dataRegionName, className){
            var dataRegion = LABKEY.DataRegions[dataRegionName];
            var checked = dataRegion.getChecked();
            if (!checked || !checked.length){
                alert('No records selected');
                return;
            }

            Ext4.create(className || 'EHR.window.ChangeRequestStatusWindow', {
                dataRegionName: dataRegionName
            }).show();
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
            if (!checked || !checked.length){
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

                if (!data || data.rows.length!=1){
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
                            if (r.schemaName && r.schemaName.match(/study/i)){
                                pendingRequests++;
                                LABKEY.Query.selectRows({
                                    schemaName: 'study',
                                    queryName: r.queryName,
                                    viewName:  '~~UPDATE~~',
                                    columns: EHR.Metadata.Columns[r.queryName] || null,
                                    filterArray: [
                                        LABKEY.Filter.create('taskid', taskid, LABKEY.Filter.Types.EQUAL)
                                    ],
                                    scope: this,
                                    success: function(data){
                                        if (data.rows.length){
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
                                columns: 'UserId,DisplayName',
                                sort: 'Type,DisplayName',
                                autoLoad: true
                            }),
                            displayField: 'DisplayName',
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
                            if (!assignedTo){
                                alert('Must assign to someone');
                                Ext.Msg.hide();
                                return;
                            }
                            var title = o.ownerCt.ownerCt.theForm.titleField.getValue();
                            if (!title){
                                alert('Must enter a title');
                                Ext.Msg.hide();
                                return;
                            }

                            var date = o.ownerCt.ownerCt.theForm.date.getValue();

                            var subjectArray = o.ownerCt.ownerCt.theForm.ids.getValue();
                            if (subjectArray){
                                subjectArray = subjectArray.replace(/[\s,;]+/g, ';');
                                subjectArray = subjectArray.replace(/(^;|;$)/g, '');
                                subjectArray = subjectArray.toLowerCase();
                                subjectArray = subjectArray.split(';');
                            }

                            o.ownerCt.ownerCt.close();

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
                                        if (date)
                                            record.date = date;

                                        obj.rows.push(record);
                                    }, this);
                                    if (obj.rows.length)
                                        toUpdate.push(obj);
                                }

                                var duedate = date || oldDate;
                                if (duedate){ duedate = duedate.toGMTString()};

                                var taskConfig = {
                                    initialQCState: 'Scheduled',
                                    childRecords: toUpdate,
                                    existingRecords: null,
                                    taskRecord: {duedate: duedate, assignedTo: assignedTo, category: 'task', title: title, formType: row.formtype},
                                    success: function(response, options, config){
                                        Ext.Msg.hide();
                                        Ext.Msg.confirm('View Task Now?', 'Do you want to view the task now?', function(btn){
                                            if (btn == 'yes'){
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

                                if (subjectArray.length){

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
                            o.ownerCt.ownerCt.close();
                        }
                    }]
                }).show();
            }
        },

        showCaseHistory: function(objectId, subjectId, el){
            var ctx = EHR.Utils.getEHRContext();
            LDK.Assert.assertNotEmpty('EHRContext not loaded.  This might indicate a ClientDependency issue', ctx);
            if (!ctx){
                return;
            }

            Ext4.create('EHR.window.CaseHistoryWindow', {
                subjectId: subjectId,
                caseId: objectId,
                containerPath: ctx['EHRStudyContainer']
            }).show(el);
        },

        showRunSummary: function(runId, Id, el){
            Ext4.create('Ext.window.Window', {
                title: 'Labwork Results: ' + Id,
                bodyStyle: 'padding: 3px;',
                width: 600,
                minHeight: 300,
                modal: true,
                items: [{
                    xtype: 'ehr-labworksummarypanel',
                    border: true,
                    hideHeader: true,
                    runId: runId
                }],
                buttons: [{
                    text: 'Close',
                    handler: function(btn){
                        btn.up('window').close();
                    }
                }]
            }).show(el);
        }
    }
}


