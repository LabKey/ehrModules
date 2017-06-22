/*
 * Copyright (c) 2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.panel.BirthInstructionsPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ehr-birthinstructionspanel',

    initComponent: function(){
        Ext4.apply(this, {
            defaults: {
                border: false
            },
            items: [{
                html: 'This form allows you to enter new birth.  The birth can be entered, and then saved.  If saved as a draft, none of the extra steps below will occur.  Only once the record has been finalized will these steps take place:<p>' +
                '<ul>' +
                '<li>If not already present, a demographics record will be created.  This is the table holding 1 row for all known IDs.</li>' +
                '<li>If date, species, gender, and/or geographic origin are entered at the time the birth record is entered, the demographic record will use these.</li>' +
                '<li>If room/cage are entered, a housing record will be created starting on the birth date.</li>' +
                '<li>If a dam is supplied, the infant will be set to the same SPF status as the dam (on the infant\'s DOB, not the current date).</li>' +
                '<li>If the dam is assigned to a breeding group or U42 on the infant\'s DOB (not the date this was entered), this will be applied to the infant.</li>' +
                '<li>The infant will be set to Nonrestricted as the animal condition.</li>' +
                '</ul>' +
                'If you are editing a record that has already been finalized, certain steps will not occur.' +
                '<ul>' +
                '<li>If the record was initially finalized without a room and then edited, this will not create a housing record.</li>' +
                '<li>If the record was initially finalized without a weight and then edited, this will not create weight record.</li>' +
                '<li>If the record was initially finalized without a dam and then edited, it will copy the SPF status and animal groups of this dam.  This will only happen the first time a dam is entered (ie. dam was blank, then filled in).  If the wrong dam was entered and then changed, you will need to manually update SPF status and/or animal groups.</li>' +
                '</ul>',
                style: 'padding: 5px;'
            }]
        });

        this.callParent(arguments);
    }
});