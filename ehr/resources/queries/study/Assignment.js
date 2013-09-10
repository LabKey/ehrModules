/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

require("ehr/triggers").initScript(this);

function onInit(event, helper){
    helper.setScriptOptions({
        allowFutureDates: true,
        removeTimeFromDate: true,
        skipAssignmentCheck: true
    });

    helper.decodeExtraContextProperty('assignmentsInTransaction');

    helper.registerRowProcessor(function(helper, row){
        if (!row.row)
            return;

        row = row.row;

        if (!row.Id || !row.project){
            return;
        }

        var assignmentsInTransaction = helper.getProperty('assignmentsInTransaction');
        assignmentsInTransaction = assignmentsInTransaction || {};
        assignmentsInTransaction[row.Id] = assignmentsInTransaction[row.Id] || [];

        var shouldAdd = true;
        if (row.objectid){
            LABKEY.ExtAdapter.each(assignmentsInTransaction[row.Id], function(r){
                if (r.objectid == row.objectid){
                    shouldAdd = false;
                    return false;
                }
            }, this);
        }

        if (shouldAdd){
            assignmentsInTransaction[row.Id].push({
                objectid: row.objectid,
                date: row.date,
                enddate: row.enddate,
                qcstate: row.QCState,
                project: row.project
            });
        }

        helper.setProperty('assignmentsInTransaction', assignmentsInTransaction);
    });
}

function onUpsert(helper, scriptErrors, row, oldRow){
    if (!helper.isETL()){
        //note: the the date field is handled above by removeTimeFromDate
        EHR.Server.Utils.removeTimeFromDate(row, scriptErrors, 'enddate');
        EHR.Server.Utils.removeTimeFromDate(row, scriptErrors, 'projectedRelease');
    }

    //remove the projected release date if a true enddate is added
    if (row.enddate && row.projectedRelease){
        row.projectedRelease = null;
    }

    //check number of allowed animals at assign/approve time
    if (!helper.isETL() && !helper.isQuickValidation() &&
        !(oldRow && oldRow.Id && oldRow.Id==row.Id) &&
        row.Id && row.project && row.date
    ){
        helper.getJavaHelper().verifyAssignmentCounts(row.Id, row.project);
    }
}