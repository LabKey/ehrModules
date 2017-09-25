/*
 * Copyright (c) 2013-2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @param fieldConfigs
 */
Ext4.define('EHR.data.BloodDrawClientStore', {
    extend: 'EHR.data.DataEntryClientStore',

    constructor: function(){
        this.callParent(arguments);

        this.on('update', this.onRecordUpdate, this);
    },

    onRecordUpdate: function(store, record){
        if (!record.get('quantity') && record.get('num_tubes') > 0 && record.get('tube_vol') > 0){
            record.set('quantity', record.get('num_tubes') * record.get('tube_vol'));
        }
    },

    getExtraContext: function(){
        // Submit all of the draws in this batch as a separate property on the extra context,
        // so that server-side validation can see them all at once for validation purposes (and not just rely
        // on the blood draws already saved to the database)
        var bloodDrawMap = {};
        var allRecords = this.getRange();
        for (var idx = 0; idx < allRecords.length; ++idx){
            var record = allRecords[idx];
            if (record.get('quantity') > 0){
                var id = record.get('Id');
                var date = record.get('date');
                if (!id || !date)
                    continue;

                date = date.format(LABKEY.extDefaultDateFormat);

                if (!bloodDrawMap[id])
                    bloodDrawMap[id] = [];

                bloodDrawMap[id].push({
                    objectid: record.get('objectid'),
                    date: date,
                    qcstate: record.get('QCState'),
                    quantity: record.get('quantity')
                });
            }
        }

        if (!LABKEY.Utils.isEmptyObj(bloodDrawMap)){
            bloodDrawMap = Ext4.encode(bloodDrawMap);

            return {
                bloodInTransaction: bloodDrawMap
            }
        }

        return null;
    }
});
