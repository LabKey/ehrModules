/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @param dataEntryPanel
 * @param dataEntryBtn
 * @param reviewRequiredRecipient
 */
Ext4.define('EHR.window.SubmitForReviewPanel', {
    extend: 'Ext.window.Window',

    initComponent: function(){
        Ext4.apply(this, {
            closeAction: 'destroy',
            modal: true,
            title: 'Submit For Review',
            width: 430,
            buttons: [{
                text:'Submit',
                disabled:false,
                itemId: 'submit',
                scope: this,
                handler: function(btn){
                    var win = btn.up('window');
                    var assignedTo = win.down('#assignedTo').getValue();
                    if(!assignedTo){
                        alert('Must assign this task to someone');
                        return;
                    }

                    var taskStore = this.dataEntryPanel.storeCollection.getServerStoreForQuery('ehr', 'tasks');
                    taskStore.getAt(0).set('assignedto', assignedTo);
                    this.dataEntryPanel.storeCollection.transformServerToClient();
                    this.dataEntryPanel.onSubmit(this.dataEntryBtn);
                    win.close();
                }
            },{
                text: 'Cancel',
                scope: this,
                handler: function(btn){
                    btn.up('window').hide();
                }
            }],
            items: [{
                bodyStyle: 'padding:5px;',
                items: [{
                    xtype: 'ehr-usersandgroupscombo',
                    forceSelection: true,
                    fieldLabel: 'Assign To',
                    width: 400,
                    queryMode: 'local',
                    store: {
                        type: 'labkey-store',
                        schemaName: 'core',
                        queryName: 'PrincipalsWithoutAdmin',
                        columns: 'UserId,DisplayName',
                        sort: 'Type,DisplayName',
                        autoLoad: true,
                        listeners: {
                            scope: this,
                            load: function(store){
                                if (this.reviewRequiredRecipient){
                                    var recIdx = store.findExact('DisplayName', this.reviewRequiredRecipient);
                                    if(recIdx!=-1){
                                        this.down('#assignedTo').setValue(store.getAt(recIdx).get('UserId'));
                                    }
                                }
                            }
                        }
                    },
                    displayField: 'DisplayName',
                    valueField: 'UserId',
                    itemId: 'assignedTo'
                }]
            }]
        });

        this.callParent(arguments);
    }
});