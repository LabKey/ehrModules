/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.namespace('EHR.ext.customPanels');

LABKEY.requiresScript("/ehr/transposeRows.js");
LABKEY.requiresScript("/ehr/utilities.js");
LABKEY.requiresScript("/ehr/animalHistory.js");


Ext.onReady(function ()
{
    /* get the participant id from the request URL: this parameter is required. */
    var participantId = LABKEY.ActionURL.getParameter('participantId');
    /* get the dataset id from the request URL: this is used to remember expand/collapse
       state per-dataset.  This parameter is optional; we use -1 if it isn't provided. */

    if (!participantId){alert('Must Provide Id'); return false;}

//    new EHR.ext.customPanels.detailsView({
//        schemaName: 'study',
//        queryName: 'demographics',
//        title: 'Animal Details:',
//        renderTo: 'participantDetails',
//        filterArray: [LABKEY.Filter.create('Id', participantId, LABKEY.Filter.Types.EQUAL)]
//    });

    new EHR.ext.customPanels.SingleAnimalReport({
        applyTo: 'participantView',
        initComponent: function()
        {
            //we reload the fields from URL if the params exist
            if (LABKEY.ActionURL.getParameter('participantId'))
            {
                this.subjectArray = LABKEY.ActionURL.getParameter('participantId').split(',');
            }

            Ext.Panel.prototype.bodyBorder = false;

            Ext.apply(this, {
                autoHeight: true
                ,bodyBorder: false
                ,border: false
                ,frame: false
                ,reports: {}
                ,defaults: {
                    border: false,
                    autoWidth: true
                }
                ,items: [
                {
//                    layout: 'column'
//                    ,defaults: {
//                        autoHeight: true
//                    }
//                    ,items: [{
                        width: 500,
                        items: [{
                            xtype: 'hidden',
                            ref: '../inputType',
                            value: 'renderSingleSubject'
                        },{
                            xtype: 'hidden',
                            ref: '../subjArea',
                            value: LABKEY.ActionURL.getParameter('participantId')
//                        }]
                    }]
                },{
                    ref: 'idPanel'                        
                },{
                    xtype: 'tabpanel',
                    ref: 'tabPanel',
                    cls: 'extContainer',
                    bodyBorder: true,
                    width: '90%',
                    border: true,
                    autoHeight: true,
                    bodyStyle: 'padding-top: 5px;',
                    frame: true
                }]
            });

            EHR.ext.customPanels.SingleAnimalReport.superclass.initComponent.call(this);

            this.allReports = new LABKEY.ext.Store({
                schemaName: 'lists',
                queryName: 'reports',
                filterArray: [LABKEY.Filter.create('Visible', true, LABKEY.Filter.Types.EQUAL)],
                //, LABKEY.Filter.create('ReportCategory', 'AnimalReport', LABKEY.Filter.Types.EQUAL)
                sort: 'Category,ReportTitle',
                autoLoad: true,
    //            listeners: {
    //                scope: this,
    //                load: this.createTabPanel
    //            },
                errorCallback: function(error){
                    console.log('Error callback called');
                    console.log(target);
                    EHR.UTILITIES.onError(error)
                }
            });
    //TODO: replace when store is fixed
            this.allReports.on('load', this.createTabPanel, this);

            this.on('afterLayout', this.restoreUrl);  
            this.doLayout();
        }

    });

});
