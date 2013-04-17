/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

/*
 * Include the appropriate external scripts and export them
 */
var console = require("console");
exports.console = console;

var LABKEY = require("labkey");
exports.LABKEY = LABKEY;

var EHR = {};
exports.EHR = EHR;

/**
 * A namespace for server-side JS code that is used in trigger/validation scripts.
 * @namespace
 */
EHR.Server = {};

EHR.Server.Utils = require("ehr/utils").EHR.Server.Utils;

EHR.Server.Security = require("ehr/security").EHR.Server.Security;

EHR.Server.TriggerManager = require("ehr/triggerManager").EHR.Server.TriggerManager;

EHR.Server.Validation = require("ehr/validation").EHR.Server.Validation;

/**
 * This class handles the serer-side validation/transform that occurs in the EHR's trigger scripts.  It should be used by every EHR dataset.  The purpose is to centralize
 * complex code into one single pathway for all incoming records.  The trigger scripts of individual records can include this code (see example script below).  This
 * replaces the default functions LabKey expects including beforeInsert, beforeUpdate, etc.  Without the dataset's trigger script, you will include this code, then
 * create functions only to handle the dataset-specific needs.  For example, the Blood Draws dataset contains extra validation that is needed prior to every insert/update.
 * As a result, this script includes an additional onUpsert() function that will get called.  The minimal code needed in each dataset's validation script is:
 * <p>
 *
 * require("ehr/triggers").initScript(this);
 *
 * <p>
 * This line of code will uses javascript <a href="https://developer.mozilla.org/en/New_in_JavaScript_1.7#Destructuring_assignment_(Merge_into_own_page.2Fsection)">destructuring assignment</a>
 * import to import properties of the exports object from triggers.js into the desired local variables.  With one line of code you inherit all
 * the defaults specified in EHR.Server.Triggers.
 *
 * @name EHR.Server.Triggers
 * @class
 */
EHR.Server.Triggers = {};


/**
 * This overrides the default init() function on scripts inheriting this code.  It performs the following:
 * <br>1. Sets up this.scriptContext, which is a map used to pass information between functions and to track information such as the distinct participants modified in this script
 * <br>2. If the dataset's trigger script contains a function named onInit(), it will be called and passed the following arguments:
 * <br>
 * <li>event: the name of this event (ie. insert, update, delete)</li>
 * <li>scriptContext: a map containing information about the current script session, as well as objects to track participants and requests modified in this script.
 * @param {string} event The name of the event, as passed from LabKey.
 * @param {object} errors The errors object, as passed from LabKey.
 */
EHR.Server.Triggers.init = function(event, errors){
    console.log("** evaluating: " + this['javax.script.filename'] + ' for: '+event);

    var fileParse = (this['javax.script.filename']).split('/');
    this.extraContext.schemaName = fileParse[1];
    this.extraContext.queryName = fileParse[2].replace(/\.js$/, '');

    //test to see if GUID persisted across tables
//    if (this.extraContext.sessionGuid)
//        console.log('existing GUID: ' + this.extraContext.sessionGuid)
//    else {
//        this.extraContext.sessionGuid = LABKEY.Utils.generateUUID();
//        console.log('creating new session GUID: ' +  this.extraContext.sessionGuid);
//    }

    this.scriptContext = {
        helper: org.labkey.ehr.utils.TriggerScriptHelper.getForContainer(LABKEY.Security.currentUser.id, LABKEY.Security.currentContainer.id),
        rows: [],
        startTime: new Date(),
        event: event,
        extraContext: this.extraContext,
        queryName: this.extraContext.queryName,
        schemaName: this.extraContext.schemaName,
        notificationRecipients : [],
        participantsModified: [],
        publicParticipantsModified: [],
        tasksModified: [],
        requestsModified: [],
        requestsDenied: {},
        requestsCompleted: {},
        missingParticipants: [],
        PKsModified: [],
        publicPKsModified: [],
        demographicsMap: {},
        errorQcLabel: 'Review Required',
        verbosity: 0
    };

    EHR.Server.Security.init(this.scriptContext);

    var handlers = [];
    if(this.onInit){
        handlers.push(this.onInit);
    }

    var initHandlers = EHR.Server.TriggerManager.getHandlersForQuery(EHR.Server.TriggerManager.Events.INIT, this.scriptContext.schemaName, this.scriptContext.queryName, true) || [];
    if(initHandlers.length)
        handlers = handlers.concat(initHandlers);

    if (handlers.length){
        for (var i=0;i<handlers.length;i++){
            handlers[i].call(this, event, this.scriptContext);
        }
    }
}
exports.init = EHR.Server.Triggers.init;


/**
 * This should override the default beforeInsert() function on scripts inheriting this code.  Will be called once for each row being inserted.  It performs the following:
 * <br>1. Verifies permissions for the current dataset / action / QCState
 * <br>2. Calls EHR.Server.Triggers.rowInit(), which is a method shared by both insert/update actions.
 * <br>3. If the incoming record is a request, it forces this newly inserted record to have a future date
 * <br>4. If the dataset's trigger script contains a function named onUpsert(), it will be called and passed the following arguments:
 * <br>
 * <li>scriptContext: A map containing information about the current script session, as well as objects to track participants and requests modified in this script.
 * <li>scriptErrors: An error object that should be used identically to the default errors object.  It is separate from LabKey's error object and handled using EHR.Server.Triggers.processErrors()</li>
 * <li>row: The row object, as passed by LabKey</li>
 * <br>5. If the dataset's trigger script contains a function named onInsert(), it will be called and pass the same arguments as onUpsert():
 * <br>6. Calls EHR.Server.Triggers.rowEnd(), which is a method shared by both insert/update actions.
 * @param {object} row The row object, as passed from LabKey.
 * @param {object} errors The errors object, as passed from LabKey.
 */
