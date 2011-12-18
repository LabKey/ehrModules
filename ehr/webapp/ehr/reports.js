/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.namespace('EHR.reports');

LABKEY.requiresScript("/ehr/ehrDetailsPanel.js");
LABKEY.requiresScript("/ehr/Utils.js");
/*
 * This file contains a series of JS-baed reports used in the Animal History page
 *
 */

//a standardized config object used in QWPs
EHR.reports.qwpConfig = {
    allowChooseQuery: false,
    allowChooseView: true,
    showInsertNewButton: false,
    showDeleteButton: false,
    showDetailsColumn: true,
    showUpdateColumn: false,
    showRecordSelectors: true,
    showReports: false,
    frame: 'portal',
    linkTarget: '_blank',
    buttonBarPosition: 'top',
    timeout: 0,
    success: function(dr){
        var width1 = Ext.get('dataregion_'+dr.id).getSize().width+50;
        var width2 = Ext.get(this.anchorLayout.id).getSize().width;

        if(width1 > width2){
            this.anchorLayout.setWidth(width1+140);
            console.log('resizing')
        }
        else {
            this.anchorLayout.setWidth('100%');
        }
    },
    failure: function(error){
        console.log('Error callback called');
        EHR.utils.onError(error)
    }
};

EHR.reports.abstract = function(tab, subject){
    var filterArray = this.getFilterArray(tab, subject);
    var title = (subject ? subject.join("; ") : '');
    tab.getTopToolbar().removeAll();
    
    var target = tab.add({tag: 'div', html: '', style: 'padding-bottom: 10px'});
    tab.doLayout();

    var config = {
        schemaName: 'study',
        queryName: 'demographics',
        viewName: 'Abstract',
        title: "Abstract",
        titleField: 'Id',
        renderTo: target.id,
        filterArray: filterArray.removable.concat(filterArray.nonRemovable),
        multiToGrid: true,
        qwpConfig: {
            scope: this,
            success: function(dr){
                var width1 = Ext.get('dataregion_'+dr.id).getSize().width+50;
                var width2 = Ext.get(this.anchorLayout.id).getSize().width;

                if(width1 > width2){
                    this.anchorLayout.setWidth(width1+140);
                    console.log('resizing')
                }
                else {
                    this.anchorLayout.setWidth('100%');
                }
            }
        }
    };
    new EHR.ext.DetailsView(config);

    target = tab.add({tag: 'div', style: 'padding-bottom: 20px'});
    tab.doLayout();
    config = Ext.applyIf({
        title: 'Other Notes' + ": " + title,
        frame: true,
        schemaName: 'study',
        queryName: 'notes',
        sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable,
        scope: this
    }, EHR.reports.qwpConfig);
    new LABKEY.QueryWebPart(config).render(target.id);

    target = tab.add({tag: 'div', style: 'padding-bottom: 20px'});
    tab.doLayout();
    var config = Ext.applyIf({
        title: 'Active Assignments' + ": " + title,
        frame: true,
        schemaName: 'study',
        queryName: 'ActiveAssignments',
        //viewName: 'Active Assignments',
        //sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable,
        scope: this
    }, EHR.reports.qwpConfig);
    new LABKEY.QueryWebPart(config).render(target.id);

    target = tab.add({tag: 'div', style: 'padding-bottom: 20px'});
    tab.doLayout();
    var config = Ext.applyIf({
        title: 'Problem List' + ": " + title,
        frame: true,
        schemaName: 'study',
        allowChooseView: true,
        queryName: 'Problem List',
        //sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable,
        scope: this
    }, EHR.reports.qwpConfig);

    new LABKEY.QueryWebPart(config).render(target.id);

    EHR.reports.weightGraph.call(this, tab, subject);
       
};

