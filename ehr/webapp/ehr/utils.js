/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.namespace('EHR.ext', 'EHR.utils');

LABKEY.requiresScript("/ehr/arrayUtils.js");



//function to test whether a user is a member of the allowed group array
EHR.utils.isMemberOf = function(allowed, successCallback){
    if (typeof(allowed) != 'object')
        allowed = [allowed];

    LABKEY.Security.getGroupsForCurrentUser({
        successCallback: function (results){
            for(var i=0;i<results.groups.length;i++){
                if (allowed.contains(results.groups[i].name)){
                    successCallback();
                    return true;
                }
            }
        }
    });
};


//generic error handler
EHR.utils.onError = function(error){
    console.log('ERROR: ' + error.exception);
    console.log(error);

    LABKEY.Query.insertRows({
         //it would be nice to store them in the current folder, but we cant guarantee they have write access..
         containerPath: '/shared',
         schemaName: 'ehr',
         queryName: 'client_errors',
         rowDataArray: [{
            page: window.location,
            exception: error.exception || error.statusText,
            json: Ext.util.JSON.encode(error)
        }],
        success: function(){
            console.log('Error successfully logged')
        },
        failure: function(){
            console.log('Problem logging error')
        }
    });
};

//NOTE: modified to accept a maxDepth argument to avoid excessive recursion
EHR.utils.rApplyIf = function(o, c, maxDepth, depth){
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
            EHR.utils.rApplyIf(o[p], c[p], maxDepth, depth+1);
        }
    }

    return o;
};

//NOTE: modified to accept a maxDepth argument to avoid excessive recursion
EHR.utils.rApply = function(o, c, maxDepth, depth){
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
            EHR.utils.rApply(o[p], c[p], maxDepth, depth+1);
        }
    }
    return o;
};


EHR.utils.rApplyCloneIf = function(o, c, maxDepth, depth){
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
            EHR.utils.rApplyClone(o[p], c[p], maxDepth, depth+1);
        }
        else if (Ext.type(o[p])=='object'){
            EHR.utils.rApplyCloneIf(o[p], c[p], maxDepth, depth+1);
        }
    }

    return o;
};

//NOTE: modified to accept a maxDepth argument to avoid excessive recursion
EHR.utils.rApplyClone = function(o, c, maxDepth, depth){
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
            EHR.utils.rApplyClone(o[p], c[p], maxDepth, depth+1);
        }
    }
    return o;
};



EHR.utils.isEmptyObj = function(ob){
   for(var i in ob){ return false;}
   return true;
};


EHR.utils.findWebPartTitle = function(childObj) {
    var wp = childObj.findParentNode('table[class*=labkey-wp]', null, true);
    return wp.child('th[class*=labkey-wp-title-left]', null, true);
};

EHR.utils.loadTemplateByName = function(title, formType){
    LABKEY.Query.selectRows({
        schemaName: 'ehr',
        queryName: 'formtemplates',
        filterArray: [
            LABKEY.Filter.create('title', title, LABKEY.Filter.Types.EQUAL),
            LABKEY.Filter.create('formType', formType, LABKEY.Filter.Types.EQUAL)
        ],
        success: onLoadTemplate
    });

    function onLoadTemplate(data){
        if(!data || !data.rows.length)
            return;

        EHR.utils.loadTemplate(data.rows[0].entityid)
    }
};


EHR.utils.loadTemplate = function(templateId){
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
            if(!store.fields && store.fields.length){
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
            var recs = store.addRecords(toAdd[i])
        }

        Ext.Msg.hide();
    }
};

EHR.utils.errorSeverity = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    FATAL: 4
};

EHR.utils.maxError = function(severity1, severity2){
    if (!severity1 || EHR.utils.errorSeverity[severity1] < EHR.utils.errorSeverity[severity2])
        return severity2;
    else
        return severity1;
};

EHR.utils.roundNumber = function(num, dec){
    return Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
};

