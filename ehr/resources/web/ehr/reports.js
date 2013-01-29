/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.namespace('EHR.reports');

/*
 * This file contains a series of JS-baed reports used in the Animal History page.
 * These should really get refactored into true JS reports; however, the difficultly
 * is that a JS report expects to render into a DIV, and here we are adding ExtComponents
 * to the TabPanel, plus passing in some non-standard context
 *
 */
EHR.reports.abstract = function(panel, tab){
    var filterArray = panel.getFilterArray(tab);
    var title = panel.getTitleSuffix();

    var tb = tab.getDockedItems('toolbar[dock="top"]');
    if(tb)
        tab.remove(tb);
    
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
        xtype: 'ldk-querypanel',
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
        xtype: 'ldk-querypanel',
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
        xtype: 'ldk-querypanel',
        style: 'margin-bottom:20px;',
        queryConfig: config
    });

    EHR.reports.weightGraph(panel, tab);
};

EHR.reports.arrivalDeparture = function(panel, tab){
    var filterArray = panel.getFilterArray(tab);
    var title = panel.getTitleSuffix();

    var config = panel.getQWPConfig({
        title: 'Arrivals' + title,
        schemaName: 'study',
        queryName: 'arrival',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable,
        frame: true
    });

    tab.add({
        xtype: 'ldk-querypanel',
        style: 'margin-bottom:20px;',
        queryConfig: config
    });

    config = panel.getQWPConfig({
        title: 'Departures' + title,
        schemaName: 'study',
        queryName: 'departure',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable,
        frame: true
    });

    tab.add({
        xtype: 'ldk-querypanel',
        style: 'margin-bottom:20px;',
        queryConfig: config
    });
}

EHR.reports.pedigree = function(panel, tab){
    var filterArray = panel.getFilterArray(tab);
    var title = panel.getTitleSuffix();

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
        xtype: 'ldk-querypanel',
        style: 'margin-bottom:20px;',
        queryConfig: configOffspring
    });

    tab.add({
        xtype: 'ldk-querypanel',
        style: 'margin-bottom:20px;',
        queryConfig: configSibling
    });
};

EHR.reports.weightGraph = function(panel, tab){
    var subjects = tab.filters.subjects || [];

    if (subjects.length){
        for (var i=0;i<subjects.length;i++){
            var subject = subjects[i];
            var filterArray = panel.getFilterArray(tab);
            filterArray.nonRemovable.push(LABKEY.Filter.create('Id', subject, LABKEY.Filter.Types.EQUAL));

            LABKEY.Query.selectRows({
                schemaName: 'study',
                queryName: 'weightRelChange',
                filterArray: filterArray.removable.concat(filterArray.nonRemovable),
                columns: 'id,date,weight,LatestWeight,LatestWeightDate,PctChange,IntervalInMonths',
                sort: 'Id,-date',
                requiredVersion: 9.1,
                scope: this,
                failure: LDK.Utils.getErrorCallback(),
                success: Ext4.Function.pass(function(subj, results){
                    tab.add({
                        xtype: 'ldk-graphpanel',
                        style: 'margin-bottom: 30px',
                        title: 'Weight Graph: ' + subj,
                        plotConfig: {
                            results: results,
                            title: 'Weight: ' + subj,
                            height: 400,
                            width: 900,
                            yLabel: 'Weight (kg)',
                            xLabel: 'Date',
                            xField: 'date',
                            grouping: ['Id'],
                            layers: [{
                                y: 'weight',
                                hoverText: function(row){
                                    var lines = [];

                                    lines.push('Date: ' + row.date.format('Y-m-d'));
                                    lines.push('Weight: ' + row.weight + ' kg');
                                    lines.push('Latest Weight: ' + row.LatestWeight + ' kg');
                                    if(row.LatestWeightDate)
                                        lines.push('Latest Weight Date: ' + row.LatestWeightDate.format('Y-m-d'));
                                    if(row.PctChange)
                                        lines.push('% Change From Current: '+row.PctChange + '%');
                                    lines.push('Interval (Months): ' + row.IntervalInMonths);

                                    return lines.join('\n');
                                },
                                name: 'Weight'
                            }]
                        }
                    });
                }, [subject])
            });
        }
    }

    var gridFilterArray = panel.getFilterArray(tab);
    var title = panel.getTitleSuffix();

    var config = panel.getQWPConfig({
        title: 'Weight Summary' + title,
        schemaName: 'study',
        queryName: 'demographicsWeightChange',
        viewName: 'With Id',
        sort: 'id',
        filters: gridFilterArray.nonRemovable,
        removeableFilters: gridFilterArray.removable,
        frame: true
    });

    tab.add({
        xtype: 'ldk-querypanel',
        style: 'margin-bottom:20px;',
        queryConfig: config
    });

    config = panel.getQWPConfig({
        title: 'Weight' + title,
        schemaName: 'study',
        queryName: 'weight',
        viewName: 'Percent Change',
        sort: 'id,-date',
        filters: gridFilterArray.nonRemovable,
        removeableFilters: gridFilterArray.removable,
        frame: true
    });

    tab.add({
        xtype: 'ldk-querypanel',
        style: 'margin-bottom:20px;',
        queryConfig: config
    });
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
        xtype: 'ldk-querypanel',
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
        xtype: 'ldk-querypanel',
        style: 'margin-bottom:20px;',
        queryConfig: config
    });

    config = panel.getQWPConfig({
        schemaName: 'study',
        queryName: 'Chemistry Results',
        viewName: 'Plus Ref Range',
        title: "Reference Ranges:",
        titleField: 'Id',
        sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable
    });

    tab.add({
        xtype: 'ldk-querypanel',
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
        xtype: 'ldk-querypanel',
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
        xtype: 'ldk-querypanel',
        style: 'margin-bottom:20px;',
        queryConfig: config
    });

    config = panel.getQWPConfig({
        schemaName: 'study',
        queryName: 'Urinalysis Results',
        viewName: 'Plus Ref Range',
        title: "Reference Ranges:",
        titleField: 'Id',
        sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable
    });

    tab.add({
        xtype: 'ldk-querypanel',
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
        xtype: 'ldk-querypanel',
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
        xtype: 'ldk-querypanel',
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
        xtype: 'ldk-querypanel',
        style: 'margin-bottom:20px;',
        queryConfig: config
    });
}
