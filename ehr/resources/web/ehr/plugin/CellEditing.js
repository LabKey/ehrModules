
Ext4.define('EHR.grid.plugin.CellEditing', {
    extend: 'LDK.grid.plugin.CellEditing',
    alias: 'plugin.ehr-cellediting',

    ensureLookups: function(record, column, editor) {
        if( (editor?.field?.xtype === 'labkey-combo' || editor?.field?.xtype === 'ehr-simplecombo')
                && record.data[column.dataIndex] && editor?.field?.store) {

            const valid = editor.field.store.findExact("value", record.data[column.dataIndex]) !== -1

            if (!valid) {
                const plugin = Ext4.create('LDK.plugin.UserEditableCombo', {
                    allowChooseOther: false,
                    name: 'invalidLookup',
                });

                editor.field.plugins = editor.plugins || [];
                editor.field.plugins.push(plugin);
                plugin.init(editor.field);
            }
        }
    },

    getEditor: function(record, column) {
        const editor = this.callParent(arguments);
        this.ensureLookups(record, column, editor);
        return editor;
    }
});