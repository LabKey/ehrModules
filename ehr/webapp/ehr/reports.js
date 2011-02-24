/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.namespace('EHR.reports');

LABKEY.requiresScript("/ehr/transposeRows.js");
LABKEY.requiresScript("/ehr/utilities.js");

EHR.reports.qwpConfig = {
    allowChooseQuery: false,
    allowChooseView: true,
    showInsertNewButton: false,
    showDeleteButton: false,
    showDetailsColumn: true,
    showUpdateColumn: false,
    showRecordSelectors: true,
    frame: 'portal',
    linkTarget: '_new',  
    buttonBarPosition: 'top',
    //TODO: switch to 0 once bug is fixed
    timeout: 3000000,
    successCallback: function(c){
        this.endMsg();
    },
    errorCallback: function(error){
        console.log('Error callback called');
        this.endMsg();
        EHR.UTILITIES.onError(error)
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
        multiToGrid: true
    };
    new EHR.ext.DetailsView(config);

    target = tab.add({tag: 'div', style: 'padding-bottom: 20px'});
    tab.doLayout();
    var config = Ext.applyIf({
        title: 'Active Assignments' + ": " + title,
        frame: true,
        schemaName: 'study',
        queryName: 'assignment',
        viewName: 'Active Assignments',
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

EHR.reports.Diagnostics = function(tab, subject){
    var target = tab.add({tag: 'span', html: 'In progress.  Will contain graphing'});


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
            queryName: 'weight',
            filterArray: filterArray.removable.concat(filterArray.nonRemovable),
            columns: 'id,date,weight',
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
            yField: "weight",
            xAxis: new Ext.chart.TimeAxis({
                orientation: 'vertical',
                title: 'Date',
                labelRenderer: function(date) { return date.format("Y-m-d"); }
            }),
            yAxis: new Ext.chart.NumericAxis({
                title: 'Weight (kg)'
            }),
            listeners: {
                scope: this,
                itemmouseover: function(o) {
                    //var myGrid = Ext.getCmp('myGrid');
                    //myGrid.selModel.selectRow(o.index);
                },
                itemclick: function(o){
                    var rec = o.item;

                    var gridPanel = o.component.ownerCt.ownerCt.ownerCt.grid;
                    var rowNum = gridPanel.view.findRowIndex(rec);
                    gridPanel.view.focusRow(rowNum);

                    var clinPanel = o.component.ownerCt.detailsPanel;
                    clinPanel.removeAll();

                    var store = new LABKEY.ext.Store({
                        schemaName: 'study',
                        queryName: 'Clinical Remarks',
                        filterArray: [LABKEY.Filter.create('Id', rec.Id, LABKEY.Filter.Types.EQUAL), LABKEY.Filter.create('Date', rec.date, LABKEY.Filter.Types.DATE_EQUAL)],
                        columns: 'category,remark',
                        autoLoad: true,
                        ownerCt: clinPanel
                    });
                    store.on('load', function(s){
                        s.ownerCt.doLayout();
                    }, this);

                    var grid = new LABKEY.ext.EditorGridPanel({
                        store: store
                        ,title: 'Clinical Remarks: '+rec.date.format('Y-m-d')
                        ,height: 300
                        ,width: 600
                        ,autoScroll: true
                        ,editable: false
                        ,stripeRows: true
                        ,disableSelection: true
                        ,style: 'padding-top: 10px'
                        ,tbar: []
                        ,bbar: []
                        ,sm: new Ext.grid.RowSelectionModel()
                        ,errorCallback: function(error){
                            EHR.UTILITIES.onError(error)
                        }
                        ,scope: this
                        ,listeners: {
                            scope: this
    //                                reconfigure: function(c){
    //                                    console.log('reconfigure')
    //                                    c.doLayout();
    //                                },
    //                                bodyresize: function(c){
    //                                    console.log('resize')
    //                                    c.doLayout();
    //                                }
                        }
                    });

                    clinPanel.add(grid);
                    clinPanel.doLayout();
                }
            }
        });
    //    tab.on('show', function(c){
    //        //c.chart.refresh();
    //    });

        tab.add(new Ext.Panel({
            title: 'Weight: ' + title,
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
    //                ,
    //                tab.grid
            ]}
        ]}
        ));
    }

    var target = tab.add({tag: 'span', style: 'padding-bottom: 20px'});
    tab.doLayout();

    var filterArray = this.getFilterArray(tab, subject);
    var title = (subject ? subject.join("; ") : '');

    var config = Ext.applyIf({
        title: 'Weight' + ": " + title,
        schemaName: 'study',
        queryName: 'weight',
        sort: 'id,-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable,
        scope: this,
        frame: true
    }, EHR.reports.qwpConfig);

    new LABKEY.QueryWebPart(config).render(target.id);
};

