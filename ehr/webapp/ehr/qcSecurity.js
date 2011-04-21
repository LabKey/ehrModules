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
        schemaName: 'ehr',
        queryName: 'qcStateMap',
        sort: 'role',
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

EHR.utils.getTablePermissions = function(config) {
    if(!config || !config.success){
        throw "Must provide a success callback";
    }
    if(!config.queries || !config.queries.length){
        throw "config.queries must be an array of queries";
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
                insert: [],
                update: [],
                'delete': []
            };
            qcRow.effectivePermissions = {};

            Ext.each(config.queries, function(q){
                if(schemaMap.schemas[q.schemaName] && schemaMap.schemas[q.schemaName].queries[q.queryName]){
                    var query = schemaMap.schemas[q.schemaName].queries[q.queryName];
                    query.permissionsByQCState = query.permissionsByQCState || {};
                    query.permissionsByQCState[qcState] = {};

                    //iterate over each permission this user has on this query
                    Ext.each(query.effectivePermissions, function(p){
                        if(p == qcRow.insertPermissionName){
                            qcRow.permissionsByQuery.insert.push(q.queryName);
                            query.permissionsByQCState[qcState].insert = true;
                        }
                        if(p == qcRow.updatePermissionName){
                            qcRow.permissionsByQuery.update.push(q.queryName);
                            query.permissionsByQCState[qcState].update = true;
                        }
                        if(p == qcRow.deletePermissionName){
                            qcRow.permissionsByQuery['delete'].push(q.queryName);
                            query.permissionsByQCState[qcState]['delete'] = true;
                        }
                    }, this);
                }
            }, this);

            qcRow.effectivePermissions.insert = (qcRow.permissionsByQuery.insert.length == config.queries.length);
            qcRow.effectivePermissions.update = (qcRow.permissionsByQuery.update.length == config.queries.length);
            qcRow.effectivePermissions['delete'] = (qcRow.permissionsByQuery['delete'].length == config.queries.length);
        }

        function hasPermission(qcStateLabel, permission, queries){
            if(!qcStateLabel || !permission)
                throw "Must provide a QC State label and permission name";

            if(queries && !Ext.isArray(queries))
                queries = [queries];

            //if schemaName not supplied, we return based on all queries
            if(!queries.length){
                if(!qcMap.label[qcState].effectivePermissions ||
                   !qcMap.label[qcState].effectivePermissions[permission]
                )
                    return false;
                else
                    return true;
            }

            var result = true;
            Ext.each(queries, function(query){
                //if this schema isnt present, it's not securable, so we allow anything
                if(!schemaMap.schemas[query.schemaName])
                    return true;

                if(!schemaMap.schemas[query.schemaName].queries[query.queryName] ||
                   !schemaMap.schemas[query.schemaName].queries[query.queryName].permissionsByQCState[qcStateLabel] ||
                   !schemaMap.schemas[query.schemaName].queries[query.queryName].permissionsByQCState[qcStateLabel][permission]
                )
                    result = false;
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

        config.success.apply(config.scope || this, [{
            qcMap: qcMap,
            schemaMap: schemaMap,
            hasPermission: hasPermission,
            getQueryPermissions: getQueryPermissions
        }]);
    }

    multi.send(onSuccess, this);
};