EHR.Server.Triggers.beforeInsert = function(row, errors){
    var scriptErrors = {};
    if(this.scriptContext.verbosity > 0)
        console.log("beforeInsert: " + row);

    if(EHR.Server.Security.verifyPermissions('insert', this.scriptContext, row) === false){
        errors._form = 'Insufficent Permissions';
        console.warn('ERROR: insufficient permissions');
        return;
    }

    EHR.Server.Triggers.rowInit.call(this, scriptErrors, row, null);

    //force newly entered requests to have future dates
    if(row.date && EHR.Server.Security.getQCStateByLabel(row.QCStateLabel).isRequest){
        var now = new Date();
        // NOTE: the removeTimeFromDate flag indicates that that tables only considers date (not datetime).  therefore we need to
        // use a different value when considering past dates
        if(this.scriptContext.removeTimeFromDate)
            now = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        //if the row's date appears to be date-only, we adjust now accordingly
        if(row.date.getHours()==0 && row.date.getMinutes()==0)
            now = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        now = now.getTime();
        var rowDate = now - row.date.getTime();

        //allow a reasonable window to support inserts from other scripts
        if(rowDate > 1000 * 60 * 10) //10 minutes
            EHR.Server.Validation.addError(scriptErrors, 'date', 'Cannot place a request in the past', 'ERROR');

    }

    //dataset-specific beforeInsert
    var handlers = [];
    if(this.onUpsert){
        handlers.push(this.onUpsert);
    }

    var upsertHandlers = EHR.Server.TriggerManager.getHandlersForQuery(EHR.Server.TriggerManager.Events.BEFORE_UPSERT, this.scriptContext.schemaName, this.scriptContext.queryName, true) || [];
    if (upsertHandlers.length)
        handlers = handlers.concat(upsertHandlers);

    if(this.onInsert)
        handlers.push(this.onInsert);

    var insertHandlers = EHR.Server.TriggerManager.getHandlersForQuery(EHR.Server.TriggerManager.Events.BEFORE_INSERT, this.scriptContext.schemaName, this.scriptContext.queryName, true) || [];
    if (insertHandlers.length)
        handlers = handlers.concat(insertHandlers);

    if (handlers.length){
        for (var i=0;i<handlers.length;i++){
            handlers[i].call(this, this.scriptContext, scriptErrors, row);
        }
    }

    EHR.Server.Triggers.rowEnd.call(this, errors, scriptErrors, row, null);
}
exports.beforeInsert = EHR.Server.Triggers.beforeInsert;


/**
 * This should override the default afterInsert() function on scripts inheriting this code.  Will be called once for each row being inserted.  It performs the following:
 * <br>1. Calls EHR.Server.Triggers.afterEvent(), which is a method shared by insert/update/delete actions.
 * <br>2. If the dataset's trigger script contains a function named onAfterUpsert(), it will be called and passed the following arguments:
 * <br>
 * <li>scriptContext: A map containing information about the current script session, as well as objects to track participants and requests modified in this script.
 * <li>errors: The LabKey error object</li>
 * <li>row: The row object, as passed by LabKey</li>
 * <br>3. If the dataset's trigger script contains a function named onAfterInsert(), it will be called and passed the same arguments as onAfterUpsert().
 * @param {object} row The row object, as passed from LabKey.
 * @param {object} errors The errors object, as passed from LabKey.
 */
EHR.Server.Triggers.afterInsert = function(row, errors){
    if(this.scriptContext.verbosity > 0)
        console.log('after insert');

    EHR.Server.Triggers.afterEvent.call(this, 'insert', errors, row, null);

    var handlers = [];
    if(this.onAfterUpsert)
        handlers.push(this.onAfterUpsert);

    var upsertHandlers = EHR.Server.TriggerManager.getHandlersForQuery(EHR.Server.TriggerManager.Events.AFTER_UPSERT, this.scriptContext.schemaName, this.scriptContext.queryName, true) || [];
    if (upsertHandlers.length)
        handlers = handlers.concat(upsertHandlers);

    if(this.onAfterInsert)
        handlers.push(this.onAfterInsert);

    var insertHandlers = EHR.Server.TriggerManager.getHandlersForQuery(EHR.Server.TriggerManager.Events.AFTER_INSERT, this.scriptContext.schemaName, this.scriptContext.queryName, true) || [];
    if (insertHandlers.length)
        handlers = handlers.concat(insertHandlers);

    if (handlers.length){
        for (var i=0;i<handlers.length;i++){
            handlers[i].call(this, this.scriptContext, errors, row);
        }
    }
}
exports.afterInsert = EHR.Server.Triggers.afterInsert;


/**
 * This should override the default beforeUpdate() function on scripts inheriting this code.  Will be called once for each row being updated.  It performs the following:
 * <br>1. Verifies permissions for the current dataset / action / QCState
 * <br>2. Calls EHR.Server.Triggers.rowInit(), which is a method shared by both insert/update actions.
 * <br>3. If the dataset's trigger script contains a function named onUpsert(), it will be called and passed the following arguments:
 * <br>
 * <li>scriptContext: A map containing information about the current script session, as well as objects to track participants and requests modified in this script.
 * <li>scriptErrors: An error object that should be used identically to the default errors object.  It is separate from LabKey's error object and handled using EHR.Server.Triggers.processErrors()</li>
 * <li>row: The row object, as passed by LabKey</li>
 * <li>oldRow: The original row object (prior to update), as passed by LabKey</li>
 * <br>4. If the dataset's trigger script contains a function named onUpdate(), it will be called and pass the same arguments as onUpsert():
 * <br>5. Calls EHR.Server.Triggers.rowEnd(), which is a method shared by both insert/update actions.
 * @param {object} row The row object, as passed from LabKey.
 * @param {object} oldRow The original row object (prior to update), as passed from LabKey.
 * @param {object} errors The errors object, as passed from LabKey.
 */
