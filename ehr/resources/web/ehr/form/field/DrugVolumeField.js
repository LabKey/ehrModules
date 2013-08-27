Ext4.define('EHR.form.field.DrugVolumeField', {
    extend: 'EHR.form.field.TriggerNumberField',
    alias: 'widget.ehr-drugvolumefield',

    triggerCls: 'x4-form-search-trigger',
    triggerToolTip: 'Click to calculate amount based on concentration and volume',

    initComponent: function(){
        this.callParent(arguments);
    },

    onTriggerClick: function(){
        var record = EHR.DataEntryUtils.getBoundRecord(this);
        if (record){
            //recalculate amount if needed:
            var conc = record.get('concentration');
            var volume = this.getValue();

            if (!volume || !conc){
                Ext4.Msg.alert('Error', 'Must supply volume and concentration');
                return;
            }

            if (volume && conc){
                var amount = conc * volume;
                record.set('amount', amount);
            }
        }
    }
});