
require("ehr/triggers").initScript(this);


function onUpsert(helper, scriptErrors, row, oldRow) {
    if(!helper.isETL() && row) {

        // TODO: start date is not getting converted to time
        // var start_date = new Date(row.startDate).getTime();
        // var end_date = new Date(row.endDate).getTime();
        //
        // if(end_date < start_date) {
        //     EHR.Server.Utils.addError(scriptErrors, 'endDate', 'Start date can not be after end date', 'ERROR');
        // }
    }
}