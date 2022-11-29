/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.window.CreateProjectWindow', {
    extend: 'Ext.window.Window',

    statics: {
        buttonHandler: function(dataRegionName){
            Ext4.create('EHR.window.CreateProjectWindow', {
                protocol: LABKEY.ActionURL.getParameter('protocol')
            }).show();
        }
    },

    initComponent: function(){
        Ext4.apply(this, {
            title: 'Create Project For Protocol',
            modal: true,
            closeAction: 'destroy',
            width: 375,
            bodyStyle: 'padding: 5px;',
            items: [{
                html: 'This helper is designed to quickly create a new project or sub-project for an IACUC protocol.  It will copy certain information from that IACUC to the new project; however, you will have the opportunity to make changes on the next screen.',
                border: false,
                style: 'padding-bottom: 10px;'
            },{
                xtype: 'ehr-protocolfield',
                showInactive: false,
                itemId: 'protocolField',
                fieldLabel: 'IACUC Protocol',
                width: 350,
                value: this.protocol
            }],
            buttons: [{
                text: 'Submit',
                scope: this,
                handler: function (btn) {
                    var protocol = btn.up('window').down('#protocolField').getValue();
                    if (!protocol) {
                        Ext4.Msg.alert('Error', 'Must enter a protocol');
                        return;
                    }

                    Ext4.Msg.wait('Loading...');
                    LABKEY.Query.selectRows({
                        method: 'POST',
                        schemaName: 'ehr',
                        queryName: 'protocol',
                        columns: 'protocol,title,investigatorId,approve,renewalDate',
                        filterArray: [LABKEY.Filter.create('protocol', protocol)],
                        failure: LDK.Utils.getErrorCallback(),
                        success: function (results) {
                            Ext4.Msg.hide();
                            if (!results || !results.rows || !results.rows.length) {
                                Ext4.Msg.alert('Error', 'No rows found');
                                return;
                            }

                            var rows = [];
                            Ext4.Array.forEach(results.rows, function (r) {
                                var obj = {
                                    protocol: r.protocol,
                                    title: r.title,
                                    investigatorId: r.investigatorId,
                                    startdate: r.approve,
                                    enddate: r.renewalDate
                                };

                                rows.push(obj);
                            }, this);

                            var initialData = {
                                'project': rows
                            };

                            var newForm = Ext4.DomHelper.append(document.getElementsByTagName('body')[0],
                                            '<form method="POST" action="' + LABKEY.ActionURL.buildURL('ehr', 'dataEntryFormForQuery', null, {schemaName: 'ehr', queryName: 'project', project: ''}) + '&returnUrl=' + LDK.Utils.getSrcURL() + '">' +
                                            '<input type="hidden" name="initialData" value="' + Ext4.htmlEncode(Ext4.encode(initialData)) + '" />' +
                                            '<input type="hidden" name="X-LABKEY-CSRF" value="' + Ext4.htmlEncode(LABKEY.CSRF) + '" />' +
                                            '</form>');
                            newForm.submit();
                        }
                    });
                }
            },{
                text: 'Cancel',
                handler: function(btn){
                    btn.up('window').close();
                }
            }]
        });

        this.callParent(arguments);
    }
});