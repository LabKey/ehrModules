Ext4.define('EHR.form.field.AnimalIdGeneratorField', {
    extend: 'EHR.form.field.TriggerNumberField',
    alias: 'widget.ehr-animalgeneratorfield',

    allowDecimals : false,
    allowNegative : false,

    initComponent: function(){
        LABKEY.ExtAdapter.apply({
            triggerToolTip: 'Click to populate with the next available Id'
        });

        this.callParent(arguments);
    },

    onTriggerClick: function(){
        Ext4.Msg.wait('Loading...');

        LABKEY.Query.executeSql({
            schemaName: 'study',
            sql: 'SELECT max(CAST(Id as integer)) as expr FROM study.demographics',
            maxRows: 1,
            scope: this,
            error: LDK.Utils.getErrorCallback(),
            success: function(results){
                Ext4.Msg.hide();

                if (results && results.rows && results.rows.length){
                    this.setValue(results.rows[0].expr + 1);
                }
            }
        });
    }
});