EHR.Server.Triggers.beforeUpdate = function(row, oldRow, errors){
    var scriptErrors = {};

    if(this.scriptContext.verbosity > 0)
        console.log("beforeUpdate: " + row);

    if(EHR.Server.Security.verifyPermissions('update', this.scriptContext, row, oldRow) === false){
        errors._form = 'Insufficent permissions';
        return;
    }

    EHR.Server.Triggers.rowInit.call(this, scriptErrors, row, oldRow);

    //dataset-specific beforeUpdate
    var handlers = [];
    if(this.onUpsert){
        handlers.push(this.onUpsert);
    }

    var upsertHandlers = EHR.Server.TriggerManager.getHandlersForQuery(EHR.Server.TriggerManager.Events.BEFORE_UPSERT, this.scriptContext.schemaName, this.scriptContext.queryName, true) || [];
    if (upsertHandlers.length)
        handlers = handlers.concat(upsertHandlers);

    if(this.onUpdate)
        handlers.push(this.onUpdate);

    var insertHandlers = EHR.Server.TriggerManager.getHandlersForQuery(EHR.Server.TriggerManager.Events.BEFORE_UPDATE, this.scriptContext.schemaName, this.scriptContext.queryName, true) || [];
    if (insertHandlers.length)
        handlers = handlers.concat(insertHandlers);

    if (handlers.length){
        for (var i=0;i<handlers.length;i++){
            handlers[i].call(this, this.scriptContext, scriptErrors, row, oldRow);
        }
    }

    EHR.Server.Triggers.rowEnd.call(this, errors, scriptErrors, row, oldRow);

    //NOTE: this is designed to merge the old row into the new one.
    for (var prop in oldRow){
        if(!row.hasOwnProperty(prop) && LABKEY.ExtAdapter.isDefined(oldRow[prop])){
            row[prop] = oldRow[prop];
        }
    }
}
exports.beforeUpdate = EHR.Server.Triggers.beforeUpdate;


/**
 * This should override the default afterUpdate() function on scripts inheriting this code.  Will be called once for each row being updated.  It performs the following:
 * <br>1. Calls EHR.Server.Triggers.afterEvent(), which is a method shared by insert/update/delete actions.
 * <br>2. If the dataset's trigger script contains a function named onAfterUpsert(), it will be called and passed the following arguments:
 * <br>
 * <li>scriptContext: A map containing information about the current script session, as well as objects to track participants and requests modified in this script.
 * <li>errors: The LabKey error object</li>
 * <li>row: The row object, as passed by LabKey</li>
 * <li>oldRow: The original row object (prior to update), as passed by LabKey</li>
 * <br>3. If the dataset's trigger script contains a function named onAfterUpdate(), it will be called and passed the same arguments as onAfterUpsert().
 * @param {object} row The row object, as passed from LabKey.
 * @param {object} oldRow The original row object (prior to update), as passed from LabKey.
 * @param {object} errors The errors object, as passed from LabKey.
 */
EHR.Server.Triggers.afterUpdate = function(row, oldRow, errors){
    if(this.scriptContext.verbosity > 0)
        console.log('after update');

    EHR.Server.Triggers.afterEvent.call(this, 'update', errors, row, oldRow);

    //table-specific handlers
    var handlers = [];
    if(this.onAfterUpsert)
        handlers.push(this.onAfterUpsert);

    var afterUpsertHandlers = EHR.Server.TriggerManager.getHandlersForQuery(EHR.Server.TriggerManager.Events.AFTER_UPSERT, this.scriptContext.schemaName, this.scriptContext.queryName, true) || [];
    if (afterUpsertHandlers.length)
        handlers = handlers.concat(afterUpsertHandlers);

    if(this.onAfterUpdate)
        handlers.push(this.onAfterUpdate);

    var afterUpdateHandlers = EHR.Server.TriggerManager.getHandlersForQuery(EHR.Server.TriggerManager.Events.AFTER_UPDATE, this.scriptContext.schemaName, this.scriptContext.queryName, true) || [];
    if (afterUpdateHandlers.length)
        handlers = handlers.concat(afterUpdateHandlers);

    if (handlers && handlers.length){
        for (var i=0;i<handlers.length;i++){
            handlers[i].call(this, this.scriptContext, errors, row, oldRow);
        }
    }
}
exports.afterUpdate = EHR.Server.Triggers.afterUpdate;


/**
 * This should override the default beforeDelete() function on scripts inheriting this code.  Will be called once for each row being deleted.  It performs the following:
 * <br>1. Verifies permissions for the current dataset / action / QCState
 * <br>2. If the dataset's trigger script contains a function named onDelete(), it will be called and passed the following arguments:
 * <br>
 * <li>scriptErrors: An error object that should be used identically to the default errors object.  It is separate from LabKey's error object and handled using EHR.Server.Triggers.processErrors()</li>
 * <li>scriptContext: A map containing information about the current script session, as well as objects to track participants and requests modified in this script.
 * <li>row: The row object, as passed by LabKey</li>
 * @param {object} row The row object, as passed from LabKey.
 * @param {object} errors The errors object, as passed from LabKey.
 */
EHR.Server.Triggers.beforeDelete = function(row, errors){
    if(this.scriptContext.verbosity > 0)
        console.log("beforeDelete: ");

    if(EHR.Server.Security.verifyPermissions('delete', this.scriptContext, row) === false){
        errors._form = 'Insufficent permissions';
        return;
    }

    //table-specific handlers
    var handlers = EHR.Server.TriggerManager.getHandlersForQuery(EHR.Server.TriggerManager.Events.BEFORE_DELETE, this.scriptContext.schemaName, this.scriptContext.queryName, true) || [];
    if(this.onDelete)
        handlers.unshift(this.onDelete);

    if (handlers && handlers.length){
        for (var i=0;i<handlers.length;i++){
            handlers[i].call(this, errors, this.scriptContext, row);
        }
    }
}
exports.beforeDelete = EHR.Server.Triggers.beforeDelete;


/**
 * This should override the default afterDelete() function on scripts inheriting this code.  Will be called once for each row being deleted.  It performs the following:
 * <br>1. Calls EHR.Server.Triggers.afterEvent(), which is a method shared by insert/update/delete actions.
 * <br>2. If the dataset's trigger script contains a function named onAfterDelete(), it will be called and passed the following arguments:
 * <br>
 * <li>scriptContext: A map containing information about the current script session, as well as objects to track participants and requests modified in this script.
 * <li>errors: The LabKey error object</li>
 * <li>row: The row object, as passed by LabKey</li>
 * @param {object} row The row object, as passed from LabKey.
 * @param {object} errors The errors object, as passed from LabKey.
 */
