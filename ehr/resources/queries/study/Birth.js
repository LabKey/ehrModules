/*
 * Copyright (c) 2010-2014 LabKey Corporation
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

function onUpsert(helper, scriptErrors, row, oldRow){
    if (row.weight && !row.wdate){
        EHR.Server.Utils.addError(scriptErrors, 'wdate', 'This field is required when supplying a weight', 'WARN');
    }

    if (!row.weight && row.wdate){
        EHR.Server.Utils.addError(scriptErrors, 'weight', 'This field is required when supplying a weight date', 'WARN');
    }
}

function onBecomePublic(scriptErrors, helper, row, oldRow){
    var isLiving = EHR.Server.Utils.isLiveBirth(row.cond);
    if (isLiving){
        helper.registerLiveBirth(row.Id, row.date);
    }

    if (!helper.isETL()){
        //if a weight is provided, we insert into the weight table:
        if (row.weight && row.wdate){
            helper.getJavaHelper().insertWeight(row.Id, row.wdate, row.weight);
        }

        //if room provided, we insert into housing.  if this animal already has an active housing record, skip
        if (row.room && row.Id && row.date){
            helper.getJavaHelper().createHousingRecord(row.Id, row.date, (isLiving ? null : row.date), row.room, (row.cage || null));
        }

        if (!helper.isGeneratedByServer()){
            var obj = {
                Id: row.Id,
                gender: row.gender,
                dam: row.dam,
                sire: row.sire,
                origin: row.origin,
                birth: row.date,
                date: row.date,
                calculated_status: isLiving ? 'Alive' : 'Dead'
            };

            if (row['Id/demographics/species']){
                obj.species = row['Id/demographics/species'];
            }

            if (row['Id/demographics/geographic_origin']){
                obj.geographic_origin = row['Id/demographics/geographic_origin'];
            }

            //find dam, if provided
            if (row.dam && !obj.geographic_origin){
                obj.geographic_origin = helper.getJavaHelper().getGeographicOrigin(row.dam);
            }

            //if not already present, we insert into demographics
            helper.getJavaHelper().createDemographicsRecord(row.Id, obj);
        }
    }
}