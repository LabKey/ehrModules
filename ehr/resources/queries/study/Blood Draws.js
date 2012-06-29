    /*
 * Copyright (c) 2010-2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");


function onBecomePublic(errors, scriptContext, row, oldRow){
    if(scriptContext.extraContext.dataSource != 'etl' && row.additionalServices && row.requestId != null){
        //we auto-create a clinpath request if a test is newly added, assuming it comes from a request
        var rts = row.additionalServices.split(';');
        var tests = [];
        var idx = 0;
        //Scrub the string of requested tests for PCR-SRV,1,2,3,4,5
        for (var i = 0; i < rts.length; i++) {
        	if ((rts[i] != "2") && (rts[i] != "3") && (rts[i] != "4") && (rts[i] != "5")) 
        	{
        		   if (rts[i] == "PCR - SRV 1") {
        			   tests[idx++] = "PCR - SRV 1,2,3,4,5";
        		   } else {
        			   tests[idx++] = rts[i]; 
        		   }
        	}
        	
        }

        var toAutomaticallyCreate = [];
        LABKEY.Query.selectRows({
        	schemaName: 'ehr_lookups',
        	queryName: 'blood_draw_services',
        	success: function(data) {
        		if (data.rows && data.rows.length){
        			var rowBDS;
        			var k  = 0;
        			for (i = 0; i < tests.length; i++) {
        				for (var j = 0; j < data.rows.length; j++) {
        				   rowBDS = data.rows[j];
        				   
        				   if (rowBDS.service == tests[i]) {
        				   	  if (rowBDS.automaticrequestfromblooddraw.valueOf() ) {  
        				   	  	toAutomaticallyCreate[k++] = tests[i];
        				   	  }
   				   	          break;
        				   }
        				}
        			}
        		}
        	},
        	failure: EHR.Server.Utils.onFailure
        });
        
        if (toAutomaticallyCreate.length > 0)
		{
            //first create the request
            var requestId = LABKEY.Utils.generateUUID();
            var dateRequested = new Date();

            //if this is part of a request, inherit notify, etc from previous
            var rowObj = {
                daterequested: dateRequested,
                requestid: requestId,
                priority: 'Routine',
                category: 'request',
                formtype: 'Clinpath Request',
                title: 'Clinpath Request: '+row.Id,
                notify1: LABKEY.Security.currentUser.id
            };

            if(row.requestid){
                LABKEY.Query.selectRows({
                    schemaName: 'ehr',
                    queryName: 'requests',
                    filterArray: [
                        LABKEY.Filter.create('requestid', row.requestid, LABKEY.Filter.Types.EQUAL)
                    ],
                    scope: this,
                    success: function(data){
                        if(data.rows && data.rows.length){
                            var r = data.rows[0];

                            rowObj.notify1 = r.notify1;
                            rowObj.notify2 = r.notify2;
                            rowObj.notify3 = r.notify3;
                            rowObj.priority = r.priority;
                        }
                    },
                    failure: EHR.Server.Utils.onFailure
                });
            }

            LABKEY.Query.insertRows({
                schemaName: 'ehr',
                queryName: 'requests',
                extraContext: {
                    quickValidation: true
                },
                rows: [rowObj],
                success: function(data){
                    console.log('Success creating request from blood draw');
                },
                failure: EHR.Server.Utils.onFailure
            });

            var rows = [];
            LABKEY.Query.selectRows({
             	schemaName: 'ehr_lookups',
             	queryName: 'clinpath_tests',
             	success: function(data){
             		if (data.rows && data.rows.length){
             			var cpt;
             		    //Cycle through the toAutomaticallyCreate items to create clinpath tests
             			for (var i = 0; i < toAutomaticallyCreate.length; i++) {
             			  for (var j = 0; j < data.rows.length; j++) {
             			  	cpt = data.rows[j];
             			  	if (cpt.testname == toAutomaticallyCreate[i]) {
             			  		console.log("creating clinPath test = " + cpt.testname);
             			  		rows.push({Id: row.Id, date: dateRequested, project: row.project, account: row.account, requestId: requestId, sampletype: 'Blood - EDTA Whole Blood', collectedBy: row.performedby, serviceRequested: cpt.testname, type: cpt.dataset, QCStateLabel: 'Request: Pending'});
             			  		break;
             			  	}
             			  }
             			}
             		}
             	},
             	failure: EHR.Server.Utils.onFailure
             });
            
             if(rows.length){
                LABKEY.Query.insertRows({
                    schemaName: 'study',
                    queryName: 'Clinpath Runs',
                    extraContext: {
                        quickValidation: true
                    },
                    rows: rows,
                    success: function(data){
                        console.log('Success requesting clinpath tests!')
                    },
                    failure: EHR.Server.Utils.onFailure
                });
            }
        }
    }
}

function onAfterInsert(scriptContext, errors, row){
  if (row.additionalServices && row.requestid == null)
  {

      var toAutomaticallyCreate = getAdditionalServices(row.additionalServices);
      console.log(toAutomaticallyCreate);
      if (toAutomaticallyCreate.length > 0)
      {

          var requestId = LABKEY.Utils.generateUUID();
          var dateRequested = new Date();
          var rowObj = {
                 daterequested: dateRequested,
                 requestid: requestId,
                 priority: 'Routine',
                 formtype: 'Clinpath Request',
                 title: 'Clinpath Service Request from Blood Draw: ' + row.Id,
                 notify1: LABKEY.Security.currentUser.id
          };

          LABKEY.Query.insertRows({
               schemaName: 'ehr',
               queryName: 'requests',
               extraContext: {
                 quickValidation: true
               },
               rows: [rowObj],
               success: function(data) {
                     console.log('Clinpath request created');
               },
               failure: EHR.Server.Utils.onFailure
          });
          var rows = [];
          LABKEY.Query.selectRows({
               schemaName: 'ehr_lookups',
               queryName: 'clinpath_tests',
               success: function(data) {
                if(data.rows && data.rows.length) {
                    var cpt;
                    for (var i = 0; i < toAutomaticallyCreate.length; i++) {
                         for (var j = 0; j < data.rows.length; j++) {
                               cpt = data.rows[j];
                               if (cpt.testname == toAutomaticallyCreate[i]) {
                                        console.log('clinical path service: ' + toAutomaticallyCreate[i] + ' requested');
                                        rows.push({
                                          Id: row.Id, date: dateRequested, project: row.project, account: row.account, requestId: requestId,
                                          sampletype: 'Blood - EDTA Whole Blood', collectedBy: row.performedby,
                                          serviceRequested: cpt.testname, type: cpt.dataset,
                                          QCStateLabel: 'Request: Pending'
                                        });
                                        break;
                               }
                         }
                    }
                }
               },
               failure: EHR.Server.Utils.onFailure
          });
          if (rows.length) {
               LABKEY.Query.insertRows({
                  schemaName: 'study', queryName: 'Clinpath Runs',
                  extraContext: { quickValidation: true },
                  rows: rows,
                  success: function(date) {
                           console.log(' Requesting ' + rows.length + ' clinpath tests');
                  },
                  failure: EHR.Server.Utils.onFailure
               });
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
    if(EHR.Server.Security.getQCStateByLabel(row.QCStateLabel)['metadata/isRequest'] && !row.taskid)
        errorQC = 'ERROR';
    else
        errorQC = 'INFO';

    if(row.quantity===0){
        EHR.Server.Validation.addError(errors, 'quantity', 'This field is required', 'WARN');
    }

    if(context.extraContext.dataSource != 'etl'){
        if(row.date && !row.requestdate)
            row.requestdate = row.date;
        
        //Ensure that requests for blood are not being requested more than 30 days in advance    
        var maxDate = new Date();
        maxDate.setDate(maxDate.getDate()+30);
        var x = String(row.daterequested);
        var monthVal = Number(x.substring(5,7));
        monthVal = monthVal - 1;

        var reqDate = new Date();
        reqDate.setYear(x.substring(0,4));
        reqDate.setMonth(monthVal);
        reqDate.setDate(x.substring(8,10));

        if (reqDate > maxDate)
        {
           console.log('User requested a date of ' + reqDate + ' which is greater than ' + maxDate + ' which is 30 days beyond today');
           EHR.Server.Validation.addError(errors, 'date', 'May not request a blood draw more than 30 days in advance of today ', 'ERROR - May not request a blood draw more than 30 days in advance of today');
        }    

        if(!row.quantity && row.num_tubes && row.tube_vol)
            row.quantity = row.num_tubes * row.tube_vol;
        if (row.additionalServices) {
        	if (row.additionalServices.indexOf('CBC', 0) >= 0  && row.tube_type != 'EDTA' ) {
            		EHR.Server.Validation.addError(errors, 'tube_type', 'May not request CBC without specifying a tube type = \'EDTA\' ', 'ERROR');
           	}
           	if (row.additionalServices.indexOf('Vet-19', 0) >= 0 && row.tube_type != 'SST') {
            		EHR.Server.Validation.addError(errors, 'tube_type', 'May not request Vet-19 without specifying a tube type = \'SST\' ', 'ERROR');
           	}
           	if (row.additionalServices.indexOf('Vet-19', 0) >= 0 && row.additionalServices.indexOf('CBC', 0) >= 0) {
           		EHR.Server.Validation.addError(errors, 'additionalServices', 'May not combine CBC and Vet-19 services with one tube', 'ERROR');
           	}
        }
        if(row.quantity && row.tube_vol){
            if(row.quantity != (row.num_tubes * row.tube_vol)){
                EHR.Server.Validation.addError(errors, 'quantity', 'Quantity does not match tube vol / # tubes', 'INFO');
                EHR.Server.Validation.addError(errors, 'num_tubes', 'Quantity does not match tube vol / # tubes', 'INFO');
            }
            //We do not permit requests of 6mL in EDTA with CBC
            if (row.additionalServices) {
            	var aServices = row.additionalServices;
            	if (row.tube_type == 'EDTA' && row.tube_vol === 6 && row.additionalServices.indexOf('CBC', 0) >= 0) {
            		EHR.Server.Validation.addError(errors, 'tube_type', 'May not request draw of 6mL in EDTA with CBC', 'ERROR');
            	}
            }
            
        }

        EHR.Server.Validation.checkRestraint(row, errors);

        if(row.Id && row.date && row.quantity){
            var minDate = new Date(row.date.toGMTString());
            minDate.setDate(minDate.getDate()-30);

            var checkFutureRecords = true;

            var multiplier = 0.2;
            if(row.species=='Marmoset'){
                multiplier = 0.15;
            }

            var sql = "SELECT b.lsid, coalesce(b.id, d.id) as id, b.quantity, d.MostRecentWeight FROM (SELECT b.lsid, b.id, b.quantity " +
                "FROM study.\"Blood Draws\" b " +
                "WHERE b.id='"+row.Id+"' AND cast(b.date as date) >= '"+EHR.Server.Validation.dateToString(minDate)+"' AND cast(b.date as date) <= '"+EHR.Server.Validation.dateToString(row.date) +"' " +
                "AND (b.qcstate.publicdata = true OR b.qcstate.metadata.DraftData = true) ) b ";

            sql +=
            "RIGHT OUTER JOIN study.demographicsMostRecentWeight d on (d.id=b.id) " +
            "WHERE d.id='"+row.Id+"' ";

            //console.log(sql);
            var availBlood = -1;
            var bloodLast30 = 0;

            // find all blood draws from this animal in 30 days prior to this date
            LABKEY.Query.executeSql({
                schemaName: 'study',
                sql: sql,
                scope: this,
                success: function(data){
                    if(data && data.rows && data.rows.length){
                        var r;
                        for (var i=0;i<data.rows.length;i++){
                            r = data.rows[i];
                            availBlood = r.MostRecentWeight * multiplier *60;

                            //NOTE: if this blood draw is part of the current transaction, we skip it
                            if(r.quantity){
                                if(r.lsid && context.extraContext.bloodTotals[r.id].lsids.indexOf(r.lsid)==-1){
                                    if(!(row.lsid && row.lsid==r.lsid))
                                        bloodLast30 += r.quantity;
                                }
                            }
                        }
                    }
                    else {
                        console.log('no rows found.  blood draws.js line 204');
                    }
                },
                failure: EHR.Server.Utils.onFailure
            });

            //test within this transaction
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
            bloodLast30 += bloodInThisTransaction;
            availBlood = Math.round(availBlood*Math.pow(10,2))/Math.pow(10,2);
            var effectiveBlood = availBlood - bloodLast30;
            if(availBlood > 0 && (effectiveBlood - row.quantity) < 0){
               EHR.Server.Validation.addError(errors, 'num_tubes', 'Blood in this form exceeds allowable. Max allowable is '+effectiveBlood+' mL', errorQC);
               EHR.Server.Validation.addError(errors, 'quantity', 'Blood in this form exceeds allowable. Max allowable is '+effectiveBlood+' mL', errorQC);
               checkFutureRecords = false;
            }


            // find all blood draws from this animal in 30 days after this date
            if(checkFutureRecords){
                var maxDate = new Date(row.date.toGMTString());
                maxDate.setDate(maxDate.getDate()+30);

                var availBlood = -1;
                var bloodNext30 = 0;

                var sql = "SELECT b.lsid, coalesce(b.id, d.id) as id, b.quantity, d.MostRecentWeight FROM (SELECT b.lsid, b.id, b.quantity " +
                    "FROM study.\"Blood Draws\" b " +
                    "WHERE b.id='"+row.Id+"' AND cast(b.date as date) >= '"+EHR.Server.Validation.dateToString(row.date) +"' AND cast(b.date as date) <= '"+EHR.Server.Validation.dateToString(maxDate)+"' " +
                    "AND (b.qcstate.publicdata = true OR b.qcstate.metadata.DraftData = true) ) b ";

                sql +=
                "RIGHT OUTER JOIN study.demographicsMostRecentWeight d on (d.id=b.id) " +
                "WHERE d.id='"+row.Id+"' ";

                //console.log(sql);

                LABKEY.Query.executeSql({
                    schemaName: 'study',
                    sql: sql,
                    scope: this,
                    success: function(data){
                        if(data && data.rows && data.rows.length){
                            var r;
                            for (var i=0;i<data.rows.length;i++){
                                r = data.rows[i];
                                availBlood = r.MostRecentWeight * multiplier *60;
                                if(r.quantity){
                                    //NOTE: if this blood draw is part of the current transaction, we skip it
                                    if(r.lsid && context.extraContext.bloodTotals[r.id].lsids.indexOf(r.lsid)==-1){
                                        if(!(row.lsid && row.lsid==r.lsid))
                                            bloodNext30 += r.quantity;
                                    }
                                }
                            }
                        }
                        else {
                            console.log('no rows found.  blood draws.js line 246');
                        }
                    },
                    failure: EHR.Server.Utils.onFailure
                });

                //test within this transaction
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
                bloodNext30 += bloodInThisTransaction;
                availBlood = Math.round(availBlood*Math.pow(10,2))/Math.pow(10,2);
                var effectiveBlood = availBlood - bloodNext30;
                if(availBlood > 0 && (effectiveBlood - row.quantity) < 0){
                   EHR.Server.Validation.addError(errors, 'num_tubes', 'Blood in this form conflicts with future draws. Max allowable: '+effectiveBlood+' mL', errorQC);
                   EHR.Server.Validation.addError(errors, 'quantity', 'Blood in this form conflicts with future draws. Max allowable: '+effectiveBlood+' mL', errorQC);
                }
            }
        }

        //keep track of blood per ID.  this must happen after the earlier checks on volume
        if(row.Id){
            context.extraContext.bloodTotals[row.Id].rows.push(row);
            if(row.lsid){
                context.extraContext.bloodTotals[row.Id].lsids.push(row.lsid);
            }
        }

    }
}

function getAdditionalServices(enteredServices) {
  var tempVar = enteredServices.split(';');
  var tests = [];
  var idx = 0;
  //Iterate through tempVar in the event that user specified PCR-SRV,1,2,3,4,5 we can scrub it
  for (var i = 0; i<tempVar.length; i++) {
        if ((tempVar[i] != "2") && (tempVar[i] != "3") && (tempVar[i] != "4") && (tempVar[i] != "5"))
        {
                if (tempVar[i] == "PCR - SRV 1") {
                  tests[idx++] = "PCR - SRV 1,2,3,4,5";
                } else {
                  tests[idx++] = tempVar[i];
                }
        }
  }
  var toAutomaticallyCreate = [] ;
  LABKEY.Query.selectRows({
        schemaName: 'ehr_lookups',
        queryName: 'blood_draw_services',
        success: function(data) {
           if (data.rows && data.rows.length) {
                var drawServices;
                var k = 0;
                for (i = 0; i < tests.length; i++) {
                  for (var j = 0; j < data.rows.length; j++) {
                        drawServices = data.rows[j];
                        if (drawServices.service  == tests[i]) {
                          if (drawServices.automaticrequestfromblooddraw.valueOf() ) {
                                toAutomaticallyCreate[k++] = tests[i];
                          }
                          break;
                        }
                  }
                }
             }
         },
         failure: EHR.Server.Utils.onFailure
        });
   return toAutomaticallyCreate;

}

function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if (row.quantity)
        description.push('Total Quantity: '+ row.quantity);
    if (row.performedby)
        description.push('Performed By: '+ row.performedby);
//    if (row.requestor)
//        description.push('Requestor: '+ row.requestor);
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
