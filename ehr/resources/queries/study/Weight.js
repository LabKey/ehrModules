/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");


//TODO: update demographics


function onUpsert(row, errors, scriptContext, oldRow){
    //warn if more than 10% different from last weight
    if(row.Id && row.weight){
        EHR.findDemographics({
            participant: row.Id,
            callback: function(data){
                if(data){
                    if(data.weight && (row.weight <= data.weight*0.9)){
                        EHR.addError(errors, 'weight', 'Weight drop of >10%. Last weight: '+data.weight, 'INFO');
                    }
                    else if(data.weight && (row.weight >= data.weight/0.9)){
                        EHR.addError(errors, 'weight', 'Weight gain of >10%. Last weight: '+data.weight, 'INFO');
                    }
                }
            },
            scope: this
        });
    }
}

function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

	description.push('Weight: '+row.weight);

    return description;
}

