Ext4.define('EHR.panel.DataEntryPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ehr-dataentrypanel',

    initComponent: function(){
        Ext4.apply(this, {
            defaults: {
                border: false
            },
            items: this.getItems()
        });

        this.callParent();
    },

    getItems: function(){
        if (!this.formConfig || !this.formConfig.sections || !this.formConfig.sections.length){
            return [];
        }

        var items = [];
        for (var i=0; i<this.formConfig.sections.length; i++){
            var section = this.formConfig.sections[i];

            items.push({
                xtype: section.xtype,
                formConfig: section,
                parentPanel: this
            });
        }

        return items;
    }
});
