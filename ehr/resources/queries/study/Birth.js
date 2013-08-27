/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

require("ehr/triggers").initScript(this);

function onInit(event, helper){
    helper.setScriptOptions({
        allowAnyId: true,
        requiresStatusRecalc: true,
        allowDeadIds: true,
        skipIdFormatCheck: true,
        skipHousingCheck: true
    });

    helper.decodeExtraContextProperty('birthsInTransaction');
}

function onBecomePublic(scriptErrors, helper, row, oldRow){
    helper.registerBirth(row.Id, row.date);

    if (!helper.isETL()){
        //if a weight is provided, we insert into the weight table:
        if (row.weight && row.wdate){
            helper.getJavaHelper().insertWeight(row.Id, row.wdate, row.weight);
        }

        //if room provided, we insert into housing
        if (row.room && row.cage){
            helper.getJavaHelper().createHousingRecord(row.Id, row.date, null, row.room, row.cage);
        }

        if (!helper.isGeneratedByServer()){
            //if not already present, we insert into demographics
            helper.getJavaHelper().createDemographicsRecord(row.Id, {
                Id: row.Id,
                gender: row.gender,
                dam: row.dam,
                sire: row.sire,
                origin: row.origin,
                birth: row.date,
                date: row.date,
                //TODO: conditionalize based on birth type
                calculated_status: 'Alive'
            });
        }
    }
}