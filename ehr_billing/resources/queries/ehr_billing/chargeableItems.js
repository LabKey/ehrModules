
require("ehr/triggers").initScript(this);


function onUpsert(helper, scriptErrors, row, oldRow) {
    if(!helper.isETL() && row) {
        var startDate = EHR.Server.Utils.normalizeDate(row.startDate);
        var endDate = EHR.Server.Utils.normalizeDate(row.endDate);
        if (startDate && endDate && endDate < startDate) {
            EHR.Server.Utils.addError(scriptErrors, 'endDate', 'End date can not be before start date.', 'ERROR');
        }
    }
}