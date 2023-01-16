/*
 * Copyright (c) 2012-2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.namespace('EHR.reports');

/*
 * This file contains a series of JS-based reports used in the Animal History page.
 * These should really get refactored into true JS reports; however, the difficultly
 * is that a JS report expects to render into a DIV, and here we are adding ExtComponents
 * to the TabPanel, plus passing in some non-standard context.
 *
 * The function for a given report will be invoked with two arguments. The first is an instance of
 * EHR.panel.AnimalHistoryPanel being used to select animals, and the second is the ExtJS tab into which
 * the UI should be rendered.
 *
 */
EHR.reports['abstract'] = function(panel, tab){
    var filterArray = panel.getFilterArray(tab);
    var title = panel.getTitleSuffix();

    tab.add({
        xtype: 'ldk-multirecorddetailspanel',
        bodyStyle: 'padding-bottom: 20px',
        store: {
            schemaName: 'study',
            queryName: 'demographics',
            viewName: 'Abstract',
            filterArray: filterArray.removable.concat(filterArray.nonRemovable)
        },
        titleField: 'Id',
        titlePrefix: 'Details',
        multiToGrid: true,
        qwpConfig: panel.getQWPConfig({
            title: 'Abstract'
        })
    });

    var config = panel.getQWPConfig({
        title: 'Other Notes' + title,
        frame: true,
        schemaName: 'study',
        queryName: 'notes',
        sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable
    });

    tab.add({
        xtype: 'ldk-querycmp',
        style: 'margin-bottom:20px;',
        queryConfig: config
    });

    config = panel.getQWPConfig({
        title: 'Active Assignments' + title,
        frame: true,
        schemaName: 'study',
        queryName: 'Assignment',
        viewName: 'Active Assignments',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable
    });

    tab.add({
        xtype: 'ldk-querycmp',
        style: 'margin-bottom:20px;',
        queryConfig: config
    });

    config = panel.getQWPConfig({
        title: 'Problem List' + title,
        frame: true,
        schemaName: 'study',
        allowChooseView: true,
        queryName: 'Problem List',
        //sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable
    });

    tab.add({
        xtype: 'ldk-querycmp',
        style: 'margin-bottom:20px;',
        queryConfig: config
    });

    EHR.reports.weightGraph(panel, tab);
};

EHR.reports.arrivalDeparture = function(panel, tab){
    var filterArray = panel.getFilterArray(tab);
    var title = panel.getTitleSuffix();

    tab.add({
        xtype: 'ldk-querycmp',
        style: 'margin-bottom:20px;',
        queryConfig: panel.getQWPConfig({
            title: 'Arrivals' + title,
            schemaName: 'study',
            queryName: 'arrival',
            filters: filterArray.nonRemovable,
            removeableFilters: filterArray.removable,
            frame: true
        })
    });

    tab.add({
        xtype: 'ldk-querycmp',
        style: 'margin-bottom:20px;',
        queryConfig: panel.getQWPConfig({
            title: 'Departures' + title,
            schemaName: 'study',
            queryName: 'departure',
            filters: filterArray.nonRemovable,
            removeableFilters: filterArray.removable,
            frame: true
        })
    });
};

EHR.reports.pedigree = function(panel, tab){
    var filterArray = panel.getFilterArray(tab);
    var title = panel.getTitleSuffix();

    tab.add({
        xtype: 'ldk-multirecorddetailspanel',
        bodyStyle: 'padding-bottom: 20px',
        store: {
            schemaName: 'study',
            queryName: 'demographicsFamily',
            filterArray: filterArray.removable.concat(filterArray.nonRemovable)
        },
        titlePrefix: 'Parents/Grandparents',
        titleField: 'Id',
        multiToGrid: true
    });

    var configOffspring = panel.getQWPConfig({
        title: 'Offspring' + title,
        schemaName: 'study',
        queryName: 'demographicsOffspring',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable,
        frame: true
    });

    var configSibling = panel.getQWPConfig({
        title: 'Siblings' + title,
        schemaName: 'study',
        queryName: 'demographicsSiblings',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable,
        frame: true
    });

    tab.add({
        xtype: 'ldk-querycmp',
        style: 'margin-bottom:20px;',
        queryConfig: configOffspring
    });

    tab.add({
        xtype: 'ldk-querycmp',
        style: 'margin-bottom:20px;',
        queryConfig: configSibling
    });
};

