/**
 * Created to allow a custom row editor plugin and column that summarize observations
 */
Ext4.define('EHR.grid.RemarksAndObsGridPanel', {
    extend: 'EHR.grid.Panel',
    alias: 'widget.ehr-remarksandobsgridpanel',

    getRowEditorPlugin: function(){
        if (this.rowEditorPlugin)
            return this.rowEditorPlugin;

        this.rowEditorPlugin = Ext4.create('EHR.plugin.ClinicalRemarksRowEditor', {
            cmp: this
        });

        return this.rowEditorPlugin;
    },

    configureColumns: function(){
        this.callParent(arguments);

        //TODO: add calculated col for obs?
        console.log(this.columns);
    }
});