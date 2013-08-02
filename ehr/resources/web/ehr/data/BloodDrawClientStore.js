/**
 * @param fieldConfigs
 */
Ext4.define('EHR.data.BloodDrawClientStore', {
    extend: 'EHR.data.DataEntryClientStore',

    getExtraContext: function(){
        var bloodDrawMap = {};
        var allRecords = this.getRange();
        for (var idx = 0; idx < allRecords.length; ++idx){
            var record = allRecords[idx];
            if (record.get('quantity') > 0){
                var id = record.get('Id');
                var date = record.get('date');
                if (!id || !date)
                    continue;

                date = date.format('Y-m-d');

                if (!bloodDrawMap[id])
                    bloodDrawMap[id] = [];

                bloodDrawMap[id].push({
                    objectid: record.get('objectid'),
                    date: date,
                    qcstate: record.get('QCState'),
                    quantity: record.get('quantity')
                });
            }

            if (!LABKEY.Utils.isEmptyObj(bloodDrawMap)){
                return {
                    bloodInTransaction: bloodDrawMap
                }
            }
        }

        return null;
    }
});
