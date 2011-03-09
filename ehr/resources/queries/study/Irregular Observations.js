/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


//TODO: cascade delete/update records in observations table


var {EHR, LABKEY, Ext, shared, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");


function onUpsert(row, errors, oldRow){
    if (
        row.feces ||
        row.menses ||
        row.behavior ||
        row.breeding ||
        row.other ||
        row.tlocation ||
        row.remark ||
        row.otherbehavior
    ){
        row.isIrregular = true;
    }
    else {
        row.isIrregular = false;
    }

    //todo: testing needed

    //store room at time / cage at time
    if(row.id && row.date){
        //TODO: change odate to enddate
        //TODO: account for QCstate
        var sql = "SELECT h.room, h.cage FROM study.housing h " +
            "WHERE h.id='"+row.Id+"' AND h.date <= '"+EHR.validation.dateTimeToString(row.date) +"' AND (h.odate > '"+EHR.validation.dateTimeToString(row.date)+"' OR h.odate IS NULL";
        LABKEY.Query.executeSql({
            schemaName: 'study',
            sql: sql,
            success: function(data){
                if(data && data.rows && data.rows.length){
                    row.RoomAtTime = data.rows[0].room;
                    row.CageAtTime = data.rows[0].cage;
                    console.log('Room at time: '+row);
                }
            },
            failure: EHR.onFailure
        });
    }

    //if reporting menses, make sure the anmimal is female
    if(row.menses && row.id)
        EHR.validation.verifyIsFemale(row, errors);

}

function onBecomePublic(row, errors, oldRow){
    var rowDataArray = [];
    //auto-update observations table with mens, diar.
    if(row.menses){
        rowDataArray.push({category: 'Irregular Obs', parentid: row.objectid, remark: 'mens: '+row.menses})
    }

    if(row.feces){
        rowDataArray.push({category: 'Irregular Obs', parentid: row.objectid, remark: 'diar: '+row.feces})
    }

    if(rowDataArray.length){
        LABKEY.Query.insertRows({
            schemaName: 'study',
            queryName: 'Clinical Observations',
            rowDataArray: rowDataArray,
            success: function(data){
                console.log('Success')
            },
            failure: function(error){
                console.log(error.exceptionClass)
            }
        });
    }
}


function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if(row.feces)
        description.push('Feces: '+row.feces);
    if(row.menses)
        description.push('Menses: '+row.menses);
    if(row.behavior)
        description.push('Behavior: '+row.behavior);
    if(row.breeding)
        description.push('Breeding: '+row.breeding);
    if(row.other)
        description.push('Other: '+row.other);
    if(row.tlocation)
        description.push('Trauma Location: '+row.tlocation);
    if(row.otherbehavior)
        description.push('Other Behavior: '+row.otherbehavior);

    if(!row.isIrregular)
        description.push('No Irregular Observations');

    return description;
}


