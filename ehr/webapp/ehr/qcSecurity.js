/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.namespace('EHR.utils');



EHR.utils.getQCStateMap = function(config){
    if(!config || !config.success){
        throw "Must provide a success callback"
    }

    LABKEY.Query.selectRows({
        schemaName: 'study',
        queryName: 'qcState',
        //queryName: 'qcStateMap',
        //sort: 'role',
        columns: '*',
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
        failure: EHR.utils.onError
    });

};

EHR.utils.getDatasetPermissions = function(config) {
    var schemaName = 'study';

    //if already loaded, we reuse it
    if(EHR.permissionMap){
        //console.log('reusing existing permission map')
        if(config.success)
            config.success.apply(config.scope || this, [EHR.permissionMap]);

        return;
    }

    var multi = new LABKEY.MultiRequest();
    var schemaMap;
    var qcMap;

    multi.add(EHR.utils.getQCStateMap, {
        scope: this,
        success: function(results){
            qcMap = results;
        },
        failure: EHR.utils.onError
    });
    //TODO: eventually accept other schemas
    multi.add(LABKEY.Security.getSchemaPermissions, {
        schemaName: schemaName,
        scope: this,
        success: function(map){
            schemaMap = map;
        },
        failure: EHR.utils.onError
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

        function hasPermission(qcStateLabel, permission, queries){
            if(!qcStateLabel || !permission)
                throw "Must provide a QC State label and permission name";

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
        }

        function getQueryPermissions(schemaName, queryName){
            if(!schemaMap.schemas[schemaName] ||
               !schemaMap.schemas[schemaName].queries[queryName] ||
               !schemaMap.schemas[schemaName].queries[queryName].permissionsByQCState
            )
                return {};

            return schemaMap.schemas[schemaName].queries[queryName].permissionsByQCState;
        }

        EHR.permissionMap = new function(){return {
            qcMap: qcMap,
            schemaMap: schemaMap,
            hasPermission: hasPermission,
            getQueryPermissions: getQueryPermissions
        }};

        if(config.success)
            config.success.apply(config.scope || this, [EHR.permissionMap]);
    }

    multi.send(onSuccess, this);
};

