/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.plugin.BehaviorRemarksRowEditor', {
    extend: 'EHR.plugin.ClinicalRemarksRowEditor',

    getObservationPanelCfg: function(){
        var ret = this.callParent(arguments);
        ret.observationFilterArray = [LABKEY.Filter.create('category', 'Behavior')];

        return ret;
    }
});