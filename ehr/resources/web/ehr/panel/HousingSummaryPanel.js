/*
 * Copyright (c) 2013-2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.panel.HousingSummaryPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ehr-housingsummarypanel',

    nounSingular: 'Building',
    nounPlural: 'Buildings',
    headerNames: [],
    cageUsagePanelColumnCount: 4,
    usageTitle: 'Cage Usage',
    usageDescriptionHTML: null,

    initComponent: function(){
        Ext4.apply(this, {
            style: 'padding: 5px',
            border: false,
            defaults: {
                border: false,
                bodyStyle: 'background-color: transparent;'
            },
            items: [{
                html: '<i class="fa fa-spinner fa-pulse"></i> loading...'
            }]
        });

        this.callParent(arguments);
        this.loadData();
    },

    loadData: function(){
        var multi = new LABKEY.MultiRequest();

        multi.add(LABKEY.Query.selectRows, {
            requiredVersion: 9.1,
            schemaName: 'study',
            queryName: 'housingPairingSummary',
            scope: this,
            failure: LDK.Utils.getErrorCallback(),
            success: function(results){
                this.housingPairingSummaryData = results;
            }
        });

        multi.add(LABKEY.Query.selectRows, {
            requiredVersion: 9.1,
            schemaName: 'study',
            queryName: 'housingTypeSummary',
            scope: this,
            failure: LDK.Utils.getErrorCallback(),
            success: function(results){
                this.housingTypeSummaryData = results;
            }
        });

        multi.add(LABKEY.Query.selectRows, {
            requiredVersion: 9.1,
            schemaName: 'ehr_lookups',
            queryName: 'roomUtilizationByBuilding',
            sort: '-pctUsed',
            filterArray: [LABKEY.Filter.create('availableCages', 0, LABKEY.Filter.Types.GT)],
            scope: this,
            failure: LDK.Utils.getErrorCallback(),
            success: function(results){
                this.roomUtilizationByBuildingData = results;
            }
        });

        multi.send(this.onLoad, this);
    },

    onLoad: function(){
        var cfg = {
            defaults: {
                border: false,
                bodyStyle: 'background-color: transparent;'
            },
            items: []
        };

        if (this.roomUtilizationByBuildingData){
            cfg.items.push(this.appendUtilizationSection(this.roomUtilizationByBuildingData));
        }

        if (this.housingTypeSummaryData){
            cfg.items.push(this.appendSection(this.housingTypeSummaryData, {
                header: 'Housing Type Summary',
                columns: ['housingType', 'totalAnimals'],
                sumField: 'totalAnimals'
            }));
        }

        if (this.housingPairingSummaryData){
            cfg.items.push(this.appendSection(this.housingPairingSummaryData, {
                header: 'Pairing Summary',
                columns: ['category', 'totalAnimals'],
                sumField: 'totalAnimals'
            }));
        }

        this.removeAll();
        this.add(cfg);
    },

    appendUtilizationSection: function(results){
        if (!results || !results.rows || !results.rows.length){
            return this.getNoRecordsFoundPanel(this.usageTitle, this.nounPlural);
        }

        var headerNames = this.getCageUsageHeaderNames.call(this);
        var cells = [];

        Ext4.each(headerNames, function(headerName, idx){
            cells.push({
                html: '<b>' + headerName + '</b>',
                border: false,
                style: 'padding: 2px;padding-right: 5px;'
            });
        }, this);

        Ext4.each(results.rows, function(r){
            var row = new LDK.SelectRowsRow(r);

            var area = row.getDisplayValue(this.nounSingular.toLowerCase());
            if (!area){
                area = 'Unknown';
            }

            var urlParams = {
                schemaName: 'ehr_lookups',
                'query.queryName': 'roomUtilization'
            };
            urlParams['query.room/' + this.nounSingular.toLowerCase() + '~eq'] = area;
            var url = LABKEY.ActionURL.buildURL('query', 'executeQuery', null, urlParams);

            cells.push({
                html: '<a target="_blank" href="' + url + '">' + area + ':</a>',
                border: false,
                style: 'padding: 2px;padding-right: 5px;'
            });

            urlParams = this.getAvailableCagesUrlParams(area);
            url = LABKEY.ActionURL.buildURL('query', 'executeQuery', null, urlParams);
            cells.push(EHR.Utils.getFormattedRowNumber(row.getDisplayValue('availableCages'),url,false));

            cells.push(EHR.Utils.getFormattedRowNumber(row.getDisplayValue('cagesEmpty'),null,false));

            this.addAdditionalCells(cells,row);
            cells.push({
                html: Ext4.util.Format.round(row.getDisplayValue('pctUsed'), 2).toFixed(2) + '%',
                border: false,
                style: 'padding: 2px;padding-right: 5px;text-align: right;'
            });
        }, this);

        var items = [];
        if (this.usageDescriptionHTML) {
            items.push({
                border: false,
                html: this.usageDescriptionHTML
            });
        }
        items.push({
            border: false,
            layout: {
                type: 'table',
                columns: this.cageUsagePanelColumnCount
            },
            items: cells
        });

        return Ext4.create('LDK.panel.WebpartPanel', {
            title: LABKEY.Utils.encodeHtml(this.usageTitle),
            useDefaultPanel: true,
            items: items
        });
    },

    getAvailableCagesUrlParams: function (area) {
        var urlParams = {
            schemaName: 'ehr_lookups',
            'query.queryName': 'availableCages',
            'query.isAvailable~eq': true,
            'query.sort': 'cage'
        };
        urlParams['query.room/' + this.nounSingular.toLowerCase() + '~eq'] = area;
        return urlParams;
    },

    addAdditionalCells: function(cells, row){
        return;
    },

    getNoRecordsFoundPanel: function(title, nounPlural) {
        return Ext4.create('LDK.panel.WebpartPanel', {
            title: LABKEY.Utils.encodeHtml(title),
            useDefaultPanel: true,
            items: [{
                border: false,
                html: 'No ' + nounPlural.toLowerCase() + ' were found'
            }]
        });
    },

    appendSection: function(results, cfg){
        if (!results || !results.rows || !results.rows.length){
            return this.getNoRecordsFoundPanel(cfg.header, 'records');
        }

        var total = 0;
        if (cfg.sumField){
            Ext4.each(results.rows, function(r){
                var row = new LDK.SelectRowsRow(r);
                total += row.getValue(cfg.sumField);
            }, this);
        }
        var cells = [];
        Ext4.each(this.headerNames, function(headerName, idx){
            cells.push({
                html: '<b>' + headerName + '</b>',
                border: false,
                style: 'padding: 2px;padding-right: 5px;'
            });
        }, this);
        Ext4.each(results.rows, function(r){
            var row = new LDK.SelectRowsRow(r);

            Ext4.each(cfg.columns, function(col, idx){
                var val = row.getDisplayValue(col);
                if (idx == 0){
                    if (!val)
                        val = 'Unknown';

                    val += ':';
                }

                var url = row.getURL(col);
                if (url)
                    val = '<a target="_blank" href="' + url + '">' + val + '</a>';

                if (Ext4.isNumber(val)) {
                    cells.push(EHR.Utils.getFormattedRowNumber(val,null,false));
                }
                else {
                    cells.push({
                        html: val + '',
                        border: false,
                        style: 'padding: 2px;padding-right: 5px;'
                    });
                }
            }, this);

            if (cfg.sumField){
                var pct =  (row.getValue(cfg.sumField) / total) * 100;
                pct = Ext4.util.Format.round(pct, 2).toFixed(2);
                pct = pct.toString();

                cells.push({
                    html: '(' + pct + '%)',
                    border: false,
                    style: 'padding: 2px;padding-right: 5px;text-align : right'
                })
            }
        }, this);

        return Ext4.create('LDK.panel.WebpartPanel', {
            title: LABKEY.Utils.encodeHtml(cfg.header),
            useDefaultPanel: true,
            items: [{
                border: false,
                layout: {
                    type: 'table',
                    columns: cfg.columns.length + (cfg.sumField ? 1 : 0)
                },
                items: cells
            }]
        });
    },

    getCageUsageHeaderNames: function () {
        return [this.nounSingular, 'Total Cages', 'Empty Cages', '% Used'];
    }
});