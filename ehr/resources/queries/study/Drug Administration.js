/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

require("ehr/triggers").initScript(this);

function onUpsert(helper, scriptErrors, row, oldRow){
    if (helper.isETL())
        return;

//        if(!row.amount && !row.volume){
//            EHR.Server.Utils.addError(scriptErrors, 'amount', 'Must supply either amount or volume', 'INFO');
//            EHR.Server.Utils.addError(scriptErrors, 'volume', 'Must supply either amount or volume', 'INFO');
//        }

    if (row.volume && row.concentration){
        var expected = Math.round(row.volume * row.concentration * 1000) / 1000;
        if (Math.abs(row.amount - expected) > 0.2){ //allow for rounding
            EHR.Server.Utils.addError(scriptErrors, 'amount', 'Amount does not match volume for this concentration. Expected: '+expected, 'INFO');
            //EHR.Server.Utils.addError(scriptErrors, 'volume', 'Volume does not match amount for this concentration. Expected: '+expected, 'WARN');
        }
    }

    EHR.Server.Validation.checkRestraint(row, scriptErrors);

    if (row.qualifier && row.qualifier.match(/\//)){
        EHR.Server.Utils.addError(scriptErrors, 'qualifier', 'This field contains a /. This likely means you need to pick one of the options', 'INFO');
    }

    //we need to store something in the date field during the draft stage, so i use header date
    //we swap begindate in here instead
    //any form that is an encounter should show begindate, not date
    //other forms will not show begindate, so this shouldnt matter here
    if (row.begindate)
        row.date = row.begindate;
}