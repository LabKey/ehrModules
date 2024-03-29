/*
 * Copyright (c) 2018-2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * This field is used to display EHR projects.  It contains a custom template for the combo list which displays both the project and protocol.
 * It also listens for participantchange events and will display only the set of allowable projects for the selected animal.
 */
Ext4.define('EHR_Billing.form.field.EHRBillingProjectField', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.ehr_billingprojectfield',

    fieldLabel: 'Center Project',
    caseSensitive: false,
    anyMatch: true,
    editable: true,
    forceSelection: true,
    showInactive: false,
    matchFieldWidth: false,

    onlyIncludeProjectsWithAssignments: false,

    initComponent: function(){
        // Ext4.apply(this, {
        //     displayField: 'displayName',
        //     valueField: 'project',
        //     queryMode: 'local',
        //     store: this.getStoreCfg()
        // });
        //
        // this.listConfig = this.listConfig || {};
        // Ext4.apply(this.listConfig, {
        //     innerTpl:this.getInnerTpl(),
        //     getInnerTpl: function(){
        //         return this.innerTpl;
        //     },
        //     style: 'border-top-width: 1px;' //this was added in order to restore the border above the boundList if it is wider than the field
        // });
        //
        // console.log("EHRBillingProjectField initComponent");
        // this.callParent(arguments);
    },

    //can be overridden by child modules
    getInnerTpl: function(){
        return ['<span style="white-space:nowrap;">{[LABKEY.Utils.encodeHtml(values["displayName"] + " " + (values["inves"] ? "(" + (values["inves"] ? values["inves"] : "") : "") + (values["account"] ? ": " + values["account"] : "") + (values["inves"] ? ")" : ""))]}&nbsp;</span>'];
    },

    getStoreCfg: function(){
        var ctx = EHR.Utils.getEHRContext();

        var storeCfg = {
            type: 'labkey-store',
            containerPath: ctx ? ctx['EHRStudyContainer'] : null,
            schemaName: 'ehr',
            queryName: 'project',
            columns: 'project,protocol,protocol/displayName,displayName,account,inves',
            filterArray: this.showInactive ? null : [LABKEY.Filter.create('enddateCoalesced', '-0d', LABKEY.Filter.Types.DATE_GREATER_THAN_OR_EQUAL)],
            sort: 'displayName',
            autoLoad: true
        };

        if (this.onlyIncludeProjectsWithAssignments){
            storeCfg.filterArray.push(LABKEY.Filter.create('activeAssignments/activeAssignments', 0, LABKEY.Filter.Types.GT));
        }

        if (this.storeConfig){
            Ext4.apply(storeCfg, this.storeConfig);
        }

        if (this.filterArray){
            storeCfg.filterArray = storeCfg.filterArray.concat(this.filterArray);
        }

        return storeCfg;
    }
});