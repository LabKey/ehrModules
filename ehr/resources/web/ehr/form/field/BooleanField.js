/*
 * Copyright (c) 2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.field.BooleanField', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.ehr-booleanField',

    trueText: 'Yes',
    falseText: 'No',
    undefinedText: '',

    initComponent: function(){

        Ext4.apply(this, {
            displayField: 'displayText',
            valueField: 'value',
            queryMode: 'local',
            trueText: 'Yes',
            falseText: 'No',
            store: {
                type: 'array',
                fields: ['value', 'displayText'],
                data: [
                    [false, this.falseText],
                    [true, this.trueText]
                ]
            }
        });

        this.callParent(arguments);
    }
});
