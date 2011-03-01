/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


var {EHR, LABKEY, Ext, shared, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");

console.log("** evaluating: " + this['javax.script.filename']);

EHR.onETL = function(row, errors){
    if (!row.source){
        row.source = 'Unknown';
    }

};

EHR.setDescription = function(row, errors){
    //we need to set description for every field
    var description = new Array();

    if (row.source)
        description.push('Source: ' + row.source);

    return description;
};

EHR.onComplete = function(event, errors){
    //todo update demographics
    var changedIds = [];
    for(var i in shared.participantsModified){
        changedIds.push(i);
    }

//changedIds = ['cy0113'];

    if(shared.verbosity > 0)
        console.log(changedIds);

<<<<<<< .mine
    if(changedIds.length){
        var demographicsMap = {};
        LABKEY.Query.selectRows({
            schemaName: 'study',
            queryName: 'demographics',
            filterArray: [LABKEY.Filter.create('Id', changedIds.join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF)],
            columns: 'lsid,arrivedate,Id',
            success: function(data){
                if(data.rows && data.rows.length){
                    for (var i=0;i<data.rows.length;i++){
                        demographicsMap[data.rows[i].Id] = data.rows[i];
                    }
=======
}


function beforeInsert(row, errors) {
    beforeBoth(row, errors);

}

function beforeUpdate(row, oldRow, errors) {
    beforeBoth(row, errors);

}



// ================================================

//==includeStart
/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
console.log("** evaluating: " + this['javax.script.filename']);

//var errorQC = 4;
var errorQC = 'Review Required';
var verbosity = 0;


var EHR = {};
EHR.validation = {
    rowInit: function(row, errors){
        //row.dataSource = 'etl';
        row._warnings = new Array();
        
        if (verbosity > 1)
            console.log('Original: '+row);

        //these are extra checks to fix mySQL data
        if (row.dataSource == 'etl'){
            //inserts a date if missing
            EHR.validation.addDate(row, errors);

            EHR.validation.fixParticipantId(row, errors);
            if (row.project)
                EHR.validation.fixProject(row, errors);

            repairRow(row, errors);
            if(verbosity > 1)
                console.log('Repaired: '+row);
        }

        //these are always run

        //flags dates more than 1 year in the future or 60 in the past
        EHR.validation.suspDate(row, errors);
    },
    rowEnd: function(row, errors){

        if (!row._warnings.length){
            row.Description = setDescription(row, errors).join(',\n');

            if (row.Description.length > 4000)
                row.Description = row.Description.substring(0, 3999);
        }
        else {
            row.Description = row._warnings.join(',\n');
            row.QCStateLabel = errorQC;
        }

        for (var i in row){
            if (row[i] == ''){
                row[i] = null;
            }
        }

        if (verbosity > 0 )
            console.log("New: "+row);
    },
    antibioticSens: function(row, errors){
        if (row.sensitivity && row.antibiotic == null){
            row.antibiotic = 'Unknown';
            row._warnings.push('ERROR: Row has sensitivity, but no antibiotic');
            row.QCStateLabel = errorQC;
        }
    },
    snomedString: function (title, code, meaning){
        return title+': ' + (meaning ? meaning+(code ? ' ('+code+')' : '') : (code ? code : ''))
    },
    dateString: function (date){
        //TODO: do better once more date functions added
        if(date){
            date = new Date(date);

            return (date.getFullYear() ? date.getFullYear()+'-'+(date.getMonth()<10 ? 0:'')+date.getMonth()+'-'+(date.getDate()<10 ? 0:'')+date.getDate() : '');
        }
        else
            return '';
    },
    dateTimeString: function (date){
        if(date){
            date = new Date(date);
            return date.getFullYear()+'-'+(date.getMonth()<10 ? 0:'')+date.getMonth()+'-'+(date.getDate()<10 ? 0:'')+date.getDate()
                    ' '+date.getHours()+':'+date.getMinutes();
        }
        else
            return '';
    },
    fixProject: function(row, errors){
        //i think the ETL can return project as a string
        if (row.project && !/^\d*$/.test(row.project)){
        //if (row.project && typeof(row.project)!='number' && typeof(row.project)!='integer' && !row.project.search(/^[0-9]*$/)){
            row._warnings.push('ERROR: Bad Project#: '+row.project);
            row.project = null;
            row.QCStateLabel = errorQC;
        }
    },
    fixParticipantId: function (row, errors){
        if (!row.Id && !row.id){
            row.id = 'MISSING';
            row._warnings.push('ERROR: Missing Id');            
            row.QCStateLabel = errorQC;
        }

        //TODO: regex validate patterns and warn
    },
    addDate: function (row, errors){
        if (!row.Date){
            //we need to insert something...
            row.Date = new java.util.Date();
            row._warnings.push('ERROR: Missing Date');
            row.QCStateLabel = errorQC;
        }
    },
    fixBiopsyCase: function(row, errors){
        //we try to clean up the biopsy ID
        var re = /([0-9]+)(b)([0-9]+)/i;
        var match = row.caseno.match(re);
        if (!match){
            row._warnings.push('Error in caseno: '+row.caseno);
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
                row._warnings.push('Unsure how to correct caseno year: '+match[1]);
                row.QCStateLabel = errorQC;
            }
            
            //standardize number to 3 digits
            if (match[3].length != 3){
                var tmp = match[3];
                for (var i=0;i<(3-match[3].length);i++){
                    tmp = '0' + tmp;
>>>>>>> .r15703
                }
            },
            failure: EHR.onFailure
        });
        //find the most recent arrival date per participant

        LABKEY.Query.executeSql({
            schemaName: 'study',
            sql: 'SELECT a.Id, max(a.date) as maxDate FROM study.arrival a WHERE a.id IN (\''+changedIds.join(',')+'\') GROUP BY a.id',
            success: function(data){
                if(data.rows && data.rows.length){
                    for (var i=0;i<data.rows.length;i++){
                        if(!demographicsMap[data.rows[i].Id]){
                            demographicsMap[data.rows[i].Id] = {};
                        }

                        demographicsMap[data.rows[i].Id]['maxArrivalDate'] = data.rows[i].maxDate;
                    }
                }
            },
            failure: EHR.onFailure
        });

        var rowDataArray = [];
        var missingIds = [];
        for (var i=0;i<changedIds.length;i++){
            var id = changedIds[i];

            if(shared.verbosity > 0){
                console.log('demographic map: for: '+id)
                console.log(demographicsMap[id])
            }

            if(!demographicsMap[id] || !demographicsMap[id].lsid){
                missingIds.push(id);
            }
            else {
//                if(demographicsMap[id].arrivedate != demographicsMap[id].maxArrivalDate){
                    rowDataArray.push({
                        lsid: demographicsMap[id].lsid,
                        arrivedate: demographicsMap[id].maxArrivalDate
                    });
//                }
            }
        }
console.log(rowDataArray);
console.log(missingIds);
        if(rowDataArray.length){
            LABKEY.Query.updateRows({
                schemaName: 'study',
                queryName: 'demographics',
                rows: rowDataArray,
                success: function(data){
                    console.log('Success updating demographics')
                },
                failure: EHR.onFailure
            });
        }

        //send email to colony records alerting that row is lacking from demographics
        if(missingIds.length){
            //find recipients:
            var recipients = [];
            LABKEY.Query.selectRows({
                schemaName: 'ehr',
                queryName: 'notificationRecipients',
                filterArray: [LABKEY.Filter.create('notificationType', 'Colony Validation - General', LABKEY.Filter.Types.EQUAL)],
                success: function(data){
                    for(var i=0;i<data.rows.length;i++){
                        recipients.push(LABKEY.Message.createRecipient(LABKEY.Message.recipientType.to, data.rows[i].recipient));

                        if(shared.verbosity > 0)
                            console.log('Sending email to: '+data.rows[i].recipient);
                    }

                    if(recipients.length){
                        LABKEY.Message.sendMessage({
                            msgFrom: 'admin@test.com',
                            msgSubject: 'Ids missing from demographics table',
                            msgRecipients: recipients,
                            msgContent: [
                                //LABKEY.Message.createMsgContent(LABKEY.Message.msgType.html, '<h2>This is a test message</h2>'),
                                LABKEY.Message.createMsgContent(LABKEY.Message.msgType.plain, 'The following Ids were added to arrival, but do not have records in the demographics table: '+missingIds.join(','))
                            ]
                        });
                    }
                },
                failure: EHR.onFailure
            });
        }
    }

}