/*
 * Copyright (c) 2010-2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

/*
 * This is a subclass of the AnimalHistory page, used as the details page for all study participants.
 * It should display the same set of reports, except it does not allow the user to toggle between participants or rooms
 * @cfg participantId The ID of the participant to display
 */

Ext4.define('EHR.panel.ParticipantDetailsPanel', {
    extend: 'EHR.panel.AnimalHistoryPanel',

    initComponent: function(){
        this.callParent();

        this.down('#submitBtn').hidden = true;
    },

    getFilterOptionsItems: function(){
        return [{
            xtype: 'radiogroup',
            itemId: 'inputType',
            hidden: true,
            items: [{
                xtype: 'radio',
                name: 'selector',
                inputValue: 'renderSingleSubject',
                checked: true
            }]
        }];
    },

    renderSingleSubject: function(){
        var target = this.down('#filterPanel');
        target.removeAll();

        target.add({
            xtype: 'panel',
            hidden: true,
            items: [{
                xtype: 'textfield',
                name: 'subjectBox',
                width: 165,
                itemId: 'subjArea',
                value: this.participantId
            }]
        });
    }
});