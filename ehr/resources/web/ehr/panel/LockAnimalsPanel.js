/*
 * Copyright (c) 2017-2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.panel.LockAnimalsPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ehr-lockanimalspanel',

    initComponent: function() {
        Ext4.apply(this, {
            bodyStyle: 'padding: 5px;',
            defaults: {
                border: false
            },
            items: [{
                html: this.getInstructionsText(),
                style: 'padding-bottom: 10px;'
            },{
                itemId: 'infoArea',
                border: false
            },{
                layout: 'hbox',
                defaults: {
                    style: 'margin-right: 5px;'
                },
                items: [{
                    xtype: 'button',
                    itemId: 'lockBtn',
                    text: 'Lock Entry',
                    disabled: true, // start disabled until we know it is OK to enable it
                    scope: this,
                    locked: true,
                    handler: this.lockRecords

                }]
            }]
        });

        this.callParent(arguments);

        var query = Ext4.ComponentQuery.query('ehr-dataentrypanel');
        LDK.Assert.assertTrue('Unable to find data entry panel', (query && query.length));
        if (query && query.length){
            this.dataEntryPanel = query[0];
        }

        LABKEY.Ajax.request({
            url: LABKEY.ActionURL.buildURL('ehr', 'getAnimalLock'),
            scope: this,
            failure: LDK.Utils.getErrorCallback(),
            success: LABKEY.Utils.getCallbackWrapper(this.onSuccess, this)
        });
    },

    getInstructionsText: function() {
        return 'The birth/arrival screen is initially disabled by default. You must enable the form in order to: <br> '
            + '<ul><li>Get an Animal ID(s)</li><li>Secure the numbers for processing</li><li>Finish entering data on acquired numbers</li></ul><br>'
            + '<b>When you enable the form for data entry all others will automatically be blocked from using the form.</b><br>'
            + 'Once you "Submit for Review" or "Save and Close", the birth/arrival form will be automatically be available for all other users. '
            + 'If you do not submit/save <i>please click the button below to exit data entry before leaving</i>, otherwise all other users will be '
            + 'permanently locked out. <br><br>'
            + 'If the birth/arrival form is unavailable and you believe it has been kept locked by mistake, please '
            + 'first contact the person who locked the form. If they cannot be reached, please contact the LabKey server administrator. '
            + 'Please take care not to request the birth/arrival form be unlocked unless you are confident the lock is in error, otherwise you will '
            + 'kick a user out of the birth/arrival form and prevent data entry.';
    },

    onSuccess: function(results){
        var target = this.down('#infoArea');
        target.removeAll();

        //Added this block ny Lakshmi:If the screen is not locked:
        //Lock the screen by default. User has to click on the "Lock Entry" button to enable the screen for data entry.
        if (!results.locked) {

            var up1 = this.dataEntryPanel.getUpperPanel();
            if (!up1)
                return;

            var ret1;
            up1.items.each(function(item){

                if (item.getId() != this.getId())
                {
                    item.setDisabled(true);
                }

            }, this);

        }

        //If the screen is locked by some one: display the Locked details
        if (results.locked)  {

            this.locked_person = results.lockedBy;
            target.add({
                html: ['Locked By: ' + results.lockedBy, 'Locked On: ' + results.lockDate ].join('<br>'),
                style: 'padding-bottom: 10px;',
                border: false
            });
        }
        else {
            this.locked_person = null;
        }

        this.togglePanel(!!results.locked);

    },

    lockRecords: function(btn){

        LABKEY.Ajax.request({
            url: LABKEY.ActionURL.buildURL('ehr', 'setAnimalLock'),
            scope: this,
            failure: LDK.Utils.getErrorCallback(),
            success: LABKEY.Utils.getCallbackWrapper(this.onSuccess, this),
            jsonData: {
                lock: !!btn.locked

            }
        });

    },

    togglePanel: function(locked) {
        var btn = this.down('#lockBtn');

        btn.locked = !locked;

        var up = this.dataEntryPanel.getUpperPanel();
        if (!up)
            return;

        var ret;
        up.items.each(function(item){
            if (item.getId() != this.getId())
            {

                // If locked person is not defined then enforce locking before data entry
                if(!Ext4.isDefined(this.locked_person) || !this.locked_person) {
                    item.setDisabled(!locked);
                    btn.setDisabled(locked);
                }
                // Changed by Lakshmi: If the locked person is not the person who is logged in, then lock the entire screen
                //If the locked person is same as the loggedin person, enable the entire screen
                else if (this.locked_person != LABKEY.Security.currentUser.displayName )
                {
                    item.setDisabled(locked); ///Disable all data entry fields on the screen
                    btn.setDisabled(locked); //Disable the "Unlock Entry" button for other users

                    if (LABKEY.Security.currentUser.isSystemAdmin || LABKEY.Security.currentUser.isAdmin )  //Let the sys Admins and Folder Admins unlock the screen
                    {
                        btn.setDisabled(!locked);
                    }

                }
                //If the locked person is the loggedin person, Lock the screen. ie the Birth screen is always locked when you open it first time.
                else if (this.locked_person == LABKEY.Security.currentUser.displayName)  // || LABKEY.Security.currentUser.isAdmin )
                {
                    item.setDisabled(!locked);
                    btn.setDisabled(!locked);
                }

            }

        }, this);

        //Changed by Lakshmi: Don't disable the submit and save draft ... button bar ever.
        var bbar = up.getDockedItems('toolbar[dock="bottom"]')[0];
        bbar.setDisabled(!locked);

    },

});

EHR.DataEntryUtils.registerDataEntryFormButton('BIRTHARRIVALCLOSE', {
    text: 'Save & Close',
    name: 'closeBtn',
    requiredQC: 'In Progress',
    errorThreshold: 'WARN',
    successURL: LABKEY.ActionURL.getParameter('srcURL') || LABKEY.ActionURL.getParameter('returnURL') || LABKEY.ActionURL.buildURL('ehr', 'enterData.view'),
    disabled: true,
    itemId: 'closeBtn1',
    handler: function(btn){
        LABKEY.Ajax.request({
            url: LABKEY.ActionURL.buildURL('ehr', 'setAnimalLock'),
            scope: this,
            failure: LDK.Utils.getErrorCallback(),
            success: LABKEY.Utils.getCallbackWrapper(function() {
                var panel = btn.up('ehr-dataentrypanel');
                panel.onSubmit(btn);
            }, this),
            jsonData: {
                lock: false
            }
        });
    },
    disableOn: 'ERROR'
});

EHR.DataEntryUtils.registerDataEntryFormButton('BIRTHARRIVALFINAL', {
    text: 'Submit Final',
    name: 'submit',
    requiredQC: 'Completed',
    targetQC: 'Completed',
    errorThreshold: 'WARN',
    successURL: LABKEY.ActionURL.getParameter('srcURL') || LABKEY.ActionURL.getParameter('returnURL') || LABKEY.ActionURL.buildURL('ehr', 'enterData.view'),
    disabled: true,
    itemId: 'submitBtn',
    handler: function(btn){
        LABKEY.Ajax.request({
            url: LABKEY.ActionURL.buildURL('ehr', 'setAnimalLock'),
            scope: this,
            failure: LDK.Utils.getErrorCallback(),
            success: LABKEY.Utils.getCallbackWrapper(function() {
                var panel = btn.up('ehr-dataentrypanel');
                Ext4.Msg.confirm('Finalize Birth/Arrival Form', 'You are about to finalize this form.  Do you want to proceed?', function(v){
                    if(v == 'yes')
                        panel.onSubmit(btn);
                });
            }, this),
            jsonData: {
                lock: false
            }
        });
    },
    disableOn: 'ERROR'
});

EHR.DataEntryUtils.registerDataEntryFormButton('BIRTHARRIVALRELOAD', {
    text: 'Submit & Reload',
    name: 'submit',
    requiredQC: 'Completed',
    targetQC: 'Completed',
    errorThreshold: 'WARN',
    successURL: LABKEY.ActionURL.buildURL('ehr', 'dataEntryForm.view', null, {formType: LABKEY.ActionURL.getParameter('formType')}),
    disabled: true,
    itemId: 'reloadBtn1',
    handler: function(btn){
        LABKEY.Ajax.request({
            url: LABKEY.ActionURL.buildURL('ehr', 'setAnimalLock'),
            scope: this,
            failure: LDK.Utils.getErrorCallback(),
            success: LABKEY.Utils.getCallbackWrapper(function() {
                var panel = btn.up('ehr-dataentrypanel');
                Ext4.Msg.confirm('Finalize Birth/Arrival Form', 'You are about to finalize and reload this form.  Do you want to proceed?', function(v){
                    if(v == 'yes')
                        panel.onSubmit(btn);
                });
            }, this),
            jsonData: {
                lock: false
            }
        });
    },
    disableOn: 'ERROR'
});


EHR.DataEntryUtils.registerDataEntryFormButton('BIRTHARRIVALREVIEW', {
    text: 'Submit for Review',
    name: 'review',
    requiredQC: 'Review Required',
    targetQC: 'Review Required',
    errorThreshold: 'WARN',
    successURL: LABKEY.ActionURL.getParameter('srcURL') || LABKEY.ActionURL.getParameter('returnURL') || LABKEY.ActionURL.buildURL('ehr', 'enterData.view'),
    disabled: true,
    itemId: 'reviewBtn1',
    handler: function(btn){

        LABKEY.Ajax.request({
            url: LABKEY.ActionURL.buildURL('ehr', 'setAnimalLock'),
            scope: this,
            failure: LDK.Utils.getErrorCallback(),
            success: LABKEY.Utils.getCallbackWrapper(function() {
                var panel = btn.up('ehr-dataentrypanel');
                Ext4.create('EHR.window.SubmitForReviewWindow', {
                    dataEntryPanel: panel,
                    dataEntryBtn: btn,
                    reviewRequiredRecipient: panel.formConfig.defaultReviewRequiredPrincipal
                }).show();
            }, this),
            jsonData: {
                lock: false
            }
        });
    },
    disableOn: 'ERROR'
});