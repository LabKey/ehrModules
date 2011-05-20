/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");



function onUpsert(context, errors, row, oldRow){
    var species;

    if(!row.weight){
        EHR.addError(errors, 'weight', 'This field is required', 'WARN');
    }

    //warn if more than 10% different from last weight
    if(context.extraContext.dataSource != 'etl' && row.Id && row.weight){
        LABKEY.Query.selectRows({
            schemaName: 'study',
            queryName: 'demographicsMostRecentWeight',
            scope: this,
            filterArray: [LABKEY.Filter.create('Id', row.Id, LABKEY.Filter.Types.EQUAL)],
            success: function(data){
                if(data && data.rows.length){
                    var r = data.rows[0];

                    if(r.MostRecentWeight && (row.weight <= r.MostRecentWeight*0.9)){
                        EHR.addError(errors, 'weight', 'Weight drop of >10%. Last weight '+r.MostRecentWeight+' kg', 'INFO');
                    }
                    else if(r.MostRecentWeight && (row.weight >= r.MostRecentWeight/0.9)){
                        EHR.addError(errors, 'weight', 'Weight gain of >10%. Last weight '+r.MostRecentWeight+' kg', 'INFO');
                    }
                }
                else {
                    console.log('not found')
                }
            }
        });

        EHR.findDemographics({
            participant: row.Id,
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
                                    EHR.addError(errors, 'weight', 'Weight below the allowable value of '+rowData.min_weight+' kg for '+data.species, 'WARN');
                                }
                                if(rowData.max_weight!==undefined && row.weight > rowData.max_weight){
                                    EHR.addError(errors, 'weight', 'Weight above the allowable value of '+rowData.max_weight+' kg for '+data.species, 'WARN');
                                }
                            }
                        },
                        failure: EHR.onFailure
                    });
                }
            }
        });
    }

}

function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

	description.push('Weight: '+row.weight);

    return description;
}

/*
function onComplete(event, errors, scriptContext){
    //NOTE: we will stop caching this info

    //TODO: only public modifications
    if(scriptContext.participantsModified.length){
        //find the most recent weight per participant
        var toUpdate = [];
        var idsFound = [];
        LABKEY.Query.executeSql({
            schemaName: 'study',
            scope: this,
            sql: 'SELECT w.Id, w.wdate, w2.weight ' +
                'FROM (SELECT w.Id, max(w.date) as wdate FROM study.weight w WHERE w.id IN (\''+scriptContext.participantsModified.join(',')+'\') AND w.qcstate.publicdata = TRUE GROUP BY w.id) w ' +
                'JOIN study.weight w2 ON (w.id=w2.id AND w.wdate = w2.date) ' +
                'WHERE w2.qcstate.publicdata = TRUE',
            success: function(data){
                if(data.rows && data.rows.length){
                    var row;
                    for (var i=0;i<data.rows.length;i++){
                        row = data.rows[i];
                        idsFound.push(row.Id);
                        EHR.findDemographics({
                            participant: row.Id,
                            scope: this,
                            forceRefresh: true,
                            callback: function(data){
                                if(data){
                                    if(row.wdate != data.wdate || row.weight != data.weight)
                                        toUpdate.push({lsid: data.lsid, Id: row.Id, weight: row.weight, wdate: row.wdate});
                                }
                            }
                        });
                    }
                }
            },
            failure: EHR.onFailure
        });

        if(toUpdate.length != scriptContext.publicParticipantsModified.length){
            Ext.each(scriptContext.publicParticipantsModified, function(p){
                if(idsFound.indexOf(p) == -1){
                    EHR.findDemographics({
                        participant: p,
                        forceRefresh: true,
                        scope: this,
                        callback: function(data){
                            if(data){
                                toUpdate.push({weight: null, wdate: null, Id: data.Id, lsid: data.lsid});
                            }
                        }
                    });
                }
            }, this);
        }

        if(toUpdate.length){
            LABKEY.Query.updateRows({
                schemaName: 'study',
                queryName: 'demographics',
                extraContext: {
                    schemaName: 'study',
                    queryName: 'Demographics'
                },
                rows: toUpdate,
                success: function(data){
                    console.log('Success updating demographics weight fields')
                },
                failure: EHR.onFailure
            });
        }
    }
};
*/
