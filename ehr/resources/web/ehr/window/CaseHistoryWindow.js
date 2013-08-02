/**
 * @cfg subjectId
 * @cfg minDate
 * @cfg caseId
 */
Ext4.define('EHR.window.CaseHistoryWindow', {
    extend: 'EHR.window.ClinicalHistoryWindow',
    alias: 'widget.ehr-casehistorywindow',

    initComponent: function(){
        LABKEY.ExtAdapter.apply(this, {
            title: 'Case History:'
        });

        this.callParent(arguments);
    },

    getItems: function(){
        var items = this.callParent();
        items[1].items[0].title = 'Entire History';
        items[1].items.splice(1, 0, {
            title: 'Case History',
            xtype: 'ehr-casehistorypanel',
            border: true,
            width: 1180,
            gridHeight: 400,
            height: 400,
            autoScroll: true,
            autoLoadRecords: true,
            subjectId: this.subjectId,
            caseId: this.caseId
        });

        return items;
    }
})