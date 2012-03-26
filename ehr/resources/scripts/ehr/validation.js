/*
 * Copyright (c) 2010-2012 LabKey Corporation
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

var Ext = require("Ext").Ext;
exports.Ext = Ext;

var EHR = {};
exports.EHR = EHR;

/**
 * A namespace for server-side JS code that is used in trigger/validation scripts.
 * @namespace
 */
EHR.Server = {};

EHR.Server.Utils = require("ehr/utils").EHR.Server.Utils;

EHR.Server.Security = require("ehr/security").EHR.Server.Security;


/**
 * This class handles the serer-side validation/transform that occurs in the EHR's trigger scripts.  It should be used by every EHR dataset.  The purpose is to centralize
 * complex code into one single pathway for all incoming records.  The trigger scripts of individual records can include this code (see example script below).  This
 * replaces the default functions LabKey expects including beforeInsert, beforeUpdate, etc.  Without the dataset's trigger script, you will include this code, then
 * create functions only to handle the dataset-specific needs.  For example, the Blood Draws dataset contains extra validation that is needed prior to every insert/update.
 * As a result, this script includes an additional onUpsert() function that will get called.  The minimal code needed in each dataset's validation script is:
 * <p>
 *
 * var {EHR, LABKEY, Ext, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");
 *
 * <p>
 * This line of code will uses javascript <a href="https://developer.mozilla.org/en/New_in_JavaScript_1.7#Destructuring_assignment_(Merge_into_own_page.2Fsection)">destructuring assignment</a>
 * import to import properties of the exports object from validation.js into the desired local variables.  With one line of code you inherit all
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

    this.scriptContext = {
        rows: [],
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

    if(this.onInit)
        this.onInit.call(this, event, this.scriptContext);
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
        errors._form = 'Insufficent permissions';
        return;
    }

    EHR.Server.Triggers.rowInit.call(this, scriptErrors, row, null);

    //force newly entered requests to have future dates
    if(row.date && EHR.Server.Security.getQCStateByLabel(row.QCStateLabel)['metadata/isRequest']){
        var now = new Date();
        //if the row's date appears to be date-only, we adjust now accordingly
        if(row.date.getHours()==0 && row.date.getMinutes()==0)
            now = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        now = now.getTime();
        var rowDate = now - row.date.getTime();

        //allow a 30 second window to support inserts from other scripts
        if(rowDate > 30000){
            EHR.Server.Validation.addError(scriptErrors, 'date', 'Cannot place a request in the past', 'ERROR');
        }
    }

    //dataset-specific beforeInsert
    if(this.onUpsert)
        this.onUpsert(this.scriptContext, scriptErrors, row);
    if(this.onInsert)
        this.onInsert(this.scriptContext, scriptErrors, row);

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

    if(this.onAfterUpsert)
        this.onAfterUpsert(this.scriptContext, errors, row);
    if(this.onAfterInsert)
        this.onAfterInsert(this.scriptContext, errors, row);
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
    if(this.onUpsert)
        this.onUpsert(this.scriptContext, scriptErrors, row, oldRow);
    if(this.onUpdate)
        this.onUpdate(this.scriptContext, scriptErrors, row, oldRow);

    EHR.Server.Triggers.rowEnd.call(this, errors, scriptErrors, row, oldRow);

    //NOTE: this is designed to merge the old row into the new one.
    for (var prop in oldRow){
        if(!row.hasOwnProperty(prop) && Ext.isDefined(oldRow[prop])){
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

    if(this.onAfterUpsert)
        this.onAfterUpsert(this.scriptContext, errors, row, oldRow);
    if(this.onAfterUpdate)
        this.onAfterUpdate(this.scriptContext, errors, row, oldRow);
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

    if(this.onDelete)
        this.onDelete(errors, this.scriptContext, row);
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

    if(this.scriptContext.extraContext.dataSource != 'etl' && this.onAfterDelete)
        this.onAfterDelete(this.scriptContext, errors, row);
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

    if(this.onComplete)
        this.onComplete(event, errors, this.scriptContext);

    //send emails. query notificationRecipients table based on notification type(s)
    if(this.scriptContext.notificationTypes){
        //NOTE: this is being handled by each dataset's script, if needed
    }

    if(this.scriptContext.notificationRecipients && !Ext.isEmpty(this.scriptContext.notificationRecipients)){
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
        console.log('rowInit');
        console.log(row);
    }

    //empty strings can do funny things, so we make them null
    for (var i in row){
        if (row[i] === ''){
            row[i] = null;
        }
    }

    //these are extra checks to fix mySQL data
    //@depreciated
    //should be removed from this code at some point
    if (this.scriptContext.extraContext.dataSource == 'etl'){
        if(this.scriptContext.verbosity > 0)
            console.log('Row from ETL');

        //we ignore all errors from ETL records.  they will get flagged as review required
        this.scriptContext.errorThreshold = 'FATAL';
        EHR.ETL.fixRow.call(this, row, errors);
    }

    //check Id format
    if(this.scriptContext.extraContext.dataSource != 'etl'){
        EHR.Server.Validation.verifyIdFormat(row, errors, this.scriptContext)
    }

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

                    if(data.calculated_status != 'Alive' && !this.scriptContext.allowAnyId){
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
                    if(!this.scriptContext.allowAnyId){
                        if(EHR.Server.Security.getQCStateByLabel(row.QCStateLabel)['metadata/isRequest'])
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
                    if(EHR.Server.Security.getQCStateByLabel(row.QCStateLabel)['metadata/isRequest'])
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
        var start = Date.parse(row.date.toGMTString());
        var end = Date.parse(row.enddate.toGMTString());

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
        console.log('rowInit end:');
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
        console.log('rowEnd start:');
        console.log(row);
    }

    //use this flag to filters errors below a given severity
    var errorThreshold = this.scriptContext.errorThreshold || 'WARN';

    //this flag is to let records be validated, but forces failure of validation
    if(this.extraContext && this.extraContext.validateOnly){
        //console.log('validate only')
        EHR.Server.Validation.addError(scriptErrors, '_validateOnly', 'Ignore this error');
    }

    //this converts error objects into an array of strings
    //it also separates errors below the specified threshold
    var totalErrors = EHR.Server.Validation.processErrors.call(this, row, errors, scriptErrors, errorThreshold, this.extraContext);

    if (!totalErrors){
        if(this.setDescription){
            row.Description = this.setDescription(row, errors).join(',\n');
            if (row.Description.length > 4000)
                row.Description = row.Description.substring(0, 3999);
        }
        else
            row.Description = '';

        row.QCState = EHR.Server.Security.getQCStateByLabel(row.QCStateLabel).RowId || null;
    }
    else {
        row.Description = [];
        for(var i in errors){
            for (var j=0;j<errors[i].length;j++){
                row.Description.push(errors[i][j]);
            }
        }
        row.Description = row.Description.join(',\n');
        row.QCState = EHR.Server.Security.getQCStateByLabel(this.scriptContext.errorQcLabel).RowId || null;
    }

    if(this.scriptContext.verbosity > 0)
        console.log('QCState: '+row.QCState+'/'+row.QCStateLabel);

    //empty strings can do funny things, so we make them null
    for (var i in row){
        if (row[i] === '' || !Ext.isDefined(row[i])){
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
    if(this.scriptContext.verbosity > 0)
        console.log('After Event: '+event);

    //normalize QCState
    if(row.QCState && !row.QCStateLabel){
        row.QCStateLabel = EHR.Server.Security.getQCStateByRowId(row.QCState).Label
    }
    if(oldRow && oldRow.QCState && !oldRow.QCStateLabel){
        oldRow.QCStateLabel = EHR.Server.Security.getQCStateByRowId(oldRow.QCState).Label
    }

    this.scriptContext.rows.push({
        row: row,
        oldRow: oldRow
    });

    if(row._becomingPublicData && this.afterBecomePublic){
        this.afterBecomePublic(errors, this.scriptContext, row, oldRow);
    }

    if(this.scriptContext.participantsModified.indexOf(row.Id) == -1){
        this.scriptContext.participantsModified.push(row.Id);

        //if(row._publicData){
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


/**
 * This class contains static methods used for server-side validation of incoming data.
 * @class
 */
