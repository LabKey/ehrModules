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

    tab.add({
        xtype: 'ldk-querypanel',
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
        xtype: 'ldk-querypanel',
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
        for (var i=0;i<subjects.length;i++){
            var subject = subjects[i];
            toAdd.push(EHR.reports.renderWeightData(panel, tab, subject));
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
            style: 'padding-bottom: 20px;',
            border: false,
            defaults: {
                border: false
            },
            items: [{
                html: '<b>Weight Summary:</b>'
            },{
                html: '<hr>'
            },{
                itemId: 'summaryArea',
                border: false,
                defaults: {
                    border: false
                }
            }]
        },{
            html: 'Loading...',
            itemId: 'tabArea',
            border: false
        }],
        listeners: {
            single: true,
            scope: this,
            render: function(targetPanel){
                var filterArray = [LABKEY.Filter.create('Id', subject, LABKEY.Filter.Types.EQUAL)];

                //first summary
                LABKEY.Query.selectRows({
                    schemaName: 'study',
                    queryName: 'demographicsWeightChange',
                    columns: 'id,date,MostRecentWeightDate,MostRecentWeight,DaysSinceWeight,MinLast30,MaxLast30,MaxChange30,AvgLast30,Weights30,MinLast90,MaxLast90,AvgLast90,MaxChange90,Weights90,MinLast180,MaxLast180,AvgLast180,MaxChange180,Weights180',
                    requiredVersion: 9.1,
                    filterArray: filterArray,
                    failure: LDK.Utils.getErrorCallback(),
                    scope: this,
                    success: function(results){
                        var target = targetPanel.down('#summaryArea');
                        target.removeAll();

                        if (results.rows && results.rows.length){
                            var row = results.rows[0];

                            var dateVal = '';
                            if (!Ext4.isEmpty(row.MostRecentWeightDate)){
                                dateVal = row.MostRecentWeightDate.displayValue || row.MostRecentWeightDate.value;
                                if (!Ext4.isEmpty(row.DaysSinceWeight)){
                                    dateVal += ' (' + (row.DaysSinceWeight.displayValue || row.DaysSinceWeight.value) + ' days ago)'
                                }
                            }

                            function safeAppendNumber(row, prop, suffix){
                                if (row[prop] && Ext4.isEmpty(row[prop].value))
                                    return '';

                                return Ext4.util.Format.round(row[prop].value, 2) + (suffix ? ' ' + suffix : '');
                            }

                            target.add([{
                                defaults: {
                                    border: false,
                                    style: 'padding: 3px;'
                                },
                                layout: {
                                    type: 'table',
                                    columns: 2
                                },
                                items: [{
                                    html: 'Last Weight:'
                                },{
                                    html: (row.MostRecentWeight.value ? row.MostRecentWeight.value + ' kg' : 'no record')
                                },{
                                    html: 'Date:'
                                },{
                                    html: dateVal
                                }]
                            },{
                                border: false,
                                style: 'padding-top: 20px',
                                defaults: {
                                    border: false,
                                    style: 'padding: 3px;'
                                },
                                layout: {
                                    type: 'table',
                                    columns: 6
                                },
                                items: [{
                                    html: ''
                                },{
                                    html: '# Weights'
                                },{
                                    html: 'Avg Weight'
                                },{
                                    html: 'Min Weight'
                                },{
                                    html: 'Max Weight'
                                },{
                                    html: 'Max Pct Change'
                                },{
                                    html: 'Previous 30 Days:'
                                },{
                                    html: safeAppendNumber(row, 'Weights30')
                                },{
                                    html: safeAppendNumber(row, 'AvgLast30', ' kg')
                                },{
                                    html: safeAppendNumber(row, 'MinLast30', ' kg')
                                },{
                                    html: safeAppendNumber(row, 'MaxLast30', ' kg')
                                },{
                                    html: safeAppendNumber(row, 'MaxChange30', '%')
                                },{
                                    html: 'Previous 90 Days:'
                                },{
                                    html: safeAppendNumber(row, 'Weights90')
                                },{
                                    html: safeAppendNumber(row, 'AvgLast90', ' kg')
                                },{
                                    html: safeAppendNumber(row, 'MinLast90', ' kg')
                                },{
                                    html: safeAppendNumber(row, 'MaxLast90', ' kg')
                                },{
                                    html: safeAppendNumber(row, 'MaxChange90', '%')
                                },{
                                    html: 'Previous 180 Days:'
                                },{
                                    html: safeAppendNumber(row, 'Weights180')
                                },{
                                    html: safeAppendNumber(row, 'AvgLast180', ' kg')
                                },{
                                    html: safeAppendNumber(row, 'MinLast180', ' kg')
                                },{
                                    html: safeAppendNumber(row, 'MaxLast180', ' kg')
                                },{
                                    html: safeAppendNumber(row, 'MaxChange180', '%')
                                }]
                            }]);
                        }
                        else {
                            target.add({
                                html: 'There are no weight records within the past 90 days'
                            });
                        }
                    }
                });

                //then raw data
                LABKEY.Query.selectRows({
                    schemaName: 'study',
                    queryName: 'weightRelChange',
                    filterArray: filterArray,
                    columns: 'id,date,weight,LatestWeight,LatestWeightDate,PctChange,IntervalInMonths',
                    sort: 'Id,-date',
                    requiredVersion: 9.1,
                    scope: this,
                    failure: LDK.Utils.getErrorCallback(),
                    success: Ext4.Function.pass(function(subj, results){
                        var target = targetPanel.down('#tabArea');
                        target.removeAll();
                        target.add({
                            xtype: 'tabpanel',
                            style: 'margin-bottom: 20px',
                            items: [{
                                xtype: 'ldk-graphpanel',
                                title: 'Graph',
                                style: 'margin-bottom: 30px',
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
                            },{
                                xtype: 'ldk-querypanel',
                                title: 'Raw Data',
                                style: 'margin: 5px;',
                                queryConfig: panel.getQWPConfig({
                                    frame: 'none',
                                    schemaName: 'study',
                                    queryName: 'weight',
                                    viewName: 'Percent Change',
                                    sort: 'id,-date',
                                    filterArray: filterArray
                                })
                            }]
                        });
                    }, [subject])
                });
            }
        }
    }
}

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
        queryName: 'chemistryRefRange',
        //viewName: 'Plus Ref Range',
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
        queryName: 'urinalysisRefRange',
        //viewName: 'Plus Ref Range',
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
