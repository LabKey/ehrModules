/*
 * Copyright (c) 2010-2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");


function onInit(event, context){
    context.allowDeadIds = true;
    context.allowAnyId = true;
    context.extraContext = context.extraContext || {};
    context.extraContext.skipIdFormatCheck = true;
}


function onUpsert(context, errors, row, oldRow){
    if(context.extraContext.dataSource != 'etl')
        EHR.Server.Validation.removeTimeFromDate(row, errors);

    //lookup test type if not supplied:
    if(!row.type && row.servicerequested){
        context.clinPathTests = context.clinPathTests || {};
        if(Ext.isDefined(context.clinPathTests[row.servicerequested])){
            row.type = context.clinPathTests[row.servicerequested];
        }
        else {
            LABKEY.Query.selectRows({
                schemaName: 'ehr_lookups',
                queryName: 'clinpath_tests',
                columns: '*',
                scope: this,
                filterArray: [
                    LABKEY.Filter.create('testname', row.servicerequested, LABKEY.Filter.Types.EQUAL)
                ],
                success: function(data){
                    if(data && data.rows && data.rows.length==1){
                        context.clinPathTests[row.servicerequested] = data.rows[0].dataset;
                        row.type = context.clinPathTests[row.servicerequested];
                    }
                    else {
                        context.clinPathTests[row.servicerequested] = null;
                    }
                },
                failure: EHR.Server.Utils.onFailure
            });
        }
    }

}

function onComplete(event, errors, scriptContext) {

           if (scriptContext.rows.length > 0) {
              r = scriptContext.rows[0];
              if (r.row.requestid && !r.row.taskid && r.row.QCState == 5) {
                LABKEY.Query.selectRows({
                        schemaName:'ehr',
                        queryName:'requests',
                        filterArray:[
                          LABKEY.Filter.create('requestid', r.row.requestid, LABKEY.Filter.Types.EQUAL)
                        ],
                        scope:this,
                        success: function(data){
                         if (data.rows && data.rows.length) {
                            var dRow = data.rows[0];
                            if (dRow.priority == 'Stat') {
                                 EHR.Server.Validation.sendEmail({
                                  notificationType: 'Clinpath Request - Stat',
                                  msgContent: 'A clinpath request (' + dRow.rowid +') requires immediate attention:<br>' +
                                    dRow.title + ',<br>' +
                                  '<p></p><a href="'+LABKEY.ActionURL.getBaseURL()+'ehr' + LABKEY.ActionURL.getContainer() + '/requestDetails.view?formtype=Clinpath Request&requestid=' + r.row.requestid +
                 '">Click here to view request ' + dRow.rowid +'</a>.',
                                  msgSubject: 'Request ' + dRow.rowid + ' Stat!'
                                 });
                            }
                         }
                        },
                        failure:EHR.Server.Utils.onFailure
                });
              }
           }
}


function onETL(row, errors){
    if(row.sampleQuantity)
        EHR.ETL.fixSampleQuantity(row, errors, 'sampleQuantity');

}


function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if (row.type)
        description.push('Type: '+row.type);

    if (row.serviceRequested)
        description.push('Service Requested: '+row.serviceRequested);

    if (row.sampleType)
        description.push('Sample Type: '+row.sampleType);

    if (row.sampleId)
        description.push('Sample Id: '+row.sampleId);

    if (row.collectedBy)
        description.push('Collected By: '+row.collectedBy);

    if (row.collectionMethod)
        description.push('Collection Method: '+row.collectionMethod);

    if (row.clinremark)
        description.push('Clinical Remark: '+row.clinremark);

    return description;
}

