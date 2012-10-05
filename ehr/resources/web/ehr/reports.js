/*
 * Copyright (c) 2010-2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.namespace('EHR.reports');

/*
 * This file contains a series of JS-baed reports used in the Animal History page
 *
 */
EHR.reports.abstract = function(panel, tab, subject){
    var filterArray = panel.getFilterArray(tab, subject);
    var title = (subject ? subject.join("; ") : '');
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
        title: 'Other Notes' + ": " + title,
        frame: true,
        schemaName: 'study',
        queryName: 'notes',
        sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable
    });

    tab.add({
        xtype: 'ldk-querypanel',
        style: 'padding-bottom:20px;',
        queryConfig: config
    });

    config = panel.getQWPConfig({
        title: 'Active Assignments' + ": " + title,
        frame: true,
        schemaName: 'study',
        queryName: 'ActiveAssignments',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable
    });

    tab.add({
        xtype: 'ldk-querypanel',
        style: 'padding-bottom:20px;',
        queryConfig: config
    });

    config = panel.getQWPConfig({
        title: 'Problem List' + ": " + title,
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
        style: 'padding-bottom:20px;',
        queryConfig: config
    });

    EHR.reports.weightGraph(panel, tab, subject);
};

EHR.reports.arrivalDeparture = function(panel, tab, subject){
    var filterArray = panel.getFilterArray(tab, subject);
    var title = (subject ? subject.join("; ") : '');

    var config = panel.getQWPConfig({
        title: 'Arrivals' + ": " + title,
        schemaName: 'study',
        queryName: 'arrival',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable,
        frame: true
    });

    tab.add({
        xtype: 'ldk-querypanel',
        style: 'padding-bottom:20px;',
        queryConfig: config
    });

    config = panel.getQWPConfig({
        title: 'Departures' + ": " + title,
        schemaName: 'study',
        queryName: 'departure',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable,
        frame: true
    });

    tab.add({
        xtype: 'ldk-querypanel',
        style: 'padding-bottom:20px;',
        queryConfig: config
    });
}

EHR.reports.diagnostics = function(panel, tab, subject){
    var filterArray = panel.getFilterArray(tab, subject);
    var title = (subject ? subject.join("; ") : '');
    tab.getTopToolbar().removeAll();

    var config = panel.getQWPConfig({
        title: 'Bacteriology',
        frame: true,
        schemaName: 'study',
        queryName: 'Bacteriology Results',
        sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable
    });

    tab.add({
        xtype: 'ldk-querypanel',
        style: 'padding-bottom:20px;',
        queryConfig: config
    });

    config = panel.getQWPConfig({
        title: 'Chemistry',
        frame: true,
        schemaName: 'study',
        queryName: 'chemPivot',
        sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable
    });

    tab.add({
        xtype: 'ldk-querypanel',
        style: 'padding-bottom:20px;',
        queryConfig: config
    });

    config = panel.getQWPConfig({
        schemaName: 'study',
        queryName: 'chemMisc',
        title: "Misc Chemistry Tests:",
        titleField: 'Id',
        sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable
    });

    tab.add({
        xtype: 'ldk-querypanel',
        style: 'padding-bottom:20px;',
        queryConfig: config
    });

    config = panel.getQWPConfig({
        title: 'Hematology',
        frame: true,
        schemaName: 'study',
        allowChooseView: true,
        queryName: 'hematologyPivot',
        sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable
    });

    tab.add({
        xtype: 'ldk-querypanel',
        style: 'padding-bottom:20px;',
        queryConfig: config
    });

    config = panel.getQWPConfig({
        schemaName: 'study',
        queryName: 'hematologyMisc',
        title: "Misc Hematology Tests:",
        titleField: 'Id',
        sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable
    });

    tab.add({
        xtype: 'ldk-querypanel',
        style: 'padding-bottom:20px;',
        queryConfig: config
    });

    config = panel.getQWPConfig({
        schemaName: 'study',
        queryName: 'Hematology Morphology',
        title: "Hematology Morphology:",
        titleField: 'Id',
        sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable
    });

    tab.add({
        xtype: 'ldk-querypanel',
        style: 'padding-bottom:20px;',
        queryConfig: config
    });

    config = panel.getQWPConfig({
        schemaName: 'study',
        queryName: 'immunologyPivot',
        title: "Immunology",
        sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable
    });

    tab.add({
        xtype: 'ldk-querypanel',
        style: 'padding-bottom:20px;',
        queryConfig: config
    });

    config = panel.getQWPConfig({
        schemaName: 'study',
        queryName: 'Parasitology Results',
        title: "Parasitology",
        sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable
    });

    tab.add({
        xtype: 'ldk-querypanel',
        style: 'padding-bottom:20px;',
        queryConfig: config
    });

    config = panel.getQWPConfig({
        schemaName: 'study',
        queryName: 'urinalysisPivot',
        title: "Urinalysis",
        sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable
    });

    tab.add({
        xtype: 'ldk-querypanel',
        style: 'padding-bottom:20px;',
        queryConfig: config
    });

    config = panel.getQWPConfig({
        schemaName: 'study',
        queryName: 'Virology Results',
        title: "Virology",
        sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable
    });

    tab.add({
        xtype: 'ldk-querypanel',
        style: 'padding-bottom:20px;',
        queryConfig: config
    });
}

