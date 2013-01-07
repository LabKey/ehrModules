/*
 * Copyright (c) 2010-2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

require("ehr/triggers").initScript(this);

function onUpsert(context, errors, row, oldRow){
    var species;

    if(!row.weight){
        EHR.Server.Validation.addError(errors, 'weight', 'This field is required', 'WARN');
    }

    //warn if more than 10% different from last weight
    //the highest error this can produce is WARN.  therefore skip if we would ignore it anyway.  this would normally occur when finalizing a form
    if(context.extraContext.dataSource != 'etl' &&
        row.Id && row.weight
        && EHR.Server.Validation.shouldIncludeError('WARN', context.extraContext.errorThreshold)
    ){
        LABKEY.Query.selectRows({
            schemaName: 'study',
            queryName: 'demographicsMostRecentWeight',
            scope: this,
            filterArray: [LABKEY.Filter.create('Id', row.Id, LABKEY.Filter.Types.EQUAL)],
            success: function(data){
                if(data && data.rows.length){
                    var r = data.rows[0];

                    if(r.MostRecentWeight && (row.weight <= r.MostRecentWeight*0.9)){
                        EHR.Server.Validation.addError(errors, 'weight', 'Weight drop of >10%. Last weight '+r.MostRecentWeight+' kg', 'INFO');
                    }
                    else if(r.MostRecentWeight && (row.weight >= r.MostRecentWeight/0.9)){
                        EHR.Server.Validation.addError(errors, 'weight', 'Weight gain of >10%. Last weight '+r.MostRecentWeight+' kg', 'INFO');
                    }
                }
                else {
                    console.log('WARN: Most recent weight not found for ' + row.Id);
                }
            }
        });

        EHR.Server.Validation.findDemographics({
            participant: row.Id,
            scriptContext: context,
            scope: this,
            callback: function(data){
                if(data && data.species){
                    LABKEY.Query.selectRows({
                        schemaName: 'ehr_lookups',
                        queryName: 'weight_ranges',
                        scope: this,
                        filterArray: [LABKEY.Filter.create('species', data.species, LABKEY.Filter.Types.EQUAL)],
                        columns: '*',
                        success: function(results){
                            if(results && results.rows && results.rows.length==1){
                                var rowData = results.rows[0];
                                if(rowData.min_weight!==undefined && row.weight < rowData.min_weight){
                                    EHR.Server.Validation.addError(errors, 'weight', 'Weight below the allowable value of '+rowData.min_weight+' kg for '+data.species, 'WARN');
                                }
                                if(rowData.max_weight!==undefined && row.weight > rowData.max_weight){
                                    EHR.Server.Validation.addError(errors, 'weight', 'Weight above the allowable value of '+rowData.max_weight+' kg for '+data.species, 'WARN');
                                }
                            }
                        },
                        failure: EHR.Server.Utils.onFailure
                    });
                }
            }
        });
    }
}

function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if(row.weight)
	    description.push('Weight: '+row.weight);

    return description;
}
