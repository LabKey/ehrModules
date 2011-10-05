/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


var {EHR, LABKEY, Ext, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");


function onUpsert(context, errors, row, oldRow){
    if(row.Id && row.tattoo && context.extraContext.dataSource != 'etl'){
        var regexp = row.Id.replace(/\D/, '');
        regexp = regexp.replace(/^0+/, '');
        regexp = new RegExp(regexp);

        if(!row.tattoo.match(regexp)){
            EHR.addError(errors, 'tattoo', 'Id not found in the tattoo', 'INFO');
        }
    }
}

function onComplete(event, errors, scriptContext){
    if(scriptContext.publicParticipantsModified.length){
        var valuesMap = {};
        var r;
        for(var i=0;i<scriptContext.rows.length;i++){
            r = scriptContext.rows[i];
            valuesMap[r.row.Id] = {};
            valuesMap[r.row.Id].death = r.row.date;
        }
        EHR.validation.updateStatusField(scriptContext.publicParticipantsModified, null, valuesMap);

        EHR.sendEmail({
            notificationType: 'Animal Death',
            msgContent: 'The following animals have been marked as dead:<br>' +
                 scriptContext.publicParticipantsModified.join(',<br>') +
                '<p></p><a href="'+LABKEY.ActionURL.getBaseURL()+'ehr' + LABKEY.ActionURL.getContainer() + '/animalHistory.view#_inputType:renderMultiSubject&subject:'+scriptContext.publicParticipantsModified.join(';')+'&combineSubj:true&activeReport:abstract' +
                '">Click here to view them</a>.',
            msgSubject: 'Death Notification'
        });
    }
};

function onBecomePublic(errors, scriptContext, row, oldRow){
    //this will close any existing assignments, housing and treatment records
    if(scriptContext.extraContext.dataSource != 'etl')
        EHR.onDeathDeparture(row.Id, row.date);
}

function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if(row.cause)
        description.push('Cause: '+row.cause);
    if(row.manner)
        description.push('Manner: '+row.manner);
    if(row.necropsy)
        description.push('Necropsy #: '+row.necropsy);

    return description;
}

