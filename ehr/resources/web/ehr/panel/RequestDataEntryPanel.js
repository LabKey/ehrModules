/*
 * Copyright (c) 2013-2026 LabKey Corporation
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
        // A redundant filter that helps the DB pick the index on the RequestId column even when the value arrives as a JDBC parameter rather than a literal.
        cfg.filterArray.push(LABKEY.Filter.create('requestId', this.requestId, LABKEY.Filter.Types.NOT_MISSING));

        return cfg;
    }
});
