
require("ehr/triggers").initScript(this);

function onInit(event, helper){
    helper.setScriptOptions({
        allowFutureDates: true,
        removeTimeFromDate: true,
        allowAnyId: true
    });
}