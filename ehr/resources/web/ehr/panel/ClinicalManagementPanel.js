/**
 * @cfg subjectId
 * @cfg minDate
 */
Ext4.define('EHR.panel.ClinicalManagementPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ehr-clinicalmanagementpanel',

    initComponent: function(){
        LABKEY.ExtAdapter.apply(this, {
            bodyStyle: 'padding: 3px;',
            border: false,
            items: this.getItems(),
            buttonAlign: 'left',
            buttons: [{
                text: 'Close',
                handler: function(btn){
                    btn.up('window').close();
                }
            },{
                text: 'Actions',
                menu: [{
                    text: 'Manage Medications/Diet',
                    scope: this,
                    handler: function(btn){
                        Ext4.create('EHR.window.ManageTreatmentsWindow', {
                            animalId: this.subjectId
                        }).show(btn);
                    }
                },{
                    text: 'Manage Cases',
                    scope: this,
                    handler: function(btn){
                        Ext4.create('EHR.window.ManageCasesWindow', {
                            animalId: this.subjectId
                        }).show(btn);
                    }
                }]
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