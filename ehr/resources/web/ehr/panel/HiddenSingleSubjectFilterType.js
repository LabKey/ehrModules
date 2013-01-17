Ext4.define('EHR.panel.HiddenSingleSubjectFilterType', {
    extend: 'LDK.panel.SingleSubjectFilterType',
    alias: 'widget.ehr-hiddensinglesubjectfiltertype',

    initComponent: function(){
        this.items = this.getItems();

        this.callParent();
    },

    getItems: function(){
        return [{
            xtype: 'panel',
            hidden: true,
            items: [{
                xtype: 'textfield',
                hidden: true,
                itemId: 'subjArea',
                value: this.tabbedReportPanel.participantId
            }]
        }];
    }
});