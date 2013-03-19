/**
 * @cfg caseId
 * @cfg maxGridHeight
 * @cfg autoLoadRecords
 */
Ext4.define('EHR.panel.CaseHistoryPanel', {
    extend: 'EHR.panel.ClinicalHistoryPanel',
    alias: 'widget.ehr-casehistorypanel',

    getStoreConfig: function(){
        return {
            type: 'ehr-clinicalhistorystore',
            actionName: 'getCaseHistory',
            sorters: [{property: 'group'}, {property: 'timeString'}]
        };
    }
});
