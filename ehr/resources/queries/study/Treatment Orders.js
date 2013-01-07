/*
 * Copyright (c) 2010-2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

require("ehr/triggers").initScript(this);

function onInit(event, context){
    context.extraContext.removeTimeFromDate = true;
}

function onUpsert(context, errors, row, oldRow){
    if(context.extraContext.dataSource != 'etl'){
        EHR.Server.Validation.removeTimeFromDate(row, errors, 'enddate');

        if(row.volume && row.concentration){
            var expected = Math.round(row.volume*row.concentration*1000)/1000;
            if(row.amount!=expected){
                EHR.Server.Validation.addError(errors, 'amount', 'Amount does not match volume for this concentration. Expected: '+expected, 'WARN');
                //EHR.Server.Validation.addError(errors, 'volume', 'Volume does not match amount for this concentration. Expected: '+expected, 'WARN');
            }
        }
    }
}

function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if(row.meaning)
        description.push('Meaning: '+ row.meaning);
    if(row.code || row.snomedMeaning)
        description.push('Code: '+EHR.Server.Validation.snomedToString(row.code,  row.snomedMeaning));
    if(row.route)
        description.push('Route: '+ row.route);
    if(row.concentration)
        description.push('Conc: '+ row.concentration+ ' '+ EHR.Server.Validation.nullToString(row.conc_units));
    if(row.dosage)
        description.push('Dosage: '+ row.dosage+ ' '+ EHR.Server.Validation.nullToString(row.dosage_units));
    if(row.volume)
        description.push('Volume: '+ row.volume+ ' '+ EHR.Server.Validation.nullToString(row.vol_units));
    if(row.amount)
        description.push('Amount: '+ row.amount+ ' '+ EHR.Server.Validation.nullToString(row.amount_units));

    description.push('EndDate: '+ (row.enddate ? row.enddate : 'none'));


    return description;
}