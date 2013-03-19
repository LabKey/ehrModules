/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg subjectId
 * @cfg hrefTarget
 */
Ext4.define('EHR.panel.SnapshotPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ehr-snapshotpanel',

    initComponent: function(){
        Ext4.apply(this, {
            border: false,
            defaults: {
                border: false
            },
            items: this.getItems()
        });

        this.isLoading = true;
        this.setLoading(true);
        this.callParent();
        this.loadData();
    },

    getItems: function(){
        return [{
            xtype: 'container',
            border: false,
            defaults: {
                border: false
            },
            items: [{
                html: '<b>Summary:</b><hr>'
            },{
                bodyStyle: 'padding: 5px;',
                layout: 'column',
                defaults: {
                    border: false
                },
                items: [{
                    xtype: 'container',
                    columnWidth: 0.5,
                    defaults: {
                        labelWidth: 170,
                        width: 400,
                        style: 'margin-right: 20px;'
                    },
                    items: [{
                        xtype: 'displayfield',
                        fieldLabel: 'Location',
                        itemId: 'location'
                    },{
                        xtype: 'displayfield',
                        fieldLabel: '# Animals In Location',
                        itemId: 'roommates'
                    },{
                        xtype: 'displayfield',
                        fieldLabel: 'Status',
                        itemId: 'calculated_status'
                    },{
                        xtype: 'displayfield',
                        fieldLabel: 'Gender',
                        itemId: 'gender'
                    },{
                        xtype: 'displayfield',
                        fieldLabel: 'Species',
                        itemId: 'species'
                    },{
                        xtype: 'displayfield',
                        fieldLabel: 'Geographic Origin',
                        itemId: 'geographic_origin'
                    },{
                        xtype: 'displayfield',
                        fieldLabel: 'Age',
                        itemId: 'age'
                    }]
                },{
                    columnWidth: 0.5,
                    defaults: {
                        labelWidth: 170,
                        width: 450,
                        style: 'margin-right: 20px;'
                    },
                    items: [{
                        xtype: 'displayfield',
                        fieldLabel: 'Birth',
                        itemId: 'birth'
                    },{
                        xtype: 'displayfield',
                        fieldLabel: 'Death',
                        itemId: 'death'
                    },{
                        xtype: 'displayfield',
                        fieldLabel: 'Dam',
                        itemId: 'dam'
                    },{
                        xtype: 'displayfield',
                        fieldLabel: 'Sire',
                        itemId: 'sire'
                    },{
                        xtype: 'displayfield',
                        fieldLabel: 'Current Weight (kg)',
                        itemId: 'currentWeight'
                    },{
                        xtype: 'displayfield',
                        fieldLabel: 'Weight Date',
                        itemId: 'weightDate'
                    }]
                }]
            },{
                itemId: 'flags',
                xtype: 'ehr-snapshotchildpanel',
                headerLabel: 'Active Flags'
            },{
                itemId: 'cases',
                xtype: 'ehr-snapshotchildpanel',
                headerLabel: 'Open Cases',
                emptyText: 'There are no open cases'
            },{
                itemId: 'problems',
                xtype: 'ehr-snapshotchildpanel',
                headerLabel: 'Open Problems',
                emptyText: 'There are no open problems'
            },{
                itemId: 'assignments',
                xtype: 'ehr-snapshotchildpanel',
                headerLabel: 'Active Assignments',
                emptyText: 'There are no active research assignments'
            },{
                itemId: 'treatments',
                xtype: 'ehr-snapshotchildpanel',
                headerLabel: 'Current Medications',
                emptyText: 'There are no active medications'
            },{
                itemId: 'diet',
                xtype: 'ehr-snapshotchildpanel',
                headerLabel: 'Special Diets',
                emptyText: 'There are no active special diets'
            }]
        }];
    },

    loadData: function(){
        var multi = new LABKEY.MultiRequest();

        multi.add(LABKEY.Query.selectRows, {
            schemaName: 'study',
            queryName: 'demographics',
            columns: 'Id,Id/curLocation/area,Id/curLocation/room,Id/curLocation/cage,Id/age/AgeFriendly,gender,species,geographic_origin,calculated_status,dam,sire,birth,death',
            filterArray: [LABKEY.Filter.create('Id', this.subjectId, LABKEY.Filter.Types.EQUAL)],
            failure: LDK.Utils.getErrorCallback(),
            requiredVersion: 9.1,
            scope: this,
            success: function(results){
                this.demographicsResults = results;
            }
        });

        multi.add(LABKEY.Query.selectRows, {
            schemaName: 'study',
            queryName: 'assignment',
            requiredVersion: 9.1,
            columns: 'Id,date,enddate,projectedRelease,project,project/protocol,project/title,project/investigatorId,project/investigatorId/firstName,project/investigatorId/lastName',
            filterArray: [
                LABKEY.Filter.create('Id', this.subjectId, LABKEY.Filter.Types.EQUAL),
                LABKEY.Filter.create('endDateCoalesced', '-0d', LABKEY.Filter.Types.DATE_GREATER_THAN_OR_EQUAL)
            ],
            failure: LDK.Utils.getErrorCallback(),
            scope: this,
            success: function(results){
                this.assignmentResults = results;
            }
        });

        multi.add(LABKEY.Query.selectRows, {
            schemaName: 'study',
            queryName: 'Problem List',
            requiredVersion: 9.1,
            filterArray: [
                LABKEY.Filter.create('Id', this.subjectId, LABKEY.Filter.Types.EQUAL),
                LABKEY.Filter.create('endDateCoalesced', '-0d', LABKEY.Filter.Types.DATE_GREATER_THAN_OR_EQUAL)
            ],
            failure: LDK.Utils.getErrorCallback(),
            scope: this,
            success: function(results){
                this.problemListResults = results;
            }
        });

        multi.add(LABKEY.Query.selectRows, {
            schemaName: 'study',
            queryName: 'Treatment Orders',
            columns: 'Id,date,amount,amount_units,enddate,performedby,code,route,frequency',
            requiredVersion: 9.1,
            filterArray: [
                LABKEY.Filter.create('Id', this.subjectId, LABKEY.Filter.Types.EQUAL),
                LABKEY.Filter.create('endDateCoalesced', '-0d', LABKEY.Filter.Types.DATE_GREATER_THAN_OR_EQUAL)
            ],
            failure: LDK.Utils.getErrorCallback(),
            scope: this,
            success: function(results){
                this.treatmentResults = results;
            }
        });

        multi.add(LABKEY.Query.selectRows, {
            schemaName: 'study',
            queryName: 'Cases',
            columns: 'Id,date,enddate,category,performedby,remark,description',
            requiredVersion: 9.1,
            filterArray: [
                LABKEY.Filter.create('Id', this.subjectId, LABKEY.Filter.Types.EQUAL),
                LABKEY.Filter.create('endDateCoalesced', '-0d', LABKEY.Filter.Types.DATE_GREATER_THAN_OR_EQUAL)
            ],
            failure: LDK.Utils.getErrorCallback(),
            scope: this,
            success: function(results){
                this.caseResults = results;
            }
        });

        multi.add(LABKEY.Query.selectRows, {
            schemaName: 'study',
            queryName: 'diet',
            requiredVersion: 9.1,
            filterArray: [
                LABKEY.Filter.create('Id', this.subjectId, LABKEY.Filter.Types.EQUAL),
                LABKEY.Filter.create('endDateCoalesced', '-0d', LABKEY.Filter.Types.DATE_GREATER_THAN_OR_EQUAL)
            ],
            failure: LDK.Utils.getErrorCallback(),
            scope: this,
            success: function(results){
                this.dietResults = results;
            }
        });

        multi.add(LABKEY.Query.selectRows, {
            schemaName: 'study',
            queryName: 'Flags',
            columns: 'date,enddate,performedby,flag,category,value',
            requiredVersion: 9.1,
            filterArray: [
                LABKEY.Filter.create('Id', this.subjectId, LABKEY.Filter.Types.EQUAL),
                LABKEY.Filter.create('endDateCoalesced', '-0d', LABKEY.Filter.Types.DATE_GREATER_THAN_OR_EQUAL)
            ],
            failure: LDK.Utils.getErrorCallback(),
            scope: this,
            success: function(results){
                this.flagsResults = results;
            }
        });

        multi.add(LABKEY.Query.selectRows, {
            schemaName: 'study',
            queryName: 'demographicsPaired',
            columns: 'Id,total,Animals',
            requiredVersion: 9.1,
            filterArray: [
                LABKEY.Filter.create('Id', this.subjectId, LABKEY.Filter.Types.EQUAL)
            ],
            failure: LDK.Utils.getErrorCallback(),
            scope: this,
            success: function(results){
                this.roommateResults = results;
            }
        });

        multi.add(LABKEY.Query.selectRows, {
            schemaName: 'study',
            queryName: 'demographicsMostRecentWeight',
            requiredVersion: 9.1,
            filterArray: [
                LABKEY.Filter.create('Id', this.subjectId, LABKEY.Filter.Types.EQUAL)
            ],
            failure: LDK.Utils.getErrorCallback(),
            scope: this,
            success: function(results){
                this.weightResults = results;
            }
        });

        multi.send(this.onAllComplete, this);
    },

    onAllComplete: function(){
        Ext4.suspendLayouts();

        this.appendDemographicsResults(this.demographicsResults);
        this.appendWeightResults(this.weightResults);
        this.appendRoommateResults(this.roommateResults);
        this.appendProblemList(this.problemListResults);
        this.appendAssignments(this.assignmentResults);
        this.appendTreatments(this.treatmentResults);
        this.appendCases(this.caseResults);
        this.appendDiet(this.dietResults);
        this.appendFlags(this.flagsResults);

        this.onLoad();

        Ext4.resumeLayouts(true);
    },

    appendDemographicsResults: function(results){
        if (results.rows.length){
            var row = results.rows[0];

            Ext4.each(['calculated_status', 'gender', 'dam', 'sire', 'birth', 'death', 'species', 'geographic_origin'], function(name){
                if (row[name])
                    this.down('#' + name).setValue(this.getValue(row, name));
            }, this);

            if (this.hasValue(row, 'Id/age/AgeFriendly')){
                this.down('#age').setValue(this.getValue(row, 'Id/age/AgeFriendly'));
            }

            if (this.hasValue(row, 'Id/curLocation/room') || this.hasValue(row, 'Id/curLocation/cage')){
                var location = '';
                if (this.hasValue(row, 'Id/curLocation/room'))
                    location = this.getValue(row, 'Id/curLocation/room');
                if (this.hasValue(row, 'Id/curLocation/cage'))
                    location += ' / ' + this.getValue(row, 'Id/curLocation/cage');

                if (location)
                    this.down('#location').setValue(location);
                else
                    this.down('#location').setValue('No active housing');
            }
        }
        else {
            this.removeAll();
            this.add({
                html: 'Id not found'
            });
        }
    },

    hasValue: function(row, propName){
        return !Ext4.isEmpty(row[propName]) && !Ext4.isEmpty(row[propName].value);
    },

    getValue: function(row, propName){
        if (!this.hasValue(row, propName))
            return null;

        var val = Ext4.isEmpty(row[propName].displayValue) ? row[propName].value : row[propName].displayValue;
        if (row[propName].url){
            val = '<a href="' + row[propName].url + '" ' + this.getTargetString() + '>' + val + '</a>';
        }
        return val;
    },

    getTargetString: function(){
        return this.hrefTarget ? ' target="' + this.hrefTarget + '"' : '';
    },

    appendProblemList: function(results){
        var columns = [{
            name: 'category',
            label: 'Category'
        },{
            name: 'performedby',
            label: 'Entered By'
        },{
            name: 'date',
            label: 'Date Entered'
        }];

        this.down('#problems').appendTable(results, columns)
    },

    appendWeightResults: function(results){
        if (results.rows.length){
            var row = results.rows[0];
            this.down('#currentWeight').setValue(this.getValue(row, 'MostRecentWeight'));

            if (this.hasValue(row, 'MostRecentWeightDate')){
                var val = this.getValue(row, 'MostRecentWeightDate');
                if (this.hasValue(row, 'DaysSinceWeight')){
                    val += ' (' + this.getValue(row, 'DaysSinceWeight') + ' days ago)'
                }

                this.down('#weightDate').setValue(val);
            }
        }
    },

    appendRoommateResults: function(results){
        if (results.rows.length){
            var row = results.rows[0];
            this.down('#roommates').setValue(this.getValue(row, 'total'));
        }
        else {
            this.down('#roommates').setValue(0)
        }
    },

    appendAssignments: function(results){
        var columns = [{
            name: 'project',
            label: 'Project'
        },{
            name: 'project/title',
            label: 'Title'
        },{
            name: 'project/investigatorId/lastName',
            label: 'Investigator'
        },{
            name: 'date',
            label: 'Assign Date'
        },{
            name: 'projectedRelease',
            label: 'Projected Release Date'
        }];

        this.down('#assignments').appendTable(results, columns)
    },

    appendCases: function(results){
        var columns = [{
            name: 'category',
            label: 'Category'
        },{
            name: 'date',
            label: 'Open Date'
        }];

        this.down('#cases').appendTable(results, columns)
    },

    appendDiet: function(results){
        var columns = [{
            name: 'diet',
            label: 'Diet'
        },{
            name: 'performedby',
            label: 'Entered By'
        },{
            name: 'date',
            label: 'Start Date'
        },{
            name: 'enddate',
            label: 'End Date'
        }];

        this.down('#diet').appendTable(results, columns)
    },

    appendTreatments: function(results){
        var columns = [{
            name: 'code',
            label: 'Medication'
        },{
            name: 'performedby',
            label: 'Ordered By'
        },{
            name: 'frequency',
            label: 'Frequency'
        },{
            name: 'amount',
            label: 'Amount'
        },{
            name: 'amount_units',
            label: 'Units'
        },{
            name: 'route',
            label: 'Route'
        },{
            name: 'date',
            label: 'Start Date'
        },{
            name: 'enddate',
            label: 'End Date'
        },{
            name: 'remark',
            label: 'Remark'
        }];

        this.down('#treatments').appendTable(results, columns)
    },

    appendFlags: function(results){
        var columns = ['flag', 'value', {name: 'date', label: 'Date Created'}];

        this.down('#flags').appendTable(results, columns)
    },

    safeAppendNumber: function(row, prop, suffix){
        if (row[prop] && Ext4.isEmpty(row[prop].value))
            return '';

        return Ext4.util.Format.round(row[prop].value, 2) + (suffix ? ' ' + suffix : '');
    },

    onLoad: function(){
        if (this.isLoading){
            this.setLoading(false);
            this.isLoading = false;
        }
    }
});

    /**
 * @cfg headerLabel
 * @cfg emptyText
 * @cfg renderCollapsed
 */
