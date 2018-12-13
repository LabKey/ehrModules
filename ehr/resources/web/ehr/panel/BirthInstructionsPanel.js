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
                '</ul>' +
                'If you are editing a record that has already been finalized, certain steps will not occur.' +
                '<ul>' +
                '<li>If the record was initially finalized without a room and then edited, this will not create a housing record.</li>' +
                '<li>If the record was initially finalized without a weight and then edited, this will not create weight record.</li>' +
                '</ul>',
                style: 'padding: 5px;'
            }]
        });

        this.callParent(arguments);
    }
});