/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/triggers");

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

function onETL(row, errors){
    if(row.code == '00000000'){
        row.code = null;
        row.qualifier = row.meaning;
    }

    //transform non-SNOMED into true SNOMED
    switch (row.code){
        case 'c-f0000a':
            row.qualifier = 'Soak chow in water';
            row.code = 'c-f0000';
            break;
        case 'c-f0000b':
            row.qualifier = 'Soak chow in ensure';
            row.code = 'c-f0000';
            break;
        case 'c-f0000c':
            row.qualifier = 'Zupreem';
            row.code = 'c-f0000';
            break;
        case 'c-f0000d':
            row.qualifier = 'softies';
            row.code = 'c-f0000';
            break;
        case 'c-f0000e':
            row.qualifier = 'softies';
            row.code = 'c-f0000';
            break;
        case 'c-f0000f':
            row.qualifier = 'PB Sand / Fig Newton / Fruit';
            row.code = 'c-f0000';
            break;
        case 'c-f0000g':
            row.qualifier = 'PB Sand / Fig Newton';
            row.code = 'c-f0000';
            break;
        case 'c-f0000h':
            row.qualifier = 'PB Sand';
            row.code = 'c-f0000';
            break;
        case 'c-f0000i':
            row.qualifier = 'PB Sand / Yogurt Sand';
            row.code = 'c-f0000';
            break;
        case 'c-f0000j':
            row.qualifier = 'yogurt';
            row.code = 'c-f0000';
            break;
        case 'c-f0000k':
            row.qualifier = 'Fruit';
            row.code = 'c-f0000';
            break;
        case 'c-f2300a':
            row.qualifier = 'Ensure';
            row.code = 'c-f2300';
            break;
        case 'c-f2300-':
            //row.qualifier = '';
            row.code = 'c-f2300';
            break;
        case 'w-10068a':
            row.qualifier = 'Animal Parade Gummi';
            row.code = 'w-10068';
            break;
        case 'w-10068b':
            row.qualifier = 'Solaray Chewable';
            row.code = 'w-10068';
            break;
        case 'f-61e1fa':
            row.qualifier = 'Primadophilus chewable tablet';
            row.code = 'f-61e1f';
            break;
        case 'f-61e1fb':
            row.qualifier = 'Primadophilus powder';
            row.code = 'f-61e1f';
            break;
        case 'f-61e1f-':
            row.qualifier = 'Yakult';
            row.code = 'f-61e1f';
            break;


        case 'c-60187':
            row.qualifier = 'Rimadyl';
            break;
        case 'c-d1467':
            row.qualifier = 'Flunixin Meglumine (Banamine)';
            break;
        case 'c-60111':
            row.qualifier = 'Tramadol';
            break;
        case 'c-54221':
            row.qualifier = 'Penicillin';
            break;
        case 'c-52340':
            row.qualifier = 'Tylosin tartrate (Tylan)';
            break;
        case 'c-84540':
            row.qualifier = 'Immodium';
            break;
        case 'c-a1210':
            row.qualifier = 'Progesterone preparation';
            break;
        case 'c-622b0':
            row.qualifier = 'Clomicalm';
            break;
        case 'c-680d0':
            row.qualifier = 'Epinephrine';
            break;
        case 'c-71064':
            row.qualifier = 'tumil-K';
            break;
        case 'w-10192':
            row.qualifier = 'Supplemental Enrichment';
            break;
    }

    if(row.vol_units == 'ml')
        row.vol_units = 'mL';
    if(row.vol_units == 'capsules')
        row.vol_units = 'capsule(s)';
    if(row.vol_units == 'pieces')
        row.vol_units = 'piece(s)';
    if(row.vol_units == 'tablets')
        row.vol_units = 'tablet(s)';

    if(row.conc_units == 'mg/ml')
        row.conc_units = 'mg/mL';
    if(row.conc_units == 'IU/ml')
        row.conc_units = 'IU/mL';
    if(row.conc_units == 'units/ml')
        row.conc_units = 'units/mL';
    if(row.conc_units == 'mEq/ml')
        row.conc_units = 'mEq/mL';

    if(row.amount_units == 'ml')
        row.amount_units = 'mL';
    if(row.amount_units == 'NULL')
        row.amount_units = null;


    row.meaning = row.meaning || row.snomedMeaning || null;

    row.performedby = row.performedby || row.userid || null;

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