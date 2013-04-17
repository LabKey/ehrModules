Ext4.define('EHR.panel.SmallFormSnapshotPanel', {
    extend: 'EHR.panel.SnapshotPanel',
    alias: 'widget.ehr-smallformsnapshotpanel',

    showLocationDuration: false,

    initComponent: function(){

        this.defaultLabelWidth = 120;
        this.callParent();
    },

    getItems: function(){
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
            },{
                xtype: 'displayfield',
                style: 'margin-left: 5px;',
                fieldLabel: 'Treatments',
                itemId: 'treatments',
                width: 800
            }]
        }];
    },

    appendProblemList: function(results){
        if (results && results.rows && results.rows.length){
            var values = [];
            Ext4.each(results.rows, function(row){
                var sr = new LDK.SelectRowsRow(row);
                var cat = sr.getDisplayValue('category');
                if (cat)
                    values.push(cat);
            }, this);

            if (values.length)
                this.down('#openProblems').setValue(values.join(', '));
        }
        else {
            this.down('#openProblems').setValue('None');
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

    appendCases: function(results){
        if (results && results.rows && results.rows.length){
            var values = {};
            Ext4.each(results.rows, function(row){
                var sr = new LDK.SelectRowsRow(row);
                var cat = sr.getDisplayValue('category');
                if (cat){
                    if (!values[cat])
                        values[cat] = 0;

                    values[cat]++;
                }
            }, this);

            var distinct = Ext4.Object.getKeys(values);
            distinct = distinct.sort();
            var text = [];
            Ext4.each(distinct, function(t){
                text.push(t + ' (' + values[t] + ')');
            }, this);

            if (text.length)
                this.down('#activeCases').setValue(text.join(', '));
        }
        else {
            this.down('#activeCases').setValue('None');
        }
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