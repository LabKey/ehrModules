/*
 * Copyright (c) 2010-2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/triggers");

//function onInit(event, context){
//    context.extraContext.allowAnyId = true;
//}

function onUpsert(context, errors, row, oldRow){
    //TODO: do we need this for every ETL record?
    //NOTE: this should be getting set by the birth, death, arrival & departure tables
    if(!row.calculated_status || context.extraContext.dataSource == 'etl'){
        row = EHR.Server.Validation.updateStatusField([row.Id], row);
    }
}

function onETL(row, errors){
    var species = EHR.Server.Validation.getSpecies(row, errors);
    row.species = row.species || species;

    //the ETL code is going to error if the row is missing a date.
    //since demographics can have a blank date, we remove that:
    if(errors['date']){
        var obj = [];
        Ext.each(errors['date'], function(e){
            if(e.message!='Missing Date')
                obj.push(e);
        }, this);
        errors.date = obj;
    }

}

function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    return description;
}
