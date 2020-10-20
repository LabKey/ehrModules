/*
 * Copyright (c) 2013-2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.panel.RequestDataEntryPanel', {
    extend: 'EHR.panel.DataEntryPanel',
    alias: 'widget.ehr-requestdataentrypanel',

    taskId: null,

    initComponent: function(){
        this.requestId = this.requestId || LABKEY.ActionURL.getParameter('requestid') || LABKEY.ActionURL.getParameter('requestId') || LABKEY.Utils.generateUUID().toUpperCase();
        this.callParent();
    },

    applyConfigToServerStore: function(cfg){
        cfg = this.callParent(arguments);
        cfg.filterArray = cfg.filterArray || [];
        cfg.filterArray.push(LABKEY.Filter.create('requestId', this.requestId, LABKEY.Filter.Types.EQUALS));
        // A redundant filter that can help the DB choose a more efficient query plan. SQLServer does better with this
        // filter in choosing to use the index on the RequestId column, even if the value is being passed as a JDBC
        // parameter instead of being embedded in the SQL as a string literal.
        cfg.filterArray.push(LABKEY.Filter.create('requestId', this.requestId, LABKEY.Filter.Types.NOT_MISSING));

        return cfg;
    }
});