EHR.reports.arrivalDeparture = function(tab, subject){
    var filterArray = this.getFilterArray(tab, subject);
    var title = (subject ? subject.join("; ") : '');

    var target = tab.add({tag: 'span', style: 'padding-bottom: 20px'});
    tab.doLayout();
    var config = Ext.applyIf({
        title: 'Arrivals' + ": " + title,
        schemaName: 'study',
        queryName: 'arrival',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable,
        scope: this,
        frame: true
    }, EHR.reports.qwpConfig);

    new LABKEY.QueryWebPart(config).render(target.id);

    target = tab.add({tag: 'span', style: 'padding-bottom: 20px'});
    tab.doLayout();
    var config = Ext.applyIf({
        title: 'Departures' + ": " + title,
        schemaName: 'study',
        queryName: 'departure',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable,
        scope: this,
        frame: true
    }, EHR.reports.qwpConfig);

    new LABKEY.QueryWebPart(config).render(target.id);

}

EHR.reports.diagnostics = function(tab, subject){
    var filterArray = this.getFilterArray(tab, subject);
    var title = (subject ? subject.join("; ") : '');
    tab.getTopToolbar().removeAll();

    var target = tab.add({tag: 'div', style: 'padding-bottom: 20px'});
    tab.doLayout();
    var config = Ext.applyIf({
        title: 'Bacteriology',
        frame: true,
        schemaName: 'study',
        queryName: 'Bacteriology Results',
        sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable,
        scope: this
    }, EHR.reports.qwpConfig);
    new LABKEY.QueryWebPart(config).render(target.id);

    target = tab.add({tag: 'div', style: 'padding-bottom: 20px'});
    tab.doLayout();
    config = Ext.applyIf({
        title: 'Chemistry',
        frame: true,
        schemaName: 'study',
        queryName: 'chemPivot',
        sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable,
        scope: this
    }, EHR.reports.qwpConfig);
    new LABKEY.QueryWebPart(config).render(target.id);

    target = tab.add({tag: 'div', style: 'padding-bottom: 20px'});
    tab.doLayout();
    config = Ext.applyIf({
        schemaName: 'study',
        queryName: 'chemMisc',
        title: "Misc Chemistry Tests:",
        titleField: 'Id',
        sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable,
        scope: this
    }, EHR.reports.qwpConfig);
    new LABKEY.QueryWebPart(config).render(target.id);

    target = tab.add({tag: 'div', style: 'padding-bottom: 20px'});
    tab.doLayout();
    var config = Ext.applyIf({
        title: 'Hematology',
        frame: true,
        schemaName: 'study',
        allowChooseView: true,
        queryName: 'hematologyPivot',
        sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable,
        scope: this
    }, EHR.reports.qwpConfig);

    new LABKEY.QueryWebPart(config).render(target.id);

    target = tab.add({tag: 'span', style: 'padding-bottom: 20px'});
    tab.doLayout();

    config = Ext.applyIf({
        schemaName: 'study',
        queryName: 'hematologyMisc',
        title: "Misc Hematology Tests:",
        titleField: 'Id',
        sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable,
        scope: this
    }, EHR.reports.qwpConfig);
    new LABKEY.QueryWebPart(config).render(target.id);

    target = tab.add({tag: 'span', style: 'padding-bottom: 20px'});
    tab.doLayout();

    config = Ext.applyIf({
        schemaName: 'study',
        queryName: 'Hematology Morphology',
        title: "Hematology Morphology:",
        titleField: 'Id',
        sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable,
        scope: this
    }, EHR.reports.qwpConfig);
    new LABKEY.QueryWebPart(config).render(target.id);

    target = tab.add({tag: 'span', style: 'padding-bottom: 20px'});
    tab.doLayout();

    config = Ext.applyIf({
        schemaName: 'study',
        queryName: 'immunologyPivot',
        title: "Immunology",
        sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable,
        scope: this
    }, EHR.reports.qwpConfig);
    new LABKEY.QueryWebPart(config).render(target.id);

    target = tab.add({tag: 'span', style: 'padding-bottom: 20px'});
    tab.doLayout();

    config = Ext.applyIf({
        schemaName: 'study',
        queryName: 'Parasitology Results',
        title: "Parasitology",
        sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable,
        scope: this
    }, EHR.reports.qwpConfig);
    new LABKEY.QueryWebPart(config).render(target.id);

    target = tab.add({tag: 'span', style: 'padding-bottom: 20px'});
    tab.doLayout();

    config = Ext.applyIf({
        schemaName: 'study',
        queryName: 'urinalysisPivot',
        title: "Urinalysis",
        sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable,
        scope: this
    }, EHR.reports.qwpConfig);
    new LABKEY.QueryWebPart(config).render(target.id);

    target = tab.add({tag: 'span', style: 'padding-bottom: 20px'});
    tab.doLayout();

    config = Ext.applyIf({
        schemaName: 'study',
        queryName: 'Virology Results',
        title: "Virology",
        sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable,
        scope: this
    }, EHR.reports.qwpConfig);
    new LABKEY.QueryWebPart(config).render(target.id);

}

