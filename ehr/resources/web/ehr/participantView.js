/*
 * Copyright (c) 2010-2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.namespace('EHR.ext');

/*
 * This is a subclass of the AnimalHistory page, used as the details page for all study participants.
 * It should display the same set of reports, except it does not allow the user to toggle between participants or rooms
 */

EHR.ext.generateParticipantView = function(target){
    /* get the participant id from the request URL: this parameter is required. */
    var participantId = LABKEY.ActionURL.getParameter('participantId');

    if (!participantId){alert('Must Provide Id'); return false;}

    new EHR.ext.SingleAnimalReport({
        renderTo: target,
        initComponent: function(){
            //we reload the fields from URL if the params exist
            if (LABKEY.ActionURL.getParameter('participantId'))
            {
                this.subjectArray = LABKEY.ActionURL.getParameter('participantId').split(',');
            }

            Ext.apply(this, {
                autoHeight: true
                ,bodyBorder: false
                ,bodyStyle: 'background-color : transparent;'
                ,width: '100%'
                ,border: false
                ,layout: 'anchor'
                ,frame: false
                ,reports: {}
                ,defaults: {
                    border: false,
                    bodyStyle: 'background-color : transparent;'
                }
                ,items: [{
                    width: 500,
                    items: [{
                        xtype: 'hidden',
                        ref: '../inputType',
                        value: 'renderSingleSubject'
                    },{
                        xtype: 'hidden',
                        ref: '../subjArea',
                        value: LABKEY.ActionURL.getParameter('participantId')
                    }]
                },{
                    ref: 'idPanel'
                },{
                    layout: 'anchor',
                    width: '80%',
                    ref: 'anchorLayout',
                    items: [{
                        xtype: 'tabpanel',
                        ref: '../tabPanel',
                        activeTab: 0,
                        cls: 'extContainer',
//                        plugins: ['fittoparent'],
                        autoHeight: true,
                        bodyStyle: 'padding-top: 5px;',
                        frame: true
                    }]
                }]
            });

            EHR.ext.SingleAnimalReport.superclass.initComponent.call(this);

            this.allReports = new LABKEY.ext.Store({
                schemaName: 'ehr',
                queryName: 'reports',
                filterArray: [LABKEY.Filter.create('visible', true, LABKEY.Filter.Types.EQUAL)],
                sort: 'category,reporttitle',
                autoLoad: true,
                failure: function(error){
                    console.log('Error callback called');
                    console.log(target);
                    EHR.Utils.onError(error)
                }
            });

            this.allReports.on('load', this.createTabPanel, this);

            this.on('afterLayout', this.restoreUrl);
            this.doLayout();
        }
    });
}
