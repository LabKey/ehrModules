/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
function historyHandler(dataRegion, dataRegionName)
{
    var checked = dataRegion.getChecked();
    var sql = "SELECT DISTINCT s.Id FROM study.studydata s WHERE s.LSID IN ('" + checked.join("', '") + "')";

    LABKEY.Query.executeSql({
         schemaName: 'study',
         sql: sql,
         successCallback: changeLocation
         });

    function changeLocation(data){
        var ids = new Array();
        for (var i = 0; i < data.rows.length; i++)
            ids.push(data.rows[i].Id);

        if (ids.length){
            window.location = LABKEY.ActionURL.buildURL(
                'ehr'
                ,'animalHistory'
                ,'WNPRC/EHR/'
                ,{showReport: 1, report: 1, participantId: ids.join(',')}
            );
        }
    }




}

