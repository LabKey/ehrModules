/**
 * @cfg subjectId
 * @cfg minDate
 */
Ext4.define('EHR.window.ClinicalHistoryWindow', {
    extend: 'Ext.window.Window',
    alias: 'widget.ehr-clinicalhistorywindow',

    initComponent: function(){
        LABKEY.ExtAdapter.apply(this, {
            title: 'Clinical History:',
            bodyStyle: 'padding: 3px;',
            width: 1200,
            modal: true,
            items: this.getItems(),
            buttons: [{
                text: 'Close',
                handler: function(btn){
                    btn.up('window').close();
                }
            },{
                text: 'Add Remark',
                handler: function(btn){
                    Ext4.Msg.alert('Add remark', 'Because we still use IRIS, we are not doing any data entry through PRIMe.  Once we start this migration, it will be possible to enter remarks, order treatments, etc. from these screens.')
                }
            }]

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
            xtype: 'ehr-clinicalhistorypanel',
            border: true,
            width: 1180,
            gridHeight: 400,
            height: 400,
            autoLoadRecords: true,
            autoScroll: true,
            subjectId: this.subjectId,
            minDate: this.minDate || Ext4.Date.add(new Date(), Ext4.Date.YEAR, -2)
        }];
    }
});