EHR.reports.pedigree = function(tab, subject){
    var filterArray = this.getFilterArray(tab, subject);
    var title = (subject ? subject.join("; ") : '');

    var target = tab.add({tag: 'span', style: 'padding-bottom: 20px'});
    tab.doLayout();    
    var config = {
        schemaName: 'study',
        queryName: 'demographicsFamily',
        title: "Parents/Grandparents",
        titleField: 'Id',
        renderTo: target.id,
        filterArray: filterArray.removable.concat(filterArray.nonRemovable),
        multiToGrid: true
    };
    new EHR.ext.DetailsView(config);

    target = tab.add({tag: 'span', style: 'padding-bottom: 20px'});
    tab.doLayout();
    config = Ext.applyIf({
        title: 'Offspring' + ": " + title,
        schemaName: 'study',
        queryName: 'demographicsOffspring',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable,
        scope: this,
        frame: true
    }, EHR.reports.qwpConfig);

    new LABKEY.QueryWebPart(config).render(target.id);

    target = tab.add({tag: 'span', style: 'padding-bottom: 20px'});
    tab.doLayout();
    config = Ext.applyIf({
        title: 'Siblings' + ": " + title,
        schemaName: 'study',
        queryName: 'demographicsSiblings',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable,
        scope: this,
        frame: true
    }, EHR.reports.qwpConfig);

    new LABKEY.QueryWebPart(config).render(target.id);


}