Ext4.define('EHR.panel.SnapshotChildPanel', {
    alias: 'widget.ehr-snapshotchildpanel',
    extend: 'Ext.panel.Panel',

    initComponent: function(){
        Ext4.apply(this, {
            border: false,
            defaults: {
                border: false
            },
            items: [{
                html: '<b>' + this.headerLabel + ':</b>',
                itemId: 'headerItem',
                overCls: 'ldk-clickable',
                listeners: {
                    afterrender: function(panel){
                        var owner = panel.up('ehr-snapshotchildpanel');
                        panel.getEl().on('click', owner.onClick, owner);
                    }
                }
            },{
                border: false,
                itemId: 'childPanel',
                style: 'padding-bottom: 10px;',
                hidden: this.renderCollapsed,
                defaults: {
                    border: false
                },
                items: [{
                    html: '<hr>'
                }]
            }]
        });

        this.callParent();
    },

    onClick: function(el, event){
        var target = this.down('#childPanel');
        target.setVisible(!target.isVisible());
    },

    appendTable: function(results, columns){
        var target = this.down('#childPanel');
        var total = results.rows.length;
        var headerEl = this.down('#headerItem').body;
        var html = headerEl.getHTML();
        html = html.replace(this.headerLabel + ':', this.headerLabel + ': ' + total);
        headerEl.update(html);

        if (results.rows.length){
            var table = target.down('#resultTable');
            if (table)
                target.remove(table);

            var toAdd = {
                itemId: 'resultTable',
                layout: {
                    type: 'table',
                    columns: columns.length,
                    tdAttrs: {
                        style: 'padding: 5px;'
                    }
                },
                border: false,
                defaults: {
                    border: false
                },
                items: []
            };

            //first the header
            var colKeys = [];
            Ext4.each(columns, function(col){
                if (Ext4.isString(col)){
                    var field = this.getField(results, col);
                    toAdd.items.push({
                        html: '<i>' + field.caption + '</i>'
                    });
                    colKeys.push(field.name);
                }
                else if (Ext4.isObject(col)){
                    toAdd.items.push({
                        html: '<i>' + col.label + '</i>'
                    });
                    colKeys.push(col.name);
                }
            }, this);

            Ext4.each(results.rows, function(row){
                Ext4.each(colKeys, function(name){
                    if (!Ext4.isEmpty(row[name]) && !Ext4.isEmpty(row[name].value)){
                        toAdd.items.push({
                            html: (row[name].displayValue || row[name].value) + ''
                        });
                    }
                    else {
                        toAdd.items.push({
                            html: ''
                        });
                    }
                }, this);
            }, this);

            target.add(toAdd);
        }
        else {
            if (this.emptyText){
                target.add({
                    html: this.emptyText
                });
            }
        }
    },

    getField: function(results, name){
        var result = null;
        Ext4.each(results.metaData.fields, function(field){
            if (field.name.toLowerCase() == name.toLowerCase()){
                result = field;
                return false;
            }
        }, this);

        return result;
    }
});