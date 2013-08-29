/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @param fieldConfigs
 */
Ext4.define('EHR.data.AssignmentClientStore', {
    extend: 'EHR.data.DataEntryClientStore',

    getExtraContext: function(){
        var map = {};
        var allRecords = this.getRange();
        for (var idx = 0; idx < allRecords.length; ++idx){
            var record = allRecords[idx];

            var date = record.get('date');
            var id = record.get('Id');
            var project = record.get('project');
            if (!id || !date || !project)
                continue;

            date = date.format('Y-m-d');

            if (!map[id])
                map[id] = [];

            map[id].push({
                objectid: record.get('objectid'),
                date: date,
                enddate: record.get('enddate'),
                qcstate: record.get('QCState'),
                project: record.get('project')
            });
        }

        if (!LABKEY.Utils.isEmptyObj(map)){
            map = LABKEY.ExtAdapter.encode(map);

            return {
                assignmentsInTransaction: map
            }
        }

        return null;
    }
});
