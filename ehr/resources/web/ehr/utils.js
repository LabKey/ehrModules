/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.namespace('EHR.ext', 'EHR.Utils');

LABKEY.requiresScript("/ehr/Security.js");

/**
 * @namespace Utils static class to provide miscellaneous utility functions.
 * @name EHR.Utils
 */

EHR.Utils = new function(){
    return {

        /**
         * Helper to test whether the current user is a member of at least one of the provided groups
         * @param {array} groups A list of groups to test.
         * @param {function} success The success callback function
         * @returns {boolean} True/false depending on whether the current user is a member of at least one of the supplied groups
         */
        isMemberOf: function(groups, successCallback){
            if (typeof(groups) != 'object')
                groups = [groups];

            LABKEY.Security.getGroupsForCurrentUser({
                successCallback: function (results){
                    for(var i=0;i<results.groups.length;i++){
                        if (groups.contains(results.groups[i].name)){
                            successCallback();
                            return true;
                        }
                    }
                }
            });
        },


        /**
         * A generic error handler.  This function will insert a record into the audit table, which provides a mechanism to monitor client-side errors.
         * Can be used directly as the failure callback for asyc calls (ie. failure: EHR.Utils.onError).  However, this could also be used directly by passing in an object with the property 'exception'.
         * @param {object} error The error object passed to failure callbacks.
         */
        onError: function(error){
            Ext.Msg.hide();
            console.log('ERROR: ' + error.exception);
            console.log(error);


            LABKEY.Query.insertRows({
                 //it would be nice to store them in the current folder, but we cant guarantee they have write access..
                 containerPath: '/shared',
                 schemaName: 'auditlog',
                 queryName: 'audit',
                 rows: [{
                    EventType: "Client API Actions",
                    Key1: "Client Error",
                    //NOTE: labkey should automatically crop these strings to the allowable length for that field
                    Key2: window.location.href,
                    Key3: (error.stackTrace && Ext.isArray(error.stackTrace) ? error.stackTrace.join('\n') : null),
                    Comment: (error.exception || error.statusText || error.message),
                    Date: new Date()
                 }],
                 success: function(){
                     console.log('Error successfully logged')
                 },
                 failure: function(error){
                    console.log('Problem logging error');
                    console.log(error)
                 }
            });
        },

        /**
         * A utility designed to recursively merge two objects, applying properties from the second only if they do not exist in the first.
         * @param {object} o The first object
         * @param {object} c Object that will be applied to the first
         * @param {integer} maxDepth The maximum depth to recurse
         * @returns {object} The merged object
         */
        rApplyIf: function(o, c, maxDepth, depth){
            maxDepth = maxDepth || 50;
            depth = depth || 1;
            o = o || {};
            if(depth>maxDepth){
                console.log('Warning: rApplyIf hit : '+depth);
            }

            for(var p in c){
                if(!Ext.isDefined(o[p]) || depth >= maxDepth)
                    o[p] = c[p];
                else if (Ext.type(o[p])=='object'){
                    EHR.Utils.rApplyIf(o[p], c[p], maxDepth, depth+1);
                }
            }

            return o;
        },

        /**
         * A utility designed to recursively merge two objects.
         * @param {object} o The first object
         * @param {object} c Object that will be applied to the first
         * @param {integer} maxDepth The maximum depth to recurse
         * @returns {object} The merged object
         */
        rApply: function(o, c, maxDepth, depth){
            maxDepth = maxDepth || 50;
            depth = depth || 1;
            if(depth>=maxDepth){
                console.log('Warning: rApply hit max: '+depth);
            }
            o = o || {};

            for(var p in c){
                if(Ext.type(o[p])!='object' || Ext.type(c[p])!='object' || depth >= maxDepth){
                        o[p] = c[p];
                }
                else {
                    EHR.Utils.rApply(o[p], c[p], maxDepth, depth+1);
                }
            }
            return o;
        },

        /**
         * A utility designed to recursively merge two objects, applying properties from the second only if they do not exist in the first and returning a deep copy of the first object.
         * @param {object} o The first object
         * @param {object} c Object that will be applied to the first
         * @param {integer} maxDepth The maximum depth to recurse
         * @returns {object} The cloned object
         */
        rApplyCloneIf: function(o, c, maxDepth, depth){
            maxDepth = maxDepth || 50;
            depth = depth || 1;
            o = o || {};
            if(depth>=maxDepth){
                console.log('Warning: rApplyCloneIf hit max: '+depth);
            }

            for(var p in c){
                if((!Ext.isDefined(o[p]) && Ext.type(c[p])!='object') || depth >= maxDepth)
                    o[p] = c[p];
                else if (!Ext.isDefined(o[p]) && Ext.type(c[p])=='object'){
                    o[p] = {};
                    EHR.Utils.rApplyClone(o[p], c[p], maxDepth, depth+1);
                }
                else if (Ext.type(o[p])=='object'){
                    EHR.Utils.rApplyCloneIf(o[p], c[p], maxDepth, depth+1);
                }
            }

            return o;
        },

        /**
         * A utility designed to recursively merge two objects, returning a deep copy of the first.
         * @param {object} o The first object
         * @param {object} c Object that will be applied to the first
         * @param {integer} maxDepth The maximum depth to recurse
         * @returns {object} The cloned object
         */
        rApplyClone: function(o, c, maxDepth, depth){
            maxDepth = maxDepth || 50;
            depth = depth || 1;
            if(depth>maxDepth){
                console.log('Warning: rApplyClone hit max: '+depth);
            }
            o = o || {};

            for(var p in c){
                if(Ext.type(c[p])!='object' || depth >= maxDepth)
                        o[p] = c[p];
                else {
                    if(Ext.type(o[p])!='object')
                        o[p] = {};
                    EHR.Utils.rApplyClone(o[p], c[p], maxDepth, depth+1);
                }
            }
            return o;
        },


        /**
         * A utility designed to test whether an object is empty (ie. {})
         * @param {object} o The object to test
         * @returns {boolean} True/false depending on whether the object is empty
         */
        isEmptyObj: function(ob){
           for(var i in ob){ return false;}
           return true;
        },


        /**
         * A utility designed to work up the DOM hierarchy and return the LabKey webpart header node
         * @param {object} element The DOM element that is a child of the webpart
         * @returns {object} The DOM element containing the webpart header
         */
        findWebPartTitle: function(childObj) {
            var wp = childObj.findParentNode('table[class*=labkey-wp]', null, true);
            return wp.child('th[class*=labkey-wp-title-left]', null, true);
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
                success: onLoadTemplate
                //scope: store
            });

            Ext.Msg.wait("Loading Template...");

            function onLoadTemplate(data){
                if(!data || !data.rows.length){
                    Ext.Msg.hide();
                    return;
                }

                var toAdd = {};

                Ext.each(data.rows, function(row){
                    var data = Ext.util.JSON.decode(row.json);
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
                    var store = Ext.StoreMgr.get(i);
                    toAdd[i].reverse();
                    var recs = store.addRecords(toAdd[i])
                }

                Ext.Msg.hide();
            }
        },


        //private
        //this object provides a numeric heirarchy to the error severities returned by the server
        errorSeverity: {
            DEBUG: 0,
            INFO: 1,
            WARN: 2,
            ERROR: 3,
            FATAL: 4
        },


        //private
        //a helper that will compare two errors and return the most severe
        maxError: function(severity1, severity2){
            if (!severity1 || EHR.Utils.errorSeverity[severity1] < EHR.Utils.errorSeverity[severity2])
                return severity2;
            else
                return severity1;
        },


        /**
         * A utility that will round a number to the supplied number of decimals.
         * @param {number} number The number to round
         * @param {integer} decimals The number of decimal places to round
         * @returns {number} The rounded number
         */
        roundNumber: function(num, dec){
            return Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
        },


        /**
         * A utility that convert an input string to title case
         * @param {string} string The input string
         * @returns {string} The string converted to title case
         */
        toTitleCase: function(str){
            return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
        },


        /**
         * A utility that will take an input value and pad with left-hand zeros until the string is of the desired length
         * @param {number} input The input number
         * @param {integer} length The desired length of the string.  The input will be padded with zeros until it reaches this length
         * @returns {number} The padded number
         */
        padDigits: function(n, totalDigits){
            n = n.toString();
            var pd = '';
            if (totalDigits > n.length){
                for (var i=0; i < (totalDigits-n.length); i++){
                    pd += '0';
                }
            }
            return pd + n;
        },


        /**
         * A utility that will create a new task, potentially including child records based on a supplied config.
         * @param {object} config The configuration object.
         * @param {string} [config.taskId] The GUID to use for this panel.  If blank a new GUID will be created.
         * @param {string} [config.initialQCState] The initial QCState to use for any new records.  Defaults to 'In Progress'
         * @param {string} [config.containerPath] The container path used by the stores in this form.  Defaults to the current container.
         * @param {array} [config.childRecords] An array of objects to be used to create records in any child stores.  Each of these objects must have the following properties:
         * <li>schemaName: The name of the schema</li>
         * <li>queryName: The name of the query</li>
         * <li>Rows: An array of row objects that will be passed to LABKEY.Query.insertRows</li>
         * @param {object} [config.taskRecord] An object with initial values for the record used task.  Thiis object will be passed as the row object in LABKEY.Query.insertRows
         * @param {object} [config.existingRecords] An map of pairs containing the name of a dataset and an array of LSIDs from that dataset that match existing records that should be added to this task.  This option is used by blood and clinpath requests.  In this situation a task is simultaneously created and existing requested blood draws are added to it.
         */
        createTask: function(config){
            config.initialQCState = config.initialQCState || 'In Progress';
            config.taskId = LABKEY.Utils.generateUUID();
            config.taskRecord = config.taskRecord || {};
            config.taskRecord.taskId = config.taskId;
            config.taskRecord.QCStateLabel = config.initialQCState;
            config.containerPath = config.containerPath || LABKEY.ActionURL.getContainer();
            config.childRecords = config.childRecords || [];

            var commands = [{
                schemaName: 'ehr',
                queryName: 'tasks',
                command: "insertWithKeys",
                rows: [{values: config.taskRecord}]
            }];

            if(config.childRecords.length){
                Ext.each(config.childRecords, function(r){
                    var rows = [];
                    Ext.each(r.rows, function(row){
                        row.taskId = config.taskId;
                        delete row.QCState;
                        delete row.qcstate;
                        row.QCStateLabel = config.initialQCState;
                        rows.push({values: row});
                    }, this);

                    commands.push({
                        schemaName: r.schemaName,
                        queryName: r.queryName,
                        command: "insertWithKeys",
                        rows: rows
                    });
                });
            }

            if(config.existingRecords){
                for(var dataset in config.existingRecords){
                    var rows = [];
                    var row;
                    Ext.each(config.existingRecords[dataset], function(lsid){
                        row = {taskId: config.taskId, lsid: lsid, QCStateLabel: config.initialQCState};
                        rows.push({values: row, oldKeys: {lsid: lsid}});
                    }, this);

                    commands.push({
                        schemaName: 'study',
                        queryName: dataset,
                        command: "updateChangingKeys",
                        rows: rows
                    });
                }
            }

            if(commands.length){
                Ext.Ajax.request({
                    url : LABKEY.ActionURL.buildURL("query", "saveRows", config.containerPath),
                    method : 'POST',
                    success: function(response, options){
                        if(config.success){
                            config.success.call(this, response, options, config);
                        }
                    },
                    failure: function(){
                        if(config.failure){
                            config.failure.call(this, arguments);
                        }
                    },
                    scope: this,
                    jsonData : {
                        containerPath: config.containerPath,
                        commands: commands
                    },
                    headers : {
                        'Content-Type' : 'application/json'
                    }
                });
            }
        },


        /**
         * A sorter function that can be used to sort an Ext store.  This is useful because it allows a store to be sorted on the displayValue of a field.
         * @param {array} fieldList An ordered array of objects describing sorts to be applied to a store.  Each object has the following properties:
         * <li>storeId: The Id of the lookup store</li>
         * <li>displayField: The displayfield (ie. the field holding the value displayed to the user</li>
         * <li>valueField: The field that corresponds to the value that is stored in the record</li>
         * @returns {function} The sorter function that can be passed to the sort() method of an Ext.data.Store or subclass of this.

         */
        sortStore: function(fieldList){
            return function(a, b){
                var retVal = 0;
                Ext.each(fieldList, function(item){
                    var val1 = '';
                    var val2 = '';
                    if(!item.storeId){
                        val1 = a.get(item.term) || '';
                        val2 = b.get(item.term) || '';
                    }
                    else {
                        var store = Ext.StoreMgr.get(item.storeId);
                        var rec1;
                        var rec2;
                        rec1 = store.find(item.valueField, a.get(item.term));
                        if(rec1 != -1){
                            rec1 = store.getAt(rec1);
                            val1 = rec1.get(item.displayField) || '';
                        }
                        rec2 = store.find(item.valueField, b.get(item.term));
                        if(rec2 != -1){
                            rec2 = store.getAt(rec2);
                            val2 = rec2.get(item.displayField) || '';
                        }
                    }

                    if(val1 < val2){
                        retVal = -1;
                        return false;
                    }
                    else if (val1 > val2){
                        retVal = 1;
                        return false;
                    }
                    else {
                        retVal = 0;
                    }
                }, this);
                return retVal;
            }
        },


        /**
         * This is a helper designed to normalize species names based on known variations
         * @param {string} species The species name to normalize
         * @returns {string} The normalized species name
         */
        normalizeSpecies: function(species){
            if(!species){
                return null;
            }

            if(species.match(/cyno/i)){
                species = 'Cynomolgus';
            }
            else if(species.match(/rhesus/i)){
                species = 'Rhesus';
            }
            if(species.match(/vervet/i)){
                species = 'Vervet';
            }
            if(species.match(/pigtail/i)){
                species = 'Pigtail';
            }
            if(species.match(/marmoset/i)){
                species = 'Marmoset';
            }

            return species;
        },


        /**
         * A utility that will create a variant of EHR.ext.ImportPanel based on a supplied config.
         * This is used by the data entry page to create the appropriate panel based on records from ehr.formtypes
         * @param {object} config The configuration object.  Can contain any properties used by EHR.ext.ImportPanel in addition to the ones below.
         * @param {string} [config.formType] The formType to create, which should correspond to a value in ehr.formtypes.  However, if it does not match a known FormType, it will assume this is a SimpleTask (ie. Task consisting of only one query) and the FormType will be used as the queryName.
         * @param {string} [config.formUUID] The GUID to use when creating this form.  If creating a new form (as opposed to loading an existing one) this should be left blank.
         * @param {string} [config.panelType] The type of ImportPanel to create.  Should correspond to a class under EHR.ext.ImportPanel (ie. TaskPanel or TaskDetailsPanel)
         *
         */
        createImportPanel: function(config){
            var multi = new LABKEY.MultiRequest();

            var formSections;
            multi.add(LABKEY.Query.selectRows, {
                schemaName: 'ehr',
                queryName: 'formpanelsections',
                filterArray: [LABKEY.Filter.create('formType', config.formType, LABKEY.Filter.Types.EQUAL)],
                sort: 'destination,sort_order',
                scope: this,
                successCallback: function(results){
                    formSections = results.rows;
                },
                failure: EHR.Utils.onError
            });

            var formConfig;
            multi.add(LABKEY.Query.selectRows, {
                schemaName: 'ehr',
                queryName: 'formtypes',
                filterArray: [LABKEY.Filter.create('formType', config.formType, LABKEY.Filter.Types.EQUAL)],
                scope: this,
                successCallback: function(results){
                    if(results.rows.length)
                        formConfig = results.rows[0];
                    else
                        formConfig = {};
                },
                failure: EHR.Utils.onError
            });
            multi.send(onSuccess, this);

            function onSuccess(){
                if(!formSections.length){
                    //we assume this is a simple query:
                    config.queryName = config.formType;
                    config.schemaName = 'study';
                    if(config.panelType=='TaskPanel')
                        EHR.Utils.createSimpleTaskPanel(config);
                    else if (config.panelType=='TaskDetailsPanel')
                        EHR.Utils.createSimpleTaskDetailsPanel(config);
                    else
                        alert('Form type not found');
                    return;
                }

                var panelCfg = formConfig.configjson ? Ext.util.JSON.decode(formConfig.configjson) : {};
                panelCfg = Ext.apply(panelCfg, config);

                Ext.applyIf(panelCfg, {
                    title: config.formType,
                    formHeaders: [],
                    formSections: [],
                    formTabs: []
                });

                Ext.each(formSections, function(row){
                    var metaSources;
                    if(row.metadatasources)
                        metaSources = row.metadatasources.split(',');

                    var obj = {
                        xtype: row.xtype,
                        schemaName: row.schemaName,
                        queryName: row.queryName,
                        title: row.title || row.queryName,
                        metadata: EHR.Metadata.getTableMetadata(row.queryName, metaSources)
                    };

                    if(row.buttons)
                        obj.tbarBtns = row.buttons.split(',');

                    if(row.initialTemplates && !config.formUUID){
                        panelCfg.initialTemplates = panelCfg.initialTemplates || [];
                        var templates = row.initialTemplates.split(',');
                        var storeId;
                        Ext.each(templates, function(t){
                            storeId = [row.schemaName, row.queryName, '', ''].join('||');
                            panelCfg.initialTemplates.push({storeId: row.storeId, title: t});
                        }, this);

                    }

                    if(row.configJson){
                        var json = Ext.util.JSON.decode(row.configJson);
                        Ext.apply(obj, json);
                    }

                    if(config.noTabs && row.destination == 'formTabs')
                        panelCfg['formSections'].push(obj);
                    else
                        panelCfg[row.destination].push(obj);
                }, this);

                return new EHR.ext.ImportPanel[config.panelType](panelCfg);
            }

        },


        /**
         * A utility that will create an EHR.ext.ImportPanel.TaskPanel containing only a single section.
         * This is a special case of ImportPanel, because there does not need to be a record in ehr.formtypes describing the panel sections.
         * @param {object} config The configuration object.  Can contain any properties used by EHR.ext.ImportPanel in addition to the ones below.
         * @param {string} [config.queryName] The queryName to load in the panel's single section.
         * @param {string} [config.schemaName] The schemaName to load in the panel's single section.
         *
         */
        createSimpleTaskPanel: function(config){
            if(!config || !config.queryName){
                 alert('Must provide queryName');
                 return;
            }

            var panelCfg = Ext.apply({}, config);
            Ext.apply(panelCfg, {
                title: config.queryName,
                formHeaders: [{xtype: 'ehr-abstractpanel'}],
                formSections: [{
                    xtype: 'ehr-gridformpanel',
                    schemaName: config.schemaName,
                    queryName: config.queryName,
                    title: config.title || config.queryName,
                    viewName:  '~~UPDATE~~',
                    columns: EHR.Metadata.Columns[config.queryName],
                    metadata: EHR.Metadata.getTableMetadata(config.queryName, ['Task'])
                }],
                formTabs: []
            });

            return new EHR.ext.ImportPanel.TaskPanel(panelCfg);
        },


        /**
         * A utility that will create an EHR.ext.ImportPanel.TaskDetailsPanel containing only a single section.
         * This is a special case of ImportPanel, because there does not need to be a record in ehr.formtypes describing the panel sections.
         * @param {object} config The configuration object.  Can contain any properties used by EHR.ext.ImportPanel in addition to the ones below.
         * @param {string} [config.queryName] The queryName to load in the panel's single section.
         * @param {string} [config.schemaName] The schemaName to load in the panel's single section.
         *
         */
        createSimpleTaskDetailsPanel: function(config){
            if(!config || !config.queryName){
                 alert('Must provide queryName');
                 return;
            }

            var panelCfg = Ext.apply({}, config);
            Ext.apply(panelCfg, {
                title: config.queryName,
                formSections: [{
                    xtype: 'ehr-gridformpanel',
                    schemaName: config.schemaName,
                    queryName: config.queryName,
                    readOnly: true,
                    title: config.title || config.queryName,
                    viewName: '~~UPDATE~~',
                    columns: EHR.Metadata.Columns[config.queryName],
                    metadata: EHR.Metadata.getTableMetadata(config.queryName, ['Task'])
                }],
                formTabs: []
            });

            return new EHR.ext.ImportPanel.TaskDetailsPanel(panelCfg);
        },

        /**
         * Returns the value for the EHR containerPath on this server.  If the property has not been set, and if the Id of a element
         * is provided,  it will write a message to that element.
         * @returns {Object}
         */
        getEHRContext: function(msgTarget, requiredProps){
            var ctx = LABKEY.getModuleContext('ehr');
            var requiredProps = requiredProps || ['EHRStudyContainer'];
            var missingProps = false;
            for (var i=0;i<requiredProps.length;i++){
                if(!ctx[requiredProps[i]])
                    missingProps = true;
            }

            if (missingProps){
                if (msgTarget)
                    Ext.get(msgTarget).update('The module properties for EHR have not been set.  Please ask you administrator to configure this under the folder settings page.');
                return null;
            }

            return ctx;
        },

        showClinicalHistory: function(objectId, Id, date, el){
            var minDate = Ext4.Date.add(new Date(), Ext4.Date.YEAR, -2);
            Ext4.create('Ext.window.Window', {
                title: 'Clinical History: ' + Id,
                width: 1010,
                modal: true,
                items: [{
                    xtype: 'ehr-clinicalhistorypanel',
                    border: true,
                    width: 1000,
                    maxGridHeight: 600,
                    autoScroll: true,
                    subjectId: Id,
                    minDate: minDate
                }],
                buttons: [{
                    text: 'Close',
                    handler: function(btn){
                        btn.up('window').close();
                    }
                },{
                    text: 'Add Remark',
                    handler: function(btn){
                        Ext4.Msg.alert('Add remark', 'Because we still use IRIS, we are not doing any data entry through PRIMe.  Once we start this migration, it will be possible to enter remarks, order treatments, etc. from these screens.')
                    }
                }]
            }).show(el);
        },

        showCaseHistory: function(objectId, subjectId, el){
            Ext4.create('Ext.window.Window', {
                title: 'Case History:',
                width: 1010,
                modal: true,
                items: [{
                    xtype: 'ehr-casehistorypanel',
                    border: true,
                    width: 1000,
                    maxGridHeight: 600,
                    autoScroll: true,
                    autoLoadRecords: true,
                    subjectId: subjectId,
                    caseId: objectId
                }],
                buttons: [{
                    text: 'Close',
                    handler: function(btn){
                        btn.up('window').close();
                    }
                },{
                    text: 'Add Remark',
                    handler: function(btn){
                        Ext4.Msg.alert('Add remark', 'Because we still use IRIS, we are not doing any data entry through PRIMe.  Once we start this migration, it will be possible to enter remarks, order treatments, etc. from these screens.')
                    }
                }]
            }).show(el);
        },

        /**
         * Returns the list of links that have been registered to appear on a given page
         * @param config A config object
         * @param {array} config.linkTypes
         * @param {function} config.success The success callback.
         * @param {function} config.failure The failure callback.  Note: this will be called for a failure on each individual query, as opposed to one failure callback for the entire set, so it could potentially be called more than once.
         * @param {object} config.scope The scope of the callbacks.
         */
        getReportLinks: function(config){
            if (!config || !config.linkTypes){
                alert('Must provide an array of linkTypes');
                return;
            }

            return LABKEY.Ajax.request({
                url : LABKEY.ActionURL.buildURL('ehr', 'getReportLinks', config.containerPath, {linkTypes: config.linkTypes}),
                method : 'POST',
                success: LABKEY.Utils.getCallbackWrapper(LABKEY.Utils.getOnSuccess(config), config.scope),
                failure: LDK.Utils.getErrorCallback()
            });
        }
    }
}