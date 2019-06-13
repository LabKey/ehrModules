/*
 * Copyright (c) 2018-2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

require("ehr/triggers").initScript(this);
EHR.Server.Utils = require("ehr/utils").EHR.Server.Utils;

var demographicsUpdates = [];
var validIds = [];

function onInit(event, helper){
    helper.setScriptOptions({
        requiresStatusRecalc: true
    });

    helper.decodeExtraContextProperty('deathsInTransaction');

    // Cache valid Ids for check on each row
    LABKEY.Query.selectRows({
        requiredVersion: 9.1,
        schemaName: 'study',
        queryName: 'demographics',
        columns: ['Id'],
        scope: this,
        success: function (results) {
            if (!results || !results.rows || results.rows.length < 1)
                return;

            for(var i=0; i<results.rows.length; i++) {
                validIds.push(results.rows[i]["Id"]["value"])
            }
        },
        failure: function (error) {
            console.log(error);
        }
    });
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
    if (!helper.isValidateOnly() && row.Id && row.date && row.QCStateLabel && EHR.Server.Security.getQCStateByLabel(row.QCStateLabel).PublicData) {

        if (validIds.indexOf(row.id) !== -1) {

            var death = EHR.Server.Utils.normalizeDate(row.death);
            if (!death || death.getTime() != row.date.getTime()) {
                demographicsUpdates.push({
                    Id: row.Id,
                    death: row.date
                });
            }
        }
        else {
            console.log(row.id + " is not a valid id");
        }
    }
}

EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.ON_BECOME_PUBLIC, 'study', 'Deaths', function(scriptErrors, helper, row, oldRow) {
    helper.registerDeath(row.Id, row.date);

    //this will close any existing assignments, housing and treatment records
    helper.onDeathDeparture(row.Id, row.date);
});

function onComplete(event, errors, helper){

    if (demographicsUpdates.length > 0) {
        console.log('updating demographics death date for ' + demographicsUpdates.length + " animals");
        helper.getJavaHelper().updateDemographicsRecord(demographicsUpdates);
    }

    var deaths = helper.getDeaths();
    if (deaths){
        var ids = [];
        for (var id in deaths){
            ids.push(id);
        }

        if (!helper.isETL()) {
            console.log('sending death notification');
            helper.getJavaHelper().sendDeathNotification(ids);
        }
    }
}