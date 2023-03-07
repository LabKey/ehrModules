
require("ehr/triggers").initScript(this);

EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.AFTER_INSERT, 'study', 'flags', function(helper, scriptErrors, row, oldRow) {
    //if this category enforces only a single active flag at once, enforce it
    //note: if this flag has a future date, preemptively set enddate on flags, since isActive should handle this
    if (row.Id && row.flag && !row.enddate && row.date){
        helper.getJavaHelper().ensureSingleFlagCategoryActive(row.Id, row.flag, row.objectId, row.date);
    }
});