EHR.Server.Triggers.afterDelete = function(row, errors){
    EHR.Server.Triggers.afterEvent.call(this, 'delete', errors, row, null);

    //table-specific handlers
    if(this.scriptContext.extraContext.dataSource != 'etl'){
        var handlers = EHR.Server.TriggerManager.getHandlersForQuery(EHR.Server.TriggerManager.Events.AFTER_DELETE, this.scriptContext.schemaName, this.scriptContext.queryName, true) || [];

        if(this.onAfterDelete)
            handlers.unshift(this.onAfterDelete);

        if (handlers && handlers.length){
            for (var i=0;i<handlers.length;i++){
                handlers[i].call(this, this.scriptContext, errors, row);
            }
        }
    }
}
exports.afterDelete = EHR.Server.Triggers.afterDelete;


/**
 * This should override the default complete() function on scripts inheriting this code.  It performs the following:
 * <br>1. If the dataset's trigger script contains a function named onComplete(), it will be called and passed the following arguments:
 * <br>
 * <li>event: the name of this event (ie. insert, update, delete)</li>
 * <li>errors: the LabKey errors object</li>
 * <li>scriptContext: a map containing information about the current script session, as well as objects to track participants and requests modified in this script.
 * <br>2. If the current table is not ehr.requests, and if scriptContext.requestsCompleted or scriptContext.requestsDenied have items, then emails will be sent to the notification recipients for each completed/denied request
 * @param {string} event The name of the event, as passed from LabKey.
 * @param {object} errors The errors object, as passed from LabKey.
 */
EHR.Server.Triggers.complete = function(event, errors) {
    if(this.scriptContext.verbosity > 0){
        console.log('Event complete: '+event);
        console.log('Participants modified: '+this.scriptContext.participantsModified);
        console.log('PKs modified: '+this.scriptContext.PKsModified);
    }

    var handlers = EHR.Server.TriggerManager.getHandlersForQuery(EHR.Server.TriggerManager.Events.COMPLETE, this.scriptContext.schemaName, this.scriptContext.queryName, true) || [];

    if(this.onComplete)
        handlers.unshift(this.onComplete);

    if (handlers && handlers.length){
        for (var i=0;i<handlers.length;i++){
            handlers[i].call(this, event, errors, this.scriptContext);
        }
    }

    //send emails. query notificationRecipients table based on notification type(s)
    if(this.scriptContext.notificationTypes){
        //NOTE: this is being handled by each dataset's script, if needed
    }

    if(this.scriptContext.notificationRecipients && !LABKEY.ExtAdapter.isEmpty(this.scriptContext.notificationRecipients)){
        //NOTE: this is being handled by each dataset's script, if needed
    }

    //only do this if we're not in the ehr.requests script
    if((this.scriptContext.queryName && !this.scriptContext.queryName.match(/requests/i))){
        if(this.scriptContext.requestsModified && this.scriptContext.requestsModified.length){
            console.log('requests modified:');
            console.log(this.scriptContext.requestsModified);

        }

        if(this.scriptContext.requestsDenied && !EHR.Server.Utils.isEmptyObj(this.scriptContext.requestsDenied)){
            //console.log('requests denied:');
            //console.log(this.scriptContext.requestsDenied);
            var totalRequests = [];
            for(var i in this.scriptContext.requestsDenied){
                var rows = this.scriptContext.requestsDenied[i];
                totalRequests.push(i);
            }

            LABKEY.Query.selectRows({
                schemaName: 'ehr',
                queryName: 'requests',
                columns: '*',
                scope: this,
                filterArray: [
                    LABKEY.Filter.create('requestid', totalRequests.join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF)
                ],
                success: function(data){
                    if(data && data.rows && data.rows.length){
                        var emails = [];
                        var row;

                        for(var i=0;i<data.rows.length;i++){
                            row = data.rows[i];
                            var recipients = [];
                            var rows = this.scriptContext.requestsDenied[row.requestid];

                            if(row.notify1)
                                recipients.push(LABKEY.Message.createPrincipalIdRecipient(LABKEY.Message.recipientType.to, row.notify1));
                            if(row.notify2)
                                recipients.push(LABKEY.Message.createPrincipalIdRecipient(LABKEY.Message.recipientType.to, row.notify2));
                            if(row.notify3)
                                recipients.push(LABKEY.Message.createPrincipalIdRecipient(LABKEY.Message.recipientType.to, row.notify3));

                            var msgContent = 'One or more elements from a '+row.formtype+(row.title ? ' titled: \''+row.title+'\'' : '')+' have been denied: ' +
                                '<a href="'+LABKEY.ActionURL.getBaseURL()+'ehr' + LABKEY.ActionURL.getContainer() + '/requestDetails.view?requestid='+row.requestid+'&formtype='+row.formtype +
                                '">Click here to view them</a>.  <p>';

                            if(rows.length){
                                msgContent += 'The following IDs have been marked complete:<br>';
                                var req;
                                for(var j=0;j<rows.length;j++){
                                    req = rows[j];
                                    msgContent += '<a href="'+LABKEY.ActionURL.getBaseURL()+'ehr' + LABKEY.ActionURL.getContainer() + '/requestDetails.view?requestid='+row.requestid+'&formtype='+row.formtype + '">' + req.Id+'</a><br>';
                                    if(req.description){
                                        msgContent += req.description.replace(/\n/g,'<br>');
                                    }
                                    msgContent += '<p>';
                                }
                            }

                            msgContent += '<p>The requests that have been denied will say \'Request: Denied\' in the status column.  Please do not reply to this email, as this account is not read.';

                            EHR.Server.Validation.sendEmail({
                                recipients: recipients,
                                msgContent: msgContent,
                                msgSubject: 'EHR '+row.formtype+' Denied',
                                notificationType: row.formtype+' Denied'
                            })
                        }
                    }
                },
                failure: EHR.Server.Utils.onFailure
            });
        }

        if(this.scriptContext.requestsCompleted && !EHR.Server.Utils.isEmptyObj(this.scriptContext.requestsCompleted)){
            console.log('The following requests were completed in this batch:');
            console.log(this.scriptContext.requestsCompleted);
            var totalRequests = [];
            for(var i in this.scriptContext.requestsCompleted){
                totalRequests.push(i);
            }

            LABKEY.Query.selectRows({
                schemaName: 'ehr',
                queryName: 'requests',
                columns: '*',
                scope: this,
                filterArray: [
                    LABKEY.Filter.create('requestid', totalRequests.join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF)
                ],
                success: function(data){
                    if(data && data.rows && data.rows.length){
                        var emails = [];
                        var row;

                        for(var i=0;i<data.rows.length;i++){
                            row = data.rows[i];
                            var recipients = [];
                            var rows = this.scriptContext.requestsCompleted[row.requestid] || [];

                            if(row.notify1)
                                recipients.push(LABKEY.Message.createPrincipalIdRecipient(LABKEY.Message.recipientType.to, row.notify1));
                            if(row.notify2)
                                recipients.push(LABKEY.Message.createPrincipalIdRecipient(LABKEY.Message.recipientType.to, row.notify2));
                            if(row.notify3)
                                recipients.push(LABKEY.Message.createPrincipalIdRecipient(LABKEY.Message.recipientType.to, row.notify3));

                           var msgContent = 'One or more elements from the '+row.formtype+(row.title ? ' titled: \''+row.title+'\'' : '')+' have been completed: ' +
                                '<a href="'+LABKEY.ActionURL.getBaseURL()+'ehr' + LABKEY.ActionURL.getContainer() + '/requestDetails.view?requestid='+row.requestid+'&formtype='+row.formtype +
                                '">Click here to view them</a>.  <p>';

                            if(rows.length){
                                msgContent += 'The following IDs have been marked complete:<br>';
                                var req;
                                for(var j=0;j<rows.length;j++){
                                    req = rows[j];
                                    msgContent += '<a href="'+LABKEY.ActionURL.getBaseURL()+'ehr' + LABKEY.ActionURL.getContainer() + '/requestDetails.view?requestid='+row.requestid+'&formtype='+row.formtype + '">' + req.Id+'</a><br>';
                                    if(req.description){
                                        msgContent += req.description.replace(/\n/g,'<br>');
                                    }
                                    msgContent += '<p>';
                                }
                            }

                            msgContent += '<p>The requests that have been completed will say \'Completed\' in the status column.  Please do not reply directly to this email, as this account is not read.';

                            EHR.Server.Validation.sendEmail({
                                recipients: recipients,
                                msgContent: msgContent,
                                msgSubject: 'EHR '+row.formtype+' Completed',
                                notificationType: row.formtype+' Completed'
                            })
                         }
                    }
                }
            });
        }
    }

    console.log('Script time for ' + event + ' of ' + this.scriptContext.rows.length + ' rows: ' + (((new Date()) - this.scriptContext.startTime)/1000));
}
exports.complete = EHR.Server.Triggers.complete;


