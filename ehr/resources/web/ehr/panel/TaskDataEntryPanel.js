/*
 * Copyright (c) 2013-2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.panel.TaskDataEntryPanel', {
    extend: 'EHR.panel.DataEntryPanel',
    alias: 'widget.ehr-taskdataentrypanel',

    taskId: null,

    initComponent: function(){
        this.taskId = this.taskId || LABKEY.ActionURL.getParameter('taskid') || LABKEY.ActionURL.getParameter('taskId') || LABKEY.Utils.generateUUID().toUpperCase();
        this.callParent();

        this.storeCollection.taskId = this.taskId;
    },

    applyConfigToServerStore: function(cfg){
        cfg = this.callParent(arguments);
        cfg.filterArray = cfg.filterArray || [];
        cfg.filterArray.push(LABKEY.Filter.create('taskid', this.taskId, LABKEY.Filter.Types.EQUALS));
        // A redundant filter that can help the DB choose a more efficient query plan. SQLServer does better with this
        // filter in choosing to use the index on the TaskId column, even if the value is being passed as a JDBC
        // parameter instead of being embedded in the SQL as a string literal.
        cfg.filterArray.push(LABKEY.Filter.create('taskid', this.taskId, LABKEY.Filter.Types.NOT_MISSING));

        return cfg;
    }
});
