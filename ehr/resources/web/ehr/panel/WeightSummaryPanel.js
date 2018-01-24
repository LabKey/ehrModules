/*
 * Copyright (c) 2013-2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg subjectId
 * @cfg showRawData
 * @cfg containerPath
 */
Ext4.define('EHR.panel.WeightSummaryPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ehr-weightsummarypanel',
    cls: 'ehr-weightsummarypanel',

    initComponent: function(){
        Ext4.apply(this, {
            border: false,
            defaults: {
                border: false
            },
            items: [{
                html: '<b>Weight Summary:</b><hr>'
            },{
                itemId: 'summaryArea',
                border: false,
                defaults: {
                    border: false
                }
            }]            
        });
        
        this.callParent();

        this.loadData();
    },

    loadData: function(){
        var filterArray = [LABKEY.Filter.create('Id', this.subjectId, LABKEY.Filter.Types.EQUAL)];

        //first summary
        LABKEY.Query.selectRows({
            containerPath: this.containerPath,
            schemaName: 'study',
            queryName: 'demographicsWeightChange',
            columns: 'id,date,mostRecentWeightDate,mostRecentWeight,daysSinceWeight,minLast30,maxLast30,maxChange30,avgLast30,numLast30,minLast90,maxLast90,avgLast90,maxChange90,numLast90,minLast180,maxLast180,avgLast180,maxChange180,numLast180,minLast365,maxLast365,maxChange365,avgLast365,numLast365,minLast2Years,maxLast2Years,maxChange2Years,avgLast2Years,numLast2Years',
            requiredVersion: 9.1,
            filterArray: filterArray,
            failure: LDK.Utils.getErrorCallback(),
            scope: this,
            success: this.onDataLoad
        });
    },
    
    onDataLoad: function(results){
        var target = this.down('#summaryArea');
        if (!target){
            console.log('target panel not present in callback of WeightSummaryPanel.  This may indicate the layout changed before load');
            return;
        }

        target.removeAll();

        if (results.rows && results.rows.length){
            var row = results.rows[0];

            var dateVal = '';
            if (!Ext4.isEmpty(row.MostRecentWeightDate)){
                dateVal = row.MostRecentWeightDate.displayValue || row.MostRecentWeightDate.value;
                dateVal = Ext4.Date.format(new Date(dateVal), LABKEY.extDefaultDateFormat).toString()
                if (!Ext4.isEmpty(row.DaysSinceWeight)){
                    dateVal += ' (' + (row.DaysSinceWeight.displayValue || row.DaysSinceWeight.value) + ' days ago)'
                }
            }

            target.add([{
                defaults: {
                    border: false,
                    style: 'padding: 3px;'
                },
                layout: {
                    type: 'table',
                    columns: 2
                },
                items: [{
                    html: 'Last Weight:'
                },{
                    html: (this.safeAppendRoundedNumber(row, 'MostRecentWeight', ' kg') ? this.safeAppendRoundedNumber(row, 'MostRecentWeight', ' kg') : 'no record')
                },{
                    html: 'Date:'
                },{
                    html: dateVal
                }]
            },{
                border: false,
                style: 'padding-top: 20px',
                defaults: {
                    border: false,
                    style: 'padding: 3px;'
                },
                layout: {
                    type: 'table',
                    columns: 6
                },
                items: [{
                    html: ''
                },{
                    html: '# Weights'
                },{
                    html: 'Avg Weight'
                },{
                    html: 'Min Weight'
                },{
                    html: 'Max Weight'
                },{
                    html: 'Max Pct Change'
                },{
                    html: 'Previous 30 Days:'
                },{
                    html: this.safeAppendNumber(row, 'numLast30')
                },{
                    html: this.safeAppendRoundedNumber(row, 'avgLast30', ' kg')
                },{
                    html: this.safeAppendRoundedNumber(row, 'minLast30', ' kg')
                },{
                    html: this.safeAppendRoundedNumber(row, 'maxLast30', ' kg')
                },{
                    html: this.safeAppendRoundedNumber(row, 'maxChange30', '%')
                },{
                    html: 'Previous 90 Days:'
                },{
                    html: this.safeAppendNumber(row, 'numLast90')
                },{
                    html: this.safeAppendRoundedNumber(row, 'avgLast90', ' kg')
                },{
                    html: this.safeAppendRoundedNumber(row, 'minLast90', ' kg')
                },{
                    html: this.safeAppendRoundedNumber(row, 'maxLast90', ' kg')
                },{
                    html: this.safeAppendRoundedNumber(row, 'maxChange90', '%')
                },{
                    html: 'Previous 180 Days:'
                },{
                    html: this.safeAppendNumber(row, 'numLast180')
                },{
                    html: this.safeAppendRoundedNumber(row, 'avgLast180', ' kg')
                },{
                    html: this.safeAppendRoundedNumber(row, 'minLast180', ' kg')
                },{
                    html: this.safeAppendRoundedNumber(row, 'maxLast180', ' kg')
                },{
                    html: this.safeAppendRoundedNumber(row, 'maxChange180', '%')
                },{
                    html: 'Previous Year:'
                },{
                    html: this.safeAppendNumber(row, 'numLast365')
                },{
                    html: this.safeAppendRoundedNumber(row, 'avgLast365', ' kg')
                },{
                    html: this.safeAppendRoundedNumber(row, 'minLast365', ' kg')
                },{
                    html: this.safeAppendRoundedNumber(row, 'maxLast365', ' kg')
                },{
                    html: this.safeAppendRoundedNumber(row, 'maxChange365', '%')
                },{
                    html: 'Previous 2 Years:'
                },{
                    html: this.safeAppendNumber(row, 'numLast2Years')
                },{
                    html: this.safeAppendRoundedNumber(row, 'avgLast2Years', ' kg')
                },{
                    html: this.safeAppendRoundedNumber(row, 'minLast2Years', ' kg')
                },{
                    html: this.safeAppendRoundedNumber(row, 'maxLast2Years', ' kg')
                },{
                    html: this.safeAppendRoundedNumber(row, 'maxChange2Years', '%')
                }]
            }]);
        }
        else {
            target.add({
                html: 'There are no weight records within the past 90 days'
            });
        }
    },

    // Default rounding. Override this function for different rounding.
    getRoundedNumber: function (value) {
        return Ext4.util.Format.round(value, 2)
    },

    safeAppendNumber: function (row, prop, suffix) {
        if (row[prop] && Ext4.isEmpty(row[prop].value))
            return '';

        return row[prop].value + (suffix ? ' ' + suffix : '');
    },

    safeAppendRoundedNumber: function(row, prop, suffix){
        if (row[prop] && Ext4.isEmpty(row[prop].value))
            return '';

        return this.getRoundedNumber(row[prop].value) + (suffix ? ' ' + suffix : '');
    }
});