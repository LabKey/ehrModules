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


//this is done strangely.  need to revisit
EHR.initShared = function(){
    return {
        rows: [],
        notificationRecipients : [],
        participantsModified: [],
        PKsModified: [],
        publicParticipantsModified: [],
        publicPKsModified: [],
        publicRequestsModified: {},
        demographicsMap: {},
        errorQcLabel: 'Review Required',
        qcStateMap: {},
        verbosity: 1,
        permissions: {},
        qcStates: {
            'Review Required': {

            }
        }
    };
}

var shared = EHR.initShared();
exports.shared = shared;

//NOTES:
//set account based on project.  do differently depending on insert/update.  maybe a flag?
//if the row has id/currentroom field, then populate using housing

//Global flags:
//target QC
//errorThreshold

//Context:
//name of query?
//entityId of query?
//map of QC states?
//metadata about this table?  maybe the identity of the PK?


function init(event, errors){
    console.log("** evaluating: " + this['javax.script.filename']);

    this.test = 12;
    console.log('init: '+this.test);

    this.shared = EHR.initShared();

//    LABKEY.Query.insertRows({
//        schemaName: 'ehr',
//        queryName: 'module_properties',
//        rowDataArray: [
//            {prop_name: 'test'}
//        ],
//        success: function(data){
//            console.log('Success')
//        },
//        failure: function(error){
//            console.log(error.exceptionClass)
//        }
//    });

//    LABKEY.Query.updateRows({
//        schemaName: 'ehr',
//        queryName: 'module_properties',
//        rowDataArray: [
//            {rowid: 1, prop_name: 'test1', stringvalue: 'hello'}
//        ],
//        success: function(data){
//            console.log('Success')
//        },
//        failure: function(error){
//            console.log(error.exceptionClass)
//        }
//    });

    console.log("init: " + event);

    //figure out who the user is, user roles and calculate which QC states they can use
    LABKEY.Security.getUserPermissions({
        userId: LABKEY.Security.currentUser.id,
        success: function(data, response){
            //console.log(arguments);
            shared.permissions = data;
        },
        failure: EHR.onFailure
    });

    //query and create map of QCstates + values
    LABKEY.Query.selectRows({
        schemaName: 'study',
        queryName: 'QCState',
        success: function(data){
            var row;
            for(var i=0;i<data.rows.length;i++){
                row = data.rows[i];
                shared.qcStateMap[row.RowId] = {
                    label: row.Label,
                    publicData: row.PublicData,
                    //TODO: calculate these based on user roles
                    userCanUpdate: true,
                    userCanCreate: true,
                    userCanDelete: true,
                    isDraft: false
                }
            }
        },
        failure: EHR.onFailure
    });
}
exports.init = init;

function beforeInsert(row, errors){

    if(shared.verbosity > 0)
        console.log("beforeInsert: " + this.test +'/' + row);

    if(row.hasOwnProperty('Id'))
        EHR.addError(errors, 'Id', 'A server-side error', 'WARN');

    //EHR.addError(errors, 'date', 'Another error', 'WARN');

    EHR.rowInit.call(this, row, errors, null);

    //dataset-specific beforeInsert
    if(this.onUpsert)
        this.onUpsert(row, errors);
    if(this.onInsert)
        this.onInsert(row, errors);

    EHR.rowEnd.call(this, row, errors, null);
}
exports.beforeInsert = beforeInsert;

function afterInsert(row, errors){
    if(shared.verbosity > 0)
        console.log("afterInsert: " + this.test +'/' + row);

    if(shared.participantsModified.indexOf(row.id) == -1)
        shared.participantsModified.push(row.id);

    if(shared.PKsModified.indexOf(row.lsid) == -1)
        shared.PKsModified.push(row.lsid);

    if(row.QCState && shared.qcStateMap[row.QCState].publicData){
        if(shared.publicParticipantsModified.indexOf(row.id) == -1)
            shared.publicParticipantsModified.push(row.id);

        if(shared.publicPKsModified.indexOf(row.lsid) == -1)
            shared.publicPKsModified.push(row.lsid);
    }
}
exports.afterInsert = afterInsert;

function beforeUpdate(row, oldRow, errors){
    if(shared.verbosity > 0)
        console.log("beforeUpdate: " + this.test +'/' + row);

    EHR.rowInit(row, errors, oldRow);

    //dataset-specific beforeUpdate
    if(this.onUpsert)
        this.onUpsert(row, errors, oldRow);
    if(this.onUpdate)
        this.onUpdate(row, errors, oldRow);

    EHR.rowEnd(row, errors, oldRow);
}
exports.beforeUpdate = beforeUpdate;

