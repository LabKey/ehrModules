/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


var {EHR, LABKEY, Ext, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");

function onUpsert(context, errors, row, oldRow){
    if(context.extraContext.dataSource != 'etl'){
//        if(!row.amount && !row.volume){
//            EHR.addError(errors, 'amount', 'Must supply either amount or volume', 'INFO');
//            EHR.addError(errors, 'volume', 'Must supply either amount or volume', 'INFO');
//        }

        if(row.volume && row.concentration){
            var expected = Math.round(row.volume*row.concentration*1000)/1000;
            if(row.amount!=expected){
                EHR.addError(errors, 'amount', 'Amount does not match volume for this concentration. Expected: '+expected, 'INFO');
                //EHR.addError(errors, 'volume', 'Volume does not match amount for this concentration. Expected: '+expected, 'WARN');
            }
        }

        EHR.validation.checkRestraint(row, errors);

        if(row.qualifier && row.qualifier.match(/\//)){
            EHR.addError(errors, 'qualifier', 'This field contains a /. This likely means you need to pick one of the options', 'INFO');
        }

        //we need to store something in the date field during the draft stage, so i use header date
        //we swap begindate in here instead
        //any form that is an encounter should show begindate, not date
        //other forms will not show begindate, so this shouldnt matter here
        if(row.begindate)
            row.date = row.begindate;
        }
}



function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if(row.code)
        description.push('Code: '+EHR.validation.snomedToString(row.code,  row.meaning));
    if(row.route)
        description.push('Route: '+row.route);
    if(row.volume)
        description.push('Volume: '+ row.volume+' '+EHR.validation.nullToString(row.vol_units));
    if(row.amount)
        description.push('Amount: '+ row.amount+' '+EHR.validation.nullToString(row.amount_units));


    return description;
}

