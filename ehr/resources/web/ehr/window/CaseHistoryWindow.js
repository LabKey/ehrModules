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
        return [{
            xtype: 'ehr-smallformsnapshotpanel',
            subjectId: this.subjectId,
            hideHeader: true,
            style: 'padding: 5px;'
        },{
            xtype: 'tabpanel',
            items: [{
                title: 'Entire History',
                xtype: 'ehr-clinicalhistorypanel',
                border: true,
                width: 1180,
                gridHeight: 400,
                height: 400,
                autoLoadRecords: true,
                autoScroll: true,
                subjectId: this.subjectId,
                minDate: this.minDate || Ext4.Date.add(new Date(), Ext4.Date.YEAR, -2)
            },{
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
            }]
        }];
    }
})