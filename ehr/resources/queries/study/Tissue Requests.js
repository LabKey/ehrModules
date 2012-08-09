/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/triggers");

function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if(row.gender)
        description.push('Gender: '+row.gender);
    if(row.livedead)
        description.push('Live/Dead: '+row.livedead);
    if(row.wbo)
        description.push('WBO: '+row.wbo);
    if(row.tissue)
        description.push('Tissue: '+row.tissue);
    if(row.source)
        description.push('Source: '+row.source);
    if(row.dest)
        description.push('Dest: '+row.dest);
    if(row.recip)
        description.push('Recipient: '+row.recip);
    if(row.affil)
        description.push('Affiliation: '+row.affil);

    return description;
}