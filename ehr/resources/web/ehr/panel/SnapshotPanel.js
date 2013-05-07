/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg subjectId
 * @cfg hideHeader
 * @cfg showLocationDuration
 * @cgf showExtendedInformation
 * @cfg hrefTarget
 */
Ext4.define('EHR.panel.SnapshotPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ehr-snapshotpanel',

    showLocationDuration: true,
    defaultLabelWidth: 120,

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

    getBaseItems: function(){
        return [{
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
                    columnWidth: 0.25,
                    defaults: {
                        labelWidth: this.defaultLabelWidth,
                        style: 'margin-right: 20px;'
                    },
                    items: [{
                        xtype: 'displayfield',
                        fieldLabel: 'Location',
                        width: 400,
                        itemId: 'location'
                    },{
                        xtype: 'displayfield',
                        itemId: 'assignments',
                        fieldLabel: 'Projects'
                    },{
                        xtype: 'displayfield',
                        fieldLabel: 'Groups',
                        itemId: 'groups'
                    },{
                        xtype: 'displayfield',
                        fieldLabel: 'Open Problems',
                        itemId: 'openProblems'
                    },{
                        xtype: 'displayfield',
                        fieldLabel: 'Active Cases',
                        itemId: 'activeCases'
                    }]
                },{
                    columnWidth: 0.25,
                    defaults: {
                        labelWidth: this.defaultLabelWidth,
                        style: 'margin-right: 20px;'
                    },
                    items: [{
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
                        fieldLabel: 'Age',
                        itemId: 'age'
                    }]
                },{
                    columnWidth: 0.35,
                    defaults: {
                        labelWidth: this.defaultLabelWidth,
                        style: 'margin-right: 20px;'
                    },
                    items: [{
                        xtype: 'displayfield',
                        fieldLabel: 'Flags',
                        itemId: 'flags'
                    },{
                        xtype: 'displayfield',
                        fieldLabel: 'Last TB Date',
                        itemId: 'lastTB'
                    },{
                        xtype: 'displayfield',
                        fieldLabel: 'Weights',
                        width: 450,
                        itemId: 'weights'
                    }]
                }]
            }]
        }];
    },

    getItems: function(){
        var items = this.getBaseItems();

//                        xtype: 'displayfield',
//                        fieldLabel: '# Animals In Location',
//                        itemId: 'roommates'

        items[0].items = items[0].items.concat([{
            itemId: 'additionalInformation',
            style: 'padding-bottom: 10px;',
            border: false,
            defaults: {
                border: false
            },
            items: [{
                html: '<b>Additional Information</b><hr>'
            },{
                layout: 'column',
                defaults: {
                    labelWidth: this.defaultLabelWidth
                },
                items: [{
                    columnWidth: 0.5,
                    border: false,
                    defaults: {
                        labelWidth: this.defaultLabelWidth,
                        border: false,
                        style: 'margin-right: 20px;'
                    },
                    items: [{
                        xtype: 'displayfield',
                        width: 350,
                        fieldLabel: 'Geographic Origin',
                        itemId: 'geographic_origin'
                    },{
                        xtype: 'displayfield',
                        fieldLabel: 'Birth',
                        itemId: 'birth'
                    },{
                        xtype: 'displayfield',
                        fieldLabel: 'Death',
                        itemId: 'death'
                    }]
                },{
                    xtype: 'container',
                    columnWidth: 0.5,
                    defaults: {
                        labelWidth: this.defaultLabelWidth
                    },
                    items: [{
                        xtype: 'displayfield',
                        fieldLabel: 'Parent Information',
                        itemId: 'parents'
                    }]
                }]
            }]
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
        }]);

        return items;
    },

    loadData: function(){
        var multi = new LABKEY.MultiRequest();

        multi.add(LABKEY.Query.selectRows, {
            schemaName: 'study',
            queryName: 'demographics',
            columns: 'Id,Id/curLocation/area,Id/curLocation/room,Id/curLocation/cage,Id/curLocation/date,Id/age/yearAndDays,gender,species,geographic_origin,calculated_status,dam,sire',
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
            queryName: 'parentageSummary',
            sort: 'Id,relationship',
            columns: 'Id,date,parent,relationship,method',
            filterArray: [LABKEY.Filter.create('Id', this.subjectId, LABKEY.Filter.Types.EQUAL)],
            failure: LDK.Utils.getErrorCallback(),
            requiredVersion: 9.1,
            scope: this,
            success: function(results){
                this.parentageResults = results;
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
            schemaName: 'ehr',
            queryName: 'animal_group_members',
            requiredVersion: 9.1,
            columns: 'Id,date,enddate,groupId/name',
            filterArray: [
                LABKEY.Filter.create('Id', this.subjectId, LABKEY.Filter.Types.EQUAL),
                LABKEY.Filter.create('endDateCoalesced', '-0d', LABKEY.Filter.Types.DATE_GREATER_THAN_OR_EQUAL)
            ],
            failure: LDK.Utils.getErrorCallback(),
            scope: this,
            success: function(results){
                this.groupResults = results;
            }
        });

        multi.add(LABKEY.Query.selectRows, {
            schemaName: 'study',
            queryName: 'demographicsMostRecentTBDate',
            columns: 'Id,MostRecentTBDate,MonthsSinceLastTB,MonthsUntilDue',
            requiredVersion: 9.1,
            filterArray: [
                LABKEY.Filter.create('Id', this.subjectId, LABKEY.Filter.Types.EQUAL)
            ],
            failure: LDK.Utils.getErrorCallback(),
            scope: this,
            success: function(results){
                this.tbResults = results;
            }
        });

        multi.add(LABKEY.Query.selectRows, {
            schemaName: 'study',
            queryName: 'Problem List',
            columns: 'Id,date,enddate,category',
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
            columns: 'Id,date,amount,amount_units,amountWithUnits,enddate,performedby,code,route,frequency',
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
            queryName: 'weight',
            columns: 'Id,date,weight',
            sort: '-date',
            requiredVersion: 9.1,
            maxRows: 3,
            filterArray: [
                LABKEY.Filter.create('Id', this.subjectId, LABKEY.Filter.Types.EQUAL)
            ],
            failure: LDK.Utils.getErrorCallback(),
            scope: this,
            success: function(results){
                this.weightResults = results;
            }
        });

        if (this.showExtendedInformation){
            //only load this data if being displayed
            if (this.down('#roommates')){
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
            }

            multi.add(LABKEY.Query.selectRows, {
                schemaName: 'study',
                queryName: 'Birth',
                columns: 'Id,date,type,cond',
                requiredVersion: 9.1,
                filterArray: [
                    LABKEY.Filter.create('Id', this.subjectId, LABKEY.Filter.Types.EQUAL)
                ],
                failure: LDK.Utils.getErrorCallback(),
                scope: this,
                success: function(results){
                    this.birthResults = results;
                }
            });

            multi.add(LABKEY.Query.selectRows, {
                schemaName: 'study',
                queryName: 'Deaths',
                columns: 'Id,date,cause',
                requiredVersion: 9.1,
                filterArray: [
                    LABKEY.Filter.create('Id', this.subjectId, LABKEY.Filter.Types.EQUAL)
                ],
                failure: LDK.Utils.getErrorCallback(),
                scope: this,
                success: function(results){
                    this.deathResults = results;
                }
            });
        }

        multi.send(this.onAllComplete, this);
    },

    onAllComplete: function(){
        Ext4.suspendLayouts();

        this.appendDemographicsResults(this.demographicsResults);
        this.appendWeightResults(this.weightResults);

        if (this.roommateResults)
            this.appendRoommateResults(this.roommateResults);

        this.appendProblemList(this.problemListResults);
        this.appendAssignments(this.assignmentResults);
        this.appendGroups(this.groupResults);
        this.appendTreatments(this.treatmentResults);
        this.appendCases(this.caseResults);
        this.appendDiet(this.dietResults);
        this.appendFlags(this.flagsResults);
        this.appendTBResults(this.tbResults);

        if (this.showExtendedInformation){
            this.appendBirthResults(this.birthResults);
            this.appendDeathResults(this.deathResults);
            this.appendParentageResults(this.parentageResults);
        }
        this.onLoad();

        Ext4.resumeLayouts();
        this.doLayout();
    },

    appendTBResults: function(results){
        if (results && results.rows && results.rows.length){
            var row = results.rows[0];
            if (this.hasValue(row, 'MostRecentTBDate')){
                var value = this.getValue(row, 'MostRecentTBDate', Ext4.data.Types.DATE, 'Y-m-d');
                var months = this.getValue(row, 'MonthsSinceLastTB');
                if (months)
                    value += ' (' + months + ' month' + (months == 1 ? '' : 's') + ' ago)';

                this.down('#lastTB').setValue(value);
            }
            else {
                this.down('#lastTB').setValue('Never');
            }
        }
    },

    appendDemographicsResults: function(results){
        if (results && results.rows && results.rows.length){
            var row = results.rows[0];

            Ext4.each(['calculated_status', 'gender', 'dam', 'sire', 'species', 'geographic_origin'], function(name){
                if (row[name]){
                    var field = this.down('#' + name);
                    if (field)
                        field.setValue(this.getValue(row, name, null, null, true));
                }
            }, this);

            if (this.hasValue(row, 'Id/age/yearAndDays')){
                this.down('#age').setValue(this.getValue(row, 'Id/age/yearAndDays'));
            }

            if (this.hasValue(row, 'Id/curLocation/room') || this.hasValue(row, 'Id/curLocation/cage')){
                var location = '';
                if (this.hasValue(row, 'Id/curLocation/room'))
                    location = this.getValue(row, 'Id/curLocation/room');
                if (this.hasValue(row, 'Id/curLocation/cage'))
                    location += ' / ' + this.getValue(row, 'Id/curLocation/cage');

                if (location){
                    if (this.showLocationDuration && this.hasValue(row, 'Id/curLocation/date')){
                        var date = this.getValue(row, 'Id/curLocation/date', Ext4.data.Types.DATE, 'Y-m-d');
                        if (date)
                            location += ' (since ' + date + ')';
                    }

                    this.down('#location').setValue(location);
                }
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

    getValue: function(row, propName, extType, formatString, ignoreUrl){
        if (!this.hasValue(row, propName))
            return null;

        var val;
        if (extType){
            val = row[propName].value;
            if (extType == Ext4.data.Types.DATE){
                val = LDK.ConvertUtils.parseDate(val);
                if (formatString)
                    val = Ext4.Date.format(val, formatString);
            }
            else {
                console.error('ExtType not supported: ' + extType);
            }
        }
        else {
            val = Ext4.isEmpty(row[propName].displayValue) ? row[propName].value : row[propName].displayValue;
        }

        if (!ignoreUrl && row[propName].url){
            val = '<a href="' + row[propName].url + '" ' + this.getTargetString() + '>' + val + '</a>';
        }
        return val;
    },

    getTargetString: function(){
        return this.hrefTarget ? ' target="' + this.hrefTarget + '"' : '';
    },

    appendProblemList: function(results){
        if (results && results.rows && results.rows.length){
            var values = [];
            Ext4.each(results.rows, function(row){
                var sr = new LDK.SelectRowsRow(row);
                var text = sr.getDisplayValue('category');
                if (text){
                    var date = sr.getFormattedDateValue('date', 'Y-m-d');
                    if (date)
                        text = text + ' (' + date + ')';

                    values.push(text);
                }
            }, this);

            if (values.length)
                this.down('#openProblems').setValue(values.join(', '));
        }
        else {
            this.down('#openProblems').setValue('None');
        }
    },

    appendWeightResults: function(results){
        if (results && results.rows && results.rows.length){
            var rows = [];
            var prevRow;
            Ext4.each(results.rows, function(row){
                var sr = new LDK.SelectRowsRow(row);
                var newRow = {
                    weight: sr.getValue('weight'),
                    date: sr.getDateValue('date')
                };

                var prevDate = prevRow ? prevRow.date : new Date();
                if (prevDate){
                    //round to day for purpose of this comparison
                    var d1 = Ext4.Date.clearTime(prevDate, true);
                    var d2 = Ext4.Date.clearTime(newRow.date, true);
                    var interval = Ext4.Date.getElapsed(d1, d2);
                    interval = interval / (1000 * 60 * 60 * 24);
                    interval = Math.floor(interval);
                    newRow.interval = interval + (prevRow ? ' days between' : ' days ago');
                }

                rows.push(newRow);
                prevRow = newRow;
            }, this);

            var text = [];
            Ext4.each(rows, function(r){
                text.push('<tr><td>' + r.weight + ' kg' + '</td><td style="padding-left: 5px;">' + r.date.format('Y-m-d') + '</td><td style="padding-left: 5px;">' + (Ext4.isDefined(r.interval) ? ' (' + r.interval + ')' : '') + "</td></tr>");
            }, this);

            this.down('#weights').setValue('<table>' + text.join('') + '</table>');
        }
    },

    appendRoommateResults: function(results){
        if (results && results.rows && results.rows.length){
            var row = results.rows[0];
            this.down('#roommates').setValue(this.getValue(row, 'total'));
        }
        else {
            this.down('#roommates').setValue(0)
        }
    },

    appendGroups: function(results){
        if (results && results.rows && results.rows.length){
            var values = [];
            Ext4.each(results.rows, function(row){
                var sr = new LDK.SelectRowsRow(row);
                values.push(sr.getDisplayValue('groupId/name'));
            }, this);

            if (values.length)
                this.down('#groups').setValue(values.join('<br>'));
        }
        else {
            this.down('#groups').setValue('None');
        }
    },

    appendAssignments: function(results){
        if (results && results.rows && results.rows.length){
            var values = [];
            Ext4.each(results.rows, function(row){
                var sr = new LDK.SelectRowsRow(row);
                var val = sr.getDisplayValue('project/investigatorId/lastName') || '';
                val += ' [' + sr.getDisplayValue('project') + ']';

                if (val)
                    values.push(val);
            }, this);

            if (values.length)
                this.down('#assignments').setValue(values.join('<br>'));
        }
        else {
            this.down('#assignments').setValue('None');
        }
    },

//    appendAssignments: function(results){
//        var columns = [{
//            name: 'project',
//            label: 'Project'
//        },{
//            name: 'project/title',
//            label: 'Title'
//        },{
//            name: 'project/investigatorId/lastName',
//            label: 'Investigator'
//        },{
//            name: 'date',
//            label: 'Assign Date'
//        },{
//            name: 'projectedRelease',
//            label: 'Projected Release Date'
//        }];
//
//        this.down('#assignments').appendTable(results, columns)
//    },

    appendCases: function(results){
        if (results && results.rows && results.rows.length){
            var values = [];
            Ext4.each(results.rows, function(row){
                var sr = new LDK.SelectRowsRow(row);
                var text = sr.getDisplayValue('category');
                if (text){
                    var date = sr.getFormattedDateValue('date', 'Y-m-d');
                    if (date)
                        text = text + ' (' + date + ')';

                    values.push(text);
                }
            }, this);

            if (values.length)
                this.down('#activeCases').setValue(values.join(', '));
        }
        else {
            this.down('#activeCases').setValue('None');
        }
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
            name: 'amountWithUnits',
            label: 'Amount'
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
        if (results && results.rows && results.rows.length){
            var values = [];
            Ext4.each(results.rows, function(row){
                var sr = new LDK.SelectRowsRow(row);
                var flag = sr.getDisplayValue('flag');
                if (flag)
                    flag = Ext4.String.trim(flag);

                var val = sr.getDisplayValue('value');
                var text = val;
                if (flag)
                    text = flag + ': ' + val;

                if (text && flag == 'Alert')
                    text = '<span style="background-color:yellow">' + text + '</span>';

                if (text)
                    values.push(text);
            }, this);

            if (values.length)
            {
                values = Ext4.unique(values);
                this.down('#flags').setValue(values.join('<br>'));
            }
        }
    },

    appendBirthResults: function(results){
        if (results && results.rows && results.rows.length){
            var sr = new LDK.SelectRowsRow(results.rows[0]);
            var text = sr.getFormattedDateValue('date', 'Y-m-d');
            if (text){
                var type = sr.getDisplayValue('type');
                if (type)
                    text = text + ' (' + type + ')';

                if (text)
                    this.down('#birth').setValue(text);
            }
        }
    },

    appendDeathResults: function(results){
        if (results && results.rows && results.rows.length){
            var sr = new LDK.SelectRowsRow(results.rows[0]);
            var text = sr.getFormattedDateValue('date', 'Y-m-d');
            if (text){
                var type = sr.getDisplayValue('cause');
                if (type)
                    text = text + ' (' + type + ')';

                if (text)
                    this.down('#death').setValue(text);
            }
        }
    },

    appendParentageResults: function(results){
        if (results && results.rows && results.rows.length){
            var values = [];
            Ext4.each(results.rows, function(row){
                var sr = new LDK.SelectRowsRow(row);
                var parent = sr.getDisplayValue('parent');
                var relationship = sr.getDisplayValue('relationship');

                if (parent && relationship){
                    var text = relationship + ' - ' + parent;

                    var method = sr.getDisplayValue('method');
                    if (method){
                        text = text + ' (' + method + ')';
                    }

                    values.push(text);
                }
            }, this);

            if (values.length)
                this.down('#parents').setValue(values.join('<br>'));
        }
        else {
            this.down('#parents').setValue('No data');
        }
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

        if (results && results.rows && results.rows.length){
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