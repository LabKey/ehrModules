Ext4.define('EHR.grid.plugin.ClinicalObservationsCellEditing', {
    extend: 'LDK.grid.plugin.CellEditing',
    alias: 'plugin.clinicalobservationscellediting',

    constructor: function(config){
        this.observationTypesStore = this.observationTypesStore || Ext4.create('LABKEY.ext4.Store', {
            type: 'labkey-store',
            schemaName: 'ehr_lookups',
            queryName: 'observation_types',
            columns: 'value,description',
            autoLoad: true
        });

        this.callParent(arguments);
    },

    getEditor: function(record, column) {
        var dataIndex = column ? column.dataIndex : null;
        if (dataIndex != 'observation'){
            return this.callParent(arguments);
        }

        var category = record.get('category');
        if (!category){
            return false;
        }

        var store = this.observationTypesStore;
        var rec = store.findRecord('value', category);
        LDK.Assert.assertNotEmpty('Unable to find record matching category: ' + category, rec);
        if (!rec){
            return false;
        }

        var me = this,
                editors = me.editors,
                editorId = column.getItemId(),
                editor = editors.getByKey(editorId),
                editorOwner = me.grid.ownerLockable || me.grid;

        if (!editor || editor.obsCategory != category){
            var config = rec.get('description') ? Ext4.decode(rec.get('description')) : null;
            config = config || {
                xtype: 'textfield'
            };

            editor = Ext4.create('Ext.grid.CellEditor', {
                obsCategory: category,
                floating: true,
                editorId: editorId,
                field: config
            });

            editorOwner.add(editor);
            editor.on({
                scope: me,
                specialkey: me.onSpecialKey,
                complete: me.onEditComplete,
                canceledit: me.cancelEdit
            });
            column.on('removed', me.cancelActiveEdit, me);

            me.editors.add(editor);
        }

        editor.grid = me.grid;

        // Keep upward pointer correct for each use - editors are shared between locking sides
        editor.editingPlugin = me;

        return editor;
    }
});