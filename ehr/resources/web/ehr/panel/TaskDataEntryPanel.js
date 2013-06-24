/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.panel.TaskDataEntryPanel', {
    extend: 'EHR.panel.DataEntryPanel',
    alias: 'widget.ehr-taskdataentrypanel',

    taskId: null,

    initComponent: function(){
        this.taskId = this.taskId || LABKEY.ActionURL.getParameter('taskid') || LABKEY.Utils.generateUUID();
        this.callParent();
    },

    applyConfigToServerStore: function(cfg){
        cfg = this.callParent(arguments);
        cfg.filterArray = cfg.filterArray || [];
        cfg.filterArray.push(LABKEY.Filter.create('taskId', this.taskId, LABKEY.Filter.Types.EQUALS));
        return cfg;
    }
});