function afterUpdate(row, oldRow, errors){
    console.log("afterUpdate: " + this.test +'/' + row);

    if(shared.participantsModified.indexOf(row.id) == -1)
        shared.participantsModified.push(row.id);
    if(shared.participantsModified.indexOf(oldRow.id) == -1)
        shared.participantsModified.push(oldRow.id);

    if(shared.PKsModified.indexOf(row.lsid) == -1)
        shared.PKsModified.push(row.lsid);

    if(row.QCState && shared.qcStateMap[row.QCState].publicData){
        if(shared.publicParticipantsModified.indexOf(row.id) == -1)
            shared.publicParticipantsModified.push(row.id);
        if(shared.publicParticipantsModified.indexOf(oldRow.id) == -1)
            shared.publicParticipantsModified.push(oldRow.id);

        if(shared.publicPKsModified.indexOf(row.lsid) == -1)
            shared.publicPKsModified.push(row.lsid);
    }
}
exports.afterUpdate = afterUpdate;

function beforeDelete(row, errors){
    console.log("beforeDelete: " + this.test +'/' + row);
}
exports.beforeDelete = beforeDelete;

function afterDelete(row, errors){
    console.log("afterDelete: " + this.test +'/' + row);

    if(shared.participantsModified.indexOf(row.id) == -1)
        shared.participantsModified.push(row.id);

    if(shared.PKsModified.indexOf(row.lsid) == -1)
        shared.PKsModified.push(row.lsid);

    if(row.QCState && shared.qcStateMap[row.QCState].publicData){
        if(shared.publicParticipantsModified.indexOf(row.id) == -1)
            shared.publicParticipantsModified.push(row.id);

        if(shared.publicPKsModified.indexOf(row.lsid) == -1)
            shared.publicPKsModified.push(row.lsid);
    }
}
exports.afterDelete = afterDelete;

function complete(event, errors) {
//    for(var i=0;i<errors.length;i++){
//        errors[i].queryName = this['javax.script.filename'];
//    }

    if(shared.verbosity > 0){
        console.log("complete: " + this.test +'/' + event);
        console.log('Participants modified: '+shared.participantsModified);
        console.log('PKs modified: '+shared.PKsModified);
    }

    if(this.onComplete)
        this.onComplete(event, errors);

    //send emails. query notificationRecipients table based on notification type(s)
    if(EHR.notificationTypes || Ext.isEmpty(shared.notificationRecipients)){

    }

    //also look to notificationRecipients array

    if(shared.requestsModified && shared.requestsModified.length){

    }

        //TODO
        //send email to colony records alerting that row is lacking from demographics
//        if(missingIds.length){
//            EHR.sendEmail({
//                notificationType: 'Colony Validation - General',
//                msgSubject: 'Ids missing from demographics table',
//                mgsContent: 'The following Ids were added to the arrival table, but do not have records in the demographics table: '+missingIds.join(',')
//            });
//        }

}
exports.complete = complete;


