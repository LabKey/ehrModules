    /*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");

function onComplete(event, errors, scriptContext){
    if(scriptContext && scriptContext.rows && scriptContext.rows.length){
        var rowObj;
        for(var i=0;i<scriptContext.rows.length;i++){
            rowObj = scriptContext.rows[i];

            //we auto-create a clinpath request if a test is newly added
            if(rowObj.row.additionalServices && event=='insert'){
                //NOTE: we will try supporting this from all paths
                //scriptContext.qcMap.label[rowObj.row.QCStateLabel]['metadata/isRequest']

                var tests = rowObj.row.additionalServices.split(',');

                //request CBC
                if(tests.indexOf('CBC')!=-1 || tests.indexOf('CBC with Differential')!=-1){
                    console.log('Requesting CBC:');
//                    LABKEY.Query.insertRows({
//                        schemaName: 'study',
//                        queryName: 'Clinpath Runs',
//                        extraContext: {
//                            quickValidation: true
//                        },
//                        rows: [{Id: rowObj.row.Id, date: new Date(rowObj.row.date.toGMTString()), project: rowObj.row.project, account: rowObj.row.account, requestId: rowObj.row.requestId, sampletype: 'Blood - EDTA Whole Blood', collectedBy: rowObj.row.performedby, serviceRequested: 'CBC with Differential', dataset: 'Hematology', QCStateLabel: 'Request: Pending'}],
//                        success: function(data){
//                            console.log('Success requesting CBC!')
//                        },
//                        failure: EHR.onFailure
//                    });
                }
                //request Vet19
                if(tests.indexOf('Vet-19')!=-1 || tests.indexOf('Vet-19 Chem Panel')!=-1){
                    console.log('Requesting Vet-19:');
//                    LABKEY.Query.insertRows({
//                        schemaName: 'study',
//                        queryName: 'Clinpath Runs',
//                        extraContext: {
//                            quickValidation: true
//                        },
//                        rows: [{Id: rowObj.row.Id, date: new Date(rowObj.row.date.toGMTString()), project: rowObj.row.project, account: rowObj.row.account, requestId: rowObj.row.requestId, sampletype: 'Blood - EDTA Whole Blood', collectedBy: rowObj.row.performedby, serviceRequested: 'Vet-19 Chem Panel', dataset: 'Chemistry', QCStateLabel: 'Request: Pending'}],
//                        success: function(data){
//                            console.log('Success requesting Vet-19!')
//                        },
//                        failure: EHR.onFailure
//                    });
                }
            }
        }
    }
}


function onUpsert(context, errors, row, oldRow){
    if(context.extraContext.dataSource != 'etl' && row.date && !row.daterequested){
        if(!oldRow || !oldRow.daterequested){
            row.daterequested = row.date;
        }
    }

    //create a placeholder for storing blood vols within this transaction
    context.extraContext = context.extraContext || {};
    context.extraContext.bloodTotals = context.extraContext.bloodTotals || {};
    if(row.Id && !context.extraContext.bloodTotals[row.Id]){
        context.extraContext.bloodTotals[row.Id] = {rows: [], lsids: []};
    }

    //overdraws are handled differently for requests vs actual draws
    var errorQC;
    if(context.qcMap.label[row.QCStateLabel]['metadata/isRequest'] && !row.taskid)
        errorQC = 'ERROR';
    else
        errorQC = 'INFO';

    if(row.quantity===0){
        EHR.addError(errors, 'quantity', 'This field is required', 'WARN');
    }

    if(context.extraContext.dataSource != 'etl'){
        if(row.date && !row.requestdate)
            row.requestdate = row.date;

        if(!row.quantity && row.num_tubes && row.tube_vol)
            row.quantity = row.num_tubes * row.tube_vol;

        if(row.quantity && row.tube_vol){
            if(row.quantity != (row.num_tubes * row.tube_vol)){
                EHR.addError(errors, 'quantity', 'Quantity does not match tube vol / # tubes', 'INFO');
                EHR.addError(errors, 'num_tubes', 'Quantity does not match tube vol / # tubes', 'INFO');
            }
        }

        EHR.validation.checkRestraint(row, errors);

        if(row.Id && row.date && row.quantity){
            var minDate = new Date(row.date.toGMTString());
            minDate.setDate(minDate.getDate()-30);

            var checkFutureRecords = true;

            var multiplier = 0.2;
            if(row.species=='Marmoset'){
                multiplier = 0.15;
            }

            var sql = "SELECT b.BloodLast30, d.MostRecentWeight, round((d.MostRecentWeight*"+multiplier+"*60) - coalesce(b.BloodLast30, 0), 1) AS AvailBlood " +
            "FROM (" +
                "SELECT b.id, sum(b.quantity) as BloodLast30 " +
                "FROM study.\"Blood Draws\" b " +
                "WHERE b.id='"+row.Id+"' AND b.date >= '"+EHR.validation.dateToString(minDate)+"' AND b.date <= '"+EHR.validation.dateToString(row.date) +"' " +
                "AND (b.qcstate.publicdata = true OR b.qcstate.metadata.DraftData = true) ";

            if(context.extraContext.bloodTotals[row.Id] && context.extraContext.bloodTotals[row.Id].lsids.length){
                sql += ' AND b.lsid NOT IN (\''+context.extraContext.bloodTotals[row.Id].lsids.join("','")+'\') '
            }

            sql += "GROUP BY b.id) b " +
            "RIGHT OUTER JOIN study.demographicsMostRecentWeight d on (d.id=b.id) " +
            "WHERE d.id='"+row.Id+"' ";

            //console.log(sql);

            // find all blood draws from this animal in 30 days prior to this date
            LABKEY.Query.executeSql({
                schemaName: 'study',
                sql: sql,
                scope: this,
                success: function(data){
                    var bloodInThisTransaction = 0;
                    if(context.extraContext.bloodTotals[row.Id] && context.extraContext.bloodTotals[row.Id].rows.length){
                        var draw;
                        for(var i=0;i<context.extraContext.bloodTotals[row.Id].rows.length;i++){
                            draw = context.extraContext.bloodTotals[row.Id].rows[i];
                            if(Date.parse(draw.date) >= Date.parse(minDate) && Date.parse(draw.date) <= Date.parse(row.date)){
                                bloodInThisTransaction += draw.quantity;
                            }
                        }
                    }
                    //console.log('other blood: '+bloodInThisTransaction);

                    if(data && data.rows && data.rows.length){
                        var availBlood = data.rows[0].AvailBlood - bloodInThisTransaction;

                        if(availBlood - row.quantity < 0){
                           EHR.addError(errors, 'num_tubes', 'Blood in this form exceeds allowable. Max allowable is '+availBlood+' mL', errorQC);
                           EHR.addError(errors, 'quantity', 'Blood in this form exceeds allowable. Max allowable is '+availBlood+' mL', errorQC);
                           checkFutureRecords = false;
                        }
                    }
                    else {
                        console.log('no rows found.  blood draws.js line 90');
                    }
                },
                failure: EHR.onFailure
            });

            // find all blood draws from this animal in 30 days after this date
            if(checkFutureRecords){
                var maxDate = new Date(row.date.toGMTString());
                maxDate.setDate(maxDate.getDate()+30);

                sql = "SELECT b.BloodLast30, d.MostRecentWeight, round((d.MostRecentWeight*"+multiplier+"*60) - coalesce(b.BloodLast30, 0), 1) AS AvailBlood " +
                "FROM (" +
                    "SELECT b.id, sum(b.quantity) as BloodLast30 " +
                    "FROM study.\"Blood Draws\" b " +
                    "WHERE b.id='"+row.Id+"' AND cast(b.date as date) >= '"+EHR.validation.dateToString(row.date) +"' AND cast(b.date as date) <= '"+EHR.validation.dateToString(maxDate)+"' " +
                    "AND (b.qcstate.publicdata = true OR b.qcstate.metadata.DraftData = true) ";

                if(context.extraContext.bloodTotals[row.Id] && context.extraContext.bloodTotals[row.Id].lsids.length){
                    sql += ' AND b.lsid NOT IN (\''+context.extraContext.bloodTotals[row.Id].lsids.join("','")+'\') ';
                }

                sql += "GROUP BY b.id) b " +
                "RIGHT OUTER JOIN study.demographicsMostRecentWeight d on (d.id=b.id) " +
                "WHERE d.id='"+row.Id+"' ";

                //console.log(sql);

                LABKEY.Query.executeSql({
                    schemaName: 'study',
                    sql: sql,
                    scope: this,
                    success: function(data){
                        var bloodInThisTransaction = 0;
                        if(context.extraContext.bloodTotals[row.Id].rows.length){
                            var draw;
                            for(var i=0;i<context.extraContext.bloodTotals[row.Id].rows.length;i++){
                                draw = context.extraContext.bloodTotals[row.Id].rows[i];
                                if(Date.parse(draw.date) <= Date.parse(maxDate) && Date.parse(draw.date) >= Date.parse(row.date)){
                                    bloodInThisTransaction += draw.quantity;
                                }
                            }
                        }

                        if(data && data.rows && data.rows.length){
                            var availBlood = data.rows[0].AvailBlood - bloodInThisTransaction;
                            if((availBlood - row.quantity) < 0){
                               EHR.addError(errors, 'num_tubes', 'Blood in this form conflicts with future draws. Max allowable: '+availBlood+' mL', errorQC);
                               EHR.addError(errors, 'quantity', 'Blood in this form conflicts with future draws. Max allowable: '+availBlood+' mL', errorQC);
                            }
                        }
                        else {
                            console.log('no rows found: blood draws.js line 132');
                        }
                    },
                    failure: EHR.onFailure
                });
            }
        }

        //keep track of blood per ID
        if(row.Id){
            context.extraContext.bloodTotals[row.Id].rows.push(row);
            if(row.lsid){
                context.extraContext.bloodTotals[row.Id].lsids.push(row.lsid);
            }
        }
    }
}


function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if (row.quantity)
        description.push('Total Quantity: '+ row.quantity);
    if (row.performedby)
        description.push('Performed By: '+ row.performedby);
    if (row.requestor)
        description.push('Requestor: '+ row.requestor);
    if (row.billedby)
        description.push('Billed By: '+ row.billedby);
    if (row.assayCode)
        description.push('Assay Code', row.assayCode);
    if (row.tube_type)
        description.push('Tube Type: '+ row.tube_type);
    if (row.num_tubes)
        description.push('# of Tubes: '+ row.num_tubes);
    if(row.additionalServices)
        description.push('Additional Services: '+ row.additionalServices);

    return description;
}
