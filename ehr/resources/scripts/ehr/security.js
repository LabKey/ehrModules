/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var console = require("console");
var LABKEY = require("labkey");
var Ext = require("Ext").Ext;

var EHR = {};
exports.EHR = EHR;


EHR.Server = {};
EHR.Server.Utils = require("ehr/utils").EHR.Server.Utils;


/**
 * The server-side EHR.Server.Security is similar to the client-side version of this code.
 * Unfortunately code cannot truly be shared between client- and server-side applications at the time
 * this was written.  At the time of writing, multiRequest() was not available server-side, so this code
 * behind the server-side security API is slightly different than the client-side EHR.Security code
 * @class
 */
EHR.Server.Security = new function(){
    /* private variables and functions */
    var permissionMap;
    var schemaMap;
    var qcMap;
    var hasLoaded = false;

    //private
    function getQCStateMap(config){
        if(!config || !config.success){
            throw "Must provide a success callback";
        }

        LABKEY.Query.selectRows({
            schemaName: 'study',
            queryName: 'qcState',
            columns: 'RowId,Label,Description,Description,PublicData,metadata/draftData,metadata/isDeleted,metadata/isRequest,metadata/allowFutureDates',
            success: function(data){
                var qcmap = {
                    label: {},
                    rowid: {}
                };

                var row;
                if(data.rows && data.rows.length){
                    for (var i=0;i<data.rows.length;i++){
                        row = data.rows[i];

                        var prefix = 'org.labkey.ehr.security.EHR'+(row.Label).replace(/[^a-zA-Z0-9-]/g, '');
                        row.adminPermissionName = prefix+'AdminPermission';
                        row.insertPermissionName = prefix+'InsertPermission';
                        row.updatePermissionName = prefix+'UpdatePermission';
                        row.deletePermissionName = prefix+'DeletePermission';
                        qcmap.label[row.Label] = row;
                        qcmap.rowid[row.RowId] = row;
                    }
                }
                config.success.apply(config.scope || this, [qcmap]);
            },
            failure: EHR.Server.Utils.onFailure
        });

    };


    return {
         // public functions

        /**
         * Query the server and load the permission / QCState information necessary to manage EHR permissions
         * @description
         * A helper to return a map of QCStates and their properties, along with the effective permissions of the current user on all
         * EHR datasets.  The helper calls LABKEY.Security.getSchemaPermissions and EHR.Security.getQCStateMap and merges the results into the config object
         * described below.  The results are cached, and can be queried using the helpers EHR.Security.hasPermission() or EHR.Security.getQueryPermissions().
         * Pages expecting to enforce EHR-specific security should call .init() immediately on load.
         *
         * @param config Configuration properties.
         * @param [config.success] The success callback.  The callback will be called when the permission map has loaded.  No arguments are passed; however, EHR.Security.hasPermission() can be used to test permissions
         * @param [config.failure] The failure callback.  The callback will be passed an Ext.Ajax.request error object
         * @param [config.scope] The scope to be used in callbacks
         */
        init: function(config) {
            if(!config || !config.success){
                throw "Must provide a success callback";
            }

            var schemaName = 'study';

            getQCStateMap({
                scope: this,
                success: function(results){
                    qcMap = results;
                },
                failure: EHR.Server.Utils.onFailure
            });
            //TODO: eventually accept other schemas
            LABKEY.Security.getSchemaPermissions({
                schemaName: 'study',
                scope: this,
                success: function(map){
                    schemaMap = map;
                },
                failure: function(error){
                    console.log(error)
                }
            });

            function onSuccess(){
                for (var qcState in qcMap.label){
                    var qcRow = qcMap.label[qcState];
                    qcRow.permissionsByQuery = {
                        admin: [],
                        insert: [],
                        update: [],
                        'delete': []
                    };
                    qcRow.effectivePermissions = {};

                    if(schemaMap.schemas[schemaName] && schemaMap.schemas[schemaName].queries){
                        var queryCount = 0;
                        for(var queryName in schemaMap.schemas[schemaName].queries){
                            var query = schemaMap.schemas[schemaName].queries[queryName];
                            queryCount++;
                            query.permissionsByQCState = query.permissionsByQCState || {};
                            query.permissionsByQCState[qcState] = {};

                            //iterate over each permission this user has on this query
                            Ext.each(query.effectivePermissions, function(p){
                                if(p == qcRow.adminPermissionName){
                                    qcRow.permissionsByQuery.admin.push(queryName);
                                    query.permissionsByQCState[qcState].admin = true;
                                }
                                if(p == qcRow.insertPermissionName){
                                    qcRow.permissionsByQuery.insert.push(queryName);
                                    query.permissionsByQCState[qcState].insert = true;
                                }
                                if(p == qcRow.updatePermissionName){
                                    qcRow.permissionsByQuery.update.push(queryName);
                                    query.permissionsByQCState[qcState].update = true;
                                }
                                if(p == qcRow.deletePermissionName){
                                    qcRow.permissionsByQuery['delete'].push(queryName);
                                    query.permissionsByQCState[qcState]['delete'] = true;
                                }
                            }, this);
                        }
                    }

                    qcRow.effectivePermissions.admin = (qcRow.permissionsByQuery.admin.length == queryCount);
                    qcRow.effectivePermissions.insert = (qcRow.permissionsByQuery.insert.length == queryCount);
                    qcRow.effectivePermissions.update = (qcRow.permissionsByQuery.update.length == queryCount);
                    qcRow.effectivePermissions['delete'] = (qcRow.permissionsByQuery['delete'].length == queryCount);
                }

//                function hasPermission(qcStateLabel, permission, queries){
//                    if(!qcStateLabel || !permission)
//                        throw "Must provide a QC State label and permission name";
//
//                    if(queries && !Ext.isArray(queries))
//                        queries = [queries];
//
//                    //if schemaName not supplied, we return based on all queries
//                    if(!queries.length){
//                        throw 'Must provide an array of query objects'
//                    }
//
//                    var result = true;
//                    Ext.each(queries, function(query){
//                        //if this schema isnt present, it's not securable, so we allow anything
//                        if(!schemaMap.schemas[query.schemaName])
//                            return true;
//
//                        if(!schemaMap.schemas[query.schemaName].queries[query.queryName] ||
//                           !schemaMap.schemas[query.schemaName].queries[query.queryName].permissionsByQCState[qcStateLabel] ||
//                           !schemaMap.schemas[query.schemaName].queries[query.queryName].permissionsByQCState[qcStateLabel][permission]
//                        ){
//                            result = false;
//                        }
//                    }, this);
//
//                    return result;
//                }
//
//                function getQueryPermissions(schemaName, queryName){
//                    if(!schemaMap.schemas[schemaName] ||
//                       !schemaMap.schemas[schemaName].queries[queryName] ||
//                       !schemaMap.schemas[schemaName].queries[queryName].permissionsByQCState
//                    )
//                        return {};
//
//                    return schemaMap.schemas[schemaName].queries[queryName].permissionsByQCState;
//                }

                hasLoaded = true;

                config.success.apply(config.scope || this, [{
                    qcMap: qcMap,
                    schemaMap: schemaMap
                }]);
            }

            onSuccess();
        },


       /**
        * A helper method designed to test whether the current user has the provided permission over the QCState and query or queries provided.
        * NOTE: EHR.Security.init() must have been called and returned prior to calling hasPermission();
        * @param {String} qcStateLabel The label of the QCState to test
        * @param {String} permission The permission to test (admin, insert, update or delete)
        * @param {Array} queries An array of objects in the format: {queryName: 'myQuery', schemaName: 'study'}
        * @return {Boolean} True/false depending on whether the user has the specified permission for the QCState provides against
        * all of the queries specified in the queries param
        */
        hasPermission: function(qcStateLabel, permission, queries){
            if(!qcStateLabel || !permission)
                throw "Must provide a QC State label and permission name";

            if(!hasLoaded)
                throw "EHR.Security.init() has not been called or returned prior to this call";

            if(queries && !Ext.isArray(queries))
                queries = [queries];

            if(!queries.length){
                console.log('Must provide an array of query objects');
                return false;
            }

            var result = true;
            //var schemaName = 'study';
            Ext.each(queries, function(query){
                //if this schema isnt present, it's not securable, so we allow anything
                if(!schemaMap.schemas[query.schemaName])
                    return true;

                if(!schemaMap.schemas[query.schemaName].queries[query.queryName] ||
                   !schemaMap.schemas[query.schemaName].queries[query.queryName].permissionsByQCState[qcStateLabel] ||
                   !schemaMap.schemas[query.schemaName].queries[query.queryName].permissionsByQCState[qcStateLabel][permission]
                ){
                    result = false;
                }
            }, this);

            return result;
        },


       /**
        * Will return a map of attributes for QCState associated with the supplied Label.  Often used to translate between RowId and Label.
        * @return {Object} A map of properties associated with the requested QCState, including:
        * <li>Description: the description, as provided from study.QCState</li>
        * <li>Label: the label, as provided from study.QCState</li>
        * <li>PublicData: whether this QCState is considered public, as provided from study.QCState</li>
        * <li>RowId: the rowid, as provided from study.QCState</li>
        * <li>adminPermissionName: the name of the admin permission associated with this QCState, which is returned by LABKEY.Security.getPermissions</li>
        * <li>deletePermissionName: the name of the delete permission associated with this QCState, which is returned by LABKEY.Security.getPermissions</li>
        * <li>insertPermissionName: the name of the insert permission associated with this QCState, which is returned by LABKEY.Security.getPermissions</li>
        * <li>updatePermissionName: the name of the update permission associated with this QCState, which is returned by LABKEY.Security.getPermissions</li>
        * <li>permissionsByQuery: a map with the following keys: admin, delete, insert and update.  Each pair consists of the name of the permission and the datasets for which the user has this permission.
        * <li>effectivePermissions: similar to permissionsByQuery, except this map reports the effective permissions across all datasets.  The map has the keys: admin, delete, insert and update.  Each pair consists of the permission name and true/false depending on whether the current user has this permission across all datasets.
        */
        getQCStateByLabel: function(label){
            if(!hasLoaded)
                throw "EHR.Security.init() has not been called or returned prior to this call";

            if(!qcMap.label[label]){
                console.log('ERROR: QCLabel '+label+' not found');
                return null;
            }

            return qcMap.label[label];
        },

       /**
        * Will return a map of attributes for QCState associated with the supplied RowId.  Often used to translate between RowId and Label.
        * @return {Boolean} True/false depending on whether EHR.Security has loaded permission information.
        */
        getQCStateByRowId: function(rowid){
            if(!hasLoaded)
                throw "EHR.Security.init() has not been called or returned prior to this call";

            if(!qcMap.rowid[rowid]){
                console.log('ERROR: QC State associated with the rowId '+label+' not found');
                return null;
            }

            return qcMap.rowid[rowid];
        },

       /**
        * This is a helper to test whether the QCState and permission informaiton necessary to manage EHR security has loaded.  See EHR.Security.init() for more information.
        * @return {Boolean} True/false depending on whether EHR.Security.init() has been called and has returned.
        */
        hasLoaded: function(){
           return hasLoaded;
        },


        /**
         * This is a helper designed to test whether the current user has permission to perform the current action on
         * the incoming row.  Because the EHR regulates permissions per QCState, the action of updating the QCState field
         * on a record from 'In Progress' to 'Completed' actually requires update permission on 'In Progress' and insert
         * permission on 'Completed'.  It is somewhat tricky to get this correct, so validation code should use and/or augment
         * this.  This is called automatically by beforeUpdate, beforeInsert and beforeDelete, so it is unlikely
         * individual scripts will need to worry about this.
         *
         * @param {string} event The type of event (ie. insert/update/delete), as passed by LabKey
         * @param {object} scriptContext A map containing information about the current script session, as well as objects to track participants and requests modified in this script.
         * @param {object}row The row object, as passed by LabKey
         * @param {object}oldRow The original row object (prior to update), as passed by LabKey
         */
        verifyPermissions: function(event, scriptContext, row, oldRow){
            //NOTE: this has been moved from init() b/c init() seems to get called during the ETL even
            //if not importing any records
            if(!EHR.Server.Security.hasLoaded()){
                console.log('Verifying permissions for: '+event);

                EHR.Server.Security.init({
                    scope: this,
                    schemaName: scriptContext.extraContext.schemaName,
                    success: function(){
                        //console.log("Loaded permission map");
                    }
                });
            }

            //first we normalize QCstate
            if(oldRow){
                if(oldRow.QCState){
                    if(EHR.Server.Security.getQCStateByRowId(oldRow.QCState)){
                        oldRow.QCStateLabel = EHR.Server.Security.getQCStateByRowId(oldRow.QCState).Label;
                    }
                    else
                        console.log('Unknown QCState: '+oldRow.QCState);

                    oldRow.QCState = null;
                }
                else if (oldRow.QCStateLabel){
                    //nothing needed
                }
                else {
                    oldRow.QCStateLabel = 'Completed';
                }
            }

            if (row.QCState){
                if(EHR.Server.Security.getQCStateByRowId(row.QCState)){
                    row.QCStateLabel = EHR.Server.Security.getQCStateByRowId(row.QCState).Label;
                }
                else
                    console.log('Unknown QCState: '+row.QCState);

                row.QCState = null;
            }
            else if (row.QCStateLabel){
                //nothing needed
            }
            else {
                if(scriptContext.extraContext.validateOnly)
                    row.QCStateLabel = 'In Progress';
                else {
                    if(oldRow && oldRow.QCStateLabel){
                            row.QCStateLabel = oldRow.QCStateLabel;
                    }
                    else {
                        //console.log('USING GENERIC QCSTATE: '+scriptContext.queryName);
                        row.QCStateLabel = 'Completed';
                    }
                }
            }

            //next we determine whether to use row-level QC or the global target QCState
            //for now we always prefer the global QC
            if(scriptContext.extraContext.targetQC){
                row.QCStateLabel = scriptContext.extraContext.targetQC;
            }

            //console.log('qcstate: '+row.qcstate+'/'+row.qcstatelabel);

            //handle updates
            if(event=='update' && oldRow && oldRow.QCStateLabel){
                //updating a row to a new QC is the same as inserting into that QC state
                if(row.QCStateLabel != oldRow.QCStateLabel){
                    if(!EHR.Server.Security.hasPermission(row.QCStateLabel, 'insert', [{
                        schemaName: scriptContext.extraContext.schemaName,
                        queryName: scriptContext.extraContext.queryName
                    }])){
                        var msg = "The user "+LABKEY.Security.currentUser.id+" does not have insert privledges for the table: "+scriptContext.extraContext.queryName;
                        EHR.Server.Utils.onFailure({msg: msg});
                        return false;
                    }
                }

                //the user also needs update permission on the old row's QCstate
                if(!EHR.Server.Security.hasPermission(oldRow.QCStateLabel, 'update', [{
                    schemaName: scriptContext.extraContext.schemaName,
                    queryName: scriptContext.extraContext.queryName
                }])){
                    var msg = "The user "+LABKEY.Security.currentUser.id+" does not have update privledges for the table: "+scriptContext.extraContext.queryName;
                    EHR.Server.Utils.onFailure({msg: msg});
                    return false;
                }
        //        else
        //            console.log('the user has update permissions');
            }
            //handle inserts and deletes
            else {
                if(row.QCStateLabel){
                    if(!EHR.Server.Security.hasPermission(row.QCStateLabel, event, [{
                        schemaName: scriptContext.extraContext.schemaName,
                        queryName: scriptContext.extraContext.queryName
                    }])){
                        var msg = "The user "+LABKEY.Security.currentUser.id+" does not have "+event+" privledges for the table: "+scriptContext.extraContext.queryName;
                        EHR.Server.Utils.onFailure({msg: msg});
                        return false;
                    }
        //            else
        //                console.log('the user has '+event+' permissions');
                }
            }

            //flag public status of rows
            if(oldRow && oldRow.QCStateLabel && row.QCStateLabel){
                if(!EHR.Server.Security.getQCStateByLabel(oldRow.QCStateLabel).PublicData && EHR.Server.Security.getQCStateByLabel(row.QCStateLabel).PublicData)
                    row._becomingPublicData = true;
            }

            if(row.QCStateLabel){
                if(EHR.Server.Security.getQCStateByLabel(row.QCStateLabel).PublicData){
                    row._publicData = true;

                    //a row can be directly inserted as public
                    if(!oldRow)
                        row._becomingPublicData = true;
                }
                else {
                    row._publicData = false;
                }

            }

            if(oldRow && oldRow.QCStateLabel){
                if(EHR.Server.Security.getQCStateByLabel(oldRow.QCStateLabel).PublicData)
                    oldRow._publicData = true;
            }
        }
    }
}