EHR.reports.weightGraph = function(panel, tab){
    if (tab.filters.subjects){
        renderSubjects(tab.filters.subjects, tab);
    }
    else
    {
        panel.resolveSubjectsFromHousing(tab, renderSubjects, this);
    }

    function renderSubjects(subjects, tab){
        if (!subjects.length){
            tab.add({
                html: 'No animals were found.',
                border: false
            });

            return;
        }

        var toAdd = [];
        if (subjects.length < 10) {
            for (var i=0;i<subjects.length;i++){
                var subject = subjects[i];
                toAdd.push(EHR.reports.renderWeightData(panel, tab, subject));
            }
        }
        else {
            toAdd.push({
                html: 'Because more than 10 subjects were selected, the condensed report is being shown.  Note that you can click the animal ID to open this same report in a different tab, showing that animal in more detail.',
                style: 'padding-bottom: 20px;',
                border: false
            });

            var filterArray = panel.getFilterArray(tab);
            var title = panel.getTitleSuffix();
            toAdd.push({
                xtype: 'ldk-querycmp',
                style: 'margin-bottom:20px;',
                queryConfig: {
                    title: 'Overview' + title,
                    schemaName: 'study',
                    queryName: 'weight',
                    filterArray: filterArray.removable.concat(filterArray.nonRemovable)
                }
            });
        }

        if (toAdd.length)
            tab.add(toAdd)
    }
};

EHR.reports.renderWeightData = function(panel, tab, subject){
    return {
        xtype: 'ldk-webpartpanel',
        title: 'Weights - ' + subject,
        style: 'margin-bottom: 20px;',
        border: false,
        items: [{
            xtype: 'ehr-weightsummarypanel',
            style: 'padding-bottom: 20px;',
            subjectId: subject
        },{
            xtype: 'ehr-weightgraphpanel',
            itemId: 'tabArea',
            showRawData: true,
            border: false,
            subjectId: subject
        }]
    }
};

EHR.reports.bloodChemistry = function(panel, tab){
    var filterArray = panel.getFilterArray(tab);
    var title = panel.getTitleSuffix();

    var config = panel.getQWPConfig({
        schemaName: 'study',
        queryName: 'chemPivot',
        title: "By Panel:",
        titleField: 'Id',
        sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable
    });

    tab.add({
        xtype: 'ldk-querycmp',
        style: 'margin-bottom:20px;',
        queryConfig: config
    });

    config = panel.getQWPConfig({
        schemaName: 'study',
        queryName: 'chemMisc',
        title: "Misc Tests:",
        titleField: 'Id',
        sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable
    });

    tab.add({
        xtype: 'ldk-querycmp',
        style: 'margin-bottom:20px;',
        queryConfig: config
    });

    config = panel.getQWPConfig({
        schemaName: 'study',
        queryName: 'chemistryRefRange',
        //viewName: 'Plus Ref Range',
        title: "Reference Ranges:",
        titleField: 'Id',
        sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable
    });

    tab.add({
        xtype: 'ldk-querycmp',
        style: 'margin-bottom:20px;',
        queryConfig: config
    });
}

EHR.reports.urinalysisResults = function(panel, tab){
    var filterArray = panel.getFilterArray(tab);
    var title = panel.getTitleSuffix();

    tab.queryName = tab.queryName || 'urinalysisPivot';

    var config = panel.getQWPConfig({
        schemaName: 'study',
        queryName: 'urinalysisPivot',
        title: "By Panel:",
        titleField: 'Id',
        sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable
    });

    tab.add({
        xtype: 'ldk-querycmp',
        style: 'margin-bottom:20px;',
        queryConfig: config
    });

    config = panel.getQWPConfig({
        schemaName: 'study',
        queryName: 'urinalysisMisc',
        title: "Urinalysis Misc:",
        titleField: 'Id',
        sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable
    });

    tab.add({
        xtype: 'ldk-querycmp',
        style: 'margin-bottom:20px;',
        queryConfig: config
    });

    config = panel.getQWPConfig({
        schemaName: 'study',
        queryName: 'urinalysisRefRange',
        //viewName: 'Plus Ref Range',
        title: "Reference Ranges:",
        titleField: 'Id',
        sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable
    });

    tab.add({
        xtype: 'ldk-querycmp',
        style: 'margin-bottom:20px;',
        queryConfig: config
    });
}