EHR.reports.weightGraph = function(tab, subject){
    subject = subject || [];

    for (var i=0;i<subject.length;i++){
        var filterArray = this.getFilterArray(tab, [subject[i]]);
        var title = (subject[i] || '');

        var store = new LABKEY.ext.Store({
            schemaName: 'study',
            queryName: 'weightRelChange',
            filterArray: filterArray.removable.concat(filterArray.nonRemovable),
            columns: 'id,date,weight,LatestWeight,LatestWeightDate,PctChange,IntervalInMonths',
            sort: 'Id,-date',
            autoLoad: true
        });

        tab.chart = new Ext.chart.LineChart({
            xtype: 'linechart',
            height: 300,
            width: 900,
            //style: 'margins: 100px;',
            //extraStyle: 'margins:100px;',
            store: store,
            // The two following is not documented, but it's central for the linechart.
            xField: "date",
            yField: "weight",
            xAxis: new Ext.chart.TimeAxis({
                orientation: 'vertical',
                title: 'Date',
                labelRenderer: function(date) {
                    return date.format("Y-m-d");
                }
            }),
            yAxis: new Ext.chart.NumericAxis({
                title: 'Weight (kg)'
            }),
            tipRenderer: function(chart, rec, axis){
                var lines = [];

                lines.push('Date: '+rec.get('date').format('Y-m-d'));
                lines.push('Weight: '+rec.get('weight')+' kg');
                lines.push('Current Weight: '+rec.get('LatestWeight')+' kg');
                if(rec.get('PctChange'))
                    lines.push('Percent Change: '+rec.get('PctChange')+'%');
                lines.push('Interval (Months): '+rec.get('IntervalInMonths'));

                return lines.join('\n');
            },
            listeners: {
//                itemmouseover: function(o) {
//
//                },
                itemclick: function(o){
                    var data = o.item;

                    var lines = [];
                    lines.push('Date: '+data['date'].format('Y-m-d'));
                    lines.push('Weight: '+data.weight);
                    lines.push('Current Weight: '+data.LatestWeight+' kg');
                    if(data['PctChange'])
                        lines.push('Percent Change: '+data.PctChange+'%');
                    lines.push('Interval (Months): '+data.IntervalInMonths);

                    var qtip = new Ext.ToolTip({
                        html: lines.join('\n')
                    });
                    qtip.show();
                }
            }
        });

        tab.add(new Ext.Panel({
            title: 'Weight: ' + title,
            autoScroll: true,
            autoHeight: true,
            //frame: true,
            style: 'border:5px',
            ref: 'weightPanel',
            //border: true,
            //layout: 'fit',
            items: [{
                layout: 'hbox',
                items: [
                    tab.chart
                ,{
                    xtype: 'form',
                    style: 'padding:10px;',
                    width: 220,
                    //buttonAlign: 'left',
                    items: [{
                        xtype: 'datefield',
                        fieldLabel: 'Min Date',
                        ref: 'minDate'
                    },{
                        xtype: 'datefield',
                        fieldLabel: 'Max Date',
                        ref: 'maxDate'
                    }],
                    buttons: [{
                        xtype: 'button',
                        text: 'Refresh',
                        handler: function(o){
                            var min = o.ownerCt.ownerCt.minDate.getValue();
                            var max = o.ownerCt.ownerCt.maxDate.getValue();
                            var store = o.ownerCt.ownerCt.ownerCt.ownerCt.ownerCt.chart.store;
                            if(min)
                                store.baseParams['query.date~dategte'] = min.format('Y-m-d');
                            else
                                delete store.baseParams['query.date~dategte'];

                            if(max)
                                store.baseParams['query.date~datelte'] = max.format('Y-m-d');
                            else
                                delete store.baseParams['query.date~datelte'];

                            store.reload();
                        }
                    }]
    //                ,
    //                tab.grid
                    }]
                }]
            }
        ));
    }

    var target = tab.add({tag: 'span', style: 'padding-bottom: 20px'});
    var target2 = tab.add({tag: 'span', style: 'padding-bottom: 20px'});
    tab.doLayout();

    var filterArray = this.getFilterArray(tab, subject);
    var title = (subject ? subject.join("; ") : '');

    var config = Ext.applyIf({
        title: 'Weight Summary' + ": " + title,
        schemaName: 'study',
        queryName: 'demographicsWeightChange',
        viewName: 'With Id',
        sort: 'id',
        //columns: 'Id,wdate,MostRecentWeight,MinLast30,MaxLast30,MaxChange30,MinLast90,MaxLast90,MaxChange90,MinLast120,MaxLast120,MaxChange120',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable,
        scope: this,
        frame: true
    }, EHR.reports.qwpConfig);
    new LABKEY.QueryWebPart(config).render(target.id);

    title = (subject ? subject.join("; ") : '');
    config = Ext.applyIf({
        title: 'Weight' + ": " + title,
        schemaName: 'study',
        queryName: 'weight',
        viewName: 'Percent Change',
        sort: 'id,-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable,
        scope: this,
        frame: true
    }, EHR.reports.qwpConfig);

    new LABKEY.QueryWebPart(config).render(target2.id);
};

