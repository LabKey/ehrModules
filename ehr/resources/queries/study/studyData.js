// NOTE: this should serve as a default trigger script, applied to any dataset that lacks its own
// JS file.  Note: it will be important for studyData.query.xml to specify that only a single trigger
// is run per table, or the EHR Trigger layer could be initialized and run twice

require("ehr/triggers").initScript(this);