/**
 * This performs a set of checks shared by both beforeInsert() and beforeUpdate().  It is meant to be called internally and should not be used directly.
 * It includes the following:
 * <br>1. Converts any empty strings in the row to null
 * <br>2. Verify the format of the ID using EHR.Server.Validation.verifyIdFormat()
 * <br>3. Queries and caches the study.demographics record (if extraContext.quickValidation is not true).  If this record is found, it performes the following:
 * <br>
 * <li>If the row has a property called 'id/curlocation/location', this will be populated with the current room/cage of the animal/</li>
 * <li>Checks whether this ID exists in study.demographics and is currently located at the center.  If not, it will return an error of severity INFO.  However, if this record is a request QCState, the error will be a warning, which prevents submission.</li>
 * <br>4. If a project is provided and it is not numeric, an error is thrown
 * <br>5. If an Id, date and project are provided, it checks whether the current animal is assigned to that project on the supplied date.  This is skipped for the assignment table or if scriptContext.quickValidation is true.
 * <br>6. If Id, Date and room or cage are provided it will verify whether the animal was housed in the specified room/cage at the date provided.  This is skipped for the house & birth tables or if scriptContext.quickValidation is true.
 * <br>7. If enddate is supplied, verify it is after the start date
 * <br>8. If the QCState is 'Completed', it will not allow future dates
 * <br>9. The account will be converted to lowercase, if provided
 * <br>10. Dates more than 1 year in the future or 60 in the past will be flagged as suspicious
 * <br>11. If this record is becoming public (meaning either it is inserted as a public QCState or it is updated from a non-public QCState to a public one), then the following occurs:
 * <li>If the current row has a value for project, it will store the account associated with this record.  This is useful as the 'account at the time', since the account associated with a project could change at future dates</li>
 * <li>If the script contains a function called onBecomePublic(), it will be called with the following arguments:</li>
 * <ul>
 * <li>errors: An error object that should be used identically to the default errors object.  It is separate from LabKey's error object and handled using EHR.Server.Triggers.processErrors()</li>
 * <li>scriptContext: A map containing information about the current script session, as well as objects to track participants and requests modified in this script.
 * <li>row: The row object, as passed by LabKey</li>
 * <li>oldRow: The original row object (prior to update), as passed by LabKey</li>
 * </ul>
 *
 * @param {object} row The row object, as passed from LabKey.
 * @param {object} oldRow The original row object (prior to update), as passed from LabKey.
 * @param {object} errors The errors object, as passed from LabKey.
 */