EHR.reports.bloodChemistry = function(tab, subject){

    var filterArray = this.getFilterArray(tab, subject);
    var title = (subject ? subject.join("; ") : '');

//    tab.queryName = tab.queryName || 'chemPivot';
//    this.addHeader(tab, [{
//        html: 'Choose Report:',
//        style: 'padding-left:10px'
//        },{
//        xtype: 'combo',
//        store: new Ext.data.ArrayStore({
//            fields: ['name', 'value'],
//            data: [['Panel','chemPivot;'], ['Ref Range','Chemistry Results;Plus Ref Range']]
//        }),
//        fieldName: 'Test',
//        mode: 'local',
//        displayField: 'name',
//        valueField: 'value',
//        forceSelection:false,
//        //typeAhead: true,
//        triggerAction: 'all',
//        value: tab.query,
//        ref: '../reportSelector',
//        listeners: {
//            scope: this,
//            select: function(c){
//                var val = c.getValue().split(';');
//                c.refOwner.queryName = val[0];
//                c.refOwner.viewName = val[1];
//                c.refOwner.filters = [];
//                this.loadTab(c.refOwner);
//            }
//        }
//    }]);

    var target = tab.add({tag: 'span', style: 'padding-bottom: 20px'});
    tab.doLayout();

    var config = Ext.applyIf({
        schemaName: 'study',
        queryName: 'chemPivot',
        //viewName: tab.viewName,
        title: "By Panel:",
        titleField: 'Id',
        sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable,
        scope: this
    }, EHR.reports.qwpConfig);
    new LABKEY.QueryWebPart(config).render(target.id);

//    if(tab.queryName == 'chemPivot'){
        target = tab.add({tag: 'span', style: 'padding-bottom: 20px'});
        tab.doLayout();

        config = Ext.applyIf({
            schemaName: 'study',
            queryName: 'chemMisc',
            title: "Misc Tests:",
            titleField: 'Id',
            sort: '-date',
            filters: filterArray.nonRemovable,
            removeableFilters: filterArray.removable,
            scope: this
        }, EHR.reports.qwpConfig);
        new LABKEY.QueryWebPart(config).render(target.id);
//    }

    target = tab.add({tag: 'span', style: 'padding-bottom: 20px'});
    tab.doLayout();

    config = Ext.applyIf({
        schemaName: 'study',
        queryName: 'Chemistry Results',
        viewName: 'Plus Ref Range',
        title: "Reference Ranges:",
        titleField: 'Id',
        sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable,
        scope: this
    }, EHR.reports.qwpConfig);
    new LABKEY.QueryWebPart(config).render(target.id);
}

EHR.reports.hematology = function(tab, subject){

    var filterArray = this.getFilterArray(tab, subject);
    var title = (subject ? subject.join("; ") : '');

//    tab.queryName = tab.queryName || 'hematologyPivot';
//    this.addHeader(tab, [{
//        html: 'Choose Report:',
//        style: 'padding-left:10px'
//        },{
//        xtype: 'combo',
//        store: new Ext.data.ArrayStore({
//            fields: ['name', 'value'],
//            data: [['Panel','hematologyPivot;'], ['Ref Range','Hematology Results;Plus Ref Range']]
//        }),
//        mode: 'local',
//        displayField: 'name',
//        valueField: 'value',
//        forceSelection:false,
//        //typeAhead: true,
//        triggerAction: 'all',
//        value: tab.query,
//        ref: '../reportSelector',
//        listeners: {
//            scope: this,
//            select: function(c){
//                var val = c.getValue().split(';');
//                c.refOwner.queryName = val[0];
//                c.refOwner.viewName = val[1];
//                c.refOwner.filters = [];
//                this.loadTab(c.refOwner);
//            }
//        }
//    }]);

    var target = tab.add({tag: 'span', style: 'padding-bottom: 20px'});
    tab.doLayout();

    var config = Ext.applyIf({
        schemaName: 'study',
        queryName: 'hematologyPivot',
        //viewName: tab.viewName,
        title: "By Panel:",
        titleField: 'Id',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable,
        sort: '-date',
        scope: this
    }, EHR.reports.qwpConfig);
    new LABKEY.QueryWebPart(config).render(target.id);

//    if(tab.queryName == 'hematologyPivot'){
        target = tab.add({tag: 'span', style: 'padding-bottom: 20px'});
        tab.doLayout();

        config = Ext.applyIf({
            schemaName: 'study',
            queryName: 'hematologyMisc',
            title: "Misc Tests:",
            titleField: 'Id',
            sort: '-date',
            filters: filterArray.nonRemovable,
            removeableFilters: filterArray.removable,
            scope: this
        }, EHR.reports.qwpConfig);
        new LABKEY.QueryWebPart(config).render(target.id);
//    }

    target = tab.add({tag: 'span', style: 'padding-bottom: 20px'});
    tab.doLayout();

    config = Ext.applyIf({
        schemaName: 'study',
        queryName: 'Hematology Morphology',
        title: "Morphology:",
        titleField: 'Id',
        sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable,
        scope: this
    }, EHR.reports.qwpConfig);
    new LABKEY.QueryWebPart(config).render(target.id);

    target = tab.add({tag: 'span', style: 'padding-bottom: 20px'});
    tab.doLayout();

    config = Ext.applyIf({
        schemaName: 'study',
        queryName: 'Hematology Results',
        viewName: 'Plus Ref Range',
        title: "Reference Ranges:",
        titleField: 'Id',
        sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable,
        scope: this
    }, EHR.reports.qwpConfig);
    new LABKEY.QueryWebPart(config).render(target.id);
}

