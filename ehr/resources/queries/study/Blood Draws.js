    /*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");

function onUpsert(context, errors, row, oldRow){
    var errorQC;
    if(context.qcMap.label[row.QCStateLabel]['metadata/isRequest'])
        errorQC = 'ERROR';
    else
        errorQC = 'WARN';

    if(context.extraContext.dataSource != 'etl' && row.date && !row.requestdate)
        row.requestdate = row.date;

    if(context.extraContext.dataSource != 'etl' && !row.quantity && row.num_tubes && row.tube_vol)
        row.quantity = row.num_tubes * row.tube_vol;

    if(context.extraContext.dataSource != 'etl' && row.quantity && row.tube_vol){
        if(row.quantity != (row.num_tubes * row.tube_vol)){
            EHR.addError(errors, 'quantity', 'Quantity does not match tube vol / # tubes', 'INFO');
            EHR.addError(errors, 'num_tubes', 'Quantity does not match tube vol / # tubes', 'INFO');
        }
    }

    if(context.extraContext.dataSource != 'etl' && row.restraint && !Ext.isDefined(row.restraintTime)){
        //console.log(row.restraint)
        EHR.addError(errors, 'restraintTime', 'Must enter time restrained', 'WARN');
    }

    if(context.extraContext.dataSource != 'etl' && row.Id && row.date && row.quantity){
        var minDate = new Date(row.date.toGMTString());
        minDate.setDate(minDate.getDate()-30);
        minDate = EHR.validation.dateToString(minDate);
        var checkFutureRecords = true;

        var sql = "SELECT b.BloodLast30, d.MostRecentWeight, round((d.MostRecentWeight*0.2*60) - coalesce(b.BloodLast30, 0), 1) AS AvailBlood " +
        "FROM (" +
            "SELECT b.id, sum(b.quantity) as BloodLast30 " +
            "FROM study.\"Blood Draws\" b " +
            "WHERE b.id='"+row.Id+"' AND b.date >= '"+minDate+"' AND b.date <= '"+EHR.validation.dateToString(row.date) +"' " +
            "AND (b.qcstate.publicdata = true OR b.qcstate.metadata.DraftData = true) " +
            "GROUP BY b.id) b " +
        "RIGHT JOIN study.demographicsMostRecentWeight d on (d.id=b.id) " +
        "WHERE d.id='"+row.Id+"' ";
        console.log(sql);
        // find all blood draws from this animal in 30 days prior to this date
        LABKEY.Query.executeSql({
            schemaName: 'study',
            sql: sql,
            success: function(data){
                if(data && data.rows && data.rows.length){
                    var availBlood = data.rows[0].AvailBlood;
                    if(availBlood - row.quantity < 0){
                       EHR.addError(errors, 'num_tubes', 'Volume conflicts with previous blood draws. Max allowable is '+availBlood+' mL', errorQC);
                       EHR.addError(errors, 'quantity', 'Volume conflicts with previous blood draws. Max allowable is '+availBlood+' mL', errorQC);
                       checkFutureRecords = false;
                    }
                }
                else {
                    console.log('no rows found')
                }
            },
            failure: EHR.onFailure
        });

        // find all blood draws from this animal in 30 days after this date
        if(checkFutureRecords){
            var maxDate = new Date(row.date.toGMTString());
            maxDate.setDate(maxDate.getDate()+30);
            maxDate = EHR.validation.dateToString(maxDate);

            sql = "SELECT b.BloodLast30, d.MostRecentWeight, round((d.MostRecentWeight*0.2*60) - coalesce(b.BloodLast30, 0), 1) AS AvailBlood " +
            "FROM (" +
                "SELECT b.id, sum(b.quantity) as BloodLast30 " +
                "FROM study.\"Blood Draws\" b " +
                "WHERE b.id='"+row.Id+"' AND cast(b.date as date) >= '"+EHR.validation.dateToString(row.date) +"' AND cast(b.date as date) <= '"+maxDate+"' " +
                "AND (b.qcstate.publicdata = true OR b.qcstate.metadata.DraftData = true) " +
                "GROUP BY b.id) b " +
            "RIGHT JOIN study.demographicsMostRecentWeight d on (d.id=b.id) " +
            "WHERE d.id='"+row.Id+"' ";
            console.log(sql);
            LABKEY.Query.executeSql({
                schemaName: 'study',
                sql: sql,
                success: function(data){
                    if(data && data.rows && data.rows.length){
                        var availBlood = data.rows[0].AvailBlood;
                        if((availBlood - row.quantity) < 0){
                           EHR.addError(errors, 'num_tubes', 'Volume conflicts with future blood draws. Max allowable: '+availBlood+' mL', errorQC);
                           EHR.addError(errors, 'quantity', 'Volume conflicts with future blood draws. Max allowable: '+availBlood+' mL', errorQC);
                        }
                    }
                    else {
                        console.log('no rows found')
                    }
                },
                failure: EHR.onFailure
            });
        }
    }

    if(row.quantity===0){
        EHR.addError(errors, 'quantity', 'This field is required', 'WARN');
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