EHR.reports.pedigree = function(panel, tab, subject){
    var filterArray = panel.getFilterArray(tab, subject);
    var title = (subject ? subject.join("; ") : '');

//    var target = tab.add({tag: 'span', style: 'padding-bottom: 20px'});
//    tab.doLayout();
//
//    tab.add({
//        xtype: '',
//        schemaName: 'study',
//        queryName: 'demographicsFamily',
//        title: "Parents/Grandparents",
//        titleField: 'Id',
//        renderTo: target.id,
//        filterArray: filterArray.removable.concat(filterArray.nonRemovable),
//        multiToGrid: true
//    });

    var configOffspring = panel.getQWPConfig({
        title: 'Offspring' + ": " + title,
        schemaName: 'study',
        queryName: 'demographicsOffspring',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable,
        frame: true
    });

    var configSibling = panel.getQWPConfig({
        title: 'Siblings' + ": " + title,
        schemaName: 'study',
        queryName: 'demographicsSiblings',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable,
        frame: true
    });

    tab.add({
        xtype: 'ldk-querypanel',
        style: 'padding-bottom:20px;',
        queryConfig: configOffspring
    });

    tab.add({
        xtype: 'ldk-querypanel',
        style: 'padding-bottom:20px;',
        queryConfig: configSibling
    });
}

EHR.reports.weightGraph = function(panel, tab, subjects){
    subjects = subjects || [];

    for (var i=0;i<subjects.length;i++){
        var subject = subjects[i];
        var filterArray = panel.getFilterArray(tab, [subject]);
        var title = subject || '';

        LABKEY.Query.selectRows({
            schemaName: 'study',
            queryName: 'weightRelChange',
            filterArray: filterArray.removable.concat(filterArray.nonRemovable),
            columns: 'id,date,weight,LatestWeight,LatestWeightDate,PctChange,IntervalInMonths',
            sort: 'Id,-date',
            requiredVersion: 9.1,
            scope: this,
            failure: LDK.Utils.getErrorCallback({logToServer: true}),
            success: onSuccess
        });

        function onSuccess(results){
            tab.add({
                xtype: 'ldk-graphpanel',
                title: 'Weight: ' + subject,
                height: 500,
                width: 900,
                plotConfig: {
                    results: results,
                    metadata: results.metaData,
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
                    }],
                    yLabel: 'Weight (kg)',
                    xLabel: 'Date',
                    title: 'Weight: ' + subject,
                    xField: 'date'
                }
            });
        }
    }

    var filterArray = panel.getFilterArray(tab, subjects);
    var title = (subjects ? subjects.join("; ") : '');

    var config = panel.getQWPConfig({
        title: 'Weight Summary' + ": " + title,
        schemaName: 'study',
        queryName: 'demographicsWeightChange',
        viewName: 'With Id',
        sort: 'id',
        //columns: 'Id,wdate,MostRecentWeight,MinLast30,MaxLast30,MaxChange30,MinLast90,MaxLast90,MaxChange90,MinLast120,MaxLast120,MaxChange120',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable,
        frame: true
    });

    tab.add({
        xtype: 'ldk-querypanel',
        style: 'padding-bottom:20px;',
        queryConfig: config
    });

    title = (subjects ? subjects.join("; ") : '');
    config = panel.getQWPConfig({
        title: 'Weight' + ": " + title,
        schemaName: 'study',
        queryName: 'weight',
        viewName: 'Percent Change',
        sort: 'id,-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable,
        frame: true
    });

    tab.add({
        xtype: 'ldk-querypanel',
        style: 'padding-bottom:20px;',
        queryConfig: config
    });
};