EHR.reports.immunology = function(tab, subject){

    var filterArray = this.getFilterArray(tab, subject);
    var title = (subject ? subject.join("; ") : '');
//    tab.queryName = tab.queryName || 'immunologyPivot';

//    this.addHeader(tab, [{
//        html: 'Choose Report:',
//        style: 'padding-left:10px'
//        },{
//        xtype: 'combo',
//        store: new Ext.data.ArrayStore({
//            fields: ['name', 'value'],
//            data: [['Panel','immunologyPivot;'], ['Ref Range','Immunology Results;']]
//        }),
//        mode: 'local',
//        displayField: 'name',
//        valueField: 'value',
//        forceSelection:false,
//        //typeAhead: true,
//        triggerAction: 'all',
//        value: tab.query,
//        ref: '../reportSelector',
//        listeners: {
//            scope: this,
//            select: function(c){
//                var val = c.getValue().split(';');
//                c.refOwner.queryName = val[0];
//                c.refOwner.viewName = val[1];
//                c.refOwner.filters = [];
//                this.loadTab(c.refOwner);
//            }
//        }
//    }]);

    var target = tab.add({tag: 'span', style: 'padding-bottom: 20px'});
    tab.doLayout();

    var config = Ext.applyIf({
        schemaName: 'study',
        queryName: 'immunologyPivot',
        //viewName: tab.viewName,
        title: "By Panel:",
        titleField: 'Id',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable,
        scope: this
    }, EHR.reports.qwpConfig);
    new LABKEY.QueryWebPart(config).render(target.id);

    target = tab.add({tag: 'span', style: 'padding-bottom: 20px'});

    config = Ext.applyIf({
        schemaName: 'study',
        queryName: 'immunologyMisc',
        //viewName: tab.viewName,
        title: "Immunology Misc:",
        titleField: 'Id',
        sort: '-date',
        parent: this,
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable,
        scope: this
    }, EHR.reports.qwpConfig);
    new LABKEY.QueryWebPart(config).render(target.id);

    target = tab.add({tag: 'span', style: 'padding-bottom: 20px'});
    tab.doLayout();

    config = Ext.applyIf({
        schemaName: 'study',
        queryName: 'Immunology Results',
        viewName: 'Plus Ref Range',
        title: "Reference Ranges:",
        titleField: 'Id',
        sort: '-date',
        parent: this,
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable,
        scope: this
    }, EHR.reports.qwpConfig);
    new LABKEY.QueryWebPart(config).render(target.id);

};

