/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");




function onETL(row, errors){
    if(row.code == '00000000')
        row.code = null;
    
}

function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if(row.code || row.snomedMeaning)
        description.push('Code: '+EHR.validation.snomedToString(row.code,  row.snomedMeaning));
    if(row.meaning)
        description.push('Meaning: '+ row.meaning);
    if(row.volume)
        description.push('Volume: '+ row.volume+ ' '+ EHR.validation.nullToString(row.vunits));
    if(row.conc)
        description.push('Conc: '+ row.conc+ ' '+ EHR.validation.nullToString(row.cunits));
    if(row.amount)
        description.push('Amount: '+ row.amount+ ' '+ EHR.validation.nullToString(row.units));
    if(row.route)
        description.push('Route: '+ row.route);

    description.push('EndDate: '+ (row.enddate ? row.enddate : 'none'));


    return description;
}