EHR.Server.Triggers.rowInit = function(errors, row, oldRow){
    if(this.scriptContext.verbosity > 0){
        console.log('rowInit: ' + (((new Date()) - this.scriptContext.startTime)/1000));
        console.log(row);
    }

    //empty strings can do funny things, so we make them null
    for (var i in row){
        if (row[i] === ''){
            row[i] = null;
        }
    }

    //normalize these values to JS date objects
    //NOTE: it is important to only assign a value to these if they started with a value
    if (row.date)
        row.date = EHR.Server.Utils.normalizeDate(row.date);
    if (row.enddate)
        row.enddate = EHR.Server.Utils.normalizeDate(row.enddate);

    //these are extra checks to fix mySQL data
    //TODO: remove once we stop using the ETL
    if (this.scriptContext.extraContext.dataSource == 'etl'){
        if(this.scriptContext.verbosity > 0)
            console.log('Row is from ETL');

        //we ignore all errors from ETL records.  they will get flagged as review required
        this.scriptContext.errorThreshold = 'WARN';

        //this allows for individual modules to provide custom ETL code, acting per row
        if (EHR.ETL)
            EHR.ETL.fixRow.call(this, row, errors, this.scriptContext);
    }

    //check Id format
    if(this.scriptContext.extraContext.dataSource != 'etl' && !this.scriptContext.extraContext.skipIdFormatCheck){
        EHR.Server.Validation.verifyIdFormat(row, errors, this.scriptContext)
    }

    if(this.scriptContext.extraContext.dataSource != 'etl' && this.scriptContext.removeTimeFromDate)
        EHR.Server.Validation.removeTimeFromDate(row, errors);

    if(row.Id && !this.scriptContext.quickValidation && this.scriptContext.extraContext.dataSource != 'etl'){
        EHR.Server.Validation.findDemographics({
            participant: row.Id,
            scriptContext: this.scriptContext,
            scope: this,
            callback: function(data){
                if(data){
                    //certain forms display current location.  if the row has this property, but it is blank, we add it.
                    //not validation per se, but useful to forms
                    if(row.Id && row.hasOwnProperty('id/curlocation/location')){
                        var location = data["id/curlocation/room"] || '';

                        if(data["id/curlocation/cage"])
                            location += '-' + data["id/curlocation/cage"];

                        row['id/curlocation/location'] = location;
                    }

                    if(data.calculated_status != 'Alive' && !this.scriptContext.extraContext.allowAnyId){
                        if(data.calculated_status == 'Dead'){
                            if(!this.scriptContext.allowDeadIds)
                                EHR.Server.Validation.addError(errors, 'Id', 'Status of this Id is: '+data.calculated_status, 'INFO');
                        }
                        else if (data.calculated_status == 'Shipped'){
                            if(!this.scriptContext.allowShippedIds)
                                EHR.Server.Validation.addError(errors, 'Id', 'Status of this Id is: '+data.calculated_status, 'INFO');
                        }
                        else {
                            EHR.Server.Validation.addError(errors, 'Id', 'Status of this Id is: '+data.calculated_status, 'INFO');
                        }
                    }
                }
                else {
                    if(!this.scriptContext.extraContext.allowAnyId){
                        if(EHR.Server.Security.getQCStateByLabel(row.QCStateLabel).isRequest)
                            EHR.Server.Validation.addError(errors, 'Id', 'Id not found in demographics table', 'ERROR');
                        else
                            EHR.Server.Validation.addError(errors, 'Id', 'Id not found in demographics table', 'INFO');
                    }
                }
            }
        });
    }

    //validate project / assignment to that project
    //also add account if the project is found

    if(row.project && isNaN(row.project)){
        EHR.Server.Validation.addError(errors, 'project', 'Project must be numeric: '+row.project, 'ERROR');
        delete row.project;
    }

    //skip if doing assignments
    if(!this.scriptContext.quickValidation &&
        this.scriptContext.extraContext.dataSource != 'etl' &&
        row.project && row.Id && row.date &&
        row.project!=300901 && row.project!='Other' &&
        (this.scriptContext.queryName && !this.scriptContext.queryName.match(/assignment/i))
    ){
        var date = EHR.Server.Validation.dateToString(row.date);
        LABKEY.Query.executeSql({
            schemaName: 'study',
            queryName: 'assignment',
            scope: this,
            sql: "SELECT a.project, a.project.account, a.project.protocol FROM study.assignment a WHERE a.project='"+row.project+"' AND a.id='"+row.id+"' AND cast(a.date as date) <= '"+date+"' AND (cast(a.enddate as date) >= '"+date+"' OR a.enddate IS NULL) AND project.protocol!='wprc00' AND qcstate.publicdata = true",
            success: function(data){
                if(!data.rows || !data.rows.length){
                    var severity = 'WARN';
                    if(EHR.Server.Security.getQCStateByLabel(row.QCStateLabel).isRequest)
                        severity = 'INFO';

                    EHR.Server.Validation.addError(errors, 'project', 'Not assigned to '+row.project+' on this date', severity);
                    EHR.Server.Validation.addError(errors, 'project', 'The '+row.project+' is not associated with a valid protocol', severity);
                }
                else {
                    this.scriptContext.assignmentRecord = data.rows[0];
                }
            },
            failure: EHR.Server.Utils.onFailure
        });
    }

    //validate room / cage if present
    if(!this.scriptContext.quickValidation && this.scriptContext.extraContext.dataSource != 'etl' && row.room && row.Id && row.date && (this.scriptContext.queryName && !this.scriptContext.queryName.match(/housing|birth/i))){
        if(this.scriptContext.verbosity > 0)
            console.log('Verifying room/cage:');

        var sql = "SELECT h.room FROM study.housing h WHERE ";
        if(row.room)
            sql += "h.room='"+row.room+"' AND ";
        if(row.cage)
            sql += "h.cage='"+row.cage+"' AND ";

        sql += "h.id='"+row.id+"' AND h.date <= '"+row.date+"' AND (h.enddate >= '"+row.date+"' OR h.enddate IS NULL) " +
            "AND h.qcstate.publicdata = true";
        //console.log(sql)
        LABKEY.Query.executeSql({
            schemaName: 'study',
            queryName: 'housing',
            scope: this,
            sql: sql,
            success: function(data){
                if(!data.rows || !data.rows.length){
                    EHR.Server.Validation.addError(errors, 'room', 'Not housed in this room on this date', 'WARN');
                }
            },
            failure: EHR.Server.Utils.onFailure
        });
    }

    //enddate: verify either blank or not prior to date
    if(this.scriptContext.extraContext.dataSource != 'etl' && row.enddate && row.date){
        var start = row.date.getTime();
        var end = row.enddate.getTime();

        if(start > end){
            EHR.Server.Validation.addError(errors, 'enddate', 'End date must be after start date', 'WARN');
        }
    }

    //dont allow future dates on completed records
    if(row.QCStateLabel == 'Completed' && !this.scriptContext.allowFutureDates){
        var now = new Date();
        if(row.date && row.date.compareTo(now) > 0){
            EHR.Server.Validation.addError(errors, 'date', 'Date is in the future', 'INFO');
        }
    }

    //force account to lowercase
    if(row.account){
        row.account = row.account.toLowerCase();
    }

    if(row._becomingPublicData){
        //set account based on project.  do differently depending on insert/update.
        //assignmentRecord should have been cached above
        //we only do this one time when the row becomes public, b/c project/account relationships can change
        if(this.scriptContext.extraContext.dataSource != 'etl' && this.scriptContext.assignmentRecord && !row.account){
            if(this.scriptContext.verbosity > 0)
                console.log('setting account to: '+this.scriptContext.assignmentRecord.account);

            row.account = this.scriptContext.assignmentRecord.account;
        }

        if(this.onBecomePublic)
            this.onBecomePublic(errors, this.scriptContext, row, oldRow);
    }


    if(row.date){
        //flags dates more than 1 year in the future or 60 in the past
        EHR.Server.Validation.flagSuspiciousDate(row, errors);

//        if(this.scriptContext.extraContext.dataSource != 'etl'){
//            EHR.Server.Validation.verifyDate(row, errors, this.scriptContext)
//        }
    }

    if(this.scriptContext.verbosity > 0){
        console.log('rowInit end:' + (((new Date()) - this.scriptContext.startTime)/1000));
        console.log(row);
    }
};