EHR.reports.viralLoads = function(tab, subject){
    subject = subject || [];

    for (var i=0;i<subject.length;i++){
        var filterArray = this.getFilterArray(tab, [subject[i]]);
        var title = (subject[i] || '');

        var store = new LABKEY.ext.Store({
            schemaName: 'study',
            queryName: 'ViralLoads',
            filterArray: filterArray.removable.concat(filterArray.nonRemovable),
            columns: 'Id,date,LogVL',
            sort: 'Id,-date',
            autoLoad: true
        });

        tab.chart = new Ext.chart.LineChart({
            xtype: 'linechart',
            height: 300,
            width: 600,
            store: store,
            // The two following is not documented, but it's central for the linechart.
            xField: "date",
            yField: "LogVL",
            xAxis: new Ext.chart.TimeAxis({
                orientation: 'vertical',
                title: 'Date',
                labelRenderer: function(date) { return date.format("Y-m-d"); }
            }),
            yAxis: new Ext.chart.NumericAxis({
                title: 'Log Copies/mL'
            }),
            listeners: {
                scope: this,
                itemmouseover: function(o) {
                    //var myGrid = Ext.getCmp('myGrid');
                    //myGrid.selModel.selectRow(o.index);
                },
                itemclick: function(o){
                    var rec = o.item;
                }
            }
        });

        tab.add(new Ext.Panel({
            title: 'Viral Loads: ' + title,
            autoScroll: true,
            autoHeight: true,
            //frame: true,
            style: 'border:5px',
            //border: true,
            //layout: 'fit',
            items: [{
                layout: 'hbox',
                items: [
                    tab.chart
                ]}
            ]}
        ));
    }

    var target = tab.add({tag: 'span', style: 'padding-bottom: 20px'});
    tab.doLayout();
    var filterArray = this.getFilterArray(tab, subject);
    var title = (subject.join(', ') || '');
    var config = Ext.applyIf({
        title: 'Viral Load' + ": " + title,
        schemaName: 'study',
        queryName: 'ViralLoadsWpi',
        //viewName: 'With WPI',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable,
        sort: 'Id,-date',
        scope: this,
        frame: true
    }, EHR.reports.qwpConfig);

    new LABKEY.QueryWebPart(config).render(target.id);
}

EHR.reports.irregularObs = function(tab, subject){
    var filterArray = this.getFilterArray(tab, subject);

    var title = (subject ? subject.join("; ") : '');
    this.addHeader(tab);

    var target = tab.add({tag: 'span', style: 'padding-bottom: 20px'});
    tab.doLayout();

    var queryName;
    if(tab.filters._inputType == 'renderRoomCage' || tab.filters._inputType == 'renderColony'){
        queryName = 'irregularObsByLocation';
    }
    else {
        queryName = 'irregularObsById';
    }

    var config = Ext.apply({
        schemaName: 'study',
        queryName: queryName,
        title: "Irregular Observations: "+title,
        sort: 'room,cage,-date',
        titleField: 'Id',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable,
        scope: this
    }, EHR.reports.qwpConfig);

    if(tab.rowData.get('viewname'))
        config.viewName = tab.rowData.get('viewname');

    new LABKEY.QueryWebPart(config).render(target.id);

}

EHR.reports.irregularObsTreatment = function(tab, subject){
    var filterArray = this.getFilterArray(tab, subject);

    var title = (subject ? subject.join("; ") : '');
    this.addHeader(tab);

    var target = tab.add({tag: 'span', style: 'padding-bottom: 20px'});
    tab.doLayout();

    var queryName;
    if(tab.filters._inputType == 'renderRoomCage' || tab.filters._inputType == 'renderColony'){
        queryName = 'irregularObsTreatmentByLocation';
    }
    else {
        queryName = 'irregularObsTreatmentById';
    }

    var config = Ext.apply({
        schemaName: 'study',
        queryName: queryName,
        //viewName: tab.viewName,
        title: "Obs/Treatments: "+title,
        titleField: 'Id',
        sort: 'room,cage,-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable,
        scope: this
    }, EHR.reports.qwpConfig);
    new LABKEY.QueryWebPart(config).render(target.id);

}

