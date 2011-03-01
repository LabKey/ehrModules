/*
 * Copyright (c) 2010 LabKey Corporation
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

var shared = {
    rows: [],
    notificationRecipients : {},
    participantsModified: {},
    PKsModified: {},
    errorQC: 'Review Required',
    qcStateMap: {},
    verbosity: 1,
    permissions: {}
    //errorQC = 4
};
exports.shared = shared;


//NOTES:
//set account based on project.  do differently depending on insert/update.  maybe a flag?
//is the row has id/currentroom, then populate using housing

//Global flags:
//target QC
//errorThreshold

//Context:
//name of query?
//entityId of query?
//map of QC states?


function init(event, errors){
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
    console.log("beforeInsert: " + row);
errors.Id = 'error'
    EHR.rowInit(row, errors, null);

    //dataset-specific beforeInsert
    if(EHR.onUpsert){
        console.log('local onUpsert');
        EHR.onUpsert(row, errors);
    }
    if(EHR.onInsert){
        console.log('local onInsert');
        EHR.onInsert(row, errors);
    }

    EHR.rowEnd(row, errors, null);
}
exports.beforeInsert = beforeInsert;

function afterInsert(row, errors){
    console.log("afterInsert: " + row);

    shared.participantsModified[row.id] = 1;
    shared.PKsModified[row.lsid] = 1;
}
exports.afterInsert = afterInsert;

function beforeUpdate(row, oldRow, errors){
    console.log("beforeUpdate: " + row);

    EHR.rowInit(row, errors, oldRow);

    //dataset-specific beforeUpdate
    if(EHR.onUpsert)
        EHR.onUpsert(row, errors, oldRow);
    if(EHR.onUpdate)
        EHR.onUpdate(row, errors, oldRow);

    rowEnd(row, errors, oldRow);
}
exports.beforeUpdate = beforeUpdate

function afterUpdate(row, oldRow, errors){
    console.log("afterUpdate: " + row);

    shared.participantsModified[row.id] = 1;
    shared.PKsModified[row.lsid] = 1;
}
exports.afterUpdate = afterUpdate;

function beforeDelete(row, errors){
    console.log("beforeDelete: " + row);
}
exports.beforeDelete = beforeDelete;

function afterDelete(row, errors){
    console.log("afterDelete: " + row);
}
exports.afterDelete = afterDelete;

function complete(event, errors) {
    console.log("complete: " + event);

    if(EHR.onComplete){
        console.log('local onComplete');
        EHR.onComplete(event, errors);
    }

    //send emails
    //query notificationRecipients table based on notification type(s)
    //also look to notificationRecipients array

}
exports.complete = complete;

EHR.rowInit = function(row, errors, oldRow){
    if(oldRow && oldRow.QCState){

    }

    //take the current row's QC, compare with old Row's QC if updating
    //reject immediately if they do not have permissions

    if (shared.verbosity > 0)
        console.log('Original Row: '+row);

    //these are extra checks to fix mySQL data
    if (row.dataSource == 'etl'){
        EHR.ETL.fixRow(row, errors)
    }

    //these are always run:

    //validate ID
    //validate project / assignment to that project
    //validate room / cage if present
    //enddate: verify either blank or not prior to date
    //replace date with begindate if data is becoming public

    //flags dates more than 1 year in the future or 60 in the past
    EHR.validation.flagSuspiciousDate(row, errors);
}

EHR.rowEnd = function(row, errors, oldRow){
    //use flag in context
    var errorThreshold = 'WARN';
console.log('running EHR.rowEnd')
    //this converts error objects into an array of strings
    var transformedErrors = EHR.validation.processErrors(row, errors, errorThreshold);

    if (!errors.length){
        row.Description = EHR.setDescription(row, errors).join(',\n');

        if (row.Description.length > 4000)
            row.Description = row.Description.substring(0, 3999);
    }
    else {
        row.Description = transformedErrors.join(',\n');
        row.QCStateLabel = errorQC;
    }

    //empty strings can do funny things in grids...
    for (var i in row){
        if (row[i] === ''){
            row[i] = null;
        }
    }

    //this flag is to let records be validated, but not imported
    if(row._validateOnly){
        errors._validateOnly = true;
    }

    if (shared.verbosity > 0 )
        console.log("New: "+row);

    shared.rows.push(row);
};

EHR.onFailure = function(error){
    console.log('ERROR: '+error.exception);
    console.log(error)
}

EHR.validation = {
    processErrors: function(row, errors, errorThreshold){
        var error;
        var maxSeverity;
        var transformedErrors = [];
        for(var i=0;i<errors.length;i++){
            error = errors[i];

            if (errorThreshold && EHR.validation.errorSeverity[error.severity] < EHR.validation.errorSeverity[errorThreshold])
                continue;

            if (EHR.validation.errorSeverity[error.severity] > EHR.validation.errorSeverity[maxSeverity])
                maxSeverity = error.severity;
console.log(error);
            transformedErrors.push(error.severity+': '+error.msg);
        }

        return transformedErrors;
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
            errors.push({
                msg: 'Row has sensitivity, but no antibiotic',
                severity: 'WARN'
            });
            row.QCStateLabel = errorQC;
        }
    },
    snomedToString: function (title, code, meaning){
        return title+': ' + (meaning ? meaning+(code ? ' ('+code+')' : '') : (code ? code : ''))
    },
    dateToString: function (date){
        //TODO: do better once more date functions added
        if(date){
            date = new Date(date);

            return (date.getFullYear() ? date.getFullYear()+'-'+(date.getMonth()<10 ? 0:'')+date.getMonth()+'-'+(date.getDate()<10 ? 0:'')+date.getDate() : '');
        }
        else
            return '';
    },
    dateTimeToString: function (date){
        if(date){
            date = new Date(date);
            return date.getFullYear()+'-'+(date.getMonth()<10 ? 0:'')+date.getMonth()+'-'+(date.getDate()<10 ? 0:'')+date.getDate()
                    ' '+date.getHours()+':'+date.getMinutes();
        }
        else
            return '';
    },
    nullToString: function(value){
            return (value ? value : '');
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
            errors.push({
                msg: 'Date is more than 1 year in future: '+row.Date,
                severity: 'WARN'
            });
            row.QCStateLabel = errorQC;
        }

        cal1.add(java.util.Calendar.YEAR, -61);
        if(cal1.after(cal2)){
            errors.push({
                msg: 'Date is more than 60 days in past: '+row.Date,
                severity: 'WARN'
            });
            row.QCStateLabel = errorQC;
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
        if(EHR.onETL)
            EHR.onETL(row, errors);

        if(shared.verbosity > 0)
            console.log('Repaired: '+row);
    },
    fixProject: function(row, errors){
        //i think the ETL can return project as a string
        if (row.project && !/^\d*$/.test(row.project)){
            errors.push({
                msg: 'Bad Project#: '+row.project,
                severity: 'ERROR'
            });
            row.project = null;
            row.QCStateLabel = errorQC;
        }
    },
    fixParticipantId: function (row, errors){
        if (!row.Id && !row.id){
            row.id = 'MISSING';
            errors.push({
                msg: 'ERROR: Missing Id',
                severity: 'ERROR'
            });
            row.QCStateLabel = errorQC;
        }

        //TODO: regex validate patterns and warn
    },
    addDate: function (row, errors){
        if (!row.Date){
            //we need to insert something...
            row.Date = new java.util.Date();
            errors.push({
                msg: 'Missing Date',
                severity: 'ERROR'
            });
            row.QCStateLabel = errorQC;
        }
    },
    fixBiopsyCase: function(row, errors){
        //we try to clean up the biopsy ID
        var re = /([0-9]+)(b)([0-9]+)/i;
        var match = row.caseno.match(re);
        if (!match){
            errors.push({
                msg: 'Error in CaseNo: '+row.caseno,
                severity: 'WARN'
            });
            row.QCStateLabel = errorQC;
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
                errors.push({
                    msg: 'Unsure how to correct year in CaseNo: '+match[1],
                    severity: 'WARN'
                });
                row.QCStateLabel = errorQC;
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
                errors.push({
                    msg: 'Problem with results: ' + row.stringResults,
                    severity: 'WARN'
                });
                row.stringResults = null;
                row.QCStateLabel = errorQC;
            }
            else {
                //did not find other strings in data
                row.stringResults = row.stringResults.replace('less than', '<');

                var match = row.stringResults.match(/^([<>=]*)[ ]*(\d*\.*\d*)([-]*\d*\.*\d*)([+]*)[ ]*(.*)$/);

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
            //this covers the situation where a mySQL string column contained a numeric value
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
                errors.push({
                    msg: 'Problem with quantity: ' + row.quantity,
                    severity: 'WARN'
                });
                row.QCStateLabel = errorQC;
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
            errors.push({
                msg: 'Malformed CaseNo: '+row.caseno,
                severity: 'WARN'
            });
            row.QCStateLabel = errorQC;
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
                errors.push({
                    msg: 'Unsure how to correct year in CaseNo: '+match[1],
                    severity: 'WARN'
                });
                row.QCStateLabel = errorQC;
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
            default:
                row.major = false;
        }
    },
    fixBirth: function(row, errors){
        //TODO: figure out how to flag estimated birthdates
        //row.birthmvIndicator = 'E';
    }
}