EHR.reports.bloodChemistry = function(panel, tab, subject){
    var filterArray = panel.getFilterArray(tab, subject);
    var title = (subject ? subject.join("; ") : '');

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
        style: 'padding-bottom:20px;',
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
        style: 'padding-bottom:20px;',
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
        style: 'padding-bottom:20px;',
        queryConfig: config
    });
}

EHR.reports.hematology = function(panel, tab, subject){
    var filterArray = panel.getFilterArray(tab, subject);
    var title = (subject ? subject.join("; ") : '');

    var config = panel.getQWPConfig({
        schemaName: 'study',
        queryName: 'hematologyPivot',
        title: "By Panel:",
        titleField: 'Id',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable,
        sort: '-date'
    });

    tab.add({
        xtype: 'ldk-querypanel',
        style: 'padding-bottom:20px;',
        queryConfig: config
    });

    config = panel.getQWPConfig({
        schemaName: 'study',
        queryName: 'hematologyMisc',
        title: "Misc Tests:",
        titleField: 'Id',
        sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable
    });

    tab.add({
        xtype: 'ldk-querypanel',
        style: 'padding-bottom:20px;',
        queryConfig: config
    });

    config = panel.getQWPConfig({
        schemaName: 'study',
        queryName: 'Hematology Morphology',
        title: "Morphology:",
        titleField: 'Id',
        sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable
    });

    tab.add({
        xtype: 'ldk-querypanel',
        style: 'padding-bottom:20px;',
        queryConfig: config
    });

    config = panel.getQWPConfig({
        schemaName: 'study',
        queryName: 'Hematology Results',
        viewName: 'Plus Ref Range',
        title: "Reference Ranges:",
        titleField: 'Id',
        sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable
    });

    tab.add({
        xtype: 'ldk-querypanel',
        style: 'padding-bottom:20px;',
        queryConfig: config
    });
}

EHR.reports.immunology = function(panel, tab, subject){
    var filterArray = panel.getFilterArray(tab, subject);
    var title = (subject ? subject.join("; ") : '');

    var config = panel.getQWPConfig({
        schemaName: 'study',
        queryName: 'immunologyPivot',
        title: "By Panel:",
        titleField: 'Id',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable
    });

    tab.add({
        xtype: 'ldk-querypanel',
        style: 'padding-bottom:20px;',
        queryConfig: config
    });

    config = panel.getQWPConfig({
        schemaName: 'study',
        queryName: 'immunologyMisc',
        title: "Immunology Misc:",
        titleField: 'Id',
        sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable
    });

    tab.add({
        xtype: 'ldk-querypanel',
        style: 'padding-bottom:20px;',
        queryConfig: config
    });

    config = panel.getQWPConfig({
        schemaName: 'study',
        queryName: 'Immunology Results',
        viewName: 'Plus Ref Range',
        title: "Reference Ranges:",
        titleField: 'Id',
        sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable
    });

    tab.add({
        xtype: 'ldk-querypanel',
        style: 'padding-bottom:20px;',
        queryConfig: config
    });
};

