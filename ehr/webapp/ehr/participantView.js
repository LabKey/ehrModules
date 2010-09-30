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

            Ext.apply(this, {
                layout:'table'
                ,autoHeight: true
                ,bodyBorder: false
                ,border: false
                ,defaults: {
                    // applied to each contained panel
                    border: false
                    //,bodyStyle:'padding:5px'
                },
                layoutConfig: {
                    columns: 4
                }
            });

            EHR.ext.customPanels.SingleAnimalReport.superclass.initComponent.call(this);

            //the report row
            this.add({html: 'Choose Report:'});

            this.allReports = new LABKEY.ext.Store({
                schemaName: 'lists',
                queryName: 'reports',
                sort: 'ReportName'
            });
            this.allReports.load();

            var reportStore = new LABKEY.ext.Store({
                schemaName: 'lists',
                queryName: 'reports',
                filterArray: [LABKEY.Filter.create('Visible', true, LABKEY.Filter.Types.EQUAL), LABKEY.Filter.create('ReportCategory', 'AnimalReport', LABKEY.Filter.Types.EQUAL)],
                sort: 'ReportName'
            });

            var comboConfig = {
                emptyText:'Select a report...'
                ,xtype: 'LabkeyComboBox'
                ,displayField:'ReportName'
                ,hiddenName:'report'
                ,store: reportStore
            };

            if (LABKEY.ActionURL.getParameter('report') && LABKEY.ActionURL.getParameter('report') != ''){
                comboConfig.value = LABKEY.ActionURL.getParameter('report')
            }
            else {
                comboConfig.value = 1;
            }

            this.reportSelector = new EHR.ext.customFields.LabKeyCombo(comboConfig);

            this.add(this.reportSelector);

            this.combineSubj = new Ext.form.Checkbox();
            /*
            this.add({});

            this.add({html: 'Combine Subjects Into Single Table:'});
            this.combineSubj = this.add(new Ext.form.Checkbox());

            if (LABKEY.ActionURL.getParameter('combineSubj')){
                this.combineSubj.setValue(true);
            }
            */

            //placeholder
            this.add({});
            this.add(new Ext.Button({
                text: 'Display Report'
                ,scope: this
                ,handler: this.onSubmit
                ,type: 'submit'
                })
            );

            //pre-load the abstract
            this.reportSelector.setValue(1);
            this.onSubmit();


        }

        //this function builds the URL and reloads the page
//        onSubmit: function(){
//            this.displayReport()
//        }
    });

});
