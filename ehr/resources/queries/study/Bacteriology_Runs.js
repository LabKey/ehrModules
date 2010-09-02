/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
// ================================================

//==includeStart
/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
console.log("** evaluating: " + this['javax.script.filename']);

//var errorQC = 4;
var errorQC = 'Review Required';
var verbosity = 0;


var EHR = {};
EHR.validation = {
    rowInit: function(row, errors){
        row.dataSource = 'etl';
        row._warnings = new Array();
        
        if (verbosity > 1)
            console.log('Original: '+row);

        //these are extra checks to fix mySQL data
        if (row.dataSource == 'etl'){
            //inserts a date if missing
            EHR.validation.addDate(row, errors);

            EHR.validation.fixParticipantId(row, errors);
            if (row.project)
                EHR.validation.fixProject(row, errors);

            repairRow(row, errors);
            if(verbosity > 1)
                console.log('Repaired: '+row);
        }

        //these are always run

        //flags dates more than 1 year in the future or 60 in the past
        EHR.validation.suspDate(row, errors);
    },
    rowEnd: function(row, errors){

        if (!row._warnings.length){
            row.Description = setDescription(row, errors).join(',\n');

            if (row.Description.length > 4000)
                row.Description = row.Description.substring(0, 3999);
        }
        else {
            row.Description = row._warnings.join(',\n');
            row.QCStateLabel = errorQC;
        }

        for (var i in row){
            if (row[i] == ''){
                row[i] = null;
            }
        }

        if (verbosity > 0 )
            console.log("New: "+row);
    },
    antibioticSens: function(row, errors){
        if (row.sensitivity && row.antibiotic == null){
            row.antibiotic = 'Unknown';
            row._warnings.push('ERROR: Row has sensitivity, but no antibiotic');
            row.QCStateLabel = errorQC;
        }
    },
    snomedString: function (title, code, meaning){
        return title+': ' + (meaning ? meaning+' ('+code+')' : code)
    },
    dateString: function (date){
        if(date){
            date = new Date(date);
            return date.getFullYear()+'-'+(date.getMonth()<10 ? 0:'')+date.getMonth()+'-'+(date.getDate()<10 ? 0:'')+date.getDate();
        }
        else
            return '';
    },
    dateTimeString: function (date){
        if(date){
            date = new Date(date);
            return date.getFullYear()+'-'+(date.getMonth()<10 ? 0:'')+date.getMonth()+'-'+(date.getDate()<10 ? 0:'')+date.getDate()
                    ' '+date.getHours()+':'+date.getMinutes();
        }
        else
            return '';
    },
    fixProject: function(row, errors){
        //i think the ETL can return project as a string
        if (row.project && !/^\d*$/.test(row.project)){
        //if (row.project && typeof(row.project)!='number' && typeof(row.project)!='integer' && !row.project.search(/^[0-9]*$/)){
            row._warnings.push('ERROR: Bad Project#: '+row.project);
            row.project = null;
            row.QCStateLabel = errorQC;
        }
    },
    fixParticipantId: function (row, errors){
        if (!row.Id && !row.id){
            row.id = 'MISSING';
            row._warnings.push('ERROR: Missing Id');
            row.QCStateLabel = errorQC;
        }

        //TODO: regex validate patterns and warn
    },
    addDate: function (row, errors){
        if (!row.Date){
            //we need to insert something...
            row.Date = new java.util.Date();
            row._warnings.push('ERROR: Missing Date');
            row.QCStateLabel = errorQC;
        }
    },
    fixBiopsyCase: function(row, errors){
        //we try to clean up the biopsy ID
        var re = /([0-9]+)(b)([0-9]+)/i;
        var match = row.caseno.match(re);
        if (!match){
            row._warnings.push('Error in caseno: '+row.caseno);
            row.QCStateLabel = errorQC;
        }
        else {
            //fix the year
            if (match[1].length == 2){
                if (match[1] < 20)
                    match[1] = '20' + match[1];
                else
                    match[1] = '19' + match[1];
            }
            else if (match[1].length == 4){
                //these values are ok
            }
            else {
                row._warnings.push('Unsure how to correct caseno year: '+match[1]);
                row.QCStateLabel = errorQC;
            }
            
            //standardize number to 3 digits
            if (match[3].length != 3){
                var tmp = match[3];
                for (var i=0;i<(3-match[3].length);i++){
                    tmp = '0' + tmp;
                }
                match[3] = tmp;
            }

            row.caseno = match[1] + match[2] + match[3];
        }
        
    },
    null2string: function(value){
            return (value ? value : '');
    },
    fixChemValue: function(row, errors){
        //we try to remove non-numeric characters from this field
        if (row.stringResults && !row.stringResults.match(/^[0-9]*$/)){
            //we need to manually split these into multiple rows
            if (row.stringResults.match(/,/)){
                row.stringResults = null;
                row._warnings.push('ERROR problem with results: ' + row.stringResults);
                row.QCStateLabel = errorQC;
            }
            else {
                //did not find other strings in data
                row.stringResults = row.stringResults.replace('less than', '<');

                var match = row.stringResults.match(/^([<>]*)[ ]*(\d*\.*\d*)[ ]*(.*)$/);

                if (match[1])
                    row.resultOORIndicator = match[1];

                row.result = match[2];

                //if there is a value plus a string, we assume it's units.  otherwise it's a remark
                if (match[3]){
                    if(match[2])
                        row.units = match[3];
                    else
                        row.qualResult = match[3];
                }
            }
        }
    },
    fixUrineQuantity: function(row, errors){
        //we try to remove non-numeric characters from this field
        if (row.quantity && !row.quantity.match(/^(\d*\.*\d*)$/)){
            //we need to manually split these into multiple rows
            if (row.quantity.match(/,/)){
                row.quantity = null;
                row._warnings.push('ERROR problem with quantity: ' + row.quantity);
                row.QCStateLabel = errorQC;
            }
            else {
                //did not find other strings in data
                row.quantity = row.quantity.replace(' ', '');
                row.quantity = row.quantity.replace('n/a', '');
                row.quantity = row.quantity.replace('N/A', '');
                row.quantity = row.quantity.replace('na', '');
                row.quantity = row.quantity.replace(/ml/i, '');
                row.quantity = row.quantity.replace('prj31f', '');

                var match = row.quantity.match(/^([<>~]*)[ ]*(\d*\.*\d*)[ ]*(\+)*(.*)$/);

                if (match[1] || match[3])
                    row.quantityOORIndicator = match[1] || match[3];

                row.quantity = match[2];
            }
        }
    },
    fixDrugUnits: function(row, errors){
        //TODO
    },
    fixHemaMiscMorphology: function(row, errors){
        var c = row.morphology.split('_');
        //changes by request of molly
        //reverted.  will handle during data entry
//        if(c[0]=='TOXIC GRANULES')
//            c[0] = 'TOXIC CHANGE';

        row.morphology = c[0];
        if (c[1])
            row.score = c[1];
    },
    suspDate: function(row, errors){
        //flag any dates greater than 1 year from now
        var cal1 = new java.util.GregorianCalendar();
        cal1.add(java.util.Calendar.YEAR, 1);
        var cal2 = new java.util.GregorianCalendar();
        cal2.setTime(row.Date);
        
        if(cal2.after(cal1)){
            row._warnings.push('Date is in future: '+row.Date);
            row.QCStateLabel = errorQC;
        }

        cal1.add(java.util.Calendar.YEAR, -61);
        if(cal1.after(cal2)){
            row._warnings.push('Date is in distant past: '+row.Date);
            row.QCStateLabel = errorQC;
        }
    },
    suspImmunology: function(row, errors){
        //TODO: flag abnormal values
        //really could use sql...maybe hard encode for now?
    },
    suspHematology: function(row, errors){
        //TODO: flag abnormal values
        //same as above
    },
    fixNecropsyCase: function(row, errors){
        //we try to clean up the caseno
        var re = /([0-9]+)(a|c)([0-9]+)/i;
        var match = row.caseno.match(re);
        if (!match){
            row._warnings.push('Error in caseno: '+row.caseno);
            row.QCStateLabel = errorQC;
        }
        else {
            //fix the year
            if (match[1].length == 2){
                //kind of a hack. we just assume records wont be that old
                if (match[1] < 20)
                    match[1] = '20' + match[1];
                else
                    match[1] = '19' + match[1];
            }
            else if (match[1].length == 4){
                //these values are ok
            }
            else {
                row._warnings.push('Unsure how to correct caseno year: '+match[1]);
                row.QCStateLabel = errorQC;
            }

            //standardize number to 3 digits
            if (match[3].length != 3){
                var tmp = match[3];
                for (var i=0;i<(3-match[3].length);i++){
                    tmp = '0' + tmp;
                }
                match[3] = tmp;
            }
            row.caseno = match[1] + match[2] + match[3];
        }
    },
    fixRoom: function(row, errors){
         //TODO
    },
    fixCage: function(row, errors){
         //TODO
    },
    fixSpecies: function(row, errors){
         //TODO
    },
    fixSurgMajor: function(row, errors){
        switch (row.major){
            case 'y':
            case 'Y':
                row.major = true;
                break;
            default:
                row.major = false;
        }
    },
    fixBirth: function(row, errors){
        //TODO: figure out how to flag estimated birthdates
        //row.birthmvIndicator = 'E';
    },
    setSpecies: function(row, errors){
        if (row.Id.match(/(^rh([0-9]{4}))|(^r([0-9]{5}))/))
            row.species = 'Rhesus';
        else if (row.Id.match(/^cy([0-9]{4})/))
            row.species = 'Cynomolgus';
        else if (row.Id.match(/^ag([0-9]{4})/))
            row.species = 'Vervet';
        else if (row.Id.match(/^cj([0-9]{4})/))
            row.species = 'Marmoset';
        else if (row.Id.match(/^so([0-9]{4})/))
            row.species = 'Cotton-top Tamarin';
        else if (row.Id.match(/^pt([0-9]{4})/))
            row.species = 'Pigtail';

        //these are to handle legacy data:
        else if (row.Id.match(/(^rha([a-z]{1})([0-9]{2}))/))
            row.species = 'Rhesus';
        else if (row.Id.match(/(^rh-([a-z]{1})([0-9]{2}))/))
            row.species = 'Rhesus';
        else if (row.Id.match(/^cja([0-9]{3})/))
            row.species = 'Marmoset';
        else if (row.Id.match(/^m([0-9]{5})/))
            row.species = 'Marmoset';
        else if (row.Id.match(/^tx([0-9]{4})/))
            row.species = 'Marmoset';

        else
            row.species = 'Unknown';
    }
}



// ================================================







//==includeEnd

// ================================================



function repairRow(row, errors){

}

function setDescription(row, errors){
    //we need to set description for every field
    var description = new Array();

    if (row.userid)
        description.push('UserId: '+row.userid);

    if (row.Remark)
        description.push('Remark: '+row.Remark);

    return description;
}



function beforeBoth(row, errors) {
    EHR.validation.rowInit(row, errors);

    EHR.validation.rowEnd(row, errors);

}


function beforeInsert(row, errors) {
    beforeBoth(row, errors);
}

function beforeUpdate(row, oldRow, errors) {
    beforeBoth(row, errors);

}