EHR.reports.viralLoads = function(panel, tab, subject){
    subject = subject || [];

    for (var i=0;i<subject.length;i++){
        var filterArray = panel.getFilterArray(tab, [subject[i]]);
        var title = (subject[i] || '');

        var store = new LABKEY.ext.Store({
            schemaName: 'study',
            queryName: 'ViralLoads',
            filterArray: filterArray.removable.concat(filterArray.nonRemovable),
            columns: 'Id,date,LogVL',
            sort: 'Id,-date',
            autoLoad: true
        });

//        tab.chart = new Ext4.chart.LineChart({
//            xtype: 'linechart',
//            height: 300,
//            width: 600,
//            store: store,
//            // The two following is not documented, but it's central for the linechart.
//            xField: "date",
//            yField: "LogVL",
//            xAxis: new Ext4.chart.TimeAxis({
//                orientation: 'vertical',
//                title: 'Date',
//                labelRenderer: function(date) { return date.format("Y-m-d"); }
//            }),
//            yAxis: new Ext4.chart.NumericAxis({
//                title: 'Log Copies/mL'
//            }),
//            listeners: {
//                scope: this,
//                itemmouseover: function(o) {
//                    //var myGrid = Ext4.getCmp('myGrid');
//                    //myGrid.selModel.selectRow(o.index);
//                },
//                itemclick: function(o){
//                    var rec = o.item;
//                }
//            }
//        });
//
//        tab.add(new Ext4.Panel({
//            title: 'Viral Loads: ' + title,
//            autoScroll: true,
//            autoHeight: true,
//            //frame: true,
//            style: 'border:5px',
//            //border: true,
//            //layout: 'fit',
//            items: [{
//                layout: 'hbox',
//                items: [
//                    tab.chart
//                ]}
//            ]}
//        ));
    }

    var filterArray = panel.getFilterArray(tab, subject);
    var title = (subject.join(', ') || '');
    var config = panel.getQWPConfig({
        title: 'Viral Load' + ": " + title,
        schemaName: 'study',
        queryName: 'ViralLoadsWpi',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable,
        sort: 'id,-date',
        frame: true
    });

    tab.add({
        xtype: 'ldk-querypanel',
        style: 'padding-bottom:20px;',
        queryConfig: config
    });
}

EHR.reports.irregularObs = function(panel, tab, subject){
    var filterArray = panel.getFilterArray(tab, subject);

    var title = (subject ? subject.join("; ") : '');
    //this.addHeader(tab);

    var queryName;
    if(tab.filters._inputType == 'renderRoomCage' || tab.filters._inputType == 'renderColony'){
        queryName = 'irregularObsByLocation';
    }
    else {
        queryName = 'irregularObsById';
    }

    var config = panel.getQWPConfig({
        schemaName: 'study',
        queryName: queryName,
        title: "Irregular Observations: "+title,
        sort: 'room,cage,-date',
        titleField: 'Id',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable
    });

    if(tab.rowData.get('viewname'))
        config.viewName = tab.rowData.get('viewname');

    tab.add({
        xtype: 'ldk-querypanel',
        style: 'padding-bottom:20px;',
        queryConfig: config
    });
}

EHR.reports.irregularObsTreatment = function(panel, tab, subject){
    var filterArray = panel.getFilterArray(tab, subject);

    var title = (subject ? subject.join("; ") : '');
    //this.addHeader(tab);

    var queryName;
    if(tab.filters._inputType == 'renderRoomCage' || tab.filters._inputType == 'renderColony'){
        queryName = 'irregularObsTreatmentByLocation';
    }
    else {
        queryName = 'irregularObsTreatmentById';
    }

    var config = panel.getQWPConfig({
        schemaName: 'study',
        queryName: queryName,
        title: "Obs/Treatments: "+title,
        titleField: 'Id',
        sort: 'room,cage,-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable
    });

    tab.add({
        xtype: 'ldk-querypanel',
        style: 'padding-bottom:20px;',
        queryConfig: config
    });
}

EHR.reports.urinalysisResults = function(panel, tab, subject){

    var filterArray = panel.getFilterArray(tab, subject);
    var title = (subject ? subject.join("; ") : '');
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
        style: 'padding-bottom:20px;',
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
        style: 'padding-bottom:20px;',
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
        style: 'padding-bottom:20px;',
        queryConfig: config
    });
}

EHR.reports.treatmentSchedule = function(panel, tab, subject){
    var filterArray = panel.getFilterArray(tab, subject);
    var title = (subject ? subject.join("; ") : '');

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
        style: 'padding-bottom:20px;',
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
        style: 'padding-bottom:20px;',
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
        style: 'padding-bottom:20px;',
        queryConfig: config
    });
}