/**
 * This performs a set of checks shared by both beforeInsert() and beforeUpdate().  It is run as the final step of each row's validation.  It should not be called directly.
 * It includes the following:
 * <br>1. If scriptContext.validateOnly is true, it will add an additional error to force the operation to fail.
 * <br>2. If will prune any errors from scriptErrors with threshold below that specified in scriptContext.errorThreshold.  This value defaults to 'WARN'.
 * <br>3.
 * <br>
 * <li>If the row has a property called 'id/curlocation/location', this will be populated with the current room/cage of the animal/</li>
 * <li>Checks whether this ID exists in study.demographics and is currently located at the center.  If not, it will return an error of severity INFO.  However, if this record is a request QCState, the error will be a warning, which prevents submission.</li>
 * <br>4. If a project is provided and it is not numeric, an error is thrown
 * <br>5. If an Id, date and project are provided, it checks whether the current animal is assigned to that project on the supplied date.  This is skipped for the assignment table or if scriptContext.quickValidation is true.
 * <br>6. If Id, Date and room or cage are provided it will verify whether the animal was housed in the specified room/cage at the date provided.  This is skipped for the house & birth tables or if scriptContext.quickValidation is true.
 *
 * @param {object} errors The errors object, as passed from LabKey.
 * @param {object} scriptErrors The errors object used during rowInit()
 * @param {object} row The row object, as passed from LabKey.
 * @param {object} oldRow The original row object (prior to update), as passed from LabKey.
 */
EHR.Server.Triggers.rowEnd = function(errors, scriptErrors, row, oldRow){
    if(this.scriptContext.verbosity > 0){
        console.log('row:');
        console.log(row);
        console.log('oldRow:');
        console.log(oldRow);
    }

    //use this flag to filters errors below a given severity
    var errorThreshold = this.scriptContext.errorThreshold || 'WARN';
    //this flag is to let records be validated, but forces failure of validation
    if(this.extraContext && this.extraContext.validateOnly){
        EHR.Server.Validation.addError(scriptErrors, '_validateOnly', 'Ignore this error');
    }

    //this converts error objects into an array of strings
    //it also separates errors below the specified threshold
    var totalErrors = EHR.Server.Validation.processErrors.call(this, row, errors, scriptErrors, errorThreshold, this.extraContext);

    if (!totalErrors){
        if(this.setDescription){
            row.description = this.setDescription(row, errors).join(',\n');
            if (row.description.length > 4000)
                row.description = row.description.substring(0, 3999);
        }
        else
            row.description = '';

        row.QCState = EHR.Server.Security.getQCStateByLabel(row.QCStateLabel).RowId || null;
    }
    else {
        row.description = [];
        for(var i in errors){
            for (var j=0;j<errors[i].length;j++){
                row.description.push(errors[i][j]);
            }

            //we want all ETL records to get imported, but flag them for review
            if (this.extraContext.dataSource == 'etl'){
                errors[i] = [];
            }
        }
        row.description = row.description.join(',\n');

        row.QCState = EHR.Server.Security.getQCStateByLabel(this.scriptContext.errorQcLabel).RowId || null;
        row.QCStateLabel = EHR.Server.Security.getQCStateByLabel(this.scriptContext.errorQcLabel).Label || null;;
    }

    if(this.scriptContext.verbosity > 0)
        console.log('QCState: '+row.QCState+'/'+row.QCStateLabel);

    //empty strings can do funny things, so we make them null
    for (var i in row){
        if (row[i] === '' || !LABKEY.ExtAdapter.isDefined(row[i])){
            row[i] = null;
        }
    }

    if (this.scriptContext.verbosity > 0 )
        console.log("New row: "+row);
};


/**
 * This primarily handles bookkeeping necessary to track event between individual rows.  The purpose is to track
 * a number of values across all the rows in a given action.  In theory this allows certain actions to be batched
 * and performed once per set of imports, rather than once per record.  This method performs the following:
 * 1. Normalizes the QCState and/or QCStateLabel (this also happened earlier in the script, but this work would be reset after the event completed)
 * 2. Adds a reference to the row and oldRow (if present) objects to this.scriptContext.rows
 * 3. If a function called afterBecomePublic() is defined, it will be called with the following arguments:
 * <li>errors: An error object that should be used identically to the default errors object.  It is separate from LabKey's error object and handled using EHR.Server.Triggers.processErrors()</li>
 * <li>scriptContext: A map containing information about the current script session, as well as objects to track participants and requests modified in this script.
 * <li>row: The row object, as passed by LabKey</li>
 * <li>oldRow: The original row object (prior to update), as passed by LabKey</li>
 * 4. If not already present, the value of row.Id will be added to the array this.scriptContext.participantsModified
 * 5. If the current QCstate is public, and if row.Id is not already present, the value of row.Id will be added to the array this.scriptContext.publicParticipantsModified
 * 6. If this.extraContext.keyField is defined, row[this.extraContext.keyField] will be appended to the array the array this.scriptContext.PKsModified
 * 7. If the current QCstate is public, and if this.extraContext.keyField is defined, row[this.extraContext.keyField] will be appended to the array the array this.scriptContext.PublicPKsModified
 * 8. If row.requestId is defined, the request Id will be added to this.scriptContext.requestsModified
 * 9. If row.requestId is defined and this request is was denied in this transaction then the requestId is added to the array at this.scriptContext.requestsDenied
 * 10. If row.requestId is defined and this request is was marked complete in this transaction then the requestId is added to the array at this.scriptContext.requestsCompleted
 * 11. If row.taskId is defined, then it is added to the array at this.scriptContext.tasksModified
 * 12. If oldRow is defined, steps 4-8 and 11 are performed using the value from oldRow.
 * @param {string} event The event, as pased from LabKey
 * @param {object} errors The errors object, as passed from LabKey.
 * @param {object} row The row object, as passed from LabKey.
 * @param {object} oldRow The original row object (prior to update), as passed from LabKey.
 * */
