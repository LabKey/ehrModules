/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


var console = require("console");
exports.console = console;

var LABKEY = require("labkey");
exports.LABKEY = LABKEY;

var Ext = require("Ext").Ext;
exports.Ext = Ext;

var EHR = {};
exports.EHR = EHR;


//var map = new ScriptableMap(new org.labkey.api.collections.CaseInsensitiveHashMap());

function init(event, errors){
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
exports.init = init;

function beforeInsert(row, errors){
    var scriptErrors = {};

    if(this.scriptContext.verbosity > 0)
        console.log("beforeInsert: " + row);

    EHR.verifyPermissions('insert', this.scriptContext, row);
    EHR.rowInit.call(this, scriptErrors, row, null);

    //dataset-specific beforeInsert
    if(this.onUpsert)
        this.onUpsert(this.scriptContext, scriptErrors, row);
    if(this.onInsert)
        this.onInsert(this.scriptContext, scriptErrors, row);

    EHR.rowEnd.call(this, errors, scriptErrors, row, null);
}
exports.beforeInsert = beforeInsert;

function afterInsert(row, errors){
    if(this.scriptContext.verbosity > 0)
        console.log('after insert');

    EHR.afterEvent.call(this, 'insert', errors, row, null);

    if(this.onAfterUpsert)
        this.onAfterUpsert(this.scriptContext, errors, row);
    if(this.onAfterInsert)
        this.onAfterInsert(this.scriptContext, errors, row);
}
exports.afterInsert = afterInsert;

function beforeUpdate(row, oldRow, errors){
    var scriptErrors = {};

    if(this.scriptContext.verbosity > 0)
        console.log("beforeUpdate: " + row);

    EHR.verifyPermissions('update', this.scriptContext, row, oldRow);
    EHR.rowInit.call(this, scriptErrors, row, oldRow);

    //dataset-specific beforeUpdate
    if(this.onUpsert)
        this.onUpsert(this.scriptContext, scriptErrors, row, oldRow);
    if(this.onUpdate)
        this.onUpdate(this.scriptContext, scriptErrors, row, oldRow);

    EHR.rowEnd.call(this, errors, scriptErrors, row, oldRow);

    //NOTE: this is designed to merge the old row into the new one.
    for (var prop in oldRow){
        if(!row.hasOwnProperty(prop) && Ext.isDefined(oldRow[prop])){
            row[prop] = oldRow[prop];
        }
    }
}
exports.beforeUpdate = beforeUpdate;

function afterUpdate(row, oldRow, errors){
    if(this.scriptContext.verbosity > 0)
        console.log('after update');

    EHR.afterEvent.call(this, 'update', errors, row, oldRow);

    if(this.onAfterUpsert)
        this.onAfterUpsert(this.scriptContext, errors, row, oldRow);
    if(this.onAfterUpdate)
        this.onAfterUpdate(this.scriptContext, errors, row, oldRow);
}
exports.afterUpdate = afterUpdate;

function beforeDelete(row, errors){
    if(this.scriptContext.verbosity > 0)
        console.log("beforeDelete: ");

    EHR.verifyPermissions('delete', this.scriptContext, row);

    if(this.onDelete)
        this.onDelete(errors, this.scriptContext, row);
}
exports.beforeDelete = beforeDelete;

function afterDelete(row, errors){
    //console.log('after delete: ' +(new Date()));
    EHR.afterEvent.call(this, 'delete', errors, row, null);

    if(this.scriptContext.extraContext.dataSource != 'etl' && this.onAfterDelete)
        this.onAfterDelete(this.scriptContext, errors, row);
}
exports.afterDelete = afterDelete;

function complete(event, errors) {
    //console.log('complete: '+(new Date()));
    if(this.scriptContext.verbosity > 0){
        console.log('Event complete: '+event);
        console.log('Participants modified: '+this.scriptContext.participantsModified);
        console.log('PKs modified: '+this.scriptContext.PKsModified);
    }

    if(this.onComplete)
        this.onComplete(event, errors, this.scriptContext);

    //send emails. query notificationRecipients table based on notification type(s)
    if(this.scriptContext.notificationTypes){

    }

    if(this.scriptContext.notificationRecipients && !Ext.isEmpty(this.scriptContext.notificationRecipients)){

    }

    if(this.scriptContext.requestsModified && this.scriptContext.requestsModified.length){

    }

}
exports.complete = complete;


EHR.rowInit = function(errors, row, oldRow){
    //empty strings can do funny things, so we make them null
    for (var i in row){
        if (row[i] === ''){
            row[i] = null;
        }
    }

    //these are extra checks to fix mySQL data
    if (this.scriptContext.extraContext.dataSource == 'etl'){
        if(this.scriptContext.verbosity > 0)
            console.log('Row from ETL');

        //we ignore all errors from ETL records.  they will get flagged as review required
        this.scriptContext.errorThreshold = 'FATAL';
        EHR.ETL.fixRow.call(this, row, errors);
    }

    //check Id format
    if(this.scriptContext.extraContext.dataSource != 'etl'){
        EHR.validation.verifyIdFormat(row, errors, this.scriptContext)
    }

    if(row.Id && !this.scriptContext.quickValidation && this.scriptContext.extraContext.dataSource != 'etl'){
        EHR.findDemographics({
            participant: row.Id,
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

                    if(data.calculated_status != 'Alive'){
                        if(!this.scriptContext.allowDeadIds)
                            EHR.addError(errors, 'Id', 'Status of this Id is: '+data.calculated_status, 'INFO');
                    }
                }
                else {
                    if(!this.scriptContext.allowAnyId)
                        EHR.addError(errors, 'Id', 'Id not found in demographics table', 'INFO');
                }
            }
        });
    }

    //validate project / assignment to that project
    //also add account if the project is found
    //skip if doing assignments
    if(!this.scriptContext.quickValidation && this.scriptContext.extraContext.dataSource != 'etl' && row.project && row.Id && row.date && row.project!=300901  && (this.scriptContext.queryName && !this.scriptContext.queryName.match(/assignment/i))){
        LABKEY.Query.executeSql({
            schemaName: 'study',
            queryName: 'assignment',
            scope: this,
            sql: "SELECT a.project, a.project.account FROM study.assignment a WHERE a.project='"+row.project+"' AND a.id='"+row.id+"' AND a.date <= '"+row.date+"' AND (a.enddate >= '"+row.date+"' OR a.enddate IS NULL) AND project.protocol!='wprc00' AND qcstate.publicdata = true",
            success: function(data){
                if(!data.rows || !data.rows.length){
                    EHR.addError(errors, 'project', 'Not assigned to '+row.project+' on this date', 'WARN');
                }
                else {
                    this.scriptContext.assignmentRecord = data.rows[0];
                }
            },
            failure: EHR.onFailure
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
                    EHR.addError(errors, 'room', 'Not housed in this room on this date', 'WARN');
                }
            },
            failure: EHR.onFailure
        });
    }

    //enddate: verify either blank or not prior to date
    if(this.scriptContext.extraContext.dataSource != 'etl' && row.enddate && row.date && row.date.compareTo){
        if(row.date.compareTo(row.enddate)>0){
            EHR.addError(errors, 'enddate', 'End date must be after start date', 'WARN');
        }
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
        EHR.validation.flagSuspiciousDate(row, errors);

//        if(this.scriptContext.extraContext.dataSource != 'etl'){
//            EHR.validation.verifyDate(row, errors, this.scriptContext)
//        }
    }
};