EHR.utils.getQCStateMap = function(config){
    if(!config || !config.success){
        throw "Must provide a success callback"
    }

    var qcmap = {
        label: {},
        rowid: {}
    };

    LABKEY.Query.selectRows({
        schemaName: 'ehr',
        queryName: 'qcpermissionmap',
        sort: 'role',
        columns: 'role,qcstate,qcstate/RowId,qcstate/Label,qcstate/PublicData,read,insert,update,del,readown,updateown,deleteown,admin,all',
        success: function(data){
            var row;
            if(data.rows && data.rows.length){
                for (var i=0;i<data.rows.length;i++){
                    row = data.rows[i];
                    qcmap.label[row['qcstate/Label']] = row;
                    qcmap.rowid[row['qcstate/RowId']] = row;
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

    var qcMap = {};
    var schemaMap;

    var multi = new LABKEY.MultiRequest();
    multi.add(LABKEY.Query.selectRows, {
        scope: this,
        schemaName: 'ehr',
        queryName: 'qcpermissionmap',
        sort: 'role',
        columns: 'role,qcstate,qcstate/RowId,qcstate/Label,qcstate/PublicData,read,insert,update,del,readown,updateown,deleteown,admin,all',
        success: function(data){
            Ext.each(data.rows, function(row){
                qcMap[row.role][row['qcstate/Label']] = row;
            }, this);
        },
        failure: EHR.utils.onError
    });
    multi.add(EHR.utils.getSchemaPermissions, {
        schemaName: 'study',
        scope: this,
        success: function(map){
            schemaMap = map;
        }
    });

    function onSuccess(){
        var map = {};
        Ext.each(config.queries, function(q){
            if(schemaMap.schemas[q.schemaName] && schemaMap.schemas[q.schemaName][q.queryName]){
                Ext.each(schemaMap.schemas[q.schemaName][q.queryName].effectivePermissions, function(p){
                    if(qcMap && qcMap[q]){
                        Ext.each(qcMap[q], function(qcState){
                            map[qcState] = map[qcState] || {};
                            for(var j in LABKEY.Security.permissions){
                                if(qcMap[q][qcState][j] || qcMap[q][qcState]['all'])
                                    map[qcState][j] = true;
                            }
                        }, this);
                    }
                }, this)
            }
        }, this);
        config.success.apply(config.scope || this, [map]);
    }

    multi.send(onSuccess, this);
};


/**
 * gets permissions for a set of tables within a schema.
 * Currently only study tables have individual permissions so only works on the study schema
 * @param config A configuration object with the following properties:
 * @param {Function} config.success A reference to a function to call with the API results. This
 * function will be passed the following parameters:
 * <ul>
 * <li><b>data:</b> an object with a property named "schemas" which contains one .
 * Each schema one property with the name of each table. So
 * schemas.study.Demographics would yield the following results
 *  <ul>
 *      <li>id: The unique id of the resource (String, typically a GUID).</li>
 *      <li>name: The name of the resource suitable for showing to a user.</li>
 *      <li>description: The description of the reosurce.</li>
 *      <li>resourceClass: The fully-qualified Java class name of the resource.</li>
 *      <li>sourceModule: The name of the module in which the resource is defined and managed</li>
 *      <li>parentId: The parent resource's id (may be omitted if no parent)</li>
 *      <li>parentContainerPath: The parent resource's container path (may be omitted if no parent)</li>
 *      <li>children: An array of child resource objects.</li>
 *      <li>effectivePermissions: An array of permission unique names the current user has on the resource. This will be
 *          present only if the includeEffectivePermissions property was set to true on the config object.</li>
 *      <li>permissionMap: An object with one property per effectivePermission allowed the user. This restates
 *          effectivePermissions in a slightly more convenient way
 *  </ul>
 * </li>
 * <li><b>response:</b> The XMLHttpResponse object</li>
 * </ul>
 * @param {Function} [config.failure] A reference to a function to call when an error occurs. This
 * function will be passed the following parameters:
 * <ul>
 * <li><b>errorInfo:</b> an object containing detailed error information (may be null)</li>
 * <li><b>response:</b> The XMLHttpResponse object</li>
 * </ul>
 * @param {object} [config.scope] An optional scoping object for the success and error callback functions (default to this).
 * @param {string} [config.containerPath] An alternate container path to get permissions from. If not specified,
 * the current container path will be used.
 */
EHR.utils.getSchemaPermissions = function(config) {
    if (config.schemaName && config.schemaName != "study")
        throw "Method only works for the study schema";

    function successCallback(json, response) {
        //First lets make sure there is a study in here.
        var studyResource = null;
        for (var i = 0; i < json.resources.children.length; i++)
        {
            var resource = json.resources.children[i];
            if (resource.resourceClass == "org.labkey.study.model.StudyImpl"){
                studyResource = resource;
                break;
            }
        }

        if (null == studyResource)
        {
            config.failure.apply({description:"No study found in container."}, response);
            return;
        }

        var result = {};
        Ext.each(studyResource.children, function (dataset) {
            result[dataset.name] = dataset;
            dataset.permissionMap = {};
            Ext.each(dataset.effectivePermissions, function (perm) {
                dataset.permissionMap[perm] = true;
            })
        });

        config.success.apply(config.scope || this, [{schemas:{study:result}}, response]);
    }

    var myConfig = Ext.apply({}, config);
    myConfig.includeEffectivePermissions = true;
    myConfig.success = successCallback;
    LABKEY.Security.getSecurableResources(myConfig);
}
