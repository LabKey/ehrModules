/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");


function onInit(event, context){
    context.allowDeadIds = true;
    context.allowAnyId = true;
    context.extraContext = context.extraContext || {};
    context.extraContext.skipIdFormatCheck = true;
}



function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if(row.species)
        description.push('Species: '+row.species);
    if(row.gender)
        description.push('Gender: '+row.gender);
    if(row.weight)
        description.push('Weight: '+row.weight);
    if(row.dam)
        description.push('Dam: '+row.dam);
    if(row.sire)
        description.push('Sire: '+row.sire);
    if(row.room)
        description.push('Room: '+row.room);
    if(row.cage)
        description.push('Cage: '+row.cage);
    if(row.conception)
        description.push('Conception: '+row.conception);

    return description;
}


function onComplete(event, errors, scriptContext){
    if(scriptContext.publicParticipantsModified.length){
        EHR.sendEmail({
            notificationType: 'Prenatal Death',
            msgContent: 'The following prenatal deaths have been reported:<br>' +
                 scriptContext.publicParticipantsModified.join(',<br>') +
                '<p></p><a href="'+LABKEY.ActionURL.getBaseURL()+'ehr' + LABKEY.ActionURL.getContainer() + '/animalHistory.view#_inputType:renderMultiSubject&subject:'+scriptContext.publicParticipantsModified.join(';')+'&combineSubj:true&activeReport:abstract' +
                '">Click here to view them</a>.',
            msgSubject: 'Prenatal Death Notification'
        });
    }
};