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
                    },{
                        xtype: 'displayfield',
                        fieldLabel: 'Source',
                        itemId: 'source'
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
            headerLabel: 'Prescribed Diets',
            emptyText: 'There are no active diets'
        }]);

        return items;
    },

    loadData: function(){
        EHR.Utils.getDemographics({
            ids: [this.subjectId],
            failure: LDK.Utils.getErrorCallback(),
            success: this.onLoad,
            scope: this
        });

//        var multi = new LABKEY.MultiRequest();
//
//        multi.add(LABKEY.Query.selectRows, {
//            schemaName: 'study',
//            queryName: 'demographics',
//            columns: 'Id,Id/curLocation/area,Id/curLocation/room,Id/curLocation/cage,Id/curLocation/date,Id/age/yearAndDays,gender,species,geographic_origin,calculated_status,dam,sire',
//            filterArray: [LABKEY.Filter.create('Id', this.subjectId, LABKEY.Filter.Types.EQUAL)],
//            failure: LDK.Utils.getErrorCallback(),
//            requiredVersion: 9.1,
//            scope: this,
//            success: function(results){
//                this.demographicsResults = results;
//            }
//        });
//
//        multi.add(LABKEY.Query.selectRows, {
//            schemaName: 'study',
//            queryName: 'parentageSummary',
//            sort: 'Id,relationship',
//            columns: 'Id,date,parent,relationship,method',
//            filterArray: [LABKEY.Filter.create('Id', this.subjectId, LABKEY.Filter.Types.EQUAL)],
//            failure: LDK.Utils.getErrorCallback(),
//            requiredVersion: 9.1,
//            scope: this,
//            success: function(results){
//                this.parentageResults = results;
//            }
//        });
//
//        multi.add(LABKEY.Query.selectRows, {
//            schemaName: 'study',
//            queryName: 'demographicsSource',
//            columns: 'Id,type,source',
//            filterArray: [LABKEY.Filter.create('Id', this.subjectId, LABKEY.Filter.Types.EQUAL)],
//            failure: LDK.Utils.getErrorCallback(),
//            requiredVersion: 9.1,
//            scope: this,
//            success: function(results){
//                this.sourceResults = results;
//            }
//        });
//
//        multi.add(LABKEY.Query.selectRows, {
//            schemaName: 'study',
//            queryName: 'assignment',
//            requiredVersion: 9.1,
//            columns: 'Id,date,enddate,projectedRelease,project,project/protocol,project/title,project/investigatorId,project/investigatorId/firstName,project/investigatorId/lastName',
//            filterArray: [
//                LABKEY.Filter.create('Id', this.subjectId, LABKEY.Filter.Types.EQUAL),
//                LABKEY.Filter.create('isActive', true, LABKEY.Filter.Types.EQUAL)
//            ],
//            failure: LDK.Utils.getErrorCallback(),
//            scope: this,
//            success: function(results){
//                this.assignmentResults = results;
//            }
//        });
//
//        multi.add(LABKEY.Query.selectRows, {
//            schemaName: 'ehr',
//            queryName: 'animal_group_members',
//            requiredVersion: 9.1,
//            columns: 'Id,date,enddate,groupId/name',
//            filterArray: [
//                LABKEY.Filter.create('Id', this.subjectId, LABKEY.Filter.Types.EQUAL),
//                LABKEY.Filter.create('isActive', true, LABKEY.Filter.Types.EQUAL)
//            ],
//            failure: LDK.Utils.getErrorCallback(),
//            scope: this,
//            success: function(results){
//                this.groupResults = results;
//            }
//        });
//
//        multi.add(LABKEY.Query.selectRows, {
//            schemaName: 'study',
//            queryName: 'demographicsMostRecentTBDate',
//            columns: 'Id,MostRecentTBDate,MonthsSinceLastTB,MonthsUntilDue',
//            requiredVersion: 9.1,
//            filterArray: [
//                LABKEY.Filter.create('Id', this.subjectId, LABKEY.Filter.Types.EQUAL)
//            ],
//            failure: LDK.Utils.getErrorCallback(),
//            scope: this,
//            success: function(results){
//                this.tbResults = results;
//            }
//        });
//
//        multi.add(LABKEY.Query.selectRows, {
//            schemaName: 'study',
//            queryName: 'Problem List',
//            columns: 'Id,date,enddate,category',
//            requiredVersion: 9.1,
//            filterArray: [
//                LABKEY.Filter.create('Id', this.subjectId, LABKEY.Filter.Types.EQUAL),
//                LABKEY.Filter.create('isActive', true, LABKEY.Filter.Types.EQUAL)
//            ],
//            failure: LDK.Utils.getErrorCallback(),
//            scope: this,
//            success: function(results){
//                this.problemListResults = results;
//            }
//        });
//
//        multi.add(LABKEY.Query.selectRows, {
//            schemaName: 'study',
//            queryName: 'Treatment Orders',
//            columns: 'Id,date,amount,amount_units,amountWithUnits,category,daysElapsed,enddate,performedby,code,route,frequency,category',
//            requiredVersion: 9.1,
//            filterArray: [
//                LABKEY.Filter.create('Id', this.subjectId, LABKEY.Filter.Types.EQUAL),
//                LABKEY.Filter.create('isActive', true, LABKEY.Filter.Types.EQUAL)
//            ],
//            failure: LDK.Utils.getErrorCallback(),
//            scope: this,
//            success: function(results){
//                this.treatmentResults = results;
//            }
//        });
//
//        multi.add(LABKEY.Query.selectRows, {
//            schemaName: 'study',
//            queryName: 'Cases',
//            columns: 'Id,date,enddate,category,performedby,remark,description',
//            requiredVersion: 9.1,
//            filterArray: [
//                LABKEY.Filter.create('Id', this.subjectId, LABKEY.Filter.Types.EQUAL),
//                LABKEY.Filter.create('isActive', true, LABKEY.Filter.Types.EQUAL)
//            ],
//            failure: LDK.Utils.getErrorCallback(),
//            scope: this,
//            success: function(results){
//                this.caseResults = results;
//            }
//        });
//
//        multi.add(LABKEY.Query.selectRows, {
//            schemaName: 'study',
//            queryName: 'diet',
//            requiredVersion: 9.1,
//            filterArray: [
//                LABKEY.Filter.create('Id', this.subjectId, LABKEY.Filter.Types.EQUAL),
//                LABKEY.Filter.create('isActive', true, LABKEY.Filter.Types.EQUAL)
//            ],
//            failure: LDK.Utils.getErrorCallback(),
//            scope: this,
//            success: function(results){
//                this.dietResults = results;
//            }
//        });
//
//        multi.add(LABKEY.Query.selectRows, {
//            schemaName: 'study',
//            queryName: 'Flags',
//            columns: 'date,enddate,performedby,category,value,category/doHighlight',
//            requiredVersion: 9.1,
//            filterArray: [
//                LABKEY.Filter.create('Id', this.subjectId, LABKEY.Filter.Types.EQUAL),
//                LABKEY.Filter.create('isActive', true, LABKEY.Filter.Types.EQUAL),
//                LABKEY.Filter.create('category/omitFromOverview', true, LABKEY.Filter.Types.NEQ_OR_NULL)
//            ],
//            failure: LDK.Utils.getErrorCallback(),
//            scope: this,
//            success: function(results){
//                this.flagsResults = results;
//            }
//        });
//
//        multi.add(LABKEY.Query.selectRows, {
//            schemaName: 'study',
//            queryName: 'weight',
//            columns: 'Id,date,weight',
//            sort: '-date',
//            requiredVersion: 9.1,
//            maxRows: 3,
//            filterArray: [
//                LABKEY.Filter.create('Id', this.subjectId, LABKEY.Filter.Types.EQUAL)
//            ],
//            failure: LDK.Utils.getErrorCallback(),
//            scope: this,
//            success: function(results){
//                this.weightResults = results;
//            }
//        });
//
//        if (this.showExtendedInformation){
//            //only load this data if being displayed
//            if (this.down('#roommates')){
//                multi.add(LABKEY.Query.selectRows, {
//                    schemaName: 'study',
//                    queryName: 'demographicsPaired',
//                    columns: 'Id,total,Animals',
//                    requiredVersion: 9.1,
//                    filterArray: [
//                        LABKEY.Filter.create('Id', this.subjectId, LABKEY.Filter.Types.EQUAL)
//                    ],
//                    failure: LDK.Utils.getErrorCallback(),
//                    scope: this,
//                    success: function(results){
//                        this.roommateResults = results;
//                    }
//                });
//            }
//
//            multi.add(LABKEY.Query.selectRows, {
//                schemaName: 'study',
//                queryName: 'Birth',
//                columns: 'Id,date,type,cond',
//                requiredVersion: 9.1,
//                filterArray: [
//                    LABKEY.Filter.create('Id', this.subjectId, LABKEY.Filter.Types.EQUAL)
//                ],
//                failure: LDK.Utils.getErrorCallback(),
//                scope: this,
//                success: function(results){
//                    this.birthResults = results;
//                }
//            });
//
//            multi.add(LABKEY.Query.selectRows, {
//                schemaName: 'study',
//                queryName: 'Deaths',
//                columns: 'Id,date,cause',
//                requiredVersion: 9.1,
//                filterArray: [
//                    LABKEY.Filter.create('Id', this.subjectId, LABKEY.Filter.Types.EQUAL)
//                ],
//                failure: LDK.Utils.getErrorCallback(),
//                scope: this,
//                success: function(results){
//                    this.deathResults = results;
//                }
//            });
//        }
//
//        multi.send(this.onAllComplete, this);
    },

    onLoad: function(results){
        this.results = results.results[this.subjectId];

        this.onAllComplete();
    },

    onAllComplete: function(){
        Ext4.suspendLayouts();

        this.appendDemographicsResults(this.results);
        this.appendWeightResults(this.results.weights);

        if (this.results.cagemates)
            this.appendRoommateResults(this.results.cagemates);

        this.appendProblemList(this.results.activeProblems);
        this.appendAssignments(this.results.activeAssignments);
        this.appendGroups(this.results.activeAnimalGroups);
        this.appendSourceResults(this.results.source);
        this.appendTreatments(this.results.activeTreatments);
        this.appendCases(this.results.activeCases);

        this.appendFlags(this.results.activeFlags);
        this.appendTBResults(this.results.tb);

        if (this.showExtendedInformation){
            this.appendBirthResults(this.results.birthInfo);
            this.appendDeathResults(this.results.deathInfo);
            this.appendParentageResults(this.results.parents);
        }
        this.afterLoad();

        Ext4.resumeLayouts();
        this.doLayout();
    },

    appendTBResults: function(results){
        if (results && results.length){
            var row = results[0];

            if (!Ext4.isEmpty(row.MostRecentTBDate)){
                var value = LDK.ConvertUtils.parseDate(row.MostRecentTBDate).format('Y-m-d');
                var months = row.MonthsSinceLastTB;
                if (months)
                    value += ' (' + months + ' month' + (months == 1 ? '' : 's') + ' ago)';

                this.down('#lastTB').setValue(value);
            }
            else {
                this.down('#lastTB').setValue('Never');
            }
        }
    },

    appendSourceResults: function(results){
        if (results && results.length){
            var field = this.down('#source');

            var text = results[0].type;
            field.setValue(text);
        }
    },

    appendDemographicsResults: function(row){
        if (!row){
            console.log('Id not found');
            return;
        }

        Ext4.each(['calculated_status', 'species', 'geographic_origin'], function(name){
            if (row[name]){
                var field = this.down('#' + name);
                if (field)
                    field.setValue(row[name]);
            }
        }, this);

        if (!Ext4.isEmpty(row['gender/meaning'])){
            this.down('#gender').setValue(row['gender/meaning']);
        }

        if (!Ext4.isEmpty(row['Id/age/yearAndDays'])){
            this.down('#age').setValue(row['Id/age/yearAndDays']);
        }

        if (row.activeHousing && row.activeHousing.length){
            var housingRow = row.activeHousing[0];
            var location = '';
            if (!Ext4.isEmpty(housingRow['room']))
                location = housingRow['room'];
            if (!Ext4.isEmpty(housingRow['cage']))
                location += ' / ' + housingRow['cage'];

            if (location){
                if (this.showLocationDuration && housingRow.date){
                    var date = LDK.ConvertUtils.parseDate(housingRow.date);
                    if (date)
                        location += ' (' + date.format('Y-m-d') + ')';
                }

                this.down('#location').setValue(location);
            }
            else
                this.down('#location').setValue('No active housing');
        }
    },

    getTargetString: function(){
        return this.hrefTarget ? ' target="' + this.hrefTarget + '"' : '';
    },

    appendProblemList: function(results){
        if (results){
            var values = [];
            Ext4.each(results, function(row){
                var text = row.category;
                if (text){
                    var date = LDK.ConvertUtils.parseDate(row.date);
                    if (date)
                        text = text + ' (' + date.format('Y-m-d') + ')';

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
        if (results){
            var rows = [];
            var prevRow;
            Ext4.each(results, function(row){
                var newRow = {
                    weight: row.weight,
                    date: LDK.ConvertUtils.parseDate(row.date)
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
        var field = this.down('#roommates');
        if (!field)
            return;

        if (results){
            this.down('#roommates').setValue(row.total);
        }
        else {
            this.down('#roommates').setValue(0)
        }
    },

    appendGroups: function(results){
        if (results){
            var values = [];
            Ext4.each(results, function(row){
                values.push(row['groupId/name']);
            }, this);

            if (values.length)
                this.down('#groups').setValue(values.join('<br>'));
        }
        else {
            this.down('#groups').setValue('None');
        }
    },

    appendAssignments: function(results){
        if (results){
            var values = [];
            Ext4.each(results, function(row){
                var val = row['project/investigatorId/lastName'] || '';
                val += ' [' + row['project/displayName'] + ']';

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

    appendCases: function(results){
        if (results){
            var values = [];
            Ext4.each(results, function(row){
                var text = row.category;
                if (text){
                    var date = LDK.ConvertUtils.parseDate(row.date);
                    if (date)
                        text = text + ' (' + date.format('Y-m-d') + ')';

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

    appendTreatments: function(results){
        if (!results){
            return;
        }

        var treatmentRows = [];
        var dietRows = [];

        Ext4.Array.forEach(results, function(r){
            if (r.category == 'Diet')
                dietRows.push(r);
            else
                treatmentRows.push(r);
        }, this);


        this.appendTreatmentRecords(treatmentRows);
        this.appendDietRecords(dietRows);
    },

    appendTreatmentRecords: function(rows){
        this.down('#treatments').appendTable({
            rows: rows
        }, this.getTreatmentColumns());
    },

    appendDietRecords: function(rows){
        this.down('#diet').appendTable({
            rows: rows
        }, this.getTreatmentColumns());
    },

    getTreatmentColumns: function(){
        return [{
            name: 'code/meaning',
            label: 'Medication'
        },{
            name: 'performedby',
            label: 'Ordered By'
        },{
            name: 'frequency/meaning',
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
            name: 'daysElapsed',
            label: 'Days Elapsed'
        },{
            name: 'enddate',
            label: 'End Date'
        },{
            name: 'remark',
            label: 'Remark'
        },{
            name: 'category',
            label: 'Category'
        }];
    },

    appendFlags: function(results){
        if (results){
            var values = [];
            Ext4.each(results, function(row){
                var category = row.category;
                var highlight = row['category/doHighlight'];

                if (category)
                    category = Ext4.String.trim(category);

                var val = row.value;
                var text = val;
                if (category)
                    text = category + ': ' + val;

                if (text && highlight)
                    text = '<span style="background-color:yellow">' + text + '</span>';

                if (text)
                    values.push(text);
            }, this);

            if (values.length){
                values = Ext4.unique(values);
                this.down('#flags').setValue(values.join('<br>'));
            }
        }
    },

    appendBirthResults: function(results){
        if (results && results.length){
            var row = results[0];
            var date = LDK.ConvertUtils.parseDate(row.date);
            var text = date ?  date.format('Y-m-d') : null;
            if (text){
                var type = row.type;
                if (type)
                    text = text + ' (' + type + ')';

                if (text)
                    this.down('#birth').setValue(text);
            }
        }
    },

    appendDeathResults: function(results){
        if (results && results.length){
            var row = results[0];
            var date = LDK.ConvertUtils.parseDate(row.date);
            var text = date ? date.format('Y-m-d') : null;
            if (text){
                var type = row.cause;
                if (type)
                    text = text + ' (' + type + ')';

                if (text)
                    this.down('#death').setValue(text);
            }
        }
    },

    appendParentageResults: function(results){
        if (results){
            var parentMap = {};
            Ext4.each(results, function(row){
                var parent = row.parent;
                var relationship = row.relationship;

                if (parent && relationship){
                    var text = relationship + ' - ' + parent;

                    if (!parentMap[text])
                        parentMap[text] = [];

                    var method = row.method;
                    if (method){
                        parentMap[text].push(method);
                    }
                }
            }, this);

            var values = [];
            Ext4.Array.forEach(Ext4.Object.getKeys(parentMap).sort(), function(text){
                var method = parentMap[text].join(', ');
                values.push(text + (method ? ' (' + method + ')' : ''));
            }, this);

            if (values.length)
                this.down('#parents').setValue(values.join('<br>'));
        }
        else {
            this.down('#parents').setValue('No data');
        }
    },

    afterLoad: function(){
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
                toAdd.items.push({
                    html: '<i>' + col.label + '</i>'
                });
                colKeys.push(col.name);
            }, this);

            Ext4.Array.forEach(results.rows, function(row){
                Ext4.each(colKeys, function(name){
                    if (!Ext4.isEmpty(row[name])){
                        toAdd.items.push({
                            html: (row[name]) + ''
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
    }
});