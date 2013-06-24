Ext4.define('EHR.panel.NarrowSnapshotPanel', {
    extend: 'EHR.panel.SmallFormSnapshotPanel',
    alias: 'widget.ehr-narrowsnapshotpanel',

    showLocationDuration: false,

    initComponent: function(){

        this.defaultLabelWidth = 120;
        this.callParent();
    },

    getItems: function(){
        var items = this.getBaseItems();

        //combine the first and second columns
        var firstCol = items[0].items[1].items[0];
        var secondCol = items[0].items[1].items[1];
        var thirdCol = items[0].items[1].items[2];
        items[0].items[1].items.remove(secondCol);

        firstCol.columnWidth = 0.45;
        thirdCol.columnWidth = 0.55;

        firstCol.items = firstCol.items.concat(secondCol.items);

        items[0].items.push({
            xtype: 'displayfield',
            style: 'margin-left: 5px;',
            labelWidth: this.defaultLabelWidth,
            fieldLabel: 'Medications',
            itemId: 'medications',
            width: 800
        });

        return items;
    }
});