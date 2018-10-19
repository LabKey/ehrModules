/*
 * Copyright (c) 2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.panel.EHRSettingsPanel', {
    extend: 'Ext.panel.Panel',
    moduleName: '',

    initComponent: function () {
        this.moduleName = LABKEY.ActionURL.getController();

        if (!this.moduleName) {
            Ext4.apply(this, {
                border: false,
                defaults: {
                    border: false
                },
                items: [{
                    html: 'Error: Please specify a moduleName for this panel.'
                }]
            });
        }

        else {
            Ext4.apply(this, {
                border: false,
                defaults: {
                    border: false
                },
                items: [{
                    html: 'This page provides settings and actions for the EHR module.'
                }, {
                    html: 'Click the button below to view the status of or execute any of the ETLs defined for this container. ',
                    style: 'padding-top: 20px'
                }, {
                    xtype: 'button',
                    text: 'View ETLs',
                    handler: function () {
                        window.location = LABKEY.ActionURL.buildURL('dataintegration', 'begin');
                    }
                }, {
                    html: 'Click the button below to load / reload the extensible table definitions for the ehr schema in this container. '
                            + 'The definition for what columns to be loaded comes from the ehr.template.xml file in the module resources directory. ',
                    style: 'padding-top: 20px'
                }, {
                    xtype: 'button',
                    text: 'Load EHR table definitions',
                    handler: this.createEHRDomainHandler,
                    scope: this
                }, {
                    xtype: 'button',
                    text: 'Load EHR_Lookup table definitions',
                    handler: this.createEHRLookupsDomainHandler,
                    scope: this
                }, {
                    html: 'Click the button below to go to the pipeline data import page to load / reload the dataset definitions for the study schema in this container. '
                            + 'The definition for what columns to be loaded comes from the datasets_manifest.xml an datasets_metadata.xml files in the module resources directory. ',
                    style: 'padding-top: 20px'
                }, {
                    xtype: 'button',
                    text: 'Go to pipeline',
                    handler: this.goToPipeline,
                    scope: this
                }]
            });
        }

        this.callParent();
    },

    createEHRDomainHandler: function () {
        var ctx = EHR.Utils.getEHRContext();

        LABKEY.Domain.create({
            module: this.moduleName,
            domainKind: "EHR",
            domainGroup: "ehr",
            importData: false,
            containerPath: ctx ? ctx['EHRStudyContainer'] : null,
            success: function () {
                LABKEY.Utils.alert("Success","EHR tables updated successfully.");
            },
            failure: function (e) {
                LABKEY.Utils.alert("Error", e.exception);
            }
        });
    },

    createEHRLookupsDomainHandler: function () {
        var ctx = EHR.Utils.getEHRContext();

        LABKEY.Domain.create({
            module: this.moduleName,
            domainKind: "EHR_Lookups",
            domainGroup: "ehr_lookups",
            importData: false,
            containerPath: ctx ? ctx['EHRStudyContainer'] : null,
            success: function () {
                LABKEY.Utils.alert("Success","EHR_Lookups tables updated successfully.");
            },
            failure: function (e) {
                LABKEY.Utils.alert("Error", e.exception);
            }
        });
    },

    goToPipeline: function() {
        window.location = LABKEY.ActionURL.buildURL('pipeline', 'browse');
    }
});