EHR.reports.treatmentSchedule = function(panel, tab){
    var filterArray = panel.getFilterArray(tab);
    var title = panel.getTitleSuffix();

    var target = tab.add({tag: 'span', style: 'padding-bottom: 20px'});
    tab.doLayout();

    var config = panel.getQWPConfig({
        title: 'AM Treatments',
        schemaName: 'study',
        queryName: 'treatmentSchedule',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable.concat([LABKEY.Filter.create('timeofday', 'AM', LABKEY.Filter.Types.EQUAL)]),
        frame: true
    });

    tab.add({
        xtype: 'ldk-querycmp',
        style: 'margin-bottom:20px;',
        queryConfig: config
    });

    config = panel.getQWPConfig({
        title: 'PM Treatments',
        schemaName: 'study',
        queryName: 'treatmentSchedule',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable.concat([LABKEY.Filter.create('timeofday', 'PM', LABKEY.Filter.Types.EQUAL)]),
        frame: true
    });

    tab.add({
        xtype: 'ldk-querycmp',
        style: 'margin-bottom:20px;',
        queryConfig: config
    });

    config = panel.getQWPConfig({
        title: 'Night Treatments',
        schemaName: 'study',
        queryName: 'treatmentSchedule',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable.concat([LABKEY.Filter.create('timeofday', 'Night', LABKEY.Filter.Types.EQUAL)]),
        frame: true
    });

    tab.add({
        xtype: 'ldk-querycmp',
        style: 'margin-bottom:20px;',
        queryConfig: config
    });
};

EHR.reports.medicationSchedule = function(panel, tab, viewName){
    var filterArray = panel.getFilterArray(tab);
    var title = panel.getTitleSuffix();

    var date = Ext4.Date.format(new Date(), LABKEY.extDefaultDateFormat);
    tab.add({
        xtype: 'ldk-querypanel',
        style: 'margin-bottom:20px;',
        queryConfig: panel.getQWPConfig({
            schemaName: 'study',
            queryName: 'treatmentSchedule',
            viewName: viewName,
            title: viewName + ' ' + title,
            filters: filterArray.nonRemovable,
            removeableFilters: filterArray.removable,
            parameters: {
                StartDate: date,
                NumDays: 1
            }
        })
    });
}

EHR.reports.clinMedicationSchedule = function(panel, tab){
    EHR.reports.medicationSchedule(panel, tab, 'Clinical Medications');
};

EHR.reports.dietSchedule = function(panel, tab){
    EHR.reports.medicationSchedule(panel, tab, 'Diets');
};

EHR.reports.surgMedicationSchedule = function(panel, tab){
    EHR.reports.medicationSchedule(panel, tab, 'Surgical Medications');
};

EHR.reports.incompleteTreatments = function(panel, tab){
    EHR.reports.medicationSchedule(panel, tab, 'Incomplete Treatments');
};

EHR.reports.snapshot = function(panel, tab, showActionsBtn){
    if (tab.filters.subjects){
        renderSubjects(tab.filters.subjects, tab);
    }
    else
    {
        panel.resolveSubjectsFromHousing(tab, renderSubjects, this);
    }

    function renderSubjects(subjects, tab){
        var toAdd = [];
        if (!subjects.length){
            toAdd.push({
                html: 'No animals were found.',
                border: false
            });
        }
        else if (subjects.length < 10) {
            for (var i=0;i<subjects.length;i++){
                toAdd.push({
                    xtype: 'ldk-webpartpanel',
                    title: 'Overview: ' + subjects[i],
                    items: [{
                        xtype: 'ehr-snapshotpanel',
                        showExtendedInformation: true,
                        showActionsButton: !!showActionsBtn,
                        hrefTarget: '_blank',
                        border: false,
                        subjectId: subjects[i]
                    }]
                });

                toAdd.push({
                    border: false,
                    height: 20
                });

                toAdd.push(EHR.reports.renderWeightData(panel, tab, subjects[i]));
            }
        }
        else {
            toAdd.push({
                html: 'Because more than 10 subjects were selected, the condensed report is being shown.  Note that you can click the animal ID to open this same report in a different tab, showing that animal in more detail or click the link labeled \'Show Hx\'.',
                style: 'padding-bottom: 20px;',
                border: false
            });

            var filterArray = panel.getFilterArray(tab);
            var title = panel.getTitleSuffix();
            toAdd.push({
                xtype: 'ldk-querycmp',
                style: 'margin-bottom:20px;',
                queryConfig: {
                    title: 'Overview' + title,
                    schemaName: 'study',
                    queryName: 'demographics',
                    viewName: 'Snapshot',
                    filterArray: filterArray.removable.concat(filterArray.nonRemovable)
                }
            });
        }

        if (toAdd.length) {
            tab.add(toAdd);
            if (tab.getWidth() < 1000) {
                tab.setWidth(1000);
            }
        }
    }

};

