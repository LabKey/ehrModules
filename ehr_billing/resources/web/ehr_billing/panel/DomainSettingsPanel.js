/*
 * Copyright (c) 2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR_Billing.panel.DomainSettingsPanel', {
    extend: 'Ext.panel.Panel',

    border: false,
    defaults: {
        border: false
    },

    moduleName: null, // must be provided by panel instance

    initComponent: function () {
        if (!this.moduleName) {
            this.items = [{
                html: '<span class="labkey-error"/>Error: missing moduleName property for DomainSettingsPanel.</span>'
            }];
        }
        else {
            this.items = [{
                html: 'This panel provides options for loading domain settings and actions for the ehr_billing schema.'
            }, {
                xtype: 'button',
                text: 'Load EHR Billing table definitions',
                handler: this.createDomainHandler,
                scope: this
            }];
        }

        this.callParent();
    },

    createDomainHandler: function () {
        LABKEY.Domain.create({
            module: this.moduleName,
            domainKind: "EHR_Billing",
            domainGroup: "ehr_billing",
            importData: false,
            success: function () {
                LABKEY.Utils.alert("Success","EHR Billing tables updated successfully.");
            },
            failure: function (e) {
                LABKEY.Utils.alert("Error", e.exception);
            }
        });
    }
});