EHR.reports.urinalysisResults = function(tab, subject){

    var filterArray = this.getFilterArray(tab, subject);
    var title = (subject ? subject.join("; ") : '');
    tab.queryName = tab.queryName || 'urinalysisPivot';

//    this.addHeader(tab, [{
//        html: 'Choose Report:',
//        style: 'padding-left:10px'
//        },{
//        xtype: 'combo',
//        store: new Ext.data.ArrayStore({
//            fields: ['name', 'value'],
//            data: [['Panel','urinalysisPivot;'], ['Individual Results','Urinalysis Results;']]
//        }),
//        fieldName: 'Test',
//        mode: 'local',
//        displayField: 'name',
//        valueField: 'value',
//        forceSelection:false,
//        //typeAhead: true,
//        triggerAction: 'all',
//        value: tab.query,
//        ref: '../reportSelector',
//        listeners: {
//            scope: this,
//            select: function(c){
//                var val = c.getValue().split(';');
//                c.refOwner.queryName = val[0];
//                c.refOwner.viewName = val[1];
//                c.refOwner.filters = [];
//                this.loadTab(c.refOwner);
//            }
//        }
//    }]);

    var target = tab.add({tag: 'span', style: 'padding-bottom: 20px'});
    tab.doLayout();

    var config = Ext.applyIf({
        schemaName: 'study',
        queryName: 'urinalysisPivot',
        //viewName: tab.viewName,
        title: "By Panel:",
        titleField: 'Id',
        sort: '-date',
        parent: this,
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable,
        scope: this
    }, EHR.reports.qwpConfig);
    new LABKEY.QueryWebPart(config).render(target.id);

    target = tab.add({tag: 'span', style: 'padding-bottom: 20px'});
    tab.doLayout();

    config = Ext.applyIf({
        schemaName: 'study',
        queryName: 'urinalysisMisc',
        //viewName: tab.viewName,
        title: "Urinalysis Misc:",
        titleField: 'Id',
        sort: '-date',
        parent: this,
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable,
        scope: this
    }, EHR.reports.qwpConfig);
    new LABKEY.QueryWebPart(config).render(target.id);

    target = tab.add({tag: 'span', style: 'padding-bottom: 20px'});
    tab.doLayout();

    config = Ext.applyIf({
        schemaName: 'study',
        queryName: 'Urinalysis Results',
        viewName: 'Plus Ref Range',
        title: "Reference Ranges:",
        titleField: 'Id',
        sort: '-date',
        parent: this,
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable,
        scope: this
    }, EHR.reports.qwpConfig);
    new LABKEY.QueryWebPart(config).render(target.id);

}

EHR.reports.treatmentSchedule = function(tab, subject){
    var filterArray = this.getFilterArray(tab, subject);
    var title = (subject ? subject.join("; ") : '');


    var target = tab.add({tag: 'span', style: 'padding-bottom: 20px'});
    tab.doLayout();

    var config = Ext.applyIf({
        title: 'AM Treatments',
        schemaName: 'study',
        queryName: 'treatmentSchedule',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable.concat([LABKEY.Filter.create('timeofday', 'AM', LABKEY.Filter.Types.EQUAL)]),
        scope: this,
        frame: true
    }, EHR.reports.qwpConfig);

    new LABKEY.QueryWebPart(config).render(target.id);

    target = tab.add({tag: 'span', style: 'padding-bottom: 20px'});
    tab.doLayout();
    config = Ext.applyIf({
        title: 'PM Treatments',
        schemaName: 'study',
        queryName: 'treatmentSchedule',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable.concat([LABKEY.Filter.create('timeofday', 'PM', LABKEY.Filter.Types.EQUAL)]),
        scope: this,
        frame: true
    }, EHR.reports.qwpConfig);

    new LABKEY.QueryWebPart(config).render(target.id);

    target = tab.add({tag: 'span', style: 'padding-bottom: 20px'});
    tab.doLayout();
    config = Ext.applyIf({
        title: 'Night Treatments',
        schemaName: 'study',
        queryName: 'treatmentSchedule',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable.concat([LABKEY.Filter.create('timeofday', 'Night', LABKEY.Filter.Types.EQUAL)]),
        scope: this,
        frame: true
    }, EHR.reports.qwpConfig);

    new LABKEY.QueryWebPart(config).render(target.id);


}
