/*
 * Copyright (c) 2012-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var console = require("console");
var LABKEY = require("labkey");

var EHR = {};
exports.EHR = EHR;

EHR.Server = {};
EHR.Server.Utils = require("ehr/utils").EHR.Server.Utils;
EHR.Server.Security = require("ehr/security").EHR.Server.Security;

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
    checkRestraint: function(row, scriptErrors){
        if (row.restraint && !LABKEY.ExtAdapter.isDefined(row.restraintDuration))
            EHR.Server.Utils.scriptErrors(errors, 'restraintDuration', 'Must enter time restrained', 'INFO');

    },

    /**
     * A helper that will find the next available necropsy or biopsy case number, based on the desired year and type of procedure.
     * @param row The labkey row object
     * @param errors The errors object
     * @param table The queryName (Necropies or Biopsies) to search
     * @param procedureType The single character identifier for the type of procedure.  At time of writing, these were b, c or n.
     */
    calculateCaseno: function(row, errors, table, procedureType){
        //TODO: move to java
        var year = row.date.getYear() + 1900;
        LABKEY.Query.executeSql({
            schemaName: 'study',
            sql: "SELECT cast(SUBSTRING(MAX(caseno), 6, 8) AS INTEGER) as caseno FROM study."+table+" WHERE caseno LIKE '" + year + procedureType + "%'",
            scope: this,
            success: function(data){
                if (data && data.rows && data.rows.length==1){
                    var caseno = data.rows[0].caseno || 1;
                    caseno++;
                    caseno = EHR.Server.Utils.padDigits(caseno, 3);
                    row.caseno = year + procedureType + caseno;
                }
            },
            failure: EHR.Server.Utils.onFailure
        });

    },

    /**
     * A helper that will verify whether the caseno on the provided row is unique in the given table.
     * @param helper the script helper
     * @param row The row object, provided by LabKey
     * @param errors The errors object, provided by LabKey
     */
    verifyCasenoIsUnique: function(helper, row, errors){
        //TODO: move to java
        //find any existing rows with the same caseno
        var filterArray = [
            LABKEY.Filter.create('caseno', row.caseno, LABKEY.Filter.Types.EQUAL)
        ];
        if (row.lsid)
            filterArray.push(LABKEY.Filter.create('lsid', row.lsid, LABKEY.Filter.Types.NOT_EQUAL));

        LABKEY.Query.selectRows({
            schemaName: helper.getSchemaName(),
            queryName: help.getQueryName(),
            filterArray: filterArray,
            scope: this,
            success: function(data){
                if (data && data.rows && data.rows.length){
                    EHR.Server.Utils.addError(errors, 'caseno', 'One or more records already uses the case no: ' + row.caseno, 'INFO');
                }
            },
            failure: EHR.Server.Utils.onFailure
        });
    },

    /**
     * A helper that will flag a date if it is in the future (unless the QCState allows them) or if it is a QCState of 'Scheduled' and has a date in the past.
     * @param row The row object, provided by LabKey
     * @param errors The errors object, provided by LabKey
     * @param helper
     */
    verifyDate: function(row, errors, helper){
        var date = EHR.Server.Utils.normalizeDate(row.date);
        if (!date)
            return;

        //find if the date is greater than now
        var currentTime = new java.util.GregorianCalendar();
        var rowTime = new java.util.GregorianCalendar();
        rowTime.setTimeInMillis(date.getTime());
        var millsDiff = rowTime.getTimeInMillis() - currentTime.getTimeInMillis();
        //console.log('mills diff: ' + millsDiff +  ' / ' + rowTime.getTime() + '/' + currentTime.getTime());
        if (!helper.isValidateOnly() && millsDiff > 6000 && !EHR.Server.Security.getQCStateByLabel(row.QCStateLabel).allowFutureDates){
            EHR.Server.Utils.addError(errors, 'date', 'Date is in future', 'ERROR');
        }

        //consider date-only, not date/time
        var currentTimeRounded = new Date(currentTime.getTimeInMillis());
        currentTimeRounded = new Date(currentTimeRounded.getFullYear(), currentTimeRounded.getMonth(), currentTimeRounded.getDate());

        var rowTimeRounded = new Date(rowTime.getTimeInMillis());
        rowTimeRounded = new Date(rowTimeRounded.getFullYear(), rowTimeRounded.getMonth(), rowTimeRounded.getDate());
        var millsDiffRounded = rowTimeRounded.getTime() - currentTimeRounded.getTime();

        if (helper.getEvent() == 'insert' && millsDiffRounded > 6000 && row.QCStateLabel == 'Scheduled'){
            EHR.Server.Utils.addError(errors, 'date', 'Date is in past, but is scheduled', 'WARN');
        }
    },

    /**
     * A helper that will flag any dates more than 1 year in the future or 60 days in the past.
     * @param row The row object, provided by LabKey
     * @param scriptErrors The scriptErrors object, maintined by EHR code
     */
    flagSuspiciousDate: function(row, scriptErrors, helper){
        var date = EHR.Server.Utils.normalizeDate(row.date);
        if (!date)
            return;

        //flag any dates greater than 1 year from now
        var cal1 = new java.util.GregorianCalendar();
        cal1.add(java.util.Calendar.YEAR, 1);
        var cal2 = new java.util.GregorianCalendar();
        cal2.setTimeInMillis(date.getTime());

        if (cal2.after(cal1)){
            EHR.Server.Utils.addError(scriptErrors, 'date', 'Date is more than 1 year in future', 'WARN');
        }

        cal1.add(java.util.Calendar.YEAR, -1); //adjust for the year we added above
        cal1.add(java.util.Calendar.DATE, -60);
        if (cal1.after(cal2)){
            var qc = EHR.Server.Security.getQCState(row);
            if (!qc || !qc.PublicData){
                var severity = helper.allowDatesInDistantPast() ? 'INFO' : 'WARN';
                EHR.Server.Utils.addError(scriptErrors, 'date', 'Date is more than 60 days in past', severity);
            }
        }
    },

    /**
     * A helper that will verify that the ID located in the specified field is female.
     * @param row The row object, provided by LabKey
     * @param errors The errors object, provided by LabKey
     * @param helper The script helper
     * @param targetField The field containing the ID string to verify.
     */
    verifyIsFemale: function(row, errors, helper, targetField){
        EHR.Server.Utils.findDemographics({
            participant: row.Id,
            helper: helper,
            scope: this,
            callback: function(data){
                if (data){
                    if (data['gender/origGender'] && data['gender/origGender'] != 'f')
                        EHR.Server.Utils.addError(errors, (targetField || 'Id'), 'This animal is not female', 'ERROR');
                }
            }
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
//TODO: push to java code
        var toUpdate = [];
        var demographics = {};
        LABKEY.ExtAdapter.each(publicParticipantsModified, function(id){
            demographics[id] = {};
        });

        //NOTE: to improve efficiency when only 1 animal is present, we define the WHERE logic here:
        var whereClause;
        if (publicParticipantsModified.length==1)
            whereClause = "= '"+publicParticipantsModified[0]+"'";
        else
            whereClause = "IN ('"+(publicParticipantsModified.join('\',\''))+"')";


        //we gather the pieces of information needed to calculate the status field
        LABKEY.Query.executeSql({
            schemaName: 'study',
            sql: "select T1.Id, max(T1.date) as MostRecentArrival FROM study.arrival T1 WHERE T1.id "+whereClause+" AND T1.qcstate.publicdata = true GROUP BY T1.Id",
            scope: this,
            success: function(data){
                if (!data.rows.length){
                    //console.log('No rows returned for mostRecentArrival');
                    return
                }

                LABKEY.ExtAdapter.each(data.rows, function(r){
                    if (r.MostRecentArrival)
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
                if (!data.rows.length){
                    //console.log('No rows returned for mostRecentDeparture');
                    return;
                }

                LABKEY.ExtAdapter.each(data.rows, function(r){
                    if (r.MostRecentDeparture)
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
                if (!data.rows.length){
                    //TODO: maybe throw flag/email to alert colony records?
                    return
                }

                LABKEY.ExtAdapter.each(data.rows, function(r){
                    if (r.birth)
                        demographics[r.Id].birth = new Date(r.birth);
                    if (r.death)
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
            sql: "select T1.Id, max(T1.date) as date FROM study.birth T1 WHERE T1.id " + whereClause + " AND T1.qcstate.publicdata = true GROUP BY T1.Id",
            scope: this,
            success: function(data){
                if (!data.rows.length){
                    return;
                }

                LABKEY.ExtAdapter.each(data.rows, function(r){
                    if (demographics[r.Id].birth && demographics[r.Id].birth.getTime() != (new Date(r.date)).getTime()){
                        console.error('birth from study.birth doesnt match demographics.birth for: ' +r.Id);
                        console.error(demographics[r.Id].birth);
                        console.error(new Date(r.date));
                    }

                    if (r.date)
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
                if (!data.rows.length){
                    return;
                }
                LABKEY.ExtAdapter.each(data.rows, function(r){
                    //var demographicsDeath = demographics[r.Id].death;
                    if (demographics[r.Id].death && demographics[r.Id].death.getTime() != (new Date(r.date)).getTime()){
                        console.error('death doesnt match for: ' +r.Id);
                        console.error(demographics[r.Id].birth);
                        console.error(new Date(r.date));
                    }

                    if (r.date)
                        demographics[r.Id].death = new Date(r.date);
                }, this);
            },
            failure: EHR.Server.Utils.onFailure
        });

        LABKEY.ExtAdapter.each(publicParticipantsModified, function(id){
            var status;
            var forceUpdate = false;

            var r = demographics[id];

            //when called by birth or death, we allow the script to pass in
            //the values of the rows being changed
            //this saves a duplicate insert/update on demographics
            if (valuesMap && valuesMap[id]){
                if (valuesMap[id].birth && valuesMap[id].birth != r.birth){
                    r.birth = valuesMap[id].birth;
                    r.updateBirth = true;
                    forceUpdate = true;
                }

                if (valuesMap[id].death && valuesMap[id].death != r.death){
                    r.death = valuesMap[id].death;
                    r.updateDeath = true;
                    forceUpdate = true;
                }
            }
            //console.log('Id: ' +id+'/ status: ' +status);

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

            //console.log('Id: ' +id+'/ status: ' +status);

            //NOTE: this is only used when called by the demographics validation script,
            // which passes the row object directly, instead of using updateRows below
            if (demographicsRow && id == demographicsRow.Id){
                demographicsRow.calculated_status = status;
                return demographicsRow;
            }

//            console.log('status: ' +status);
//            console.log('forceUpdate: ' +forceUpdate);
//            console.log('calc status: ' +r.calculated_status);
            if (status != r.calculated_status || forceUpdate){
                //the following means no record exists in study.demographics for this ID
                if (!r.lsid){
                    return;
                }

                var newRow = {Id: id, lsid: r.lsid, calculated_status: status};

                if (r.updateBirth)
                    newRow.birth = EHR.Server.Utils.normalizeDate(r.birth);
                if (r.updateDeath)
                    newRow.death = EHR.Server.Utils.normalizeDate(r.death);

                toUpdate.push(newRow);
            }
        }, this);
        //console.log('to update: ' +toUpdate.length);
        if (toUpdate.length && !demographicsRow){
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

    validateAnimal: function(helper, scriptErrors, row, idProp){
        if (!row[idProp])
            return;

        EHR.Server.Utils.findDemographics({
            participant: row[idProp],
            helper: helper,
            scope: this,
            callback: function(data){
                if (data){
                    if (data.calculated_status != 'Alive' && !helper.isAllowAnyId()){
                        if (data.calculated_status == 'Dead'){
                            if (!helper.isAllowDeadIds())
                                EHR.Server.Utils.addError(scriptErrors, idProp, 'Status of this Id is: ' + data.calculated_status, 'INFO');
                        }
                        else if (data.calculated_status == 'Shipped'){
                            if (!helper.isAllowShippedIds())
                                EHR.Server.Utils.addError(scriptErrors, idProp, 'Status of this Id is: ' + data.calculated_status, 'INFO');
                        }
                        else if (data.calculated_status == null){
                            if (!helper.isAllowAnyId()){
                                if (EHR.Server.Security.getQCStateByLabel(row.QCStateLabel).isRequest)
                                    EHR.Server.Utils.addError(scriptErrors, idProp, 'Id not found in demographics table: ' + row[idProp], 'ERROR');
                                else
                                    EHR.Server.Utils.addError(scriptErrors, idProp, 'Id not found in demographics table: ' + row[idProp], 'INFO');
                            }
                        }
                        else {
                            EHR.Server.Utils.addError(scriptErrors, idProp, 'Status of this Id is: ' + (data.calculated_status || 'Unknown'), 'INFO');
                        }
                    }
                }
                else {
                    if (!helper.isAllowAnyId()){
                        if (EHR.Server.Security.getQCStateByLabel(row.QCStateLabel).isRequest)
                            EHR.Server.Utils.addError(scriptErrors, idProp, 'Id not found in demographics table: ' + row[idProp], 'ERROR');
                        else
                            EHR.Server.Utils.addError(scriptErrors, idProp, 'Id not found in demographics table: ' + row[idProp], 'INFO');
                    }
                }
            }
        });
    }

};