    /*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");

function onUpsert(context, errors, row, oldRow){
    if(!row.quantity && row.num_tubes && row.tube_vol)
        row.quantity = row.num_tubes * row.tube_vol;

    if(row.Id && row.date && row.quantity){
        var minDate = new Date(row.Date);
        minDate.setDate(minDate.getDate()-30);
        minDate = EHR.validation.dateToString(minDate);

        var sql = "SELECT b.BloodLast30, d.weight, round((d.weight*0.2*60) - coalesce(b.BloodLast30, 0), 1) AS AvailBlood " +
        "FROM (" +
            "SELECT b.id, sum(b.quantity) as BloodLast30 " +
            "FROM study.\"Blood Draws\" b " +
            "WHERE b.id='"+row.Id+"' AND b.date >= '"+minDate+"' AND b.date <= '"+EHR.validation.dateToString(row.date) +"' " +
            "AND (b.qcstate.publicdata = true OR b.qcstate.metadata.DraftData = true) " +
            "GROUP BY b.id) b " +
        "RIGHT JOIN study.demographics d on (d.id=b.id) " +
        "WHERE d.id='"+row.Id+"' ";
        //console.log(sql);
        // find all blood draws from this animal in 30 days prior to this date
        LABKEY.Query.executeSql({
            schemaName: 'study',
            sql: sql,
            success: function(data){
                if(data && data.rows && data.rows.length){
                    var availBlood = data.rows[0].AvailBlood;

                    if(availBlood - row.quantity < 0){
                       EHR.addError(errors, 'num_tubes', 'Volume exceeds available blood. Max allowable is '+availBlood+' mL', 'WARN');
                       EHR.addError(errors, 'quantity', 'Volume exceeds available blood. Max allowable is '+availBlood+' mL', 'WARN');
                    }
                }
                else {
                    console.log('no rows found 1')
                }
            },
            failure: EHR.onFailure
        });

        // find all blood draws from this animal in 30 days after this date
        var maxDate = new Date(row.Date);
        maxDate.setDate(maxDate.getDate()+30);
        maxDate = EHR.validation.dateToString(maxDate);

        sql = "SELECT b.BloodLast30, d.weight, round((d.weight*0.2*60) - coalesce(b.BloodLast30, 0), 1) AS AvailBlood " +
        "FROM (" +
            "SELECT b.id, sum(b.quantity) as BloodLast30 " +
            "FROM study.\"Blood Draws\" b " +
            "WHERE b.id='"+row.Id+"' AND b.date >= '"+EHR.validation.dateToString(row.date) +"' AND b.date <= '"+maxDate+"' " +
            "AND (b.qcstate.publicdata = true OR b.qcstate.metadata.DraftData = true) " +
            "GROUP BY b.id) b " +
        "RIGHT JOIN study.demographics d on (d.id=b.id) " +
        "WHERE d.id='"+row.Id+"' ";
        //console.log(sql);
        LABKEY.Query.executeSql({
            schemaName: 'study',
            sql: sql,
            success: function(data){
                if(data && data.rows && data.rows.length){
                    var availBlood = data.rows[0].AvailBlood;

                    if(availBlood - row.quantity < 0)
                       EHR.addError(errors, 'num_tubes', 'Volume conflicts with future blood draws. Max allowable: '+availBlood+' mL', 'WARN');
                       EHR.addError(errors, 'quantity', 'Volume conflicts with future blood draws. Max allowable: '+availBlood+' mL', 'WARN');
                }
                else {
                    console.log('no rows found')
                }
            },
            failure: EHR.onFailure
        });
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
    if (row.sampleId)
        description.push('SampleId', row.sampleId);
    if (row.tube_type)
        description.push('Tube Type: '+ row.tube_type);
    if (row.num_tubes)
        description.push('# of Tubes: '+ row.num_tubes);
    if(row.additionalServices)
        description.push('Additional Services: '+ row.additionalServices);

    return description;
}