// this allows for PRC specific overrides of which snapshot panel xtype to use
EHR.reports.clinicalHistoryPanelXtype = 'ehr-smallformsnapshotpanel';

EHR.reports.fullClinicalHistory = function(panel, tab, showActionsBtn){
    EHR.reports.clinicalHistory(panel, tab, showActionsBtn, true);
}

EHR.reports.clinicalHistory = function(panel, tab, showActionsBtn, includeAll){
    if (tab.filters.subjects){
        renderSubjects(tab.filters.subjects, tab);
    }
    else
    {
        panel.resolveSubjectsFromHousing(tab, renderSubjects, this);
    }

    function renderSubjects(subjects, tab){
        if (subjects.length > 10){
            tab.add({
                html: 'Because more than 10 subjects were selected, the condensed report is being shown.  Note that you can click the animal ID to open this same report in a different tab, showing that animal in more detail or click the link labeled \'Show Hx\'.',
                style: 'padding-bottom: 20px;',
                border: false
            });

            var filterArray = panel.getFilterArray(tab);
            var title = panel.getTitleSuffix();
            tab.add({
                xtype: 'ldk-querycmp',
                style: 'margin-bottom:20px;',
                queryConfig: {
                    title: 'Overview' + title,
                    schemaName: 'study',
                    queryName: 'demographics',
                    viewName: 'Snapshot',
                    filterArray: filterArray.removable.concat(filterArray.nonRemovable)
                }
            });

            return;
        }

        if (!subjects.length){
            tab.add({
                html: 'No animals were found.',
                border: false
            });

            return;
        }

        tab.addCls('ehr-snapshotsubpanel');

        var minDate = includeAll ? null : Ext4.Date.add(new Date(), Ext4.Date.YEAR, -2);
        var toAdd = [];
        Ext4.each(subjects, function(s){
            toAdd.push({
                html: '<span style="font-size: large;"><b>Animal: ' + Ext4.htmlEncode(s) + '</b></span>',
                style: 'padding-bottom: 20px;',
                border: false
            });

            toAdd.push({
                xtype: EHR.reports.clinicalHistoryPanelXtype,
                showActionsButton: !!showActionsBtn,
                hrefTarget: '_blank',
                border: false,
                subjectId: s
            });

            toAdd.push({
                html: '<b>Chronological History:</b><hr>',
                style: 'padding-top: 5px;',
                border: false
            });

            toAdd.push({
                xtype: 'ehr-clinicalhistorypanel',
                border: true,
                subjectId: s,
                autoLoadRecords: true,
                minDate: minDate,
                //maxGridHeight: 1000,
                hrefTarget: '_blank',
                style: 'margin-bottom: 20px;'
            });
        }, this);

        if (toAdd.length){
            tab.add(toAdd);
        }
    }
};

EHR.reports.kinshipSummary = function(panel, tab){
    var title = panel.getTitleSuffix();
    var filterArray = panel.getFilterArray(tab);
    filterArray = filterArray.removable.concat(filterArray.nonRemovable);
    tab.add({
        xtype: 'ldk-webpartpanel',
        title: 'Kinship' + title,
        style: 'margin-bottom: 20px;',
        border: false,
        items: [{
            xtype: 'ehr-kinshippanel',
            style: 'padding-bottom: 20px;',
            border: false,
            filterArray: filterArray
        }]
    });
};

EHR.reports.underDevelopment = function(panel, tab){
    tab.add({
        xtype: 'panel',
        border: false,
        html: 'The site is currently under development and we expect this tab to be enabled soon.',
        bodyStyle: 'padding: 5px;',
        defaults: {
            border: false
        }
    });
};
