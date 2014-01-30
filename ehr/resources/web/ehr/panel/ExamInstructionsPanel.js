Ext4.define('EHR.panel.ExamInstructionsPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ehr-examinstructionspanel',

    initComponent: function(){
        var buttons = [];
        LDK.Assert.assertNotEmpty('No data entry panel', this.dataEntryPanel);
        var btnCfg = EHR.DataEntryUtils.getDataEntryFormButton('APPLYFORMTEMPLATE_NO_ID');
        if (btnCfg){
            btnCfg = this.dataEntryPanel.configureButton(btnCfg);
            if (btnCfg){
                btnCfg.text = 'Apply Template To Form';
                buttons.push(btnCfg);
            }
        }

        var btnCfg2 = EHR.DataEntryUtils.getDataEntryFormButton('OPENCLINICALCASE');
        if (btnCfg2){
            btnCfg2 = this.dataEntryPanel.configureButton(btnCfg2);
            buttons.push(btnCfg2);
        }

        LABKEY.ExtAdapter.apply(this, {
            defaults: {

            },
            bodyStyle: 'padding: 5px;',
            title: 'Instructions',
            items: [{
                html: 'This form is designed to allow routine exams or initial opening of cases.  Use the sections below to enter the SOAP, medications, etc.  You can either fill out these sections directly, or use the \'Apply Form Template\' button below.  Note: cases are not automatically opened.  If there is an open clinical case, the most recent P2 will be shown.  To edit this P2, click the \'edit P2\' button.  If you do not want to make changes to the P2, there is no need to click this.',
                maxWidth: Ext4.getBody().getWidth() * 0.8,
                style: 'padding-top: 10px;padding-bottom: 10px;',
                border: false
            },{
                layout: 'hbox',
                border: false,
                defaults: {
                    style: 'margin-right: 5px;'
                },
                items: buttons
            }]
        });

        this.callParent(arguments);
    }

});