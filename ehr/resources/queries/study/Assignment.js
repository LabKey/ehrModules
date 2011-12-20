/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");


function onInit(event, context){
    context.allowFutureDates = true;
}


function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    description.push('Start Date: ' + EHR.Server.Validation.dateToString(row.Date));
    description.push('Removal Date: ' + (row.enddate ? EHR.Server.Validation.dateToString(row.enddate) : ''));

    return description;
}

function onUpsert(context, errors, row, oldRow){
    if(context.extraContext.dataSource != 'etl'){
        EHR.Server.Validation.removeTimeFromDate(row, errors);
        EHR.Server.Validation.removeTimeFromDate(row, errors, 'enddate');
        EHR.Server.Validation.removeTimeFromDate(row, errors, 'projectedRelease');
    }

    //remove the projected release date if a true enddate is added
    if(row.enddate && row.projectedRelease){
        row.projectedRelease = null;
    }

    //check number of allowed animals at assign/approve time
    if(context.extraContext.dataSource != 'etl' &&
            !context.extraContext.quickValidation &&
            !(oldRow && oldRow.Id && oldRow.Id==row.Id) &&
            row.project && row.date){
        var species;
        if(row.Id){
            EHR.Server.Validation.findDemographics({
                participant: row.Id,
                scriptContext: context,
                callback: function(data){
                    if(data){
                        species = data.species;
                    }
                },
                scope: this
            });
        }

        var protocol;
        LABKEY.Query.selectRows({
            schemaName: 'ehr',
            queryName: 'project',
            filterArray: [
                LABKEY.Filter.create('project', row.project, LABKEY.Filter.Types.EQUAL)
            ],
            success: function(data){
                if(data && data.rows && data.rows.length)
                    protocol = data.rows[0].protocol;
            },
            failure: EHR.Server.Utils.onFailure
        });

        if(!context.extraContext.newIdsAdded)
            context.extraContext.newIdsAdded = {};

        if(protocol && !context.extraContext.newIdsAdded[protocol])
            context.extraContext.newIdsAdded[protocol] = {};

        if(species && protocol){
            LABKEY.Query.selectRows({
                schemaName: 'ehr',
                queryName: 'protocolTotalAnimalsBySpecies',
                viewName: 'With Animals',
                scope: this,
                filterArray: [
                    LABKEY.Filter.create('species', species+';All Species', LABKEY.Filter.Types.EQUALS_ONE_OF),
                    LABKEY.Filter.create('protocol', protocol, LABKEY.Filter.Types.EQUAL)
                ],
                success: function(data){
                    if(data && data.rows && data.rows.length){
                        for(var i=0;i<data.rows.length;i++){
                            var remaining = data.rows[i].TotalRemaining;
                            var species = data.rows[i].Species;

                            if(!context.extraContext.newIdsAdded[protocol][species])
                                context.extraContext.newIdsAdded[protocol][species] = [];

                            if(context.extraContext.newIdsAdded[protocol] && context.extraContext.newIdsAdded[protocol][species]){
                                remaining -= context.extraContext.newIdsAdded[protocol][species].length;
                            }

                            var animals = data.rows[i].Animals;
                            if(animals && animals.indexOf(row.Id)==-1){
                                if(remaining <= 1)
                                    EHR.Server.Validation.addError(errors, 'project', 'There are not enough spaces on protocol: '+protocol, 'WARN');

                                if(context.extraContext.newIdsAdded[protocol][species] && context.extraContext.newIdsAdded[protocol][species].indexOf(row.Id)==-1)
                                    context.extraContext.newIdsAdded[protocol][species].push(row.Id);
                            }
                        }
                    }
                    else {
                        console.log('there was an error finding allowable animals per assignment')
                    }
                },
                failure: EHR.Server.Utils.onFailure
            });
        }
    }
}