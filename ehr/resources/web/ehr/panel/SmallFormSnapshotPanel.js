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
        items[0].items.push({
            xtype: 'displayfield',
            style: 'margin-left: 5px;',
            labelWidth: this.defaultLabelWidth,
            fieldLabel: 'Treatments',
            itemId: 'treatments',
            width: 800
        });

        return items;
    },

    appendTreatments: function(results){
        if (results && results.rows && results.rows.length){
            var values = [];
            Ext4.each(results.rows, function(row){
                var sr = new LDK.SelectRowsRow(row);
                var code = sr.getDisplayValue('code');
                var amount = sr.getDisplayValue('amountWithUnits');
                var route = sr.getDisplayValue('route');
                var frequency = sr.getDisplayValue('frequency');
                var enddate = sr.getFormattedDateValue('enddate', 'Y-m-d');

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
                this.down('#treatments').setValue('<table>' + values.join('') + '</table>');
        }
        else {
            this.down('#treatments').setValue('None');
        }
    },

    appendDiet: function(results){
        //ignore for now
    }
});