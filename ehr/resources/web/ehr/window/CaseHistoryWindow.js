/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg subjectId
 * @cfg minDate
 * @cfg caseId
 * @cfg containerPath
 */
Ext4.define('EHR.window.CaseHistoryWindow', {
    extend: 'EHR.window.ClinicalHistoryWindow',
    alias: 'widget.ehr-casehistorywindow',

    initComponent: function(){
        LABKEY.ExtAdapter.apply(this, {
            title: 'Case History:'
        });

        this.callParent(arguments);
    },

    getItems: function(){
        var items = this.callParent();
        items[1].items[0].title = 'Entire History';
        items[1].items.splice(1, 0, {
            title: 'Case History',
            xtype: 'ehr-casehistorypanel',
            containerPath: this.containerPath,
            border: true,
            width: 1180,
            gridHeight: 400,
            height: 400,
            autoScroll: true,
            autoLoadRecords: true,
            subjectId: this.subjectId,
            caseId: this.caseId
        });

        return items;
    }
})