/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.namespace('EHR.ext', 'EHR.UTILITIES');

LABKEY.requiresScript("/ehr/arrayUtils.js");



//creates a pair of date fields that automatically set their min/max dates to create a date range
EHR.ext.DateRangePanel = Ext.extend(Ext.Panel,
{
    initComponent : function(config)
    {
        var defaults = {
            //cls: 'extContainer',
            bodyBorder: false,
            border: false,
            defaults: {
                border: false,
                bodyBorder: false
            }
        };

        Ext.applyIf(defaults, config);
        
        Ext.apply(this, defaults);

        EHR.ext.DateRangePanel.superclass.initComponent.call(this);

        this.startDateField = new LABKEY.ext.DateField({
            format: 'Y-M-d' //YYYY-MMM-DD
            ,width: 165
            ,name:'startDate'
            ,allowBlank:true
            ,vtype: 'daterange'
            ,scope: this
            ,value: LABKEY.ActionURL.getParameter('startDate')
        });

        this.endDateField = new LABKEY.ext.DateField({
            format: 'Y-M-d' //YYYY-MMM-DD
            ,width:165
            ,name:'endDate'
            ,allowBlank:true
            ,vtype: 'daterange'
            ,scope: this
            ,value: LABKEY.ActionURL.getParameter('endDate')
        });

        Ext.apply(this.endDateField, {startDateField: this.startDateField});
        Ext.apply(this.startDateField, {endDateField: this.endDateField});

        this.add({tag: 'div', html: 'From:'});
        this.add(this.startDateField);
        this.add({tag: 'div', html: 'To:'});
        this.add(this.endDateField);
        this.add({tag: 'div', html: '<br>'});

    }

});
Ext.reg('DateRangePanel', EHR.ext.DateRangePanel);



//EHR.UTILITIES.Header = function(title){
//    var header = document.createElement('span');
//    header.innerHTML = '<table class="labkey-wp"><tbody><tr class="labkey-wp-header"><th class="labkey-wp-title-left">' +
//    (title || 'Details:')+ '</th><th class="labkey-wp-title-right">&nbsp;</th></tr></tbody></table><p/>';
//
//    return header;
//}

