/*
* Copyright (c) 2013-2019 LabKey Corporation
*
* Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
*/

var console = require("console");
var LABKEY = require("labkey");

var helper = org.labkey.ldk.query.LookupValidationHelper.create(LABKEY.Security.currentContainer.id, LABKEY.Security.currentUser.id, 'ehr_compliancedb', 'requirementspercategory');

console.log("** evaluating: " + this['javax.script.filename']);

function beforeInsert(row, errors){
    beforeUpsert(row, errors);
}

function beforeUpdate(row, oldRow, errors){
    //NOTE: this is designed to merge the old row into the new one.
    for (var prop in oldRow){
        if(!row.hasOwnProperty(prop) && LABKEY.ExtAdapter.isDefined(oldRow[prop])){
            row[prop] = oldRow[prop];
        }
    }

    beforeUpsert(row, errors);
}

function beforeUpsert(row, errors){
    var lookupFields = ['requirementname', 'unit'];
    for (var i=0;i<lookupFields.length;i++){
        var f = lookupFields[i];
        var val = row[f];
        if (!LABKEY.ExtAdapter.isEmpty(val)){
            var normalizedVal = helper.getLookupValue(val, f);

            if (LABKEY.ExtAdapter.isEmpty(normalizedVal))
                errors[f] = 'Unknown value for field: ' + f + '. Value was: ' + val;
            else
                row[f] = normalizedVal;  //cache value for purpose of normalizing case
        }
    }
    var lookupFieldsother = ['category'];
    var g = lookupFieldsother[i];
    var valt = row[g];
    var catdata= [];
    if (valt) {
        var catdata = valt.split(",");
        console.log("catdate:  " + catdata);
        console.log("valt:  " + valt);
        for (var j = 0; j < catdata.length; ++j) {
            if (!LABKEY.ExtAdapter.isEmpty(catdata[j])) {
                console.log("catdata[j]:  " + catdata[j]);
                var normalizedValt = helper.getLookupValue(catdata[j], g);
                console.log("g:  " + g);
                if (LABKEY.ExtAdapter.isEmpty(normalizedValt))
                    errors[g] = 'Unknown value for field3: ' + g + '. Value was: ' + catdata[j];
                else
                    row[g] = normalizedValt;  //cache value for purpose of normalizing case
            }
        }
    }
}