EHR.reports.bloodChemistry = function(tab, subject){

    var filterArray = this.getFilterArray(tab, subject);
    var title = (subject ? subject.join("; ") : '');
    tab.queryName = tab.queryName || 'chemPivot';
    
    this.addHeader(tab, [{
        html: 'Choose Report:',
        style: 'padding-left:10px'
        },{
        xtype: 'combo',
        store: new Ext.data.ArrayStore({
            fields: ['name', 'value'],
            data: [['Panel','chemPivot;'], ['Ref Range','Blood Chemistry Results;Plus Ref Range']]
        }),
        fieldName: 'Test',
        mode: 'local',
        displayField: 'name',
        valueField: 'value',
        forceSelection:false,
        typeAhead: true,
        triggerAction: 'all',
        value: tab.query,
        ref: '../reportSelector',
        listeners: {
            scope: this,
            select: function(c){
                var val = c.getValue().split(';');
                c.refOwner.queryName = val[0];
                c.refOwner.viewName = val[1];
                c.refOwner.filters = [];                
                this.loadTab(c.refOwner);
            }
        }
    }]);

    var target = tab.add({tag: 'span', style: 'padding-bottom: 20px'});
    tab.doLayout();

    var config = Ext.applyIf({
        schemaName: 'study',
        queryName: tab.queryName,
        viewName: tab.viewName,
        title: "Blood Chemistry Results:",
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
    tab.queryName = tab.queryName || 'hematologyPivot';

    this.addHeader(tab, [{
        html: 'Choose Report:',
        style: 'padding-left:10px'
        },{
        xtype: 'combo',
        store: new Ext.data.ArrayStore({
            fields: ['name', 'value'],
            data: [['Panel','hematologyPivot;'], ['Ref Range','Hematology Results;Plus Ref Range']]
        }),
        mode: 'local',
        displayField: 'name',
        valueField: 'value',
        forceSelection:false,
        typeAhead: true,
        triggerAction: 'all',
        value: tab.query,
        ref: '../reportSelector',
        listeners: {
            scope: this,
            select: function(c){
                var val = c.getValue().split(';');
                c.refOwner.queryName = val[0];
                c.refOwner.viewName = val[1];
                c.refOwner.filters = [];
                this.loadTab(c.refOwner);
            }
        }
    }]);

    var target = tab.add({tag: 'span', style: 'padding-bottom: 20px'});
    tab.doLayout();

    var config = Ext.applyIf({
        schemaName: 'study',
        queryName: tab.queryName,
        viewName: tab.viewName,
        title: "Hematology Results:",
        titleField: 'Id',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable,
        sort: '-date',
        scope: this
    }, EHR.reports.qwpConfig);
    new LABKEY.QueryWebPart(config).render(target.id);

}


EHR.reports.immunology = function(tab, subject){

    var filterArray = this.getFilterArray(tab, subject);
    var title = (subject ? subject.join("; ") : '');
    tab.queryName = tab.queryName || 'immunologyPivot';

    this.addHeader(tab, [{
        html: 'Choose Report:',
        style: 'padding-left:10px'
        },{
        xtype: 'combo',
        store: new Ext.data.ArrayStore({
            fields: ['name', 'value'],
            data: [['Panel','immunologyPivot;'], ['Ref Range','Immunology Results;']]
        }),
        mode: 'local',
        displayField: 'name',
        valueField: 'value',
        forceSelection:false,
        typeAhead: true,
        triggerAction: 'all',
        value: tab.query,
        ref: '../reportSelector',
        listeners: {
            scope: this,
            select: function(c){
                var val = c.getValue().split(';');
                c.refOwner.queryName = val[0];
                c.refOwner.viewName = val[1];
                c.refOwner.filters = [];
                this.loadTab(c.refOwner);
            }
        }
    }]);

    var target = tab.add({tag: 'span', style: 'padding-bottom: 20px'});
    tab.doLayout();

    var config = Ext.applyIf({
        schemaName: 'study',
        queryName: tab.queryName,
        viewName: tab.viewName,
        title: "Immunology Results:",
        titleField: 'Id',
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
        queryName: 'ViralLoads',
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
    if(tab.filters._inputType == 'renderRoomCage'){
        queryName = 'irregularObsByLocation';
    }
    else {
        queryName = 'irregularObsById';
    }
    var config = Ext.applyIf({
        schemaName: 'study',
        queryName: queryName,
        //viewName: tab.viewName,
        title: "Irregular Observations: "+title,
        titleField: 'Id',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable,
        scope: this
    }, EHR.reports.qwpConfig);
    new LABKEY.QueryWebPart(config).render(target.id);

}

EHR.reports.irregularObsTreatment = function(tab, subject){
    var filterArray = this.getFilterArray(tab, subject);

    var title = (subject ? subject.join("; ") : '');
    this.addHeader(tab);

    var target = tab.add({tag: 'span', style: 'padding-bottom: 20px'});
    tab.doLayout();

    var queryName;
    if(tab.filters._inputType == 'renderRoomCage'){
        queryName = 'irregularObsTreatmentByLocation';
    }
    else {
        queryName = 'irregularObsTreatmentById';
    }
    var config = Ext.applyIf({
        schemaName: 'study',
        queryName: queryName,
        //viewName: tab.viewName,
        title: "Obs/Treatments: "+title,
        titleField: 'Id',
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

    this.addHeader(tab, [{
        html: 'Choose Report:',
        style: 'padding-left:10px'
        },{
        xtype: 'combo',
        store: new Ext.data.ArrayStore({
            fields: ['name', 'value'],
            data: [['Panel','urinalysisPivot;'], ['Individual Results','Urinalysis Results;']]
        }),
        fieldName: 'Test',
        mode: 'local',
        displayField: 'name',
        valueField: 'value',
        forceSelection:false,
        typeAhead: true,
        triggerAction: 'all',
        value: tab.query,
        ref: '../reportSelector',
        listeners: {
            scope: this,
            select: function(c){
                var val = c.getValue().split(';');
                c.refOwner.queryName = val[0];
                c.refOwner.viewName = val[1];
                c.refOwner.filters = [];
                this.loadTab(c.refOwner);
            }
        }
    }]);

    var target = tab.add({tag: 'span', style: 'padding-bottom: 20px'});
    tab.doLayout();

    var config = Ext.applyIf({
        schemaName: 'study',
        queryName: tab.queryName,
        viewName: tab.viewName,
        title: "Urinalysis Results:",
        titleField: 'Id',
        sort: '-date',
        parent: this,
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable,
        scope: this
    }, EHR.reports.qwpConfig);
    new LABKEY.QueryWebPart(config).render(target.id);

}