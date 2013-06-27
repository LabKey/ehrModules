/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
LABKEY.ExtAdapter.ns('EHR.DataEntryUtils');

EHR.DataEntryUtils = new function(){
    var demographicsCache = {};

    function loadDemographics(animalId, callback, scope){
        //TODO: this should become a real server-side API
        var multi = new LABKEY.MultiRequest();
        var cache = {};

        multi.add(LABKEY.Query.selectRows, {
            schemaName: this.schemaName || 'study',
            queryName: this.queryName || 'demographics',
            viewName: this.viewName || 'Clinical Summary',
            filterArray: [LABKEY.Filter.create('Id', animalId, LABKEY.Filter.Types.EQUAL)],
            scope: this,
            success: function(results){
                if (results && results.rows && results.rows.length){
                    cache.demographics = new LDK.SelectRowsRow(results.rows[0]);
                }
            },
            failure: LDK.Utils.getErrorCallback(),
            requiredVersion: 9.1
        });

        multi.add(LABKEY.Query.selectRows, {
            schemaName: this.schemaName || 'study',
            queryName: this.queryName || 'flags',
            columns: 'Id,date,category,value',
            filterArray: [
                LABKEY.Filter.create('Id', animalId, LABKEY.Filter.Types.EQUAL),
                LABKEY.Filter.create('isActive', true, LABKEY.Filter.Types.EQUAL)
            ],
            scope: this,
            success: function(results){
                cache.flags = [];

                if (results && results.rows && results.rows.length){
                    Ext4.Array.forEach(results.rows, function(r){
                        cache.flags.push(new LDK.SelectRowsRow(r));
                    }, this);
                }
            },
            failure: LDK.Utils.getErrorCallback(),
            requiredVersion: 9.1
        });

        multi.send(getDemographicsCallback(animalId, cache, callback, scope), this);
    }

    function getDemographicsCallback(animalId, cache, callback, scope){
        return function(){
            cache.loadTime = new Date();
            demographicsCache[animalId] = cache;
console.log('loading for: ' + animalId);
            if (callback)
                callback.call(scope || this, animalId, cache);
        }
    }

    var gridButtons = {
        ADDRECORD: function(config){
            return Ext4.Object.merge({
                text: 'Add',
                tooltip: 'Click to add a row',
                handler: function(btn){
                    var grid = btn.up('gridpanel');
                    if(!grid.store || !grid.store.hasLoaded()){
                        console.log('no store or store hasnt loaded');
                        return;
                    }

                    var cellEditing = grid.getPlugin('cellediting');
                    if(cellEditing)
                        cellEditing.completeEdit();

                    var model = grid.store.createModel({});
                    grid.store.insert(0, [model]); //add a blank record in the first position

                    if(cellEditing)
                        cellEditing.startEditByPosition({row: 0, column: grid.firstEditableColumn || 0});
                }
            }, config);
        },
        DELETERECORD: function(config){
            return Ext4.Object.merge({
                text: 'Delete',
                tooltip: 'Click to delete selected rows',
                handler: function(btn){
                    var grid = btn.up('gridpanel');
                    var selections = grid.getSelectionModel().getSelection();

                    if(!grid.store || !selections || !selections.length)
                        return;

                    grid.store.remove(selections);
                }
            }, config);
        },
        ADDANIMALS: function(config){
            return Ext4.Object.merge({
                text: 'Add Animals',
                tooltip: 'Click to add rows',
                handler: function(btn){
                    var grid = btn.up('gridpanel');

                    Ext4.create('EHR.window.AddAnimalsWindow', {
                        targetStore: grid.store
                    }).show();
                }
            }, config);
        }
    };

    var dataEntryFormButtons = {
        SAVEDRAFT: {
            text: 'Save Draft',
            name: 'saveDraft',
            requiredQC: 'In Progress',
            errorThreshold: 'WARN',
            disabled: true,
            itemId: 'saveDraftBtn',
            handler: function(btn){
                var panel = btn.up('ehr-dataentrypanel');
                panel.onSubmit(btn)
            },
            disableOn: 'ERROR'
        },
        /**
         * A variation on the normal submit button, except will be hidden to non-admins.  It was created so MPRs could have a submit button visible only to admins (permission-based logic was not a sufficient distinction otherwise)
         */
        SUBMITADMIN: {
            text: 'Submit Final',
            name: 'submit',
            requiredQC: 'Completed',
            requiredPermission: 'admin',
            targetQC: 'Completed',
            errorThreshold: 'INFO',
            successURL: LABKEY.ActionURL.getParameter('srcURL') || LABKEY.ActionURL.buildURL('ehr', 'enterData.view'),
            disabled: true,
            itemId: 'submitBtn',
            handler: function(btn){
                var panel = btn.up('ehr-dataentrypanel');
                Ext4.Msg.confirm('Finalize Form', 'You are about to finalize this form.  Do you want to do this?', function(v){
                    if(v=='yes')
                        panel.onSubmit(btn);
                }, this);
            },
            disableOn: 'WARN'
        },
        /**
         * The standard 'Submit Final' button.  Will change the QCState of all records to 'Completed' and submit the form
         */
        SUBMIT: {
            text: 'Submit Final',
            name: 'submit',
            requiredQC: 'Completed',
            targetQC: 'Completed',
            errorThreshold: 'INFO',
            successURL: LABKEY.ActionURL.getParameter('srcURL') || LABKEY.ActionURL.buildURL('ehr', 'enterData.view'),
            disabled: true,
            itemId: 'submitBtn',
            handler: function(btn){
                var panel = btn.up('ehr-dataentrypanel');
                Ext4.Msg.confirm('Finalize Form', 'You are about to finalize this form.  Do you want to do this?', function(v){
                    if(v == 'yes')
                        this.onSubmit(btn);
                }, this);
            },
            disableOn: 'WARN'
        },
        /**
         * An admin button that will force records to submit with a QCState of 'Completed', ignoring validation errors.  Created for situations where there is a valid reason to override normal validation errors.
         */
        FORCESUBMIT: {
            text: 'Force Submit',
            name: 'submit',
            requiredQC: 'Completed',
            targetQC: 'Completed',
            requiredPermission: 'admin',
            errorThreshold: 'ERROR',
            successURL: LABKEY.ActionURL.getParameter('srcURL') || LABKEY.ActionURL.buildURL('ehr', 'enterData.view'),
            disabled: true,
            itemId: 'foreceSubmitBtn',
            handler: function(btn){
                var panel = btn.up('ehr-dataentrypanel');
                Ext4.Msg.confirm('Force Finalize Form', 'You are about to finalize this form.  Do you want to do this?', function(v){
                    if(v == 'yes')
                        this.onSubmit(btn);
                }, this);
            },
            disableOn: 'SEVERE'
        },
        /**
         * Will attempt to convert the QCState of all records to 'Completed' and submit the form.  Similar to the other SUBMIT button; however, this button does not require a confirmation prior to submitting.
         */
        BASICSUBMIT: {
            text: 'Submit',
            name: 'basicsubmit',
            requiredQC: 'Completed',
            errorThreshold: 'INFO',
            successURL: LABKEY.ActionURL.getParameter('srcURL') || LABKEY.ActionURL.buildURL('ehr', 'enterData.view'),
            disabled: true,
            itemId: 'submitBtn',
            handler: function(btn){
                var panel = btn.up('ehr-dataentrypanel');
                panel.onSubmit(btn);
            },
            disableOn: 'WARN'
        },
        /**
         * Will attempt to convert all records to the QCState 'Review Required' and submit the form.
         */
        REVIEW: {
            text: 'Submit for Review',
            name: 'review',
            requiredQC: 'Review Required',
            targetQC: 'Review Required',
            errorThreshold: 'WARN',
            successURL: LABKEY.ActionURL.getParameter('srcURL') || LABKEY.ActionURL.buildURL('ehr', 'enterData.view'),
            disabled: true,
            itemId: 'reviewBtn',
            disableOn: 'ERROR',
            handler: function(btn){
                var panel = btn.up('ehr-dataentrypanel');
                Ext4.create('EHR.window.SubmitForReviewPanel', {
                    dataEntryPanel: panel,
                    dataEntryBtn: btn
                }).show();
            }
        },
        /**
         * Will attempt to convert all records to a QCState of 'scheduled' and submit the form.
         */
        SCHEDULE: {
            text: 'Schedule',
            name: 'review',
            requiredQC: 'Scheduled',
            targetQC: 'Scheduled',
            errorThreshold: 'WARN',
            successURL: LABKEY.ActionURL.getParameter('srcURL') || LABKEY.ActionURL.buildURL('ehr', 'enterData.view'),
            disabled: true,
            itemId: 'scheduledBtn',
            disableOn: 'ERROR',
            handler: function(btn){
                var panel = btn.up('ehr-dataentrypanel');
                panel.onSubmit(btn)
            }
        },
        /**
         * Re-runs server-side validation on all records.  Primarily useful if something goes wrong in the normal validation process and an error will not disappear as it should
         */
        VALIDATEALL: {
            text: 'Validate',
            name: 'validate',
            disabled: false,
            itemId: 'validateBtn',
            handler: function(btn){
                var panel = btn.up('ehr-dataentrypanel');
                panel.storeCollection.validateAll();
            }
        },
        /**
         * Will attempt to convert all records to a QCState of 'Delete Requested' and submit the form.  NOTE: this button and the requestDelete method should really be converted to perform a true delete
         */
        DISCARD: {
            text: 'Discard',
            name: 'discard',
            itemId: 'discardBtn',
            targetQC: 'Delete Requested',
            requiredQC: 'Delete Requested',
            successURL: LABKEY.ActionURL.getParameter('srcURL') || LABKEY.ActionURL.buildURL('ehr', 'enterData.view'),
            handler: function(btn){
                var panel = btn.up('ehr-dataentrypanel');
                //TODO:
                panel.discard();
            }
        },
        /**
         * Will submit/save the form and then return to the enterData page.  It does not alter the QCState of records.
         */
        CLOSE: {
            text: 'Save & Close',
            name: 'closeBtn',
            requiredQC: 'In Progress',
            errorThreshold: 'WARN',
            successURL: LABKEY.ActionURL.getParameter('srcURL') || LABKEY.ActionURL.buildURL('ehr', 'enterData.view'),
            disabled: true,
            itemId: 'closeBtn',
            handler: function(btn){
                var panel = btn.up('ehr-dataentrypanel');
                panel.onSubmit(btn);
            },
            disableOn: 'ERROR'
        },
        /**
         * This button will attempt to convert the QCState of records to 'Request: Pending' and submit the form.  Default button for request pages.
         */
        REQUEST: {
            text: 'Request',
            name: 'request',
            targetQC: 'Request: Pending',
            requiredQC: 'Request: Pending',
            errorThreshold: 'WARN',
            successURL: LABKEY.ActionURL.getParameter('srcURL') || LABKEY.ActionURL.buildURL('ehr', 'requestServices.view'),
            disabled: true,
            itemId: 'requestBtn',
            handler: function(btn){
                var panel = btn.up('ehr-dataentrypanel');
                panel.onSubmit(btn);
            },
            disableOn: 'WARN'
        },
        /**
         * This button will convert the QCState on records to 'Request: Approved' and submit.  Not currently used in the EHR, because requests are better managed through the tabbed UI on the enterData page.
         */
        APPROVE: {
            text: 'Approve Request',
            name: 'approve',
            targetQC: 'Request: Approved',
            requiredQC: 'Request: Approved',
            errorThreshold: 'WARN',
            successURL: LABKEY.ActionURL.getParameter('srcURL') || LABKEY.ActionURL.buildURL('ehr', 'enterData.view'),
            disabled: true,
            itemId: 'approveBtn',
            handler: function(btn){
                var panel = btn.up('ehr-dataentrypanel');
                panel.onSubmit(btn);
            },
            disableOn: 'ERROR'
        }
    };

    return {
        getFormEditorConfig: function(columnInfo){
            var cfg = LABKEY.ext.Ext4Helper.getFormEditorConfig(columnInfo);

            if (cfg.xtype == 'numberfield'){
                cfg.hideTrigger = true;
            }

            return cfg;
        },

        getColumnConfigFromMetadata: function(meta, grid){
            var col = {};
            col.dataIndex = meta.dataIndex || meta.name;
            col.header = meta.header || meta.caption || meta.label || meta.name;

            col.customized = true;
            col.sortable = false;

            col.hidden = meta.hidden;
            col.format = meta.extFormat;

            //this.updatable can override col.editable
            col.editable = meta.userEditable;

            if(col.editable && !col.editor)
                col.editor = LABKEY.ext.Ext4Helper.getGridEditorConfig(meta);

            col.renderer = LABKEY.ext.Ext4Helper.getDefaultRenderer(col, meta, grid);

            //HTML-encode the column header
            col.text = Ext4.util.Format.htmlEncode(meta.label || meta.name || col.header);

            if(meta.ignoreColWidths)
                delete col.width;

            //allow override of defaults
            if(meta.columnConfig){
                col = Ext4.Object.merge(col, meta.columnConfig);
            }

            return col;
        },

        getGridButton: function(name){
            LDK.Assert.assertNotEmpty('Unknown grid button: ' + name, gridButtons[name]);
            if (gridButtons[name]){
                return gridButtons[name]()
            }
        },

        getDataEntryFormButton: function(name){
            LDK.Assert.assertNotEmpty('Unknown DataEntryForm button: ' + name, dataEntryFormButtons[name]);
            if (dataEntryFormButtons[name]){
                return Ext4.apply({}, dataEntryFormButtons[name]);
            }
        },

        getDemographics: function(animalId, callback, scope){
            LDK.Assert.assertNotEmpty('getDemographics called with a null animalId', animalId);

            //reuse cached info if less than 10 secs old
            if (demographicsCache[animalId]){
                var ms = (new Date()) - demographicsCache[animalId].loadTime;
                if (ms < 10000){
                    callback.call(scope || this, animalId, demographicsCache[animalId]);
                    return;
                }
            }

            if (Ext4.isEmpty(animalId)){
                callback.call(scope || this, animalId, null);
                return;
            }

            loadDemographics(animalId, callback, scope);
        }
    }
};