EHR.Server.Triggers.afterEvent = function (event, errors, row, oldRow){
    if(this.scriptContext.verbosity > 0){
        console.log('After Event: '+event);
        console.log('Time: ' + (((new Date()) - this.scriptContext.startTime)/1000));
    }
    //normalize QCState
    if(row.QCState && !row.QCStateLabel){
        row.QCStateLabel = EHR.Server.Security.getQCStateByRowId(row.QCState).Label
    }
    if(oldRow && oldRow.QCState && !oldRow.QCStateLabel){
        oldRow.QCStateLabel = EHR.Server.Security.getQCStateByRowId(oldRow.QCState).Label
    }

    //NOTE: necessary to populate the _becomingPublicData flag
    EHR.Server.Security.normalizeQcState(this.scriptContext, row, oldRow);

    if(row._becomingPublicData && this.afterBecomePublic){
        this.afterBecomePublic(errors, this.scriptContext, row, oldRow);
    }

    this.scriptContext.rows.push({
        row: row,
        oldRow: oldRow
    });

    if(this.scriptContext.participantsModified.indexOf(row.Id) == -1){
        this.scriptContext.participantsModified.push(row.Id);

        if(row.QCStateLabel && EHR.Server.Security.getQCStateByLabel(row.QCStateLabel).PublicData){
            this.scriptContext.publicParticipantsModified.push(row.Id);
        }
    }

    if(this.extraContext.keyField){
        var key = row[this.extraContext.keyField];

        if(key && this.scriptContext.PKsModified.indexOf(key) == -1){
            this.scriptContext.PKsModified.push(key);

            //if(row._publicData)
            if(row.QCStateLabel && EHR.Server.Security.getQCStateByLabel(row.QCStateLabel).PublicData)
                this.scriptContext.publicPKsModified.push(key);
        }
    }

    if(row.requestId && this.scriptContext.requestsModified.indexOf(row.requestId) == -1){
        this.scriptContext.requestsModified.push(row.requestId);
    }

    //track requests being denied
    if(row.requestId && row.QCStateLabel=='Request: Denied'){
        if(oldRow && oldRow.QCStateLabel && oldRow.QCStateLabel!='Request: Denied'){
            if(!this.scriptContext.requestsDenied[row.requestId])
                this.scriptContext.requestsDenied[row.requestId] = [];

            this.scriptContext.requestsDenied[row.requestId].push(row);
        }
    }

    //track requests being completed
    if(row.requestId && row.QCStateLabel=='Completed'){
        if(oldRow && oldRow.QCStateLabel && oldRow.QCStateLabel!='Completed'){
            if(!this.scriptContext.requestsCompleted[row.requestId])
                this.scriptContext.requestsCompleted[row.requestId] = [];

            this.scriptContext.requestsCompleted[row.requestId].push(row);
        }
    }

    if(row.taskId && this.scriptContext.tasksModified.indexOf(row.taskId) == -1){
        this.scriptContext.tasksModified.push(row.taskId);
    }

    if(oldRow){
        if(this.scriptContext.participantsModified.indexOf(oldRow.Id) == -1){
            this.scriptContext.participantsModified.push(oldRow.Id);

            //if(oldRow._publicData)
            if(oldRow.QCStateLabel && EHR.Server.Security.getQCStateByLabel(oldRow.QCStateLabel).PublicData)
                this.scriptContext.publicParticipantsModified.push(oldRow.Id);
        }

        if(this.extraContext.keyField){
            var key = oldRow[this.extraContext.keyField];
            if(key && this.scriptContext.PKsModified.indexOf(key) == -1){
                this.scriptContext.PKsModified.push(key);

                //if(oldRow._publicData)
                if(oldRow.QCStateLabel && EHR.Server.Security.getQCStateByLabel(oldRow.QCStateLabel).PublicData)
                    this.scriptContext.publicPKsModified.push(key);
            }
        }

        if(oldRow.requestId && this.scriptContext.requestsModified.indexOf(oldRow.requestId) == -1){
            this.scriptContext.requestsModified.push(oldRow.requestId);
        }

        if(oldRow.taskId && this.scriptContext.tasksModified.indexOf(oldRow.taskId) == -1){
            this.scriptContext.tasksModified.push(oldRow.taskId);
        }
    }
};

var extraScripts = org.labkey.ehr.utils.TriggerScriptHelper.getScriptsToLoad(LABKEY.Security.currentContainer.id);
LABKEY.ExtAdapter.each(extraScripts, function(script){
    script = script.replace(/^[\\\/]*scripts[\/\\]*/, '');
    script = script.replace(/\.js$/, '');

    var contents = require(script);
    if (!contents || !contents.init){
        console.error('An EHR trigger script has been registered that lacks an init() function: ' + script);
        return;
    }

    contents.init(EHR);
}, this);

/**
 *
 * @param scope
 */
EHR.Server.initScript = function(scope){
    var props = ['EHR', 'LABKEY', 'Ext', 'console', 'init', 'beforeInsert', 'afterInsert', 'beforeUpdate', 'afterUpdate', 'beforeDelete', 'afterDelete', 'complete'];
    for (var i=0;i<props.length;i++)
    {
        var prop = props[i];
        scope[prop] = exports[prop];
    }
}
exports.initScript = EHR.Server.initScript;