EHR.rowEnd = function(errors, scriptErrors, row, oldRow){
    //use this flag to filters errors below a given severity
    var errorThreshold = this.scriptContext.errorThreshold || 'WARN';

    //this flag is to let records be validated, but forces failure of validation
    if(this.extraContext && this.extraContext.validateOnly){
        EHR.addError(scriptErrors, '_validateOnly', 'Ignore this error');
    }

    //this converts error objects into an array of strings
    //it also separates errors below the specified threshold
    var totalErrors = EHR.validation.processErrors.call(this, row, errors, scriptErrors, errorThreshold, this.extraContext);

    if (!totalErrors){
        if(this.setDescription){
            row.Description = this.setDescription(row, errors).join(',\n');
            if (row.Description.length > 4000)
                row.Description = row.Description.substring(0, 3999);
        }
        else
            row.Description = '';

        row.QCState = this.scriptContext.qcMap.label[row.QCStateLabel].RowId || null;
    }
    else {
        row.Description = [];
        for(var i in errors){
            for (var j=0;j<errors[i].length;j++){
                row.Description.push(errors[i][j]);
            }
        }
        row.Description = row.Description.join(',\n');
        row.QCState = this.scriptContext.qcMap.label[this.scriptContext.errorQcLabel].RowId || null;
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

//NOTE: this is called after a successful insert/update/delete
//the purpose is primarily for bookkeeping.  these arrays are used to queue changed records.  when lots of records are submitted
// in theory this allows some events to be moved to the complete function and run once time, making them more efficient
EHR.afterEvent = function (event, errors, row, oldRow){
    if(this.scriptContext.verbosity > 0)
        console.log('After Event: '+event);

    this.scriptContext.rows.push({
        row: row,
        oldRow: oldRow
    });

    if(row._becomingPublicData && this.afterBecomePublic){
        this.afterBecomePublic(errors, this.scriptContext, row, oldRow);
    }

    if(this.scriptContext.participantsModified.indexOf(row.Id) == -1){
        this.scriptContext.participantsModified.push(row.Id);

        if(row._publicData)
            this.scriptContext.publicParticipantsModified.push(row.Id);
    }

    if(this.extraContext.keyField){
        var key = row[this.extraContext.keyField];

        if(key && this.scriptContext.PKsModified.indexOf(key) == -1){
            this.scriptContext.PKsModified.push(key);

            if(row._publicData)
                this.scriptContext.publicPKsModified.push(key);
        }
    }

    if(row.requestId && this.scriptContext.requestsModified.indexOf(row.requestId) == -1){
        this.scriptContext.requestsModified.push(row.requestId);
    }

    if(row.taskId && this.scriptContext.tasksModified.indexOf(row.taskId) == -1){
        this.scriptContext.tasksModified.push(row.taskId);
    }

    if(oldRow){
        if(this.scriptContext.participantsModified.indexOf(oldRow.Id) == -1){
            this.scriptContext.participantsModified.push(oldRow.Id);

            if(oldRow._publicData)
                this.scriptContext.publicParticipantsModified.push(oldRow.Id);
        }

        if(this.extraContext.keyField){
            var key = oldRow[this.extraContext.keyField];
            if(key && this.scriptContext.PKsModified.indexOf(key) == -1){
                this.scriptContext.PKsModified.push(key);

                if(oldRow._publicData)
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

EHR.onFailure = function(error){
    console.log('ERROR: '+error.exception);
    console.log(error);

    EHR.logError(error);
};

EHR.onDeathDeparture = function(participant, date){
    //close housing, assignments, treatments
    closeRecord('Assignment');
    closeRecord('Housing');
    closeRecord('Treatment Orders');

    function closeRecord(queryName){
        LABKEY.Query.selectRows({
            schemaName: 'study',
            queryName: queryName,
            columns: 'lsid,Id',
            scope: this,
            filterArray: [
                LABKEY.Filter.create('Id', participant, LABKEY.Filter.Types.EQUAL),
                LABKEY.Filter.create('endate', null, LABKEY.Filter.Types.ISBLANK)
            ],
            success: function(data){
                if(data && data.rows && data.rows.length){
                    var toUpdate = [];
                    Ext.each(data.rows, function(r){
                        toUpdate.push({lsid: r.lsid, enddate: date.toGMTString()})
                    }, this);

                    LABKEY.Query.updateRows({
                        schemaName: 'study',
                        queryName: queryName,
                        rows: toUpdate,
                        scope: this,
                        failure: EHR.onFailure,
                        success: function(data){
                            console.log('Success closing '+queryName+' records: '+toUpdate.length);
                        }
                    });
                }
            },
            failure: EHR.onFailure
        });
    }
}

EHR.findDemographics = function(config){
    if(!config || !config.participant || !config.callback || !config.scope){
        EHR.logError({
            msg: 'Error in EHR.findDemographics(): missing Id, scope or callback'
        });
        throw 'Error in EHR.findDemographics(): missing Id, scope or callback';
    }
    var scriptContext = config.scope.scriptContext || this.scriptContext;

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
            //TODO: probably should explitly name columns?
            //columns: '*',
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
            failure: EHR.onFailure
        });
    }
};

//Note: while the row map is case insensitive, client-side code is not
//therefore field names should be treated as case sensitive
EHR.addError = function(errors, field, msg, severity){
    if(!errors[field])
        errors[field] = [];

    errors[field].push({
        message: msg,
        severity: severity || 'ERROR'
    });
};

EHR.logError = function(error){
    LABKEY.Query.insertRows({
         //it would be nice to store them in the current folder, but we cant guarantee they have write access..
         containerPath: '/shared',
         schemaName: 'auditlog',
         queryName: 'audit',
         rows: [{
            EventType: "Client API Actions",
            Key1: "Client Error In Validation Script",
            Comment: error.exception || error.statusText,
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
};

/*
config:
notificationType - string
recipients - array
msgSubject - string
msgContent - string
 */


EHR.sendEmail = function(config){
    if(!config.recipients)
        config.recipients = [];

    if(this.scriptContext.verbosity > 0)
        console.log('Sending email');

    LABKEY.Query.selectRows({
        schemaName: 'ehr',
        queryName: 'notificationRecipients',
        filterArray: [LABKEY.Filter.create('notificationType', config.notificationType, LABKEY.Filter.Types.EQUAL)],
        success: function(data){
            for(var i=0;i<data.rows.length;i++){
                config.recipients.push(LABKEY.Message.createPrincipalRecipient(LABKEY.Message.recipientType.to, data.rows[i].recipient));

                if(this.scriptContext.verbosity > 0)
                    console.log('Recipient: '+data.rows[i].recipient);
            }
        },
        failure: EHR.onFailure
    });

    if(config.recipients.length){
        var siteEmail;
        LABKEY.Query.selectRows({
            schemaName: 'ehr',
            queryName: 'module_properties',
            filterArray: [LABKEY.Filter.create('prop_name', 'site_email', LABKEY.Filter.Types.EQUAL)],
            success: function(data){
                if(data && data.rows && data.rows.length){
                    siteEmail = data.rows[0].stringvalue;
                }
            },
            failure: EHR.onFailure
        });

        if(!siteEmail){
            console.log('ERROR: site email not found');
            EHR.logError({msg: 'ERROR: site email not found'});
        }

        LABKEY.Message.sendMessage({
            msgFrom: siteEmail || 'EHR-do-not-reply@primate.wisc.edu',
            msgSubject: config.msgSubject,
            msgRecipients: config.recipients,
            msgContent: [
                //LABKEY.Message.createMsgContent(LABKEY.Message.msgType.html, '<h2>This is a test message</h2>'),
                LABKEY.Message.createMsgContent(LABKEY.Message.msgType.plain, config.msgContent)
            ]
        });
    }
};

EHR.verifyPermissions = function(event, scriptContext, row, oldRow){
    //NOTE: this has been moved from init() b/c init() seems to get called during the ETL even
    //if not importing any records
    if(!scriptContext.permissionMap){
        console.log('Verifying permissions for: '+event);

        EHR.utils.getDatasetPermissions({
            scope: this,
            schemaName: scriptContext.extraContext.schemaName,
            success: function(result){
                scriptContext.qcMap = result.qcMap;
                scriptContext.permissionMap = result;
            }
        });
    }

    //first we normalize QCstate
    if(oldRow){
        if(oldRow.QCState){
            if(scriptContext.qcMap.rowid[oldRow.QCState]){
                oldRow.QCStateLabel = scriptContext.qcMap.rowid[oldRow.QCState].Label;
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
        if(scriptContext.qcMap.rowid[row.QCState]){
            row.QCStateLabel = scriptContext.qcMap.rowid[row.QCState].Label;
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
            if(!scriptContext.permissionMap.hasPermission(row.QCStateLabel, 'insert', [{
                schemaName: scriptContext.extraContext.schemaName,
                queryName: scriptContext.extraContext.queryName
            }])){
                EHR.logError({msg: "The user "+LABKEY.Security.currentUser.id+" does not have insert privledges for the table: "+scriptContext.extraContext.queryName});
                throw "This user does not have insert privledges for the table: "+scriptContext.extraContext.queryName+' on qcStateLabel: '+row.QCStateLabel;
            }
        }

        //the user also needs update permission on the old row's QCstate
        if(!scriptContext.permissionMap.hasPermission(oldRow.QCStateLabel, 'update', [{
            schemaName: scriptContext.extraContext.schemaName,
            queryName: scriptContext.extraContext.queryName
        }])){
            EHR.logError({msg: "The user "+LABKEY.Security.currentUser.id+" does not have update privledges for the table: "+scriptContext.extraContext.queryName});
            throw "This user does not have update privledges for the table: "+scriptContext.extraContext.queryName;
        }
//        else
//            console.log('the user has update permissions');
    }
    //handle inserts and deletes
    else {
        if(row.QCStateLabel){
            if(!scriptContext.permissionMap.hasPermission(row.QCStateLabel, event, [{
                schemaName: scriptContext.extraContext.schemaName,
                queryName: scriptContext.extraContext.queryName
            }])){
                EHR.logError({msg: "The user "+LABKEY.Security.currentUser.id+" does not have "+event+" privledges for the table: "+scriptContext.extraContext.queryName});
                throw "This user does not have "+event+" privledges for the table: "+scriptContext.extraContext.queryName;
            }
//            else
//                console.log('the user has '+event+' permissions');
        }
    }

    //flag public status of rows
    if(oldRow && oldRow.QCStateLabel && row.QCStateLabel){
        if(!scriptContext.qcMap.label[oldRow.QCStateLabel].PublicData && scriptContext.qcMap.label[row.QCStateLabel].PublicData)
            row._becomingPublicData = true;
    }

    if(row.QCStateLabel){
        if(scriptContext.qcMap.label[row.QCStateLabel].PublicData){
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
        if(scriptContext.qcMap.label[oldRow.QCStateLabel].PublicData)
            oldRow._publicData = true;
    }
};

EHR.validation = {
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

                if (errorThreshold && EHR.validation.errorSeverity[error.severity] <= EHR.validation.errorSeverity[errorThreshold]){
                    //console.log('error below threshold');
                    if(row._recordId){
                        if(!extraContext.skippedErrors[row._recordId])
                            extraContext.skippedErrors[row._recordId] = [];

                        error.field = i;
                        extraContext.skippedErrors[row._recordId].push(error);
                        console.log('skipping error')
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
    errorSeverity: {
        DEBUG: 0,
        INFO: 1,
        WARN: 2,
        ERROR: 3,
        FATAL: 4
    },
    antibioticSens: function(row, errors){
        if (row.sensitivity && row.antibiotic == null){
            row.antibiotic = 'Unknown';
            EHR.addError(errors, '_form', 'Row has sensitivity, but no antibiotic', 'WARN');
        }
    },
    removeTimeFromDate: function(row, errors, fieldname){
        fieldname = fieldname || 'date';

        if(row[fieldname] && typeof row[fieldname] == 'date' && Ext.isDefined(row[fieldname].setHours)){
//            row[fieldname].setHours(0);
//            row[fieldname].setMinutes(0);
//            row[fieldname].setSeconds(0);
            row[fieldname] = new Date(row[fieldname].toDateString());
        }
    },
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
                failure: EHR.onFailure
            });
        }

        return meaning ? meaning+(code ? ' ('+code+')' : '') : (code ? code : '');
    },
    verifyIdFormat: function(row, errors, scriptContext){
        if(row.Id){
            EHR.validation.setSpecies(row, errors);

            if(!scriptContext.extraContext.skipIdFormatCheck && row.species == 'Unknown'){
                EHR.addError(errors, 'Id', 'Invalid Id Format', 'WARN');
            }
        }
    },
    dateToString: function (date){
        //TODO: do better once more date functions added
        if(date){
            date = new Date(date.toGMTString());
            return (date.getFullYear() ? date.getFullYear()+'-'+EHR.validation.padDigits(date.getMonth()+1, 2)+'-'+EHR.validation.padDigits(date.getDate(), 2) : '');
        }
        else
            return '';
    },
    dateTimeToString: function (date){
        if(date){
            date = new Date(date.toGMTString());
            return date.getFullYear()+'-'+EHR.validation.padDigits(date.getMonth()+1, 2)+'-'+EHR.validation.padDigits(date.getDate(), 2) + ' '+EHR.validation.padDigits(date.getHours(),2)+':'+EHR.validation.padDigits(date.getMinutes(),2);
        }
        else
            return '';
    },
    nullToString: function(value){
            return (value ? value : '');
    },
    padDigits: function(n, totalDigits)
    {
        n = n.toString();
        var pd = '';
        if (totalDigits > n.length){
            for (var i=0; i < (totalDigits-n.length); i++){
                pd += '0';
            }
        }
        return pd + n;
    },
    calculateCaseno: function(row, errors, table, procedureType){
        var year = row.date.getYear()+1900;
        LABKEY.Query.executeSql({
            schemaName: 'study',
            sql: "SELECT cast(SUBSTRING(MAX(caseno), 6, 8) AS INTEGER) as caseno FROM study."+table+" WHERE caseno LIKE '" + year + procedureType + "%'",
            scope: this,
            success: function(data){
                if(data && data.rows && data.rows.length==1){
                    var caseno = data.rows[0].caseno + 1;
                    caseno = EHR.validation.padDigits(caseno, 3);
                    row.caseno = year + procedureType + caseno;
                }
            },
            failure: EHR.onFailure
        });

    },
    verifyCasenoIsUnique: function(context, row, errors){
        //find any existing rows with the same caseno
        LABKEY.Query.selectRows({
            schemaName: context.extraContext.schemaName,
            queryName: context.extraContext.schemaName,
            filterArray: [
                LABKEY.Filter.create('caseno', row.caseno, LABKEY.Filter.Types.EQUAL),
                LABKEY.Filter.create('lsid', row.lsid, LABKEY.Filter.Types.NOT_EQUAL)
            ],
            scope: this,
            success: function(data){
                if(data && data.rows && data.rows.length){
                    EHR.addError(errors, 'caseno', 'One or more records already uses the caseno: '+row.caseno, 'ERROR');
                }
            },
            failure: EHR.onFailure
        });
    },
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

        if(!scriptContext.extraContext.validateOnly && cal2.after(cal1) && !scriptContext.qcMap.label[row.QCStateLabel]['metadata/allowFutureDates']){
            EHR.addError(errors, 'date', 'Date is in future', 'ERROR');
        }

        if(!cal1.after(cal2) && row.QCStateLabel == 'Scheduled'){
            EHR.addError(errors, 'date', 'Date is in past, but is scheduled', 'ERROR');
        }
    },
    flagSuspiciousDate: function(row, errors){
        if(!row.date)
            return;

        if(typeof(row.Date) == 'string'){
            row.Date = new java.util.Date(java.util.Date.parse(row.Date));
        }

        //flag any dates greater than 1 year from now
        var cal1 = new java.util.GregorianCalendar();
        cal1.add(java.util.Calendar.YEAR, 1);
        var cal2 = new java.util.GregorianCalendar();
        cal2.setTime(row.Date);

        if(cal2.after(cal1)){
            EHR.addError(errors, 'date', 'Date is more than 1 year in future: '+row.Date, 'WARN');
        }

        cal1.add(java.util.Calendar.YEAR, -61);
        if(cal1.after(cal2)){
            EHR.addError(errors, 'date', 'Date is more than 60 days in past: '+row.Date, 'WARN');
        }
    },
    setSpecies: function(row, errors){
        if (row.Id.match(/(^rh([0-9]{4})$)|(^r([0-9]{5})$)/))
            row.species = 'Rhesus';
        else if (row.Id.match(/^cy([0-9]{4})$/))
            row.species = 'Cynomolgus';
        else if (row.Id.match(/^ag([0-9]{4})$/))
            row.species = 'Vervet';
        else if (row.Id.match(/^cj([0-9]{4})$/))
            row.species = 'Marmoset';
        else if (row.Id.match(/^so([0-9]{4})$/))
            row.species = 'Cotton-top Tamarin';
        else if (row.Id.match(/^pt([0-9]{4})$/))
            row.species = 'Pigtail';

        //these are to handle legacy data:
        else if (row.Id.match(/(^rha([a-z]{1})([0-9]{2}))$/))
            row.species = 'Rhesus';
        else if (row.Id.match(/(^rh-([a-z]{1})([0-9]{2}))$/))
            row.species = 'Rhesus';
        else if (row.Id.match(/^cja([0-9]{3})$/))
            row.species = 'Marmoset';
        else if (row.Id.match(/^m([0-9]{5})$/))
            row.species = 'Marmoset';
        else if (row.Id.match(/^tx([0-9]{4})$/))
            row.species = 'Marmoset';
        //and this is to handle automated tests
        else if (row.Id.match(/^test[0-9]+$/))
            row.species = 'Rhesus';

        else
            row.species = 'Unknown';
    },
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
                        EHR.addError(errors, (targetField || 'Id'), 'This animal is not female', 'ERROR');
                }
            },
            failure: EHR.onFailure
        });
    },
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
            failure: EHR.onFailure
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
            failure: EHR.onFailure
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
            failure: EHR.onFailure
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
            failure: EHR.onFailure
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
            failure: EHR.onFailure
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

            //console.log('status: '+status);
            //console.log('calc status: '+r.calculated_status);
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
                success: function(data){
                    console.log('Success updating demographics status field');
                },
                failure: function(error){
                    console.log('error: '+error.exception)
                }
            });
        }
    }
};

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
            EHR.addError(errors, 'project', 'Bad Project#: '+row.project, 'ERROR');
            row.project = null;
            //row.QCStateLabel = errorQC;
        }
    },
    fixParticipantId: function (row, errors){
        if (row.hasOwnProperty('Id') && !row.Id){
            row.id = 'MISSING';
            EHR.addError(errors, 'Id', 'Missing Id', 'ERROR');
        }
    },
    addDate: function (row, errors){
        if (row.hasOwnProperty('date') && !row.Date){
            //row will fail unless we add something in this field
            row.date = new java.util.Date();

            EHR.addError(errors, 'date', 'Missing Date', 'ERROR');
        }
    },
    fixPathCaseNo: function(row, errors, code){
        //we try to clean up the biopsy ID
        var re = new RegExp('([0-9]+)('+code+')([0-9]+)', 'i');

        var match = row.caseno.match(re);
        if (!match){
            EHR.addError(errors, 'caseno', 'Error in CaseNo: '+row.caseno, 'WARN');
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
                EHR.addError(errors, 'caseno', 'Unsure how to correct year in CaseNo: '+match[1], 'WARN');
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
                EHR.addError(errors, 'result', 'Problem with result: ' + row.stringResults, 'WARN');
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
                EHR.addError(errors, fieldName, 'Problem with quantity: ' + row[fieldName], 'WARN');
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
//            EHR.addError(errors, 'caseno', 'Malformed CaseNo: '+row.caseno, 'WARN');
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
//                EHR.addError(errors, 'caseno', 'Unsure how to correct year in CaseNo: '+match[1], 'WARN');
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
                row.major = true;
                break;
            case false:
            case 'n':
            case 'N':
                row.major = false;
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


EHR.utils = {};
EHR.utils.getQCStateMap = function(config){
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
    if(!config || !config.success){
        throw "Must provide a success callback";
    }

    var schemaName = 'study';

    var schemaMap;
    var qcMap;

    EHR.utils.getQCStateMap({
        scope: this,
        success: function(results){
            qcMap = results;
        },
        failure: EHR.utils.onError
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

            qcRow.effectivePermissions.insert = (qcRow.permissionsByQuery.insert.length == queryCount);
            qcRow.effectivePermissions.update = (qcRow.permissionsByQuery.update.length == queryCount);
            qcRow.effectivePermissions['delete'] = (qcRow.permissionsByQuery['delete'].length == queryCount);
        }

        function hasPermission(qcStateLabel, permission, queries){
            if(!qcStateLabel || !permission)
                throw "Must provide a QC State label and permission name";

            if(queries && !Ext.isArray(queries))
                queries = [queries];

            //if schemaName not supplied, we return based on all queries
            if(!queries.length){
                throw 'Must provide an array of query objects'
            }

            var result = true;
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

        config.success.apply(config.scope || this, [{
            qcMap: qcMap,
            schemaMap: schemaMap,
            hasPermission: hasPermission,
            getQueryPermissions: getQueryPermissions
        }]);
    }

    onSuccess();
};

//generic error handler
EHR.utils.onError = function(error){
    console.log('ERROR: ' + error.exception);
    console.log(error);

    var logErrors = 0;

     if(logErrors){
        EHR.logError(error);
     }
};

//Return new array with duplicate values removed
Array.prototype.unique = function()
{
    var a = [];
    var l = this.length;
    for (var i = 0; i < l; i++)
    {
        for (var j = i + 1; j < l; j++)
        {
            // If this[i] is found later in the array
            if (this[i] === this[j])
                j = ++i;
        }
        a.push(this[i]);
    }
    return a;
};