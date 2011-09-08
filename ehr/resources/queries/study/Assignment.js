/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var {EHR, LABKEY, Ext, console, init, beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, complete} = require("ehr/validation");




function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    description.push('Start Date: ' + EHR.validation.dateToString(row.Date));
    description.push('Removal Date: ' + (row.enddate ? EHR.validation.dateToString(row.enddate) : ''));

    return description;
}

function onUpsert(context, errors, row, oldRow){
    if(context.extraContext.dataSource != 'etl'){
        EHR.validation.removeTimeFromDate(row, errors);
        EHR.validation.removeTimeFromDate(row, errors, 'enddate');
    }

    //check number of allowed animals at assign/approve time
    if(context.extraContext.dataSource != 'etl' && row.project && row.date){
        var species;
        if(row.Id){
            EHR.findDemographics({
                participant: row.Id,
                callback: function(data){
                    if(data){
                        species = data.species;
                    }
                },
                scope: this
            });
        }

        var protocol;
        //TODO: switch to EHR schema
        LABKEY.Query.selectRows({
            schemaName: 'lists',
            queryName: 'project',
            filterArray: [
                LABKEY.Filter.create('project', row.project, LABKEY.Filter.Types.EQUAL)
            ],
            success: function(data){
                if(data && data.rows && data.rows.length)
                    protocol = data.rows[0].protocol;
            },
            failure: EHR.onFailure
        });

        if(!context.extraContext.newIdsAdded)
            context.extraContext.newIdsAdded = {};

        if(protocol && !context.extraContext.newIdsAdded[protocol])
            context.extraContext.newIdsAdded[protocol] = [];

        if(species && protocol){
            LABKEY.Query.selectRows({
                schemaName: 'lists',
                queryName: 'protocolTotalAnimalsBySpecies',
                viewName: 'With Animals',
                scope: this,
                filterArray: [
                    LABKEY.Filter.create('species', species, LABKEY.Filter.Types.EQUAL),
                    LABKEY.Filter.create('protocol', protocol, LABKEY.Filter.Types.EQUAL)
                ],
                success: function(data){
                    if(data && data.rows && data.rows.length){
                        var remaining = data.rows[0].TotalRemaining;

                        if(context.extraContext.newIdsAdded[protocol]){
                            remaining += context.extraContext.newIdsAdded[protocol].length;
                        }

                        var animals = data.rows[0].Animals;
                        if(animals && animals.indexOf(row.Id)==-1){
                            if(remaining <= 1)
                                EHR.addError(errors, 'project', 'There are not enough spaces on protocol: '+protocol, 'WARN');

                                if(context.extraContext.newIdsAdded[protocol] && context.extraContext.newIdsAdded[protocol].indexOf(row.Id)==-1)
                                    context.extraContext.newIdsAdded[protocol].push(row.Id);
                        }
                    }
                    else {
                        console.log('there was an error finding allowable animals per assignment')
                    }
                },
                failure: EHR.onFailure
            });
        }
    }
}