//function to test whether a user is a member of the allowed group array
EHR.UTILITIES.isMemberOf = function(allowed, successCallback){
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


//this vtype is used in date range panels
Ext.apply(Ext.form.VTypes, {
    daterange : function(val, field)
    {
        var date = field.parseDate(val);
        console.log('validating');
        if (!date)
        {
            console.log('returned');
            return;
        }
        if (field.startDateField && (!this.dateRangeMax || (date.getTime() != this.dateRangeMax.getTime())))
        {
            //var start = Ext.getCmp(field.startDateField);
            var start = field.startDateField;
            start.setMaxValue(date);
            (function(){start.validate()}).defer(10);
            this.dateRangeMax = date;

            start.fireEvent('change', start, start.getValue());
        }
        else if (field.endDateField && (!this.dateRangeMin || (date.getTime() != this.dateRangeMin.getTime())))
        {
            //var end = Ext.getCmp(field.endDateField);
            var end = field.endDateField;
            end.setMinValue(date);
            (function(){end.validate()}).defer(10);
            this.dateRangeMin = date;

            end.fireEvent('change', end, end.getValue());
        }
        /*
         * Always return true since we're only using this vtype to set the
         * min/max allowed values (these are tested for after the vtype test)
         */

        return true;
    }
});




//generic error handler
EHR.UTILITIES.onError = function(error){
    console.log('ERROR: ' + error.exception);
    console.log(error);
    
    /*
    LABKEY.Query.insertRows({
         containerPath: '/shared',
         schemaName: 'ehr',
         queryName: 'client_errors',
         rowDataArray: [
        {
            Page: window.location
            Error: error.exception,
            User: '',
            ContainerPath: ''
        }]
    */
};

//NOTE: modified to accept a maxDepth argument to avoid excessive recursion
EHR.UTILITIES.rApplyIf = function(o, c, maxDepth, depth){
    maxDepth = maxDepth || 50;
    depth = depth || 1;
    o = o || {};
    if(depth>6){
        console.log('Warning: rApplyIf hit : '+depth);
        console.log(o);
        console.log(c);
    }

    for(var p in c){
        if(!Ext.isDefined(o[p]) || depth >= maxDepth)
            o[p] = c[p];
        else if (Ext.type(o[p])=='object'){
            EHR.UTILITIES.rApplyIf(o[p], c[p], maxDepth, depth+1);
        }
    }

    return o;
};

//NOTE: modified to accept a maxDepth argument to avoid excessive recursion
EHR.UTILITIES.rApply = function(o, c, maxDepth, depth){
    maxDepth = maxDepth || 50;
    depth = depth || 1;
    if(depth>6){
        console.log('Warning: rApply hit max: '+depth);
        console.log(o);
        console.log(c);
    }
    o = o || {};

    for(var p in c){
        if(Ext.type(o[p])!='object' || depth >= maxDepth)
                o[p] = c[p];
        else {
            EHR.UTILITIES.rApply(o[p], c[p], maxDepth, depth+1);
        }
    }
    return o;
};


EHR.UTILITIES.rApplyCloneIf = function(o, c, maxDepth, depth){
    maxDepth = maxDepth || 50;
    depth = depth || 1;
    o = o || {};
    if(depth>6){
        console.log('Warning: rApplyCloneIf hit max: '+depth);
        console.log(o);
        console.log(c);
    }

    for(var p in c){
        if((!Ext.isDefined(o[p]) && Ext.type(c[p])!='object') || depth >= maxDepth)
            o[p] = c[p];
        else if (!Ext.isDefined(o[p]) && Ext.type(c[p])=='object'){
            o[p] = {};
            EHR.UTILITIES.rApplyClone(o[p], c[p], maxDepth, depth+1);
        }
        else if (Ext.type(o[p])=='object'){
            EHR.UTILITIES.rApplyCloneIf(o[p], c[p], maxDepth, depth+1);
        }
    }

    return o;
};

//NOTE: modified to accept a maxDepth argument to avoid excessive recursion
EHR.UTILITIES.rApplyClone = function(o, c, maxDepth, depth){
    maxDepth = maxDepth || 50;
    depth = depth || 1;
    if(depth>6){
        console.log('Warning: rApplyClone hit max: '+depth);
        console.log(o);
        console.log(c);
    }
    o = o || {};

    for(var p in c){
        if(Ext.type(c[p])!='object' || depth >= maxDepth)
                o[p] = c[p];
        else {
            if(Ext.type(o[p])!='object')
                o[p] = {};
            EHR.UTILITIES.rApplyClone(o[p], c[p], maxDepth, depth+1);
        }
    }
    return o;
};



EHR.UTILITIES.isEmptyObj = function(ob){
   for(var i in ob){ return false;}
   return true;
};


EHR.UTILITIES.findWebPartTitle = function(childObj) {
    var wp = childObj.findParentNode('table[class*=labkey-wp]', null, true);
    return wp.child('th[class*=labkey-wp-title-left]', null, true);
};

EHR.UTILITIES.loadTemplateByName = function(title, formType){
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

        EHR.UTILITIES.loadTemplate(data.rows[0].entityid)
    }
};


EHR.UTILITIES.loadTemplate = function(templateId){
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

EHR.UTILITIES.errorSeverity = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    FATAL: 4
};

EHR.UTILITIES.maxError = function(severity1, severity2){
    if (EHR.UTILITIES.errorSeverity[severity1] > EHR.UTILITIES.errorSeverity[severity2])
        return severity1;
    else
        return severity2;
};

EHR.UTILITIES.roundNumber = function(num, dec){
    return Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
};