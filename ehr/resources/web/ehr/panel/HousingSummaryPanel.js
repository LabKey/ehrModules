/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.panel.HousingSummaryPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ehr-housingsummarypanel',
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

        multi.send(this.onLoad, this);
    },

    onLoad: function(){
        var cfg = {
            defaults: {
                border: false
            },
            items: []
        };

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

    appendSection: function(results, cfg){
        if (!results || !results.rows || !results.rows.length){
            return {
                html: 'There was an error loading data'
            }
        }

        var total = 0;
        if (cfg.sumField){
            Ext4.each(results.rows, function(r){
                var row = new LDK.SelectRowsRow(r);
                total += row.getValue(cfg.sumField);
            }, this);
        }
        var cells = [];
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

                cells.push({
                    html: val + '',
                    border: false,
                    style: 'padding: 2px;padding-right: 5px;'
                });
            }, this);

            if (cfg.sumField){
                var pct =  (row.getValue(cfg.sumField) / total) * 100;
                pct = Ext4.util.Format.round(pct, 2);
                pct = pct.toString();

                cells.push({
                    html: '(' + pct + '%)',
                    border: false,
                    style: 'padding: 2px;padding-right: 5px;'
                })
            }
        }, this);

        return {
            border: false,
            defaults: {
                border: false
            },
            style: 'padding: 5px;',
            items: [{
                html: '<b>' + cfg.header + ':</b><hr>'
            },{
                border: false,
                style: 'padding-left: 5px;',
                layout: {
                    type: 'table',
                    columns: cfg.columns.length + (cfg.sumField ? 1 : 0)
                },
                items: cells
            }]
        }
    }
});














Ext4.define('EHR.panel.RoomUtilizationPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ehr-roomutilizationpanel',
    initComponent: function(){
        Ext4.apply(this, {
            style: 'padding: 5px',
            border: false,
            defaults: {
                border: false
            },
            items: [{
                xtype: 'grid',
                columns: [{
                    dataIndex: 'room',
                    header: 'Room',
                    width: 200
                },{
                    dataIndex: 'AvailableCages',
                    id: 'availCagesCol',
                    text: 'Total Cages',
                    width: 200,
                    summaryType: 'sum'
                },{
                    dataIndex: 'CagesEmpty',
                    id: 'cagesEmptyCol',
                    text: 'Empty Cages',
                    width: 200,
                    summaryType: 'sum'
                },{
                    dataIndex: 'pctUsed',
                    id: 'pctCol',
                    text: '% Used',
                    width: 200,
                    summaryType: 'sum',
                    summaryRenderer: function(val){
                        if (val){
                            val = Ext4.util.Format.round(val, 1);
                        }
                        return val;
                    }
                },{
                    dataIndex: 'TotalAnimals',
                    text: 'Total Animals',
                    width: 200,
                    renderer: function(value, attrs, rec){
                        var url = LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {schemaName: 'study', 'query.queryName': 'demographics', 'query.viewName': 'Alive, at Center', 'query.Id/curLocation/room~eq': rec.get('room')});
                        return '<a href="' + url + '">' + value + '</a>';
                    },
                    summaryType: 'sum'
                }],
                store: {
                    type: 'labkey-store',
                    schemaName: 'ehr_lookups',
                    queryName: 'roomUtilization',
                    columns: 'room/area,room,TotalAnimals,CagesEmpty,TotalCages,AvailableCages,CagesUsed,pctUsed',
                    filterArray: [LABKEY.Filter.create('room/datedisabled', null, LABKEY.Filter.Types.ISBLANK)],
                    autoLoad: true,
                    groupers: [{
                        property: 'room/area'
                    }]
                },
                features: [{
                    ftype:'groupingsummary',
                    startCollapsed: true,
                    groupHeaderTpl: '{name}',
                    generateSummaryData: function(){
                        var data = Ext4.grid.feature.GroupingSummary.prototype.generateSummaryData.call(this, arguments);
                        for (var group in data){
                            var pct = 1 - (data[group].cagesEmptyCol / data[group].availCagesCol);
                            pct = pct * 100;
                            data[group].pctCol = pct;
                        }

                        return data;
                    }
                }]
            }]
        });

        this.callParent();
    }
});