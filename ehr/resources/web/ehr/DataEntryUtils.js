/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
LABKEY.ExtAdapter.ns('EHR.DataEntryUtils');

EHR.DataEntryUtils = new function(){
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
                        grid.store.safeRemove(selections);
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
        COPYFROMCLINPATHRUNS: function(config){
            return Ext4.Object.merge({
                text: 'Copy From Above',
                xtype: 'button',
                tooltip: 'Click to copy records from the clinpath runs section',
                handler: function(btn){
                    var grid = btn.up('grid');
                    LDK.Assert.assertNotEmpty('Unable to find grid in COPYFROMCLINPATHRUNS button', grid);

                    var panel = grid.up('ehr-dataentrypanel');
                    LDK.Assert.assertNotEmpty('Unable to find dataEntryPanel in COPYFROMCLINPATHRUNS button', panel);

                    var store = panel.storeCollection.getClientStoreByName('Clinpath Runs');
                    LDK.Assert.assertNotEmpty('Unable to find clinpath runs store in COPYFROMCLINPATHRUNS button', store);

                    if (store){
                        Ext4.create('EHR.window.CopyFromRunsWindow', {
                            targetGrid: grid,
                            dataset: grid.title,
                            runsStore: store
                        }).show();
                    }
                }
            });
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
        TEMPLATE: function(config){
            return Ext4.Object.merge({
                text: 'Templates',
                itemId: 'templatesBtn',
                listeners: {
                    beforerender: function(btn){
                        var grid = btn.up('gridpanel');
                        LDK.Assert.assertNotEmpty('Unable to find gridpanel in TEMPLATE button', grid);

                        btn.grid = grid;
                        btn.formType = grid.store.storeCollection.formConfig.name;

                        btn.populateFromDatabase.call(btn);
                    }
                },
                populateFromDatabase: function(){
                    LABKEY.Query.selectRows({
                        schemaName: 'ehr',
                        queryName: 'my_formtemplates',
                        sort: 'title',
                        autoLoad: true,
                        filterArray: [LABKEY.Filter.create('formtype', this.formType, LABKEY.Filter.Types.EQUAL)],
                        failure: LDK.Utils.getErrorCallback(),
                        scope: this,
                        success: this.onLoad
                    });
                },
                onLoad: function(results){
                    var btn = this.menu.items.get('templatesMenu');
                    btn.menu.removeAll();

                    var toAdd = [];
                    if (results.rows && results.rows.length){
                        Ext4.Array.forEach(results.rows, function(row){
                            toAdd.push({
                                text: row.title,
                                templateId: row.entityid,
                                scope: this,
                                handler: function(menu){
                                    Ext4.create('EHR.window.ApplyTemplateWindow', {
                                        targetGrid: this.grid,
                                        formType: this.formType,
                                        defaultTemplate: menu.templateId
                                    }).show();
                                }
                            })
                        }, this);
                    }
                    else {
                        toAdd.push({
                            text: 'There are no saved templates'
                        });
                    }

                    btn.menu.add(toAdd);
                },
                menu: [{
                    text: 'Save As Template',
                    handler: function(btn){
                        var grid = btn.up('gridpanel');
                        Ext4.create('EHR.window.SaveTemplateWindow', {
                            targetGrid: grid,
                            formType: grid.store.storeCollection.formConfig.name
                        }).show();
                    }
                },{
                    text: 'Apply Template',
                    handler: function(btn){
                        var grid = btn.up('gridpanel');
                        Ext4.create('EHR.window.ApplyTemplateWindow', {
                            targetGrid: grid,
                            formType: grid.store.storeCollection.formConfig.name
                        }).show();
                    }
                },{
                    text: 'Templates',
                    itemId: 'templatesMenu',
                    menu: []
                }]
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
            col.sortable = true;

            col.hidden = meta.hidden;
            col.format = meta.extFormat;

            //this.updatable can override col.editable
            col.editable = meta.userEditable;

            if(col.editable && !col.editor){
                col.editor = LABKEY.ext.Ext4Helper.getGridEditorConfig(meta);
                col.editor.fieldLabel = null;
            }

            if (col.editor && col.editor.xtype == 'numberfield'){
                col.editor.hideTrigger = true;
            }

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
                console.log('unable to find bound record');

            return boundRecord;
        },

        /**
         * A utility that will load a EHR form template based on the title and storeId.  These correspond to records in ehr.formtemplates.
         * @param {string} title The title of the template
         * @param {string} storeId The storeId associated with the template
         */
        loadTemplateByName: function(title, storeId){
            LABKEY.Query.selectRows({
                schemaName: 'ehr',
                queryName: 'formtemplates',
                filterArray: [
                    LABKEY.Filter.create('title', title, LABKEY.Filter.Types.EQUAL),
                    LABKEY.Filter.create('storeId', storeId, LABKEY.Filter.Types.EQUAL)
                ],
                success: onLoadTemplate
            });

            function onLoadTemplate(data){
                if(!data || !data.rows.length)
                    return;

                EHR.Utils.loadTemplate(data.rows[0].entityid)
            }
        },

        /**
         * A utility that will load a EHR form template based on the templateId.  These correspond to records in ehr.formtemplates.
         * @param {string} templateId The templateId, which is the GUID of the corresponding record in ehr.formtemplates
         */
        loadTemplate: function(templateId){
            if(!templateId)
                return;

            LABKEY.Query.selectRows({
                schemaName: 'ehr',
                queryName: 'formtemplaterecords',
                filterArray: [LABKEY.Filter.create('templateId', templateId, LABKEY.Filter.Types.EQUAL)],
                sort: '-rowid',
                success: onLoadTemplate,
                scope: this
            });

            Ext4.Msg.wait("Loading Template...");

            function onLoadTemplate(data){
                if(!data || !data.rows.length){
                    Ext.Msg.hide();
                    return;
                }

                var toAdd = {};

                Ext4.each(data.rows, function(row){
                    var data = Ext4.decode(row.json);
                    var store = Ext.StoreMgr.get(row.storeid);

                    //verify store exists
                    if(!store){
                        Ext.StoreMgr.on('add', function(){
                            onLoadTemplate(data);
                        }, this, {single: true, delay: 200});
                        return false;
                    };

                    //also verify it is loaded
                    if(!store.fields || !store.fields.length){
                        store.on('load', function(){
                            onLoadTemplate(data);
                        }, this, {single: true, delay: 200});
                        return false;
                    };

                    if(!toAdd[store.storeId])
                        toAdd[store.storeId] = [];

                    toAdd[store.storeId].push(data);
                });

                for (var i in toAdd){
                    var store = Ext4.StoreMgr.get(i);
                    toAdd[i].reverse();
                    var recs = store.addRecords(toAdd[i])
                }

                Ext4.Msg.hide();
            }
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
        }
    }
};