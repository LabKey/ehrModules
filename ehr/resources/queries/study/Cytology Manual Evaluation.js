

var {EHR, LABKEY, Ext, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");


function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if (row.staintype)
        description.push('Stain Type: '+row.staintype);
    if (row.sampletype)
        description.push('Sample Type: '+row.sampletype);

    if (row.sampleappearance)
        description.push('Sample Appearance: '+EHR.Server.Validation.nullToString(row.sampleappearance));
    if (row.slidesmade) 
        description.push('Slides Made: '+(row.slidesMade));
    if (row.slidessubmitted)
    	description.push('Slides Submitted: '+row.slidessubmitted);
    if(row.results)
        description.push('Results: '+EHR.Server.Validation.nullToString(row.results));
    
    return description;
}

function onUpsert(context, errors, row, oldRow){
    if ((row.slidesmade != null) && (row.slidessubmitted != null)){
    	if (row.slidesmade < row.slidessubmitted) {
    		console.log("Looking for ...");
        EHR.Server.Validation.addError(errors, 'slidesSubmitted', "Number of slides submitted must be less than or equal the number of slides made", 'WARN');
    	}
    }

    if(context.extraContext.dataSource != 'etl')
        EHR.Server.Validation.removeTimeFromDate(row, errors);

}