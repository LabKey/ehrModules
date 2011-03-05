/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


var {EHR, LABKEY, Ext, shared, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");

function onETL(row, errors){
    if (!row.source){
        row.source = 'Unknown';
    }
};

function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if (row.source)
        description.push('Source: ' + row.source);

    return description;
};

function onComplete(event, errors){
    //we will update the demographics table arrivedate field for all participantsModified

//shared.participantsModified = ['cy0113'];

    if(shared.participantsModified.length){
        //find the most recent arrival date per participant
        var toUpdate = [];
        LABKEY.Query.executeSql({
            schemaName: 'study',
            sql: 'SELECT a.Id, max(a.date) as maxDate FROM study.arrival a WHERE a.id IN (\''+shared.participantsModified.join(',')+'\') GROUP BY a.id',
            success: function(data){
                if(data.rows && data.rows.length){
                    var row;
                    for (var i=0;i<data.rows.length;i++){
                        row = data.rows[i];
                        EHR.findDemographics({
                            participant: row.Id,
                            scope: this,
                            callback: function(data){
                                if(data){
                                    if(data.rows[i].maxDate != row.arrivedate)
                                        toUpdate.push({arrivedate: data.rows[i].maxDate, lsid: data.rows[i].lsid});
                                }
                                else {
                                    EHR.addError(errors, 'Id', 'Id not found in demographics table', 'INFO');
                                }
                            }
                        });
                    }
                }
            },
            failure: EHR.onFailure
        });

        if(toUpdate.length){
            LABKEY.Query.updateRows({
                schemaName: 'study',
                queryName: 'demographics',
                rowDataArray: toUpdate,
                success: function(data){
                    console.log('Success updating demographics')
                },
                failure: EHR.onFailure
            });
        }

        //send email to colony records alerting that row is lacking from demographics
//        if(missingIds.length){
//            EHR.sendEmail({
//                notificationType: 'Colony Validation - General',
//                msgSubject: 'Ids missing from demographics table',
//                mgsContent: 'The following Ids were added to the arrival table, but do not have records in the demographics table: '+missingIds.join(',')
//            });
//        }
    }
};