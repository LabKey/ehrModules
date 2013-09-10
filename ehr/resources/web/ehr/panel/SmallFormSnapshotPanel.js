/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.panel.SmallFormSnapshotPanel', {
    extend: 'EHR.panel.SnapshotPanel',
    alias: 'widget.ehr-smallformsnapshotpanel',

    showLocationDuration: false,

    initComponent: function(){

        this.defaultLabelWidth = 120;
        this.callParent();
    },

    getItems: function(){
        var items = this.getBaseItems();

        if (!this.redacted){
            items[0].items.push({
                xtype: 'displayfield',
                style: 'margin-left: 5px;',
                labelWidth: this.defaultLabelWidth,
                fieldLabel: 'Medications',
                itemId: 'medications',
                width: 800
            });
        }

        return items;
    },

    appendTreatments: function(results){
        if (results && results.length){
            var values = [];
            Ext4.Array.forEach(results, function(row){
                var code = row['code/meaning'];
                var amount = row.amountWithUnits;
                var route = row.route;
                var frequency = row['frequency/meaning'];
                var category = row.category;
                var enddate = row.enddate ? LDK.ConvertUtils.parseDate(row.enddate).format('Y-m-d') : null;

                var text = '';
                if (code){
                    var style = 'style="padding-right: 15px;"';

                    text +='<td ' + style + '>';
                    text += code;

                    text += '</td><td ' + style + '>';

                    if (amount)
                        text += amount;

                    text += '</td><td ' + style + '>';

                    if (route)
                        text += route;

                    text += '</td><td ' + style + '>';

                    if (frequency)
                        text += frequency;

                    text += '</td><td ' + style + '>';

                    if (enddate)
                        text += 'End: ' + enddate;

                    text += '</td>';
                }

                if (text)
                    values.push('<tr>' + text + '</tr>');
            }, this);

            if (values.length)
                this.safeAppend('#medications', '<table>' + values.join('') + '</table>');
        }
        else {
            this.safeAppend('#medications', 'None');
        }
    },

    appendDiet: function(results){
        //ignore for now
    }
});