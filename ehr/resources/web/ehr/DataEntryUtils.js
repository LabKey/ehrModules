/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
LABKEY.ExtAdapter.ns('EHR.DataEntryUtils');

EHR.DataEntryUtils = new function(){
    var dataEntryPanel = null;
    var gridButtons = {
        ADDRECORD: function(config){
            return Ext4.Object.merge({
                text: 'Add',
                tooltip: 'Click to add a row',
                handler: function(btn){
                    var grid = btn.up('gridpanel');
                    if (!grid.store || !grid.store.hasLoaded()){
                        console.log('no store or store hasnt loaded');
                        return;
                    }

                    var cellEditing = grid.getPlugin(grid.editingPluginId);
                    if (cellEditing)
                        cellEditing.completeEdit();

                    var model = grid.store.createModel({});
                    grid.store.add(model); //add a blank record in the first position
                    var recIdx = grid.store.indexOf(model);

                    if (cellEditing && recIdx > -1){
                        cellEditing.startEditByPosition({row: recIdx, column: grid.firstEditableColumn || 1});
                    }
                }
            }, config);
        },
        DELETERECORD: function(config){
            return Ext4.Object.merge({
                text: 'Delete Selected',
                tooltip: 'Click to delete selected rows',
                handler: function(btn){
                    var grid = btn.up('gridpanel');
                    var selections = grid.getSelectionModel().getSelection();

                    if(!grid.store || !selections || !selections.length)
                        return;

                    var hasPermission = true;
                    Ext4.Array.each(selections, function(r){
                        if (!r.canDelete()){
                            hasPermission = false;
                            return false;
                        }
                    }, this);

                    if (hasPermission){
                        Ext4.Msg.confirm('Confirm', 'You are about to permanently delete these records.  It cannot be undone.  Are you sure you want to do this?', function(val){
                            if (val == 'yes')
                                grid.store.safeRemove(selections);
                        }, this);
                    }
                    else {
                        Ext4.Msg.alert('Error', 'You do not have permission to remove these records');
                    }
                }
            }, config);
        },
        ADDANIMALS: function(config){
            return Ext4.Object.merge({
                text: 'Add Batch',
                tooltip: 'Click to add a batch of animals, either as a list or by location',
                handler: function(btn){
                    var grid = btn.up('gridpanel');

                    Ext4.create('EHR.window.AddAnimalsWindow', {
                        targetStore: grid.store,
                        formConfig: grid.formConfig
                    }).show();
                }
            }, config);
        },
        GUESSPROJECT: function(config){
            return Ext4.Object.merge({
                text: 'Guess Projects',
                tooltip: 'Click to automatically set the project on the selected records',
                handler: function(btn){
                    var grid = btn.up('gridpanel');
                    var selected = grid.getSelectionModel().getSelection();
                    if (!selected || !selected.length){
                        Ext4.Msg.alert('Error', 'No records selected');
                        return;
                    }

                    Ext4.create('EHR.window.GuessProjectWindow', {
                        targetGrid: grid,
                        records: selected
                    }).show();
                }
            }, config);
        },
        SELECTALL: function(config){
            return Ext4.Object.merge({
                text: 'Select All',
                tooltip: 'Click to select all rows',
                handler: function(btn){
                    var grid = btn.up('gridpanel');
                    grid.getSelectionModel().selectAll();
                }
            }, config);
        },
        REFRESH: function(config){
            return Ext4.Object.merge({
                text: 'Refresh Grid',
                tooltip: 'Click refresh the grid',
                handler: function(btn){
                    var grid = btn.up('gridpanel');
                    grid.getView().refresh();
                }
            }, config);
        },
        DUPLICATE: function(config){
            return Ext4.Object.merge({
                text: 'Duplicate Selected',
                tooltip: 'Click to duplicate selected rows',
                handler: function(btn){
                    var grid = btn.up('gridpanel');
                    var selected = grid.getSelectionModel().getSelection();
                    if (!selected || !selected.length){
                        Ext4.Msg.alert('Error', 'No records selected');
                        return;
                    }

                    Ext4.create('EHR.window.RecordDuplicatorWindow', {
                        targetGrid: grid
                    }).show();
                }
            }, config);
        },
        BULKEDIT: function(config){
            return Ext4.Object.merge({
                text: 'Bulk Edit',
                tooltip: 'Click to edit the selected rows in bulk',
                handler: function(btn){
                    var grid = btn.up('gridpanel');
                    var selected = grid.getSelectionModel().getSelection();
                    if (!selected || !selected.length){
                        Ext4.Msg.alert('Error', 'No records selected');
                        return;
                    }

                    Ext4.create('EHR.window.BulkEditWindow', {
                        targetStore: grid.store,
                        formConfig: grid.formConfig,
                        records: selected
                    }).show();
                }
            }, config);
        },
        BULKEDITDATE: function(config){
            return Ext4.Object.merge({
                text: 'Bulk Edit Date/Time',
                tooltip: 'Click to edit the time of the selected rows in bulk',
                handler: function(btn){
                    var grid = btn.up('gridpanel');
                    var selected = grid.getSelectionModel().getSelection();
                    if (!selected || !selected.length){
                        Ext4.Msg.alert('Error', 'No records selected');
                        return;
                    }

                    Ext4.create('EHR.window.BulkEditWindow', {
                        targetStore: grid.store,
                        formConfig: grid.formConfig,
                        records: selected
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
         * A variation on the normal submit button, intended for use in the basic single-record form.  Does not alter QCState
         */
        BASICSUBMIT: {
            text: 'Submit',
            name: 'submit',
            successURL: LABKEY.ActionURL.getParameter('srcURL') || LABKEY.ActionURL.buildURL('project', 'start'),
            disabled: false,
            itemId: 'submitBtn',
            handler: function(btn){
                var panel = btn.up('ehr-dataentrypanel');
                panel.onSubmit(btn);
            }
            //disableOn: 'WARN'
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
        SUBMITANDNEXT: {
            text: 'Submit And Reload',
            name: 'submit',
            requiredQC: 'Completed',
            targetQC: 'Completed',
            errorThreshold: 'INFO',
            successURL: LABKEY.ActionURL.buildURL('ehr', 'dataEntryForm.view', null, {formType: LABKEY.ActionURL.getParameter('formType')}),
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
                var ctx = EHR.Utils.getEHRContext();
                Ext4.create('EHR.window.SubmitForReviewPanel', {
                    dataEntryPanel: panel,
                    dataEntryBtn: btn,
                    reviewRequiredRecipient: ctx ? ctx['EHRSubmitForReviewPrincipal'] : null
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
                panel.discard({
                    successURL: btn.successURL
                });
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
         * Will submit/save the form and then return to the enterData page.  It does not alter the QCState of records.
         */
        OPENCLINICALCASE: {
            text: 'Open Clinical Case',
            name: 'openClinicalCase',
            //requiredQC: 'In Progress',
            successURL: LABKEY.ActionURL.getParameter('srcURL') || LABKEY.ActionURL.buildURL('ehr', 'enterData.view'),
            disabled: false,
            itemId: 'openClinicalCase',
            handler: function(btn){
                var panel = btn.up('ehr-dataentrypanel');
                LDK.Assert.assertNotEmpty('Unable to find dataentrypanel from OPENCLINICALCASE button', panel);

                //find id
                var clientStore = panel.storeCollection.getClientStoreByName('Clinical Encounters') || panel.storeCollection.getClientStoreByName('Clinical Remarks');
                LDK.Assert.assertNotEmpty('Unable to find clientStore from OPENCLINICALCASE button', clientStore);

                var rec = clientStore.getAt(0);
                if (!rec){
                    Ext4.Msg.alert('Error', 'No Animal Entered');
                    return;
                }
                LDK.Assert.assertEquality('Record count was not 1 in OPENCLINICALCASE button.', 1, clientStore.getCount());

                var animalId = rec.get('Id');
                if (!animalId){
                    Ext4.Msg.alert('Error', 'No Animal Entered');
                    return;
                }

                var win = Ext4.create('EHR.window.ManageCasesWindow', {
                    animalId: animalId
                });

                win.down('panel').showCreateWindow('Clinical');
            }
        },
        OPENSURGERYCASES: {
            text: 'Open Cases',
            name: 'openSurgeryCase',
            //requiredQC: 'In Progress',
            successURL: LABKEY.ActionURL.getParameter('srcURL') || LABKEY.ActionURL.buildURL('ehr', 'enterData.view'),
            disabled: false,
            itemId: 'openSurgeryCases',
            handler: function(btn){
                var panel = btn.up('ehr-dataentrypanel');
                LDK.Assert.assertNotEmpty('Unable to find dataentrypanel from OPENSURGERYCASES button', panel);

                //find id
                var clientStore = panel.storeCollection.getClientStoreByName('Clinical Encounters') || panel.storeCollection.getClientStoreByName('Clinical Remarks');
                LDK.Assert.assertNotEmpty('Unable to find clientStore from OPENSURGERYCASES button', clientStore);

                if (!clientStore.getCount()){
                    Ext4.Msg.alert('Error', 'No Animals Entered');
                    return;
                }

//                var animalId = rec.get('Id');
//                if (!animalId){
//                    Ext4.Msg.alert('Error', 'No Animal Entered');
//                    return;
//                }
//
//                var win = Ext4.create('EHR.window.ManageCasesWindow', {
//                    animalId: animalId
//                });
//
//                win.down('panel').showCreateWindow('Surgery');
            }
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
            successURL: LABKEY.ActionURL.getParameter('srcURL') || LABKEY.ActionURL.buildURL('ehr', 'serviceRequests.view'),
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
            text: 'Request & Approve',
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
            disableOn: 'WARN'
        }
    };

    return {
        getFormEditorConfig: function(columnInfo){
            var cfg = LABKEY.ext4.Util.getFormEditorConfig(columnInfo);

            if (cfg.xtype == 'numberfield'){
                cfg.hideTrigger = true;
            }

            return cfg;
        },

        getColumnConfigFromMetadata: function(meta, grid){
            var col = {};
            col.dataIndex = meta.dataIndex || meta.name;
            col.name = col.dataIndex;
            col.header = meta.header || meta.caption || meta.label || meta.name;

            col.customized = true;
            col.sortable = true;

            col.hidden = meta.hidden;
            col.format = meta.extFormat;

            //this.updatable can override col.editable
            col.editable = meta.userEditable;

            if(col.editable && !col.editor){
                col.editor = LABKEY.ext4.Util.getGridEditorConfig(meta);
                col.editor.fieldLabel = null;
            }

            if (col.editor && col.editor.xtype == 'numberfield'){
                col.editor.hideTrigger = true;
            }

            col.renderer = LABKEY.ext4.Util.getDefaultRenderer(col, meta, grid);

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

        getGridButton: function(name, config){
            LDK.Assert.assertNotEmpty('Unknown grid button: ' + name, gridButtons[name]);
            if (gridButtons[name]){
                return gridButtons[name](config)
            }
        },

        registerGridButton: function(name, btn){
            gridButtons[name] = btn;
        },

        getDataEntryFormButton: function(name){
            LDK.Assert.assertNotEmpty('Unknown DataEntryForm button: ' + name, dataEntryFormButtons[name]);
            if (dataEntryFormButtons[name]){
                return Ext4.apply({}, dataEntryFormButtons[name]);
            }
        },

        registerDataEntryFormButton: function(name, btn){
            dataEntryFormButtons[name] = btn;
        },

        ensureArray: function(val){
            if (Ext4.isArray(val) || Ext4.isEmpty(val))
                return val;
            else
                return [val];
        },

        setSiblingFields: function(cmp, vals){
            var boundRecord;
            var form = cmp.up('form');
            if (form){
                form.getForm().setValues(vals);
            }
            else {
                var grid = cmp.up('grid');
                if (grid){
                    var records = grid.getSelectionModel().getSelection();
                    if (records.length == 1){
                        records[0].set(vals);
                    }
                    else {
                        console.log('grid has more than 1 record selected, cannot select');
                    }

                }
                else {
                    console.log('unable to find grid or form to set');
                }
            }

        },

        getBoundRecord: function(cmp){
            var boundRecord;
            var form = cmp.up('form');
            if (form)
                boundRecord = form.getBoundRecord();
            else {
                var grid = cmp.up('grid');
                if (grid){
                    var records = grid.getSelectionModel().getSelection();
                    if (records.length == 1)
                        boundRecord = records[0];
                }
            }

            if (!boundRecord)
                console.log('unable to find bound record: ' + cmp.name);

            return boundRecord;
        },

        getLabworkServicesStore: function(){
            if (EHR._labworkServicesStore)
                return EHR._labworkServicesStore;

            var storeId = ['ehr_lookups', 'labwork_services', 'servicename', 'servicename'].join('||');

            EHR._labworkServicesStore = Ext4.StoreMgr.get(storeId) || Ext4.create('LABKEY.ext4.Store', {
                type: 'labkey-store',
                schemaName: 'ehr_lookups',
                queryName: 'labwork_services',
                sort: 'chargetype,servicename,outsidelab',
                columns: '*',
                storeId: storeId,
                autoLoad: true
            });

            return EHR._labworkServicesStore;
        },

        getSnomedStore: function(){
            if (EHR._snomedStore)
                return EHR._snomedStore;

            var storeId = ['ehr_lookups', 'snomed', 'code', 'meaning'].join('||');

            EHR._snomedStore = Ext4.StoreMgr.get(storeId) || Ext4.create('LABKEY.ext4.data.Store', {
                type: 'labkey-store',
                schemaName: 'ehr_lookups',
                queryName: 'snomed_combo_list',
                columns: 'code,meaning,categories',
                sort: 'meaning',
                storeId: storeId,
                autoLoad: true
            });

            return EHR._snomedStore;
        },

        getProceduresStore: function(){
            if (EHR._proceduresStore)
                return EHR._proceduresStore;

            var storeId = ['ehr_lookups', 'procedures', 'rowid', 'name', 'ref'].join('||');

            EHR._proceduresStore = Ext4.StoreMgr.get(storeId) || Ext4.create('LABKEY.ext4.data.Store', {
                type: 'labkey-store',
                schemaName: 'ehr_lookups',
                queryName: 'procedures',
                columns: 'rowid,name,active,category,remark',
                sort: 'category,name',
                storeId: storeId,
                autoLoad: true
            });

            return EHR._proceduresStore;
        },

        getChareableItemsStore: function(){
            if (EHR._chargeableItemsStore)
                return EHR._chargeableItemsStore;

            var storeId = ['onprc_billing', 'chargeableItems', 'rowid', 'name', 'ref'].join('||');

            EHR._chargeableItemsStore = Ext4.StoreMgr.get(storeId) || Ext4.create('LABKEY.ext4.Store', {
                type: 'labkey-store',
                schemaName: 'onprc_billing',
                queryName: 'chargeableItems',
                columns: 'rowid,name,category,allowscustomunitcost',
                sort: 'category,name',
                storeId: storeId,
                autoLoad: true
            });

            return EHR._chargeableItemsStore;
        },

        getFormularyStore: function(){
            if (EHR._formularyStore)
                return EHR._formularyStore;

            var storeId = ['ehr_lookups', 'drug_defaults', 'code', 'code'].join('||');

            EHR._formularyStore = Ext4.StoreMgr.get(storeId) || Ext4.create('LABKEY.ext4.Store', {
                type: 'labkey-store',
                schemaName: 'ehr_lookups',
                queryName: 'drug_defaults',
                columns: 'code,code/meaning,dosage,dosage_units,concentration,conc_units,amount,amount_units,volume,vol_units,route,frequency,duration,offset',
                sort: 'code',
                storeId: storeId,
                autoLoad: true
            });

            return EHR._formularyStore;
        },

        getProjectStore: function(){
            if (EHR._projectStore)
                return EHR._projectStore;

            var storeId = ['ehr', 'project', 'project', 'displayName'].join('||');

            EHR._projectStore = Ext4.StoreMgr.get(storeId) || new LABKEY.ext4.data.Store({
                type: 'labkey-store',
                schemaName: 'ehr',
                queryName: 'project',
                columns: 'project,displayName,account,name,protocol,protocol/displayName,title,investigatorId/lastName',
                //filterArray: [LABKEY.Filter.create('enddate', null, LABKEY.Filter.Types.ISBLANK)],
                sort: 'displayName',
                storeId: storeId,
                autoLoad: true
            });

            return EHR._projectStore;
        },

        getDefaultClinicalProject: function(){
            var defaultProject = null;
            var store = EHR.DataEntryUtils.getProjectStore();
            if (store){
                var recIdx = store.find('displayName', '0492');
                if (recIdx != -1){
                    defaultProject = store.getAt(recIdx).get('project');
                }
            }

            return defaultProject;
        },

        calculateQuantity: function(field, values){
            values = values || {};
            var record = EHR.DataEntryUtils.getBoundRecord(field);
            if (!record){
                return
            }

            var numTubes = Ext4.isDefined(values.num_tubes) ? values.num_tubes : record.get('num_tubes');
            var tube_vol = Ext4.isDefined(values.tube_vol) ? values.tube_vol : record.get('tube_vol');

            var quantity = numTubes * tube_vol;

            EHR.DataEntryUtils.setSiblingFields(field, {
                quantity: quantity
            });
        },

        setDataEntryPanel: function(panel){
            dataEntryPanel = panel;
        },

        //returns the most recent weight for the provided animals, preferentially taking weights from the local store
        getWeights: function(sc, ids, callback, scope, ignoreClientWeights){
            EHR.DemographicsCache.getDemographics(ids, function(animalIds, dataMap){
                var ret = {};
                var clientWeightMap = ignoreClientWeights ? {} : EHR.DataEntryUtils.getClientWeight(sc, ids);

                Ext4.Array.forEach(ids, function(id){
                    var data = dataMap[id];
                    ret[id] = clientWeightMap[id] || (data ? data.getMostRecentWeight() : null);
                }, this);

                if (callback)
                    callback.call(scope || this, ret);
            }, this, -1);

        },

        getClientWeight: function(sc, ids){
            var ret = {};
            var store = sc.getServerStoreForQuery('study', 'weight');
            if (store){
                Ext4.Array.forEach(ids, function(id){
                    var weights = [];
                    store.each(function(r){
                        if (r.get('Id') == id && !Ext4.isEmpty(r.get('weight'))){
                            weights.push(r.get('weight'));
                        }
                    }, this);

                    if (weights.length == 1)
                        ret[id] = weights[0];
                }, this);
            }

            return ret;
        },

        hasPermission: function(qcStateLabel, permissionName, permMap, queriesToTest){
            permissionName = EHR.Security.getPermissionName(qcStateLabel, permissionName);

            var hasPermission = true;
            if (queriesToTest == null){
                for (var schemaName in permMap){
                    var permissionToTest = permissionName;
                    if (schemaName.toLowerCase() != 'study'){
                        permissionToTest = 'org.labkey.api.ehr.security.EHRDataEntryPermission';
                    }

                    for (var query in permMap[schemaName]){
                        if (!permMap[schemaName][query][permissionToTest]){
                            hasPermission = false;
                            console.log('no permission');
                            break;
                        }
                    }
                }
            }
            else {
                Ext4.Object.each(permMap, function(schemaName, queries) {
                    // minor improvement.  non-study tables cannot have per-table permissions, so instead we check
                    // for the container-level DataEntryPermission
                    var permissionToTest = permissionName;
                    if (schemaName.toLowerCase() != 'study'){
                        permissionToTest = 'org.labkey.api.ehr.security.EHRDataEntryPermission';
                    }
                    Ext4.Object.each(queries, function(queryName, permissions) {
                        if (!permissions[permissionToTest]){
                            hasPermission = false;
                            return false;
                        }
                    }, this);

                    if (!hasPermission)
                        return false;
                }, this);
            }

            return hasPermission;
        },

        getEncountersRecords: function(dataEntryPanel){
            var encountersStore = dataEntryPanel.storeCollection.getClientStoreByName('encounters');
            LDK.Assert.assertNotEmpty('Unable to find encounters store in SurgeryAddRecordWindow button', encountersStore);

            var data = [];
            encountersStore.each(function(r){
                if (r.get('Id') && r.get('date')){
                    var procedureStore = EHR.DataEntryUtils.getProceduresStore();
                    var procedureName;
                    LDK.Assert.assertNotEmpty('Unable to find procedureStore from SurgeryAddRecordWindow', procedureStore);
                    if (r.get('procedureid')){
                        var procRecIdx = procedureStore.find('rowid', r.get('procedureid'));
                        var procedureRec = procedureStore.getAt(procRecIdx);
                        LDK.Assert.assertNotEmpty('Unable to find procedure record from SurgeryAddRecordWindow', procedureRec);
                        procedureName = procedureRec.get('name');
                    }
                    else {
                        procedureName = 'None'
                    }

                    var title = r.get('Id') + ': ' + procedureName;
                    data.push({
                        title: title,
                        parentid: r.get('objectid'),
                        Id: r.get('Id'),
                        date: r.get('date')
                    });
                }
            }, this);

            return data;
        }
    }
};