/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg {String} animalId
 * @cfg {String} caseId
 * @cfg {String} encounterId
 * @cfg {String} mode
 */
Ext4.define('EHR.window.EnterRemarkWindow', {
    extend: 'Ext.window.Window',
    constrain: true,
    maximizable: true,

    initComponent: function(){
        LABKEY.ExtAdapter.apply(this, {
            title: 'Enter Remark: ' + this.animalId,
            modal: true,
            closeAction: 'destroy',
            items: [{
                xtype: 'ehr-enterremarkpanel',
                animalId: this.animalId,
                caseId: this.caseId,
                encounterId: this.encounterId,
                mode: this.mode,
                hideButtons: true
            }],
            buttons: this.getButtonConfig(),
            plugins: [{
                ptype: 'ldk-selfcenteringwindow',
                constrainToWindow: true
            }]
        });

        this.callParent(arguments);
    },

    getButtonConfig: function(){
        var buttons = EHR.panel.EnterRemarkPanel.getButtonConfig(this);
        buttons.push({
            text: 'Close',
            handler: function(btn){
                btn.up('window').close();
            }
        });

        return buttons;
    }
});