EHR.rowInit = function(row, errors, oldRow){
    if(oldRow && oldRow.QCState){

    }

    console.log("row init: " + this.test);

    //take the current row's QC, compare with old Row's QC if updating
    //reject immediately if they do not have permissions

    //empty strings can do funny things in grids...
    for (var i in row){
        if (row[i] === ''){
            row[i] = null;
        }
    }

    //these are extra checks to fix mySQL data
//TODO: this is only active for debugging purposes
//    if (row.dataSource == 'etl')
        EHR.ETL.fixRow.call(this, row, errors);


    //these checks are always run:


    //certain forms display current location.  if the row has this property, but it is blank, we add it.
    //not validation per se, but useful to forms
    if(row.Id && row.hasOwnProperty('id/curlocation/location')){
        console.log('Setting current location:');
        EHR.findDemographics({
            participant: row.Id,
            scope: this,
            callback: function(data){
                if(data){
                    data.location = data.room + '-' + data.cage;
                    row['id/curlocation/location'] = data.location;
                }
                else {
                    EHR.addError(errors, 'Id', 'Id not found in demographics table', 'INFO');
                }
            }
        });
    }

    //validate project / assignment to that project
    if(row.project && row.Id && row.date && row.project!=300901){
        console.log('Verifying project assignment:');
        LABKEY.Query.executeSql({
            schemaName: 'study',
            queryName: 'assignment',
            scope: this,
            sql: "SELECT a.project FROM study.assignment a WHERE a.project='"+row.project+"' AND a.id='"+row.id+"' AND a.date <= '"+row.date+"' AND (a.rdate >= '"+row.date+"' OR a.rdate IS NULL) AND project.protocol!='wprc00'",
            success: function(data){
                if(!data.rows || !data.rows.length){
                    EHR.addError(errors, 'project', 'Not assigned to '+row.project+' on this date', 'WARN');
                }
            },
            failure: EHR.onFailure
        });
    }

    //validate room / cage if present
    if(row.room && row.Id && row.date){
        console.log('Verifying room/cage:');
        var sql = "SELECT h.room FROM study.housing h WHERE ";
        if(row.room)
            sql += "h.room='"+row.room+"' AND ";
        if(row.cage)
            sql += "h.cage='"+row.cage+"' AND ";

        sql += "h.id='"+row.id+"' AND h.date <= '"+row.date+"' AND (h.rdate >= '"+row.date+"' OR a.odate IS NULL)";

        LABKEY.Query.executeSql({
            schemaName: 'study',
            queryName: 'housing',
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
    if(row.enddate && row.date && row.enddate < row.date){
        EHR.addError(errors, 'enddate', 'End date cannot be before start date', 'WARN');
    }

    //TODO: flag rows becoming public
    if(1==2){
        EHR.onBecomePublic(row, errors, oldRow);
    }

    //flags dates more than 1 year in the future or 60 in the past
    if(row.date)
        EHR.validation.flagSuspiciousDate(row, errors);

};


EHR.rowEnd = function(row, errors, oldRow){
    console.log("row end: " + this.test);

    //use flag in context
    var errorThreshold = 'INFO';

    //this flag is to let records be validated, but forces failure of validation
    if(this.extraContext && this.extraContext.validateOnly){
        console.log('validate only');
        EHR.addError(errors, '_validateOnly', 'Ignore this error');
    }

    //this converts error objects into an array of strings
    //it also disards errors below the specified threshold
    var transformedErrors = EHR.validation.processErrors(row, errors, errorThreshold);

    if (transformedErrors){
        if(this.setDescription){
            row.Description = this.setDescription(row, errors).join(',\n');
            if (row.Description.length > 4000)
                row.Description = row.Description.substring(0, 3999);
        }
        else
            row.Description = '';
    }
    else {
        row.Description = [];
        for(var i in errors){
            for (var j=0;j<errors[i].length;j++){
                row.Description.push(errors[i][j]);
            }
        }
        row.Description = row.Description.join(',\n');
        delete row.QCState;
        row.QCStateLabel = shared.errorQcLabel;
    }

    if (shared.verbosity > 0 )
        console.log("New row: "+row);

    shared.rows.push(row);

    //NOTE: not sure if this is needed.  should review how global errors object is handled
    errors = transformedErrors;
};

EHR.onBecomePublic = function(row, errors, oldRow){
    console.log("onBecomePublic: " + this.test);

    //TODO: replace date with begindate if data is becoming public

    if(this.onBecomePublic)
        this.onBecomePublic(row, errors, oldRow);
};

EHR.onFailure = function(error){
    console.log('ERROR: '+error.exception);
    console.log(error)
};

EHR.findDemographics = function(config){
    if(!config || !config.participant || !config.callback){
        throw 'Error in EHR.findDemographics: missing Id or callback';
    }

    if(shared.demographicsMap[config.participant]){
        config.callback.apply(config.scope || this, [shared.demographicsMap[config.participant]])
    }
    else {
        LABKEY.Query.selectRows({
            schemaName: 'study',
            queryName: 'demographics',
            filterArray: [LABKEY.Filter.create('Id', config.participant, LABKEY.Filter.Types.EQUAL)],
            //columns: '*',
            success: function(data){
                if(data && data.rows && data.rows.length==1){
                    var row = data.rows[0];
                    shared.demographicsMap[row.Id] = row;
                    config.callback.apply(config.scope || this, [shared.demographicsMap[row.Id]]);
                }
                else
                    config.callback.apply(config.scope || this);
            },
            failure: EHR.onFailure
        });
    }
};

EHR.updateDemographics = function(config){
    if(!config || !config.fieldName || !config.value || !config.participant)
        throw "EHR.updateDemographics is missing config items: "+config;




};

//Note: while the row map is case insensitive, client-side code is not
//therefore field names should be treated as case sensitive
EHR.addError = function(errors, field, msg, severity){
    if(!errors[field])
        errors[field] = [];

    errors[field].push({
        msg: msg,
        severity: severity || 'ERROR'
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

    if(shared.verbosity > 0)
        console.log('Sending email');

    LABKEY.Query.selectRows({
        schemaName: 'ehr',
        queryName: 'notificationRecipients',
        filterArray: [LABKEY.Filter.create('notificationType', config.notificationType, LABKEY.Filter.Types.EQUAL)],
        success: function(data){
            for(var i=0;i<data.rows.length;i++){
                config.recipients.push(LABKEY.Message.createRecipient(LABKEY.Message.recipientType.to, data.rows[i].recipient));

                if(shared.verbosity > 0)
                    console.log('Recipient: '+data.rows[i].recipient);
            }
        },
        failure: EHR.onFailure
    });

    if(config.recipients.length){
        LABKEY.Message.sendMessage({
            //TODO: store in module properties table?
            msgFrom: 'EHR-do-not-reply@primate.wisc.edu',
            msgSubject: config.msgSubject,
            msgRecipients: config.recipients,
            msgContent: [
                //LABKEY.Message.createMsgContent(LABKEY.Message.msgType.html, '<h2>This is a test message</h2>'),
                LABKEY.Message.createMsgContent(LABKEY.Message.msgType.plain, config.msgContent)
            ]
        });
    }
};

EHR.validation = {
    processErrors: function(row, errors, errorThreshold){
        var error;
        var transformedErrors = {};
        var newErrors;
        var fieldErrors;

        for(var i in errors){
            fieldErrors = errors[i];
            newErrors = [];

            for(var j=0;j<fieldErrors.length;j++){
                error = fieldErrors[j];

                if (errorThreshold && EHR.validation.errorSeverity[error.severity] < EHR.validation.errorSeverity[errorThreshold]){
                    console.log('error below threshold');
                    continue;
                }

                newErrors.push(error.severity+': '+error.msg);
            }

            if(newErrors.length){
                errors[i] = newErrors;
                transformedErrors[i] = newErrors;
            }
        }

        //tests whether transformedErrors is an empty object or not
        for (var i in transformedErrors){
            return transformedErrors;
        }
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
            //row.QCStateLabel = errorQC;
        }
    },
    snomedToString: function (code, meaning){
        if(!meaning){
            LABKEY.Query.selectRows({
                //TODO: change to EHR_lookups eventually
                schemaName: 'lists',
                queryName: 'snomed',
                filterArray: [LABKEY.Filter.create('code', code, LABKEY.Filter.Types.EQUALS_ONE_OF)],
                columns: 'meaning',
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
    dateToString: function (date){
        //TODO: do better once more date functions added
        if(date){
            date = new Date(date);
            return (date.getFullYear() ? date.getFullYear()+'-'+EHR.validation.padDigits(date.getMonth()+1, 2)+'-'+EHR.validation.padDigits(date.getDate(), 2) : '');
        }
        else
            return '';
    },
    dateTimeToString: function (date){
        if(date){
            date = new Date(date);
            return date.getFullYear()+'-'+EHR.validation.padDigits(date.getMonth()+1, 2)+'-'+EHR.validation.padDigits(date.getDate(), 2)
                    ' '+date.getHours()+':'+date.getMinutes();
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
    flagSuspiciousDate: function(row, errors){
        //TODO
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
    flagSuspImmunology: function(row, errors){
        //TODO: flag abnormal values - query ref_range table using testId
    },
    flagSuspHematology: function(row, errors){
        //TODO: flag abnormal values - query ref_range table using testId
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

        else
            row.species = 'Unknown';
    },
    verifyIsFemale: function(row, errors){
        LABKEY.Query.selectRows({
            schemaName: 'study',
            queryName: 'demographics',
            filterArray: [
                LABKEY.Filter.create('Id', row.Id, LABKEY.Filter.Types.EQUAL)
            ],
            columns: 'Id,gender/origGender',
            success: function(data){
                if(data && data.rows && data.rows.length){
                    console.log(data.rows[0]);
                    if(data.rows[0]['gender/origGender'] && data.rows[0]['gender/origGender'] != 'f')
                        EHR.addError(errors, 'Id', 'This animal is not female', 'ERROR');
                }
            },
            failure: EHR.onFailure
        });
    }
};

EHR.ETL = {
    fixRow: function(row, errors){
        console.log('Running ETL repair on mySQL data:');

        //inserts a date if missing
        EHR.ETL.addDate(row, errors);

        EHR.ETL.fixParticipantId(row, errors);

        if (row.project)
            EHR.ETL.fixProject(row, errors);

        //allows dataset-specific code
        if(this.onETL)
            this.onETL(row, errors);

        if(shared.verbosity > 0)
            console.log('Repaired: '+row);
    },
    fixProject: function(row, errors){
        //i think the ETL can return project as a string
        if (row.project && !/^\d*$/.test(row.project)){
            EHR.addError(errors, 'project', 'Bad Project#: '+row.project, 'ERROR');
            row.project = null;
            //row.QCStateLabel = errorQC;
        }
    },
    fixParticipantId: function (row, errors){
        if (!row.Id){
            row.id = 'MISSING';
            EHR.addError(errors, 'Id', 'Missing Id', 'ERROR');
            //row.QCStateLabel = errorQC;
        }

        //TODO: regex validate patterns and warn
    },
    addDate: function (row, errors){
        if (!row.Date){
            //we need to insert something for a date...
            row.Date = new java.util.Date();
            EHR.addError(errors, 'date', 'Missing Date', 'ERROR');
            //row.QCStateLabel = errorQC;
        }
    },
    fixBiopsyCase: function(row, errors){
        //we try to clean up the biopsy ID
        var re = /([0-9]+)(b)([0-9]+)/i;
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
    fixUrineQuantity: function(row, errors){
        //we try to remove non-numeric characters from this field
        if (row.quantity && typeof(row.quantity) == 'string' && !row.quantity.match(/^(\d*\.*\d*)$/)){
            //we need to manually split these into multiple rows
            if (row.quantity.match(/,/)){
                row.quantity = null;
                EHR.addError(errors, 'quantity', 'Problem with quantity: ' + row.quantity, 'WARN');
                //row.QCStateLabel = errorQC;
            }
            else {
                //did not find other strings in data
                row.quantity = row.quantity.replace(' ', '');
                row.quantity = row.quantity.replace('n/a', '');
                row.quantity = row.quantity.replace('N/A', '');
                row.quantity = row.quantity.replace('na', '');
                row.quantity = row.quantity.replace(/ml/i, '');
                row.quantity = row.quantity.replace('prj31f', '');

                //var match = row.quantity.match(/^([<>~]*)[ ]*(\d*\.*\d*)[ ]*(\+)*(.*)$/);
                var match = row.quantity.match(/^\s*([<>~]*)\s*(\d*\.*\d*)\s*(\+)*(.*)$/);
                if (match[1] || match[3])
                    row.quantityOORIndicator = match[1] || match[3];

                row.quantity = match[2];
            }
        }
    },
    fixDrugUnits: function(row, errors){
        //TODO
    },
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
    fixNecropsyCase: function(row, errors){
        //we try to clean up the caseno
        var re = /([0-9]+)(a|c)([0-9]+)/i;
        var match = row.caseno.match(re);
        if (!match){
            EHR.addError(errors, 'caseno', 'Malformed CaseNo: '+row.caseno, 'WARN');
            //row.QCStateLabel = errorQC;
        }
        else {
            //fix the year
            if (match[1].length == 2){
                //kind of a hack. we just assume records wont be that old
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
    fixSurgMajor: function(row, errors){
        switch (row.major){
            case 'y':
            case 'Y':
                row.major = true;
                break;
            case 'n':
            case 'N':
                row.major = false;
            default:
                row.major = null;
        }
    },
    fixBirth: function(row, errors){
        //TODO: figure out how to flag estimated birthdates
        //row.birthmvIndicator = 'E';
    },
    remarkToSoap: function(row, errors){
        //convert existing SOAP remarks into 3 cols
        if(row.remark && row.remark.match(/^s\/o: /)){
            console.log('converting string into SOAP Note');
            var so = row.remark.match(/(^s\/o: )(.*)(; a: )/);
            row.so = so[2];
            var a = row.remark.match(/(; a: )(.*)(; p: )/);
            row.a = a[2];
            var p = row.remark.match(/(; p: )(.*)$/);
            row.p = p[2];

            if(row.so && row.a){
                row.remark = null;
            }
            else {
                console.log('ERROR: missing s/o, or a: '+row)
            }
        }
    }
}



