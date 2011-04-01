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
         rows: [{
            page: window.location,
            exception: error.exception || error.statusText,
            json: Ext.util.JSON.encode(error)
        }],
        success: function(){
            console.log('Error successfully logged')
        },
        failure: function(error){
            console.log('Problem logging error');
            console.log(error)
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

EHR.utils.toTitleCase = function(str){
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}
