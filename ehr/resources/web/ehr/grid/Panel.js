/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.grid.Panel', {
    extend: 'LDK.grid.Panel',
    alias: 'widget.ehr-gridpanel',

    initComponent: function(){
        this.store = {
            autoLoad: true,
            schemaName: this.formConfig.schemaName,
            queryName: this.formConfig.queryName,
            filterArray: this.getFilterArray()
        };

        Ext4.apply(this, {
            defaults: {
                border: false
            }
        });

        this.callParent();
    },

    getFilterArray: function(){
        return [LABKEY.Filter.create('taskid', this.taskId, LABKEY.Filter.Types.EQUAL)]
    }
});
