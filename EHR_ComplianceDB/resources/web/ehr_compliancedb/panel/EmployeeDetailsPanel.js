/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg employeeId
 * @cfg schemaName
 */
Ext4.define('EHR_ComplianceDB.panel.EmployeeDetailsPanel', {
    extend: 'Ext.panel.Panel',
    schemaName: 'ehr_compliancedb',

    initComponent: function(){
        var filterArray = [LABKEY.Filter.create('employeeid', this.employeeId, LABKEY.Filter.Types.EQUAL)];

        Ext4.apply(this, {
            border: false,
            defaults: {
                border: false,
                style: 'margin-bottom: 20px;'
            },
            items: [{
                xtype: 'ldk-detailspanel',
                store: {
                    schemaName: this.schemaName,
                    queryName: 'employees',
                    filterArray: filterArray
                },
                showBackBtn: false,
                title: 'Employee Details'
            },{
                xtype: 'ldk-querypanel',
                queryConfig: {
                    title: 'Training / Requirement Summary',
                    schemaName: this.schemaName,
                    queryName: 'complianceRecentTests',
                    filterArray: filterArray,
                    failure: LDK.Utils.getErrorCallback()
                }
            },{
                xtype: 'ldk-querypanel',
                queryConfig: {
                    title: 'Exemptions From Training Requirements',
                    schemaName: this.schemaName,
                    queryName: 'employeerequirementexemptions',
                    filterArray: filterArray,
                    failure: LDK.Utils.getErrorCallback()
                }
            },{
                xtype: 'ldk-querypanel',
                queryConfig: {
                    title: 'Training History',
                    schemaName: this.schemaName,
                    queryName: 'completionDates',
                    filterArray: filterArray,
                    failure: LDK.Utils.getErrorCallback()
                }
            }]
        });

        this.callParent();
    }
});