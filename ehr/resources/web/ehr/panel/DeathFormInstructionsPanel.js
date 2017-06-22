/*
 * Copyright (c) 2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.panel.DeathFormInstructionsPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ehr-deathforminstructionspanel',

    initComponent: function(){
        Ext4.apply(this, {
            defaults: {
                border: false
            },
            items: [{
                html: 'This form allows you to enter an animal death.  After the death is entered, the following steps occur:<p>' +
                '<ul>' +
                '<li>Any active treatments, cases, housing, animal groups, project assignments, notes, and/or flags will be terminated at the time of death.</li>' +
                '<li>If the release condition is entered when the death record is created, this will automatically update the condition code for this animal.  If you do not know the release condition, or do not want to make a judgement about the release condition, leave this blank.</li>' +
                '</ul>',
                style: 'padding: 5px;'
            }]
        });

        this.callParent(arguments);
    }
});