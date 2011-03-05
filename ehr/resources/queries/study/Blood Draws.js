    /*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, shared, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");




function onUpsert(row, errors, oldRow){
    if(!row.quantity && row.num_tubes && row.tube_vol)
        row.quantity = row.num_tubes * row.tube_vol;

    //TODO: verify needed
    if(row.Id){

        // find all blood draws from this animal in 30 days prior to this date
        LABKEY.Query.selectRows({
            schemaName: 'study',
            //TODO: account for QCstate
            sql: "SELECT sum(quantity) as quantity FROM study.\"Blood Draws\" b WHERE id='"+row.Id+"' AND bd.date BETWEEN TIMESTAMPADD('SQL_TSI_DAY', -30, '"+row.date+"') AND '"+row.date+"'",
            filterArray: [
                LABKEY.Filter.create('id', row.Id, LABKEY.Filter.Types.EQUAL)
            ],
            success: function(data){
                if(data && data.rows && data.rows.length)
                    var availBlood = data.rows[0].AvailBlood;
                    console.log('AvailBlood: '+availBlood);

                    if(availBlood - row.quantity < 0)
                       EHR.addError(errors, 'quantity', 'Volume exceeds available blood. Max allowable: '+availBlood, 'ERROR');
            },
            failure: EHR.onFailure
        });

        // find all blood draws from this animal in 30 days after this date
        LABKEY.Query.selectRows({
            schemaName: 'study',
            //TODO: account for QCstate
            sql: "SELECT sum(quantity) as quantity FROM study.\"Blood Draws\" b WHERE id='"+row.Id+"' AND bd.date BETWEEN TIMESTAMPADD('SQL_TSI_DAY', 30, '"+row.date+"') AND '"+row.date+"'",
            filterArray: [
                LABKEY.Filter.create('id', row.Id, LABKEY.Filter.Types.EQUAL)
            ],
            success: function(data){
                if(data && data.rows && data.rows.length)
                    var availBlood = data.rows[0].AvailBlood;
                    console.log('AvailBlood: '+availBlood);

                    if(availBlood - row.quantity < 0)
                       EHR.addError(errors, 'quantity', 'Volume conflicts with future blood draws. Max allowable: '+availBlood, 'ERROR');
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
    if (row.caretaker)
        description.push('Caretaker: '+ row.caretaker);
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
