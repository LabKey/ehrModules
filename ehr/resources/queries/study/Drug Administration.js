/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


var {EHR, LABKEY, Ext, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");

function onUpsert(context, errors, row, oldRow){
    if(context.extraContext.dataSource != 'etl'){
        if(!row.amount && !row.volume){
            EHR.addError(errors, 'amount', 'Must supply either amount or volume', 'WARN');
            EHR.addError(errors, 'volume', 'Must supply either amount or volume', 'WARN');
        }

        if(row.amount && row.volume && row.concentration && row.amount!=Math.round(row.volume*row.conc*100/2)){
            EHR.addError(errors, 'amount', 'Amount does not match volume for this concentration', 'WARN');
            EHR.addError(errors, 'volume', 'Volume does not match amount for this concentration', 'WARN');
        }
    }
}

//TODO: consider how this should work
function onBecomePublic(errors, scriptContext, row, oldRow){
    //we need to store something in the date field during the draft stage, so i use header date
    //we swap begindate in here instead
    if(scriptContext.extraContext.dataSource != 'etl' && row.begindate)
        row.date = row.begindate
}


function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if(row.code)
        description.push('Code: '+EHR.validation.snomedToString(row.code,  row.meaning));

    if(row.amount)
        description.push('Amount: '+ row.amount+' '+EHR.validation.nullToString(row.amount_units));

    if(row.route)
        description.push('Route: '+row.route);

    return description;
}

