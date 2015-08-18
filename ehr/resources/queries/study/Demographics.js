/*
 * Copyright (c) 2010-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

require("ehr/triggers").initScript(this);

function onInit(event, helper){
    helper.setScriptOptions({
        allowAnyId: true,
        requiresStatusRecalc: false,
        allowDatesInDistantPast: true
    });
}

function onUpsert(helper, scriptErrors, row, oldRow){
    //NOTE: this should be getting set by the birth, death, arrival & departure tables
    //ALSO: it should be rare to insert directly into this table.  usually this record will be created by inserting into either birth or arrival
    if (!row.calculated_status && !helper.isETL()){
        row.calculated_status = helper.getJavaHelper().getCalculatedStatusValue(row.Id);
    }

    // Trim animal IDs in these columns
    if (row.dam){
        row.dam = EHR.Server.Utils.trim(row.dam);
    }
    if (row.sire){
        row.sire = EHR.Server.Utils.trim(row.sire);
    }

}