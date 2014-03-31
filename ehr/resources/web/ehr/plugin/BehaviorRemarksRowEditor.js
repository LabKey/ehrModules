Ext4.define('EHR.plugin.BehaviorRemarksRowEditor', {
    extend: 'EHR.plugin.ClinicalRemarksRowEditor',

    getObservationPanelCfg: function(){
        var ret = this.callParent(arguments);
        ret.observationFilterArray = [LABKEY.Filter.create('category', 'Behavior')];

        return ret;
    }
});