/*
 * Copyright (c) 2010-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

require("ehr/triggers").initScript(this);
EHR.Server.Utils = require("ehr/utils").EHR.Server.Utils;

function onInit(event, helper){
    helper.setScriptOptions({
        requiresStatusRecalc: true
    });

    helper.decodeExtraContextProperty('deathsInTransaction');
}

function onUpsert(helper, scriptErrors, row, oldRow){
    if (row.Id && row.tattoo && !helper.isETL()){
        var regexp = row.Id.replace(/\D/g, '');
        regexp = regexp.replace(/^0+/, '');
        regexp = new RegExp(regexp);

        if (!row.tattoo.match(regexp)){
            EHR.Server.Utils.addError(scriptErrors, 'tattoo', 'Id not found in the tattoo', 'INFO');
        }
    }

    // update demographics death date if finalized and not changed from existing value
    if (!helper.isValidateOnly() && row.Id && row.date && row.QCStateLabel && EHR.Server.Security.getQCStateByLabel(row.QCStateLabel).PublicData){
        EHR.Server.Utils.findDemographics({
            participant: row.Id,
            helper: helper,
            scope: this,
            callback: function (data) {
                if (!data)
                    return;

                var death = EHR.Server.Utils.normalizeDate(row.death);
                if (!death || death.getTime() != row.date.getTime()) {
                    console.log('updating demographics death date');
                    helper.getJavaHelper().updateDemographicsRecord(row.Id, {
                        Id: row.Id,
                        death: row.date
                    });
                }
            }
        });
    }
}

EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.ON_BECOME_PUBLIC, 'study', 'Deaths', function(scriptErrors, helper, row, oldRow) {
    helper.registerDeath(row.Id, row.date);

    //this will close any existing assignments, housing and treatment records
    helper.onDeathDeparture(row.Id, row.date);
});

function onComplete(event, errors, helper){
    var deaths = helper.getDeaths();
    if (deaths){
        var ids = [];
        for (var id in deaths){
            ids.push(id);
        }

        console.log('sending death notification');
        helper.getJavaHelper().sendDeathNotification(ids);
    }
}