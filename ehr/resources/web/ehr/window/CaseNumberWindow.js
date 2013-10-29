/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg targetField
 */
Ext4.define('EHR.window.CaseNumberWindow', {
    extend: 'Ext.window.Window',

    initComponent: function(){
        LABKEY.ExtAdapter.apply(this, {
            modal: true,
            closeAction: 'destroy',
            title: 'Case Number',
            border: true,
            bodyStyle: 'padding:5px',
            width: 350,
            defaults: {
                width: 330,
                border: false,
                bodyBorder: false
            },
            items: [{
                xtype: 'textfield',
                itemId: 'prefix',
                fieldLabel: 'Prefix',
                allowBlank: false,
                value: 'a'
            },{
                xtype: 'numberfield',
                itemId: 'year',
                fieldLabel: 'Year',
                allowBlank: false,
                value: (new Date()).getFullYear()
            }],
            buttons: [{
                text: 'Submit',
                handler: function(btn){
                    var win = btn.up('window');
                    win.getCaseNo();
                    win.close();
                }
            },{
                text: 'Close',
                handler: function(btn){
                    btn.up('window').close();
                }
            }]
        });

        this.callParent(arguments);
    },

    getCaseNo: function(){
        var year = this.down('#year').getValue();
        var prefix = this.down('#prefix').getValue();

        if(!year || !prefix){
            Ext4.Msg.alert('Error', "Must supply both year and prefix");
            return
        }

        LABKEY.Query.executeSql({
            method: 'POST',
            schemaName: 'study',
            sql: "SELECT cast(SUBSTRING(MAX(caseno), 6, 8) AS INTEGER) as caseno FROM study.\"Clinical Encounters\" WHERE type = 'Necropsy' AND caseno LIKE '" + year + prefix + "%'",
            scope: this,
            success: function(data){
                var caseno;
                if(data.rows && data.rows.length==1){
                    caseno = data.rows[0].caseno;
                    caseno++;
                }
                else {
                    console.log('no existing cases found');
                    caseno = 1;
                }

                caseno = Ext4.String.leftPad(caseno, 3, '0');
                var val = year + prefix + caseno;
                this.targetField.setValue(val);
                this.targetField.fireEvent('change', val)
            },
            failure: LDK.Utils.getErrorCallback()
        });
    }
});