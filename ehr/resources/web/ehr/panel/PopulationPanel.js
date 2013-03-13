/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg filterArray
 * @cfg colFields
 * @cfg rowField
 */
Ext4.define('EHR.panel.PopulationPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ehr-populationpanel',
    statics: {
        FIELDS: {
            ageclass: 'Id/ageClass/label',
            species: 'species',
            gender: 'gender'
        }
    },

    initComponent: function(){
        Ext4.apply(this, {
            style: 'padding: 5px',
            border: false,
            defaults: {
                border: false
            },
            items: [{
                html: 'Loading...'
            }]
        });

        this.callParent();
        this.loadData();
    },

    loadData: function(){
        var multi = new LABKEY.MultiRequest();
        multi.add(LABKEY.Query.selectRows, {
            requiredVersion: 9.1,
            schemaName: 'study',
            queryName: 'demographics',
            filterArray: this.filterArray,
            columns: ['Id', EHR.panel.PopulationPanel.FIELDS.ageclass, EHR.panel.PopulationPanel.FIELDS.gender, EHR.panel.PopulationPanel.FIELDS.species].join(','),
            failure: LDK.Utils.getErrorCallback(),
            scope: this,
            success: this.aggregateData
        });

        multi.send(this.onLoad, this);
    },

    getValue: function(row, prop){
        if (!row[prop])
            return null;

        return Ext4.isDefined(row[prop].displayValue) ? row[prop].displayValue : row[prop].value;
    },

    ensureValue: function(map, prop, value){
        if (!map[prop])
            map[prop] = [];
        if (map[prop].indexOf(value) == -1)
            map[prop].push(value);
    },

    getColKey: function(row){
        var tokens = [];
        Ext4.each(this.colFields, function(colField){
            tokens.push(this.getValue(row, colField));
        }, this);
        return tokens.join('<>');
    },

    aggregateData: function(results){
        this.rawData = results.rows;
        this.aggregateData = {
            totalRecords: results.rows.length,
            rowMap: {}
        };
        this.valueMap = {};

        Ext4.each(results.rows, function(row){
            var rowName = this.getValue(row, this.rowField);
            this.ensureValue(this.valueMap, this.rowField, rowName);

            if (rowName){
                if (!this.aggregateData.rowMap[rowName]){
                    this.aggregateData.rowMap[rowName] = {
                        total: 0,
                        children: {},
                        colKeys: {}
                    }
                }

                this.aggregateData.rowMap[rowName].total++;

                var key = this.getColKey(row);
                if (!this.aggregateData.rowMap[rowName].colKeys[key])
                    this.aggregateData.rowMap[rowName].colKeys[key] = 0;

                this.aggregateData.rowMap[rowName].colKeys[key]++;

                var parentNode = this.aggregateData.rowMap[rowName];
                Ext4.each(this.colFields, function(colField){
                    var value = this.getValue(row, colField);
                    this.ensureValue(this.valueMap, colField, value);

                    if (!parentNode.children[value]){
                        parentNode.children[value] = {
                            total: 0,
                            children: {}
                        }

                        parentNode.total++;

                        parentNode = parentNode.children[value];
                    }
                }, this);
            }
        }, this);
    },

//    ageClass: ['Infant', 'Juvenile', 'Adult', 'Senior'],

    onLoad: function(){
        var toAdd = [];

        var populationSummary = {
            border: false,
            defaults: {
                border: false
            },
            items: [{
                html: '<b>Current Population:</b>'
            },{
                html: '<hr>'
            }]
        };

        //header rows.  first add 2 for rowname/total
        var rows = [];
        var repeats = 1;
        var keys = [];
        Ext4.each(this.colFields, function(colName, idx){
            var colspan = this.getColSpan(this.colFields, idx);
            if (idx == 0){
                rows.push({html: ''});
                rows.push({
                    html: 'Total',
                    style: 'border-bottom: solid 1px;text-align: center;margin-right: 3px;margin-left: 3px;'
                });
            }
            else {
                rows.push({html: ''});
                rows.push({html: ''});
            }

            var valueArray = this.valueMap[colName];
            for (var i=0;i<repeats;i++){
                Ext4.each(valueArray, function(header, j){
                    var style = (idx == 0 ? 'margin-right: 3px;margin-left: 3px;border-bottom: solid 1px;' : '') + 'text-align: center;';
console.log(style);
                    rows.push({
                        html: header,
                        style: style,
                        colspan: colspan
                    });
                }, this);
            }

            repeats = repeats * valueArray.length;
        }, this);

        //now append the data rows
        var colKeys = this.generateColKeys();
        var rowNames = this.valueMap[this.rowField];
        Ext4.each(rowNames, function(rowName){
            rows.push({
                html: rowName + ':',
                style: 'padding-left: 10px;padding-bottom:3px;padding-right: 5px;'
            });

            //total count
            var params = {
                schemaName: 'study',
                'query.queryName': 'Demographics',
                'query.viewName': 'Alive, at Center'
            };
            params['query.' + this.rowField + '~eq'] = rowName;
            var url = LABKEY.ActionURL.buildURL('query', 'executeQuery', null, params);
            rows.push({
                html: '<a href="' + url + '">' + this.aggregateData.rowMap[rowName].total + '</a>'
            });

            var parentData = this.aggregateData.rowMap[rowName];
            Ext4.each(colKeys, function(key){
                var value = 0;
                if (parentData.colKeys && parentData.colKeys[key])
                    value = parentData.colKeys[key];

                var params = {schemaName: 'study', 'query.queryName': 'Demographics', 'query.viewName': 'Alive, at Center'};
                var tokens = key.split('<>');

                params['query.' + this.rowField + '~eq'] = rowName;
                Ext4.each(this.colFields, function(colField, idx){
                    params['query.' + colField + '~eq'] = tokens[idx];
                }, this);

                var url = LABKEY.ActionURL.buildURL('query', 'executeQuery', null, params);
                rows.push({
                    html: '<a href="' + url + '">' + value + '</a>',
                    width: 60
                });
            }, this);
        }, this);

//        speciesRows.push({
//            html: 'Population Total:',
//            style: 'padding-left: 10px;'
//        });
//
//        var url = LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {schemaName: 'study', 'query.queryName': 'Demographics', 'query.viewName': 'Alive, at Center'});
//        speciesRows.push({
//            html: '<a href="' + url + '">' + this.colonyPopulationSummary.total + '</a>'
//        });

        populationSummary.items.push({
            layout: {
                type: 'table',
                columns: this.getTotalColumns()
            },
            defaults: {
                border: false,
                style: 'text-align: center;padding: 4px'
            },
            items: rows
        });
        toAdd.push(populationSummary);


        var populationTrends = {
            style: 'padding-top: 20px;',
            border: false,
            defaults: {
                border: false
            },
            items: [{
                html: '<b>Population Trends By Year:</b>'
            },{
                html: '<hr>'
            },{
                xtype: 'container',
                defaults: {
                    border: false
                },
                items: [{
                    xtype: 'numberfield',
                    itemId: 'minYear',
                    fieldLabel: 'Min Year'
                },{
                    xtype: 'numberfield',
                    itemId: 'maxYear',
                    fieldLabel: 'Max Year'
                },{
                    xtype: 'radiogroup',
                    itemId: 'grouping',
                    fieldLabel: 'Grouping',
                    columns: 1,
                    items: [{
                        boxLabel: 'Group By Species and Age',
                        inputValue: 'speciesAndAge'
                    },{
                        boxLabel: 'Group By Species Only',
                        inputValue: 'species',
                        checked: true
                    }]
                },{
                    xtype: 'button',
                    text: 'Reload',
                    border: true,
                    scope: this,
                    handler: function(btn){
                        Ext4.Msg.alert('', 'This section has not yet been enabled');
                    }
                }]
            }]
        };

        toAdd.push(populationTrends);

        this.removeAll();
        this.add(toAdd);

    },

    getTotalColumns: function(){
        var total = 2;
        for (var prop in this.valueMap){
            total += this.valueMap[prop].length;
        }

        return total;
    },

    getColSpan: function(colFields, idx){
        idx++;

        var length = 1;
        for (var i=idx;i<colFields.length;i++){
            var name = colFields[i];
            length = length * this.valueMap[name].length;
        }

        return length;
    },

    generateColKeys: function(){
        var keys = [];
        Ext4.each(this.colFields, function(colField, j){
            var valueArray = this.valueMap[colField];
            var newKeys = [];
            if (!keys.length){
                newKeys = keys.concat(valueArray);
            }
            else {
                Ext4.each(keys, function(key){
                    Ext4.each(valueArray, function(value){
                        newKeys.push(key + '<>' + value);
                    }, this);
                }, this);
            }

            console.log(newKeys);
            keys = newKeys;
        }, this);

        return keys;
    }
});