EHR.Server.Validation = {
    /**
     * A helper that adds an error if restraint is used, but no time is entered
     * @param row The row object
     * @param errors The errors object
     */
    checkRestraint: function(row, errors){
        if(row.restraint && !Ext.isDefined(row.restraintDuration))
            EHR.Server.Validation.addError(errors, 'restraintDuration', 'Must enter time restrained', 'INFO');

    },
    /**
     * A helper used to process errors generated internally in EHR.Server.Triggers into the errors object returned to LabKey.  Primarily used internally by rowEnd()
     * @param row The row object, provided by LabKey
     * @param errors The errors object, provided by LabKey
     * @param scriptErrors The errors object passed internally in rowEnd()
     * @param errorThreshold Any errors below this threshold will be discarded.  Should match a value from EHR.Server.Validation.errorSeverity
     * @param extraContext The extraContext object provided by LabKey.
     */
    processErrors: function(row, errors, scriptErrors, errorThreshold, extraContext){
        var error;
        var totalErrors = 0;

        //extraContext will be roundtripped  back to the client
        if(!extraContext.skippedErrors){
            extraContext.skippedErrors = {};
        }

        for(var i in scriptErrors){
            for(var j=0;j<scriptErrors[i].length;j++){
                error = scriptErrors[i][j];

                if (errorThreshold && EHR.Server.Validation.errorSeverity[error.severity] <= EHR.Server.Validation.errorSeverity[errorThreshold]){
                    //console.log('error below threshold');
                    if(row._recordid){
                        if(!extraContext.skippedErrors[row._recordid])
                            extraContext.skippedErrors[row._recordid] = [];

                        error.field = i;
                        extraContext.skippedErrors[row._recordid].push(error);
                        //console.log('skipping error')
                    }
                    continue;
                }

                if(!errors[i])
                    errors[i] = {};

                errors[i].push(error.severity+': '+error.message);
                totalErrors++;

                if(extraContext.dataSource == 'etl'){
                    console.log('ETL ERROR');
                    console.log(error.message);
                    console.log(row);
                }
            }
        }

        return totalErrors;
    },
    /**
     * Assigns numeric values to error severity strings
     * @private
     */
    errorSeverity: {
        DEBUG: 0,
        INFO: 1,
        WARN: 2,
        ERROR: 3,
        FATAL: 4
    },
    /**
     * A helper that adds an error if an antibiotic sensitivity is provided without the antibiotic name
     * @param row The row object
     * @param errors The errors object
     */
    antibioticSens: function(row, errors){
        if (row.sensitivity && row.antibiotic == null){
            row.antibiotic = 'Unknown';
            EHR.Server.Validation.addError(errors, '_form', 'Row has sensitivity, but no antibiotic', 'WARN');
        }
    },
    /**
     * A helper to remove the time-portion of a datetime field.
     * @param row The row object
     * @param errors The errors object
     * @param fieldname The name of the field from which to remove the time portion
     */
    removeTimeFromDate: function(row, errors, fieldname){
        fieldname = fieldname || 'date';
        var date = row[fieldname];

        if(!date){
            return;
        }

        //normalize to a javascript date object
        date = new Date(date.getTime());
        row[fieldname] = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    },
    /**
     * A helper to return a display string based on a SNOMED code.  It will normally display the meaning of the code, followed by the code in parenthesis.
     * @param code The SNOMED code
     * @param meaning The meaning.  This is optional and will be queried if not present.  However, if the incoming row has the meaning, this saves overhead.
     */
    snomedToString: function (code, meaning){
        if(!meaning){
            LABKEY.Query.selectRows({
                schemaName: 'ehr_lookups',
                queryName: 'snomed',
                filterArray: [LABKEY.Filter.create('code', code, LABKEY.Filter.Types.EQUALS_ONE_OF)],
                columns: 'meaning',
                scope: this,
                success: function(data){
                    if(data.rows && data.rows.length){
                        meaning = data.rows[0].meaning;
                    }
                },
                failure: EHR.Server.Utils.onFailure
            });
        }

        return meaning ? meaning+(code ? ' ('+code+')' : '') : (code ? code : '');
    },
    /**
     * A helper that will verify the ID format of an animal ID based on known regular expressions
     * @param row The row object
     * @param errors The errors object
     * @param scriptContext The scriptContext object.  See rowInit()
     */
    verifyIdFormat: function(row, errors, scriptContext){
        if(row.Id){
            var species = EHR.Server.Validation.getSpecies(row, errors);

            if(species == 'Unknown'){
                EHR.Server.Validation.addError(errors, 'Id', 'Invalid Id Format', 'INFO');
            }
            else if (species == 'Infant') {
                species = null;
            }

            row.species = row.species || species;
        }
    },
    /**
     * A helper to convert a date object into a display string.  By default is will use YYYY-mm-dd.
     * @param date The date to convert
     * @returns {string} The display string for this date or an empty string if unable to convert
     */
    dateToString: function (date){
        //TODO: do better once more date functions added
        if(date){
            date = new Date(date.toGMTString());
            return (date.getFullYear() ? date.getFullYear()+'-'+EHR.Server.Validation.padDigits(date.getMonth()+1, 2)+'-'+EHR.Server.Validation.padDigits(date.getDate(), 2) : '');
        }
        else
            return '';
    },
    /**
     * A helper to convert a datetime object into a display string.  By default is will use YYYY-mm-dd H:m.
     * @param date The date to convert
     * @returns {string} The display string for this date or an empty string if unable to convert
     */
    dateTimeToString: function (date){
        if(date){
            date = new Date(date.toGMTString());
            return date.getFullYear()+'-'+EHR.Server.Validation.padDigits(date.getMonth()+1, 2)+'-'+EHR.Server.Validation.padDigits(date.getDate(), 2) + ' '+EHR.Server.Validation.padDigits(date.getHours(),2)+':'+EHR.Server.Validation.padDigits(date.getMinutes(),2);
        }
        else
            return '';
    },
    /**
     * Converts an input value into a display string.  Used to generate description fields when the input value could potentially be null.
     * @param value The value to convert
     * @returns {string} The string value or an empty string
     */
    nullToString: function(value){
            return (value ? value : '');
    },
    /**
     * A utility that will take an input value and pad with left-hand zeros until the string is of the desired length
     * @param {number} n The input number
     * @param {integer} totalDigits The desired length of the string.  The input will be padded with zeros until it reaches this length
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
     * A helper that will find the next available necropsy or biopsy case number, based on the desired year and type of procedure.
     * @param row The labkey row object
     * @param errors The errors object
     * @param table The queryName (Necropies or Biopsies) to search
     * @param procedureType The single character identifier for the type of procedure.  At time of writing, these were b, c or n.
     */
    calculateCaseno: function(row, errors, table, procedureType){
        var year = row.date.getYear()+1900;
        LABKEY.Query.executeSql({
            schemaName: 'study',
            sql: "SELECT cast(SUBSTRING(MAX(caseno), 6, 8) AS INTEGER) as caseno FROM study."+table+" WHERE caseno LIKE '" + year + procedureType + "%'",
            scope: this,
            success: function(data){
                if(data && data.rows && data.rows.length==1){
                    var caseno = data.rows[0].caseno || 1;
                    caseno++;
                    caseno = EHR.Server.Validation.padDigits(caseno, 3);
                    row.caseno = year + procedureType + caseno;
                }
            },
            failure: EHR.Server.Utils.onFailure
        });

    },
    /**
     * A helper that will verify whether the caseno on the provided row is unique in the given table.
     * @param context The scriptContext object (see rowInit()).  This is used to identify the queryName.
     * @param row The row object, provided by LabKey
     * @param errors The errors object, provided by LabKey
     */
    verifyCasenoIsUnique: function(context, row, errors){
        //find any existing rows with the same caseno
        var filterArray = [
            LABKEY.Filter.create('caseno', row.caseno, LABKEY.Filter.Types.EQUAL)
        ];
        if(row.lsid)
            filterArray.push(LABKEY.Filter.create('lsid', row.lsid, LABKEY.Filter.Types.NOT_EQUAL));

        LABKEY.Query.selectRows({
            schemaName: context.extraContext.schemaName,
            queryName: context.extraContext.queryName,
            filterArray: filterArray,
            scope: this,
            success: function(data){
                if(data && data.rows && data.rows.length){
                    EHR.Server.Validation.addError(errors, 'caseno', 'One or more records already uses the caseno: '+row.caseno, 'INFO');
                }
            },
            failure: EHR.Server.Utils.onFailure
        });
    },
    /**
     * A helper that will flag a date if it is in the future (unless the QCState allows them) or if it is a QCState of 'Scheduled' and has a date in the past.
     * @param row The row object, provided by LabKey
     * @param errors The errors object, provided by LabKey
     * @param scriptContext The scriptContext object created in rowInit()
     */
    verifyDate: function(row, errors, scriptContext){
        if(!row.date)
            return;

        if(typeof(row.Date) == 'string'){
            row.Date = new java.util.Date(java.util.Date.parse(row.Date));
        }

        //find if the date is greater than now
        var cal1 = new java.util.GregorianCalendar();
        var cal2 = new java.util.GregorianCalendar();
        cal2.setTime(row.Date);

        if(!scriptContext.extraContext.validateOnly && cal2.after(cal1) && !EHR.Server.Security.getQCStateByLabel(row.QCStateLabel)['metadata/allowFutureDates']){
            EHR.Server.Validation.addError(errors, 'date', 'Date is in future', 'ERROR');
        }

        if(!cal1.after(cal2) && row.QCStateLabel == 'Scheduled'){
            EHR.Server.Validation.addError(errors, 'date', 'Date is in past, but is scheduled', 'ERROR');
        }
    },
    /**
     * A helper that will flag any dates more than 1 year in the future or 60 days in the past.
     * @param row The row object, provided by LabKey
     * @param errors The errors object, provided by LabKey
     */
    flagSuspiciousDate: function(row, errors){
        if(!row.date)
            return;

        var date = row.Date;
        if(typeof(row.Date) == 'string'){
            console.log('Date being passed as a string to EHR.Server.Validation.flagSuspiciousDate()');
            date = new java.util.Date(java.util.Date.parse(row.Date));
        }

        //flag any dates greater than 1 year from now
        var cal1 = new java.util.GregorianCalendar();
        cal1.add(java.util.Calendar.YEAR, 1);
        var cal2 = new java.util.GregorianCalendar();
        cal2.setTime(date);

        if(cal2.after(cal1)){
            EHR.Server.Validation.addError(errors, 'date', 'Date is more than 1 year in future', 'WARN');
        }

        cal1.add(java.util.Calendar.YEAR, -61);
        if(cal1.after(cal2)){
            EHR.Server.Validation.addError(errors, 'date', 'Date is more than 60 days in past', 'WARN');
        }
    },
    /**
     * A helper that will infer the species based on regular expression patterns and the animal ID
     * @param row The row object, provided by LabKey
     * @param errors The errors object, provided by LabKey
     */
    getSpecies: function(row, errors){
        var species;
        if (row.Id.match(/(^rh([0-9]{4})$)|(^r([0-9]{5})$)|(^rh-([0-9]{3})$)|(^rh[a-z]{2}([0-9]{2})$)/))
        //if (row.Id.match(/(^rh([0-9]{4})$)|(^r([0-9]{5})$)/))
            species = 'Rhesus';
        else if (row.Id.match(/^cy([0-9]{4})$/))
            species = 'Cynomolgus';
        else if (row.Id.match(/^ag([0-9]{4})$/))
            species = 'Vervet';
        else if (row.Id.match(/^cj([0-9]{4})$/))
            species = 'Marmoset';
        else if (row.Id.match(/^so([0-9]{4})$/))
            species = 'Cotton-top Tamarin';
        else if (row.Id.match(/^pt([0-9]{4})$/))
            species = 'Pigtail';
        else if (row.Id.match(/^pd([0-9]{4})$/))
            species = 'Infant';

        //these are to handle legacy data:
        else if (row.Id.match(/(^rha([a-z]{1})([0-9]{2}))$/))
            species = 'Rhesus';
        else if (row.Id.match(/(^rh-([a-z]{1})([0-9]{2}))$/))
            species = 'Rhesus';
        else if (row.Id.match(/^cja([0-9]{3})$/))
            species = 'Marmoset';
        else if (row.Id.match(/^m([0-9]{5})$/))
            species = 'Marmoset';
        else if (row.Id.match(/^tx([0-9]{4})$/))
            species = 'Marmoset';
        //and this is to handle automated tests
        else if (row.Id.match(/^test[0-9]+$/))
            species = 'Rhesus';

        else
            species = 'Unknown';

        return species;
    },
    /**
     * A helper that will verify that the ID located in the specified field is female.
     * @param row The row object, provided by LabKey
     * @param errors The errors object, provided by LabKey
     * @param targetField The field containing the ID string to verify.
     */
    verifyIsFemale: function(row, errors, targetField){
        LABKEY.Query.selectRows({
            schemaName: 'study',
            queryName: 'demographics',
            filterArray: [
                LABKEY.Filter.create('Id', row.Id, LABKEY.Filter.Types.EQUAL)
            ],
            columns: 'Id,gender/origGender',
            success: function(data){
                if(data && data.rows && data.rows.length){
                    if(data.rows[0]['gender/origGender'] && data.rows[0]['gender/origGender'] != 'f')
                        EHR.Server.Validation.addError(errors, (targetField || 'Id'), 'This animal is not female', 'ERROR');
                }
            },
            failure: EHR.Server.Utils.onFailure
        });
    },
    /**
     * This is a helper designed to recalculate and update the value for calculatedStatus in study.demographics.  The value of this
     * field depends on the birth, death, arrivals and departures.  It is stored as a quick method to identify which animals are currently
     * alive and at the center.  Because animals can arrive or depart multiple times in their lives, this is more difficult than you might think.
     * Because a given transaction could have more than 1 row modified, we cache a list of modified participants and only run this once during
     * the complete() handler.
     * @param publicParticipantsModified The array of public (based on QCState) participants that were modified during this transaction.
     * @param demographicsRow If called from the demographics query, we pass the current row.  This is because selectRows() will run as a separate transaction and would not pick up changes made during this transaction.
     * @param valuesMap If the current query is death, arrival, departure or birth, the values updated in this transaction will not appear for the calls to selectRows() (this is run in a separate transaction i believe).  Therefore we provide a mechanism for these scripts to pass in the values of their current row, which will be used instead.
     */
    updateStatusField: function(publicParticipantsModified, demographicsRow, valuesMap){
        var toUpdate = [];
        var demographics = {};
        Ext.each(publicParticipantsModified, function(id){
            demographics[id] = {};
        });

        //NOTE: to improve efficiency when only 1 animal is present, we define the WHERE logic here:
        var whereClause;
        if(publicParticipantsModified.length==1)
            whereClause = "= '"+publicParticipantsModified[0]+"'";
        else
            whereClause = "IN ('"+(publicParticipantsModified.join(','))+"')";


        //we gather the pieces of information needed to calculate the status field
        LABKEY.Query.executeSql({
            schemaName: 'study',
            sql: "select T1.Id, max(T1.date) as MostRecentArrival FROM study.arrival T1 WHERE T1.id "+whereClause+" AND T1.qcstate.publicdata = true GROUP BY T1.Id",
            scope: this,
            success: function(data){
                if(!data.rows.length){
                    //console.log('No rows returned for mostRecentArrival');
                    return
                }

                Ext.each(data.rows, function(r){
                    if(r.MostRecentArrival)
                        demographics[r.Id].arrival = new Date(r.MostRecentArrival);
                }, this);
            },
            failure: EHR.Server.Utils.onFailure
        });

        LABKEY.Query.executeSql({
            schemaName: 'study',
            sql: "select T1.Id, max(T1.date) as MostRecentDeparture FROM study.departure T1 WHERE T1.id "+whereClause+" AND T1.qcstate.publicdata = true GROUP BY T1.Id",
            scope: this,
            success: function(data){
                if(!data.rows.length){
                    //console.log('No rows returned for mostRecentDeparture');
                    return;
                }

                Ext.each(data.rows, function(r){
                    if(r.MostRecentDeparture)
                        demographics[r.Id].departure = new Date(r.MostRecentDeparture);
                }, this);
            },
            failure: EHR.Server.Utils.onFailure
        });

        LABKEY.Query.executeSql({
            schemaName: 'study',
            sql: "select T1.Id, T1.birth, T1.death, T1.calculated_status, T1.lsid FROM study.demographics T1 WHERE T1.id "+whereClause,
            scope: this,
            success: function(data){
                if(!data.rows.length){
                    //TODO: maybe throw flag/email to alert colony records?
                    return
                }

                Ext.each(data.rows, function(r){
                    if(r.birth)
                        demographics[r.Id].birth = new Date(r.birth);
                    if(r.death)
                        demographics[r.Id].death = new Date(r.death);

                    demographics[r.Id].lsid = r.lsid;
                    demographics[r.Id].calculated_status = r.calculated_status;
                }, this);
            },
            failure: EHR.Server.Utils.onFailure
        });

        //NOTE: the ETL acts by deleting / inserting.
        //this means the demographics row does not exist for cases when a update happens.
        //therefore we re-query birth / death directly
        LABKEY.Query.executeSql({
            schemaName: 'study',
            sql: "select T1.Id, max(T1.date) as date FROM study.birth T1 WHERE T1.id "+whereClause+" AND T1.qcstate.publicdata = true GROUP BY T1.Id",
            scope: this,
            success: function(data){
                if(!data.rows.length){
                    return;
                }

                Ext.each(data.rows, function(r){
                    if(demographics[r.Id].birth && demographics[r.Id].birth.toGMTString() != (new Date(r.date)).toGMTString()){
                        console.log('birth from study.birth doesnt match demographics.birth for: '+r.Id);
                        console.log(demographics[r.Id].birth);
                        console.log(new Date(r.date));
                    }

                    if(r.date)
                           demographics[r.Id].birth = new Date(r.date);
                }, this);
            },
            failure: EHR.Server.Utils.onFailure
        });
        LABKEY.Query.executeSql({
            schemaName: 'study',
            sql: "select T1.Id, max(T1.date) as date FROM study.deaths T1 WHERE T1.id "+whereClause+" AND T1.qcstate.publicdata = true GROUP BY T1.Id",
            scope: this,
            success: function(data){
                if(!data.rows.length){
                    return;
                }
                Ext.each(data.rows, function(r){
                    //var demographicsDeath = demographics[r.Id].death;
                    if(demographics[r.Id].death && demographics[r.Id].death.toGMTString() != (new Date(r.date)).toGMTString()){
                        console.log('death doesnt match for: '+r.Id);
                        console.log(demographics[r.Id].birth);
                        console.log(new Date(r.date));
                    }

                    if(r.date)
                        demographics[r.Id].death = new Date(r.date);
                }, this);
            },
            failure: EHR.Server.Utils.onFailure
        });

        Ext.each(publicParticipantsModified, function(id){
            var status;
            var forceUpdate = false;

            var r = demographics[id];

            //when called by birth or death, we allow the script to pass in
            //the values of the rows being changed
            //this saves a duplicate insert/update on demographics
            if(valuesMap && valuesMap[id]){
                if(valuesMap[id].birth && valuesMap[id].birth != r.birth){
                    r.birth = valuesMap[id].birth;
                    r.updateBirth = true;
                    forceUpdate = true;
                }

                if(valuesMap[id].death && valuesMap[id].death != r.death){
                    r.death = valuesMap[id].death;
                    r.updateDeath = true;
                    forceUpdate = true;
                }
            }

            if (r['death'])
                status = 'Dead';
            else if (r['departure'] && (!r['arrival'] || r['departure'] > r['arrival']))
                status = 'Shipped';
            else if ((r['birth'] || r['arrival']) && (!r['departure'] || r['departure'] < r['arrival']))
                status = 'Alive';
            else if (!r['birth'] && !r['arrival'])
                status = 'No Record';
            else
                status = 'ERROR';

            //console.log('Id: '+id+'/ status: '+status);

            //NOTE: this is only used when called by the demographics validation script,
            // which passes the row object directly, instead of using updateRows below
            if(demographicsRow && id == demographicsRow.Id){
                demographicsRow.calculated_status = status;
                return demographicsRow;
            }

//            console.log('status: '+status);
//            console.log('forceUpdate: '+forceUpdate);
//            console.log('calc status: '+r.calculated_status);
            if(status != r.calculated_status || forceUpdate){
                //the following means no record exists in study.demographics for this ID
                if(!r.lsid){
                    return;
                }

                var newRow = {Id: id, lsid: r.lsid, calculated_status: status};

                if(r.updateBirth)
                    newRow.birth = new Date(r.birth.toGMTString());
                if(r.updateDeath)
                    newRow.death = new Date(r.death.toGMTString());

                toUpdate.push(newRow);
            }
        }, this);
        //console.log('to update: '+toUpdate.length);
        if(toUpdate.length && !demographicsRow){
            LABKEY.Query.updateRows({
                schemaName: 'study',
                queryName: 'Demographics',
                rows: toUpdate,
                scope: this,
                extraContext: {
                    quickValidation: true
                },
                success: function(data){
                    console.log('Success updating demographics status field');
                },
                failure: EHR.Server.Utils.onFailure
            });
        }
    },
    /**
     * A helper that will return and cache the row in study.demographics for the provided animal.  These rows are stored in scriptContext.demographicsMap,
     * so subsequent calls do not need to hit the server.
     * @param config The configuration object
     * @param [config.participant] The participant (aka animal ID) to return
     * @param [config.callback] The success callback function
     * @param [config.scope] The scope to use for the callback
     * @param [config.scriptContext] The scriptContext object created in rowInit()
     */
    findDemographics: function(config){
        if(!config || !config.participant || !config.callback || !config.scope){
            EHR.Server.Utils.onFailure({
                msg: 'Error in EHR.Server.Validation.findDemographics(): missing Id, scope or callback'
            });
            throw 'Error in EHR.Server.Validation.findDemographics(): missing Id, scope or callback';
        }
        var scriptContext = config.scriptContext || config.scope.scriptContext;

        if(!scriptContext){
            throw "Error in EHR.Server.Validation.findDemographics(): No scriptContext provided";
        }

        if(scriptContext.demographicsMap[config.participant] && !config.forceRefresh){
            config.callback.apply(config.scope || this, [scriptContext.demographicsMap[config.participant]])
        }
        else {
            LABKEY.Query.selectRows({
                schemaName: 'study',
                queryName: 'demographics',
                columns: 'lsid,Id,birth,death,species,dam,calculated_status,sire,id/curlocation/room,id/curlocation/cage',
                scope: this,
                filterArray: [LABKEY.Filter.create('Id', config.participant, LABKEY.Filter.Types.EQUAL)],
                success: function(data){
                    if(data && data.rows && data.rows.length==1){
                        var row = data.rows[0];
                        scriptContext.demographicsMap[row.Id] = row;
                        config.callback.apply(config.scope || this, [scriptContext.demographicsMap[row.Id]]);
                    }
                    else {
                        if(scriptContext.missingParticipants.indexOf(config.participant) == -1)
                            scriptContext.missingParticipants.push(config.participant);

                        config.callback.apply(config.scope || this);
                    }
                },
                failure: EHR.Server.Utils.onFailure
            });
        }
    },
    /**
     * A helper designed to simplify appending errors to the error object.  You should exclusively use this to append errors rather than interacting with the error object directly.
     * @param {object} errors The errors object.  In most cases, this is the scriptErrors object passed internally within rowInit(), not the labkey-provided errors object.
     * @param {string}field The name of the field for which to add the error.  Treat as case-sensitive, because client-side code will be case-sensitive.
     * @param {string} msg The message associated with this error
     * @param {string} severity The error severity.  Should match a value from EHR.Server.Validation.errorSeverities.
     */
    addError: function(errors, field, msg, severity){
        if(!errors[field])
            errors[field] = [];

        errors[field].push({
            message: msg,
            severity: severity || 'ERROR'
        });
    },
    /**
     * When an animal dies or leaves the center, this will close any open records (ie. the death/depart time inserted into the enddate field) for any records in assignment, housing, problem list and treatment orders.
     * @param participant The Id of the participant
     * @param date The date of the event.
     */
    onDeathDeparture: function(participant, date){
        //close housing, assignments, treatments
        closeRecord('Assignment');
        closeRecord('Housing');
        closeRecord('Treatment Orders');
        closeRecord('Problem List');

        function closeRecord(queryName){
            LABKEY.Query.selectRows({
                schemaName: 'study',
                queryName: queryName,
                columns: 'lsid,Id',
                scope: this,
                extraContext: {
                    quickValidation: true
                },
                filterArray: [
                    LABKEY.Filter.create('Id', participant, LABKEY.Filter.Types.EQUAL),
                    LABKEY.Filter.create('enddate', '', LABKEY.Filter.Types.ISBLANK)
                ],
                success: function(data){
                    if(data && data.rows && data.rows.length){
                        var toUpdate = [];
                        //console.log(data.rows.length);
                        Ext.each(data.rows, function(r){
                            toUpdate.push({lsid: r.lsid, enddate: date.toGMTString()})
                        }, this);

                        LABKEY.Query.updateRows({
                            schemaName: 'study',
                            queryName: queryName,
                            rows: toUpdate,
                            extraContext: {
                                quickValidation: true
                            },
                            scope: this,
                            failure: EHR.Server.Utils.onFailure,
                            success: function(data){
                                console.log('Success closing '+queryName+' records: '+toUpdate.length);
                            }
                        });
                    }
                },
                failure: EHR.Server.Utils.onFailure
            });
        }
    },
    /**
     * A helper for sending emails from validation scripts that wraps LABKEY.Message.  The primary purpose is that this allows emails to be sent based on EHR notification types (see ehr.notificationtypes table).  Any emails should use this helper.
     * @param config The configuration object
     * {Array} [config.recipients] An array of recipient object to receive this email.  The should have been created using LABKEY.Message.createRecipient() or LABKEY.Message.createPrincipalIdRecipient()
     * {String} [config.notificationType] The notificationType to use, which should match a record in ehr.notificationtypes.  If provided, any users/groups 'subscribed' to this notification type (ie. containing a record in ehr.notificationrecipients for this notification type) will receive this email.
     * {String} [config.msgFrom] The email address from which to send this message
     * {String} [config.msgSubject] The subject line of the email
     * {String} [config.msgContent] The content for the body of this email
     */
    sendEmail: function(config){
        console.log('Sending emails');

        if(!config.recipients)
            config.recipients = [];

        if(config.notificationType){
            LABKEY.Query.selectRows({
                schemaName: 'ehr',
                queryName: 'notificationRecipients',
                filterArray: [LABKEY.Filter.create('notificationType', config.notificationType, LABKEY.Filter.Types.EQUAL)],
                success: function(data){
                    for(var i=0;i<data.rows.length;i++){
                        config.recipients.push(LABKEY.Message.createPrincipalIdRecipient(LABKEY.Message.recipientType.to, data.rows[i].recipient));
//                    console.log('Recipient: '+data.rows[i].recipient);
                    }
                },
                failure: EHR.Server.Utils.onFailure
            });
        }

        console.log('This email has ' + config.recipients.length + ' recipients');
        if(config.recipients.length){
            var siteEmail = config.msgFrom;
            if(!siteEmail){
                LABKEY.Query.selectRows({
                    schemaName: 'ehr',
                    queryName: 'module_properties',
                    scope: this,
                    filterArray: [LABKEY.Filter.create('prop_name', 'site_email', LABKEY.Filter.Types.EQUAL)],
                    success: function(data){
                        if(data && data.rows && data.rows.length){
                            siteEmail = data.rows[0].stringvalue;
                        }
                    },
                    failure: EHR.Server.Utils.onFailure
                });
            }

            if(!siteEmail){
                console.log('ERROR: site email not found');
                EHR.Server.Validation.logError({msg: 'ERROR: site email not found'});
            }

            LABKEY.Message.sendMessage({
                msgFrom: siteEmail,
                msgSubject: config.msgSubject,
                msgRecipients: config.recipients,
                allowUnregisteredUser: true,
                msgContent: [
                    LABKEY.Message.createMsgContent(LABKEY.Message.msgType.html, config.msgContent)
                ],
                success: function(){
                    console.log('Success sending emails');
                },
                failure: EHR.Server.Utils.onFailure
            });
        }
    }
};



/**
 * @depreciated
 * This was originally used to transform data being imported from the legacy mySQL system.
 * It should be written out of the validation script at some point.
 */
EHR.ETL = {
    fixRow: function(row, errors){
        //inserts a date if missing
        EHR.ETL.addDate(row, errors);

        EHR.ETL.fixParticipantId(row, errors);

        if (row.project)
            EHR.ETL.fixProject(row, errors);

        //allows dataset-specific code
        if(this.onETL)
            this.onETL(row, errors);

        if(this.scriptContext.verbosity > 0)
            console.log('Repaired: '+row);
    },
    fixProject: function(row, errors){
        //sort of a hack.  since mySQL doesnt directly store project for these records, we need to calculate this in the ETL using group_concat
        // 00300901 is a generic WNPRC project.  if it's present with other projects, it shouldnt be.
        if(row.project && row.project.match && (row.project.match(/,/))){
            row.project = row.project.replace(/,00300901/, '');
            row.project = row.project.replace(/00300901,/, '');
        }

        //i think the ETL can return project as a string
        if (row.project && !/^\d*$/.test(row.project)){
            EHR.Server.Validation.addError(errors, 'project', 'Bad Project#: '+row.project, 'ERROR');
            row.project = null;
            //row.QCStateLabel = errorQC;
        }
    },
    fixParticipantId: function (row, errors){
        if (row.hasOwnProperty('Id') && !row.Id){
            row.id = 'MISSING';
            EHR.Server.Validation.addError(errors, 'Id', 'Missing Id', 'ERROR');
        }
    },
    addDate: function (row, errors){
        if (row.hasOwnProperty('date') && !row.Date){
            //row will fail unless we add something in this field
            row.date = new java.util.Date();

            EHR.Server.Validation.addError(errors, 'date', 'Missing Date', 'ERROR');
        }
    },
    fixPathCaseNo: function(row, errors, code){
        //we try to clean up the biopsy ID
        var re = new RegExp('([0-9]+)('+code+')([0-9]+)', 'i');

        var match = row.caseno.match(re);
        if (!match){
            EHR.Server.Validation.addError(errors, 'caseno', 'Error in CaseNo: '+row.caseno, 'WARN');
            //row.QCStateLabel = errorQC;
        }
        else {
            //fix the year
            if (match[1].length == 2){
                if (match[1] < 20)
                    match[1] = '20' + match[1];
                else
                    match[1] = '19' + match[1];
            }
            else if (match[1].length == 4){
                //these values are ok
            }
            else {
                EHR.Server.Validation.addError(errors, 'caseno', 'Unsure how to correct year in CaseNo: '+match[1], 'WARN');
                //row.QCStateLabel = errorQC;
            }

            //standardize number to 3 digits
            if (match[3].length != 3){
                var tmp = match[3];
                for (var i=0;i<(3-match[3].length);i++){
                    tmp = '0' + tmp;
                }
                match[3] = tmp;
            }

            row.caseno = match[1] + match[2] + match[3];
        }

    },
    fixChemValue: function(row, errors){
        //we try to remove non-numeric characters from this field
        if (row.stringResults && !row.stringResults.match(/^[0-9]*$/)){
            //we need to manually split these into multiple rows

            if (row.stringResults.match(/,/) && row.stringResults.match(/[0-9]/)){
                EHR.Server.Validation.addError(errors, 'result', 'Problem with result: ' + row.stringResults, 'WARN');
                row.stringResults = null;
                //row.QCStateLabel = errorQC;
            }
            else {
                //did not find other strings in data
                row.stringResults = row.stringResults.replace('less than', '<');

                var match = row.stringResults.match(/^([<>=]*)[ ]*(\d*\.*\d*)([-]*\d*\.*\d*)([+]*)[ ]*(.*)$/);

                //our old data can have the string modifier either before or after the numeric part
                if (match[4])
                    row.resultOORIndicator = match[4];
                //kinda weak, but we preferentially take the prefix.  should never have both
                if (match[1])
                    row.resultOORIndicator = match[1];

                //these should be ranges
                if(match[3])
                    row.qualResult = match[2]+match[3];
                else
                    row.result = match[2];

                //if there is a value plus a string, we assume it's units.  otherwise it's a remark
                if (match[5]){
                    if(match[2] && !match[5].match(/[;,]/)){
                        row.units = match[5];
                    }
                    else {
                        if(row.qualResult){
                            row.Remark = match[5];
                        }
                        else {
                            row.qualResult = match[5];
                        }

                    }
                }
            }
        }
        else {
            //this covers the situation where a mySQL string column contained a numeric value without other characters
            row.result = row.stringResults;
            delete row.stringResults;
        }
    },
    fixSampleQuantity: function(row, errors, fieldName){
        fieldName = fieldName || 'quantity';

        //we try to remove non-numeric characters from this field
        if (row[fieldName] && typeof(row[fieldName]) == 'string' && !row[fieldName].match(/^(\d*\.*\d*)$/)){
            //we need to manually split these into multiple rows
            if (row[fieldName].match(/,/)){
                row[fieldName] = null;
                EHR.Server.Validation.addError(errors, fieldName, 'Problem with quantity: ' + row[fieldName], 'WARN');
                //row.QCStateLabel = errorQC;
            }
            else {
                //did not find other strings in data
                row[fieldName] = row[fieldName].replace(' ', '');
                row[fieldName] = row[fieldName].replace('n/a', '');
                row[fieldName] = row[fieldName].replace('N/A', '');
                row[fieldName] = row[fieldName].replace('na', '');
                row[fieldName] = row[fieldName].replace(/ml/i, '');
                row[fieldName] = row[fieldName].replace('prj31f', '');

                //var match = row[fieldName].match(/^([<>~]*)[ ]*(\d*\.*\d*)[ ]*(\+)*(.*)$/);
                var match = row[fieldName].match(/^\s*([<>~]*)\s*(\d*\.*\d*)\s*(\+)*(.*)$/);
                if (match[1] || match[3])
                    row[fieldName+'OORIndicator'] = match[1] || match[3];

                row[fieldName] = match[2];
            }
        }
    },
//    fixDrugUnits: function(row, errors){

//    },
    fixHemaMiscMorphology: function(row, errors){
        var c = row.morphology.split('_');
        //changes by request of molly
        //reverted.  will handle during data entry
//        if(c[0]=='TOXIC GRANULES')
//            c[0] = 'TOXIC CHANGE';

        row.morphology = c[0];
        if (c[1])
            row.score = c[1];
    },
//    fixNecropsyCase: function(row, errors){
//        //we try to clean up the caseno
//        var re = /([0-9]+)(a|c)([0-9]+)/i;
//        var match = row.caseno.match(re);
//        if (!match){
//            EHR.Server.Validation.addError(errors, 'caseno', 'Malformed CaseNo: '+row.caseno, 'WARN');
//        }
//        else {
//            //fix the year
//            if (match[1].length == 2){
//                //kind of a hack. we just assume records wont be that old
//                if (match[1] < 20)
//                    match[1] = '20' + match[1];
//                else
//                    match[1] = '19' + match[1];
//            }
//            else if (match[1].length == 4){
//                //these values are ok
//            }
//            else {
//                EHR.Server.Validation.addError(errors, 'caseno', 'Unsure how to correct year in CaseNo: '+match[1], 'WARN');
//            }
//
//            //standardize number to 3 digits
//            if (match[3].length != 3){
//                var tmp = match[3];
//                for (var i=0;i<(3-match[3].length);i++){
//                    tmp = '0' + tmp;
//                }
//                match[3] = tmp;
//            }
//            row.caseno = match[1] + match[2] + match[3];
//        }
//    },
    fixSurgMajor: function(row, errors){
        switch (row.major){
            case true:
            case 'y':
            case 'Y':
                row.major = 'Yes';
                break;
            case false:
            case 'n':
            case 'N':
                row.major = 'No';
                break;
            default:
                row.major = null;
        }
    },
    remarkToSoap: function(row, errors){
        //convert existing SOAP remarks into 3 cols
        var origRemark = row.remark;
        if(row.remark && row.remark.match(/(^s\/o: )/)){
            var so = row.remark.match(/(^s\/o: )(.*?)( a:| p:| a\/p:)/);
            if(!so){
                //this is a remark beginning with s/o:, but without a or p
                row.so = row.remark;
                row.remark = null;
            }
            else {
                row.so = so[2];
                row.so = row.so.replace(/^\s+|\s+$/g,"");

                row.remark = row.remark.replace(/^s\/o: /, '');
                row.remark = row.remark.replace(so[2], '');

                var a = row.remark.match(/^( a:| a\/p:)(.*?)( p:|$)/);
                if(a){
                    if(a[2]){
                        row.a = a[2];
                        row.a = row.a.replace(/^\s+|\s+$/g,"");

                        row.remark = row.remark.replace(/^( a:| a\/p:)/, '');
                        row.remark = row.remark.replace(a[2], '');
                    }
//                    else {
//                        console.log('a not found')
//                        console.log(origRemark);
//                    }
                }
//                else {
//                    console.log('a not found')
//                    console.log(origRemark);
//                }

                //apparently some rows can lack an assessment
                var p = row.remark.match(/^( p: )(.*)$/);
                if(p){
                    if(p[2]){
                        row.p = p[2];
                        row.p = row.p.replace(/^\s+|\s+$/g,"");

                        row.remark = row.remark.replace(/^( p: )/, '');
                        row.remark = row.remark.replace(p[2], '');
                        row.remark = row.remark.replace(/^\s+|\s+$/g,"");
                    }
//                    else {
//                        console.log('p not found')
//                        console.log(origRemark);
//                    }
                }

            }

            if(row.remark){
                console.log('REMARK REMAINING:');
                console.log(row.remark)
            }
        }
    }
};



