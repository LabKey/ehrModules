/*
 * Copyright (c) 2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.panel.ArrivalInstructionsPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ehr-arrivalinstructionspanel',

    initComponent: function(){
        Ext4.apply(this, {
            defaults: {
                border: false
            },
            items: [{
                html: 'This form allows you to enter new arrivals to the center.  On arrival, the following steps will occur:<p>' +
                '<ul>' +
                '<li>If not already present, a demographics record will be created.  This is the table holding 1 row for all known IDs.</li>' +
                '<li>If birth, species, gender, and/or geographic origin are entered at the time the arrival is entered, the demographic record will use these.  If not, you will need to edit the demographics record itself to set these.  Editing the arrival record after the fact will not automatically update the demographics table.</li>' +
                '<li>If birth date is entered, a birth record will be created.  If dam and/or sire are also provided, the birth record will use these.</li>' +
                '<li>If room/cage are entered, a housing record will be created starting on the arrival date.</li>' +
                '</ul>',
                style: 'padding: 5px;'
            }]
        });

        this.callParent(arguments);
    }
});