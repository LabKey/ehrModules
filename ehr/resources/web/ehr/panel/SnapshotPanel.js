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
 * @cfg redacted
 */
Ext4.define('EHR.panel.SnapshotPanel', {
    extend: 'Ext.form.Panel',
    alias: 'widget.ehr-snapshotpanel',

    showLocationDuration: true,
    defaultLabelWidth: 120,
    border: false,

    initComponent: function(){
        Ext4.apply(this, {
            defaults: {
                border: false
            },
            items: this.getItems()
        });

        this.callParent();

        if (this.subjectId){
            this.isLoading = true;
            this.setLoading(true);
            this.loadData();
        }
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
                        //width: 420,
                        itemId: 'location'
                    },{
                        xtype: 'displayfield',
                        hidden: this.redacted,
                        itemId: 'assignments',
                        fieldLabel: 'Projects'
                    },{
                        xtype: 'displayfield',
                        fieldLabel: 'Groups',
                        hidden: this.redacted,
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

        if (this.showExtendedInformation){
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
                        },{
                            xtype: 'displayfield',
                            fieldLabel: 'Pairing Type',
                            itemId: 'pairingType'
                        },{
                            xtype: 'displayfield',
                            fieldLabel: 'Cagemates',
                            itemId: 'cagemates'
                        }]
                    }]
                }]
            }]);
        }

        items[0].items = items[0].items.concat([{
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
        EHR.DemographicsCache.getDemographics([this.subjectId], this.onLoad, this);
    },

    onLoad: function(ids, resultMap){
        Ext4.suspendLayouts();

        this.getForm().reset();
        var id = ids[0];
        var results = resultMap[id];
        if (!results){
            if (id){
                this.safeAppend('#animalId', id);
                this.safeAppend('#calculated_status', '<span style="background-color:yellow">Unknown</span>');
            }

            return;
        }

        this.appendDemographicsResults(results, id);
        this.appendWeightResults(results.getRecentWeights());

        if (results.getCagemates())
            this.appendRoommateResults(results.getCagemates(), id);

        this.appendProblemList(results.getActiveProblems());
        this.appendAssignments(results.getActiveAssignments());
        this.appendAssignmentsAndGroups(results);
        this.appendGroups(results.getActiveAnimalGroups());

        this.appendSourceResults(results.getSourceRecord());
        this.appendTreatments(results.getActiveTreatments());
        this.appendCases(results.getActiveCases());

        this.appendFlags(results.getActiveFlags());
        this.appendTBResults(results.getTBRecord());

        if (this.showExtendedInformation){
            this.appendBirthResults(results.getBirthInfo(), results.getBirth());
            this.appendDeathResults(results.getDeathInfo());
            this.appendParentageResults(results.getParents());
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

                this.safeAppend('#lastTB', value);
            }
            else {
                this.safeAppend('#lastTB', 'Never');
            }
        }
    },

    appendSourceResults: function(results){
        if (results && results.length){
            var text = results[0].type;
            this.safeAppend('#source', text);
        }
    },

    appendDemographicsResults: function(row, id){
        if (!row){
            console.log('Id not found');
            return;
        }

        var animalId = row.getId() || id;
        if (!Ext4.isEmpty(animalId)){
            this.safeAppend('#animalId', animalId);
        }

        var status = row.getCalculatedStatus() || 'Unknown';
        this.safeAppend('#calculated_status', '<span ' + (status != 'Alive' ? 'style="background-color:yellow"' : '') + '>' + status + '</span>');

        if (!Ext4.isEmpty(row.getSpecies())){
            this.safeAppend('#species', row.getSpecies());
        }

        if (!Ext4.isEmpty(row.getGeographicOrigin())){
            this.safeAppend('#geographic_origin', row.getGeographicOrigin());
        }

        if (!Ext4.isEmpty(row.getGender())){
            this.safeAppend('#gender', row.getGender());
        }

        if (!Ext4.isEmpty(row.getAgeInYearsAndDays())){
            this.safeAppend('#age', row.getAgeInYearsAndDays());
        }

        if (row.getActiveHousing() && row.getActiveHousing().length){
            var housingRow = row.getActiveHousing();
            var location = '';
            if (!Ext4.isEmpty(row.getCurrentRoom()))
                location = row.getCurrentRoom();
            if (!Ext4.isEmpty(row.getCurrentCage()))
                location += ' / ' + row.getCurrentCage();

            if (location){
                if (this.showLocationDuration && housingRow.date){
                    var date = LDK.ConvertUtils.parseDate(housingRow.date);
                    if (date)
                        location += ' (' + date.format('Y-m-d') + ')';
                }

                this.safeAppend('#location', location);
            }
            else
                this.safeAppend('#location', 'No active housing');
        }
    },

    safeAppend: function(query, val){
        var el = this.down(query);
        if (el)
            el.setValue(val);
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
                this.safeAppend('#openProblems', values.join(', '));
        }
        else {
            this.safeAppend('#openProblems', 'None');
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

            this.safeAppend('#weights', '<table>' + text.join('') + '</table>');
        }
    },

    appendRoommateResults: function(results, id){
        if (results && results.length){
            var row = results[0];
            this.safeAppend('#pairingType', row.category);

            if (row.animals){
                var animals = row.animals.split(',');
                animals = animals.remove(id);

                if (animals.length > 3){
                    this.safeAppend('#cagemates', animals.length - 1 + ' animals');
                }
                else if (animals.length == 0){
                    this.safeAppend('#cagemates', 'None');
                }
                else {
                    this.safeAppend('#cagemates', animals.join(', '));
                }
            }
        }
        else {
            this.safeAppend('#cagemates', 0);
        }
    },

    appendGroups: function(results){
        if (results){
            var values = [];
            Ext4.each(results, function(row){
                values.push(row['groupId/name']);
            }, this);

            if (values.length)
                this.safeAppend('#groups', values.join('<br>'));
        }
        else {
            this.safeAppend('#groups', 'None');
        }
    },

    appendAssignmentsAndGroups: Ext4.emptyFn,

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
                this.safeAppend('#assignments', values.join('<br>'));
        }
        else {
            this.safeAppend('#assignments', 'None');
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
                this.safeAppend('#activeCases', values.join(', '));
        }
        else {
            this.safeAppend('#activeCases', 'None');
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
        var el = this.down('#treatments');
        if (!el)
            return;

        el.appendTable({
            rows: rows
        }, this.getTreatmentColumns());
    },

    appendDietRecords: function(rows){
        var el = this.down('#diet');
        if (!el)
            return;

        el.appendTable({
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
                var omit = row['category/omitFromOverview'];

                //skip
                if (omit === true)
                    return;

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
                this.safeAppend('#flags', values.join('<br>'));
            }
        }
    },

    appendBirthResults: function(results, birth){
        if (results && results.length){
            var row = results[0];
            var date = LDK.ConvertUtils.parseDate(row.date || birth);
            var text = date ?  date.format('Y-m-d') : null;
            if (text){
                var type = row.type;
                if (type)
                    text = text + ' (' + type + ')';

                if (text)
                    this.safeAppend('#birth', text);
            }
        }
        else if (birth){
            var date = LDK.ConvertUtils.parseDate(birth);
            if (date){
                this.safeAppend('#birth', date.format('Y-m-d'));
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
                    this.safeAppend('#death', text);
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
                this.safeAppend('#parents', values.join('<br>'));
        }
        else {
            this.safeAppend('#parents', 'No data');
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