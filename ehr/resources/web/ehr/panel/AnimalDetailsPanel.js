/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.panel.AnimalDetailsPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ehr-animaldetailspanel',

    initComponent: function(){
        Ext4.apply(this, {
            border: true,
            bodyStyle: 'padding: 5px;',
            minHeight: 200,
            defaults: {
                border: false
            }
        });

        if (!this.animalId){
            this.items = [{
                html: 'No Id Selected'
            }]
        }

        this.callParent(arguments);

        if (this.dataEntryPanel){
            this.mon(this.dataEntryPanel, 'animalselect', this.loadAnimal, this);
        }

        if (this.animalId)
            this.loadAnimal(this.animalId);
    },

    cachedData: {},

    loadAnimal: function(animalId){
        if (animalId == this.animalId){
            return;
        }

        this.animalId = animalId;

        //reuse cached info if less than 10 secs old
        if (this.cachedData[animalId]){
            var ms = (new Date()) - this.cachedData[animalId].loadTime;
            if (ms < 10000){
                console.log('using cached data');
                this.loadRow(animalId);
                return;
            }
        }
        this.removeAll();
        this.add({
            html: 'Loading...'
        });

        var multi = new LABKEY.MultiRequest();
        var cache = {};

        multi.add(LABKEY.Query.selectRows, {
            schemaName: this.schemaName || 'study',
            queryName: this.queryName || 'demographics',
            viewName: this.viewName || 'Clinical Summary',
            filterArray: [LABKEY.Filter.create('Id', this.animalId, LABKEY.Filter.Types.EQUAL)],
            scope: this,
            success: function(results){
                if (results && results.rows && results.rows.length){
                    cache.demographics = new LDK.SelectRowsRow(results.rows[0]);
                }
            },
            failure: LDK.Utils.getErrorCallback(),
            requiredVersion: 9.1
        });

        multi.add(LABKEY.Query.selectRows, {
            schemaName: this.schemaName || 'study',
            queryName: this.queryName || 'flags',
            columns: 'Id,date,category,value',
            filterArray: [
                LABKEY.Filter.create('Id', this.animalId, LABKEY.Filter.Types.EQUAL),
                LABKEY.Filter.create('isActive', true, LABKEY.Filter.Types.EQUAL)
            ],
            scope: this,
            success: function(results){
                cache.flags = [];

                if (results && results.rows && results.rows.length){
                    Ext4.Array.forEach(results.rows, function(r){
                        cache.flags.push(new LDK.SelectRowsRow(r));
                    }, this);
                }
            },
            failure: LDK.Utils.getErrorCallback(),
            requiredVersion: 9.1
        });

        multi.send(this.getProcessCallback(this.animalId, cache), this);
    },

    getProcessCallback: function(animalId, cache){
        return function(){
            if (!cache.demographics){
                this.cachedData[animalId] = {
                    loadTime: new Date(),
                    toAdd: {
                        html: 'Unknown Id: ' + animalId
                    }
                }
            }
            else {
                var location = cache.demographics.getDisplayValue('Id/curLocation/room');
                if (cache.demographics.getDisplayValue('Id/curLocation/cage')){
                    location += ' / ' + cache.demographics.getDisplayValue('Id/curLocation/cage');
                }
                location = location || 'No record';


                var toAdd = {
                    layout: 'column',
                    defaults: {
                        border: false,
                        bodyStyle: 'padding-right: 20px;'
                    },
                    items: [{
                        minWidth: 320,
                        defaults: {
                            xtype: 'displayfield',
                            labelWidth: 150
                        },
                        items: [{
                            fieldLabel: 'Id',
                            value: cache.demographics.getDisplayValue('Id')
                        },{
                            fieldLabel: 'Location',
                            value: location
                        },{
                            fieldLabel: 'Gender',
                            value: cache.demographics.getDisplayValue('gender')
                        },{
                            fieldLabel: 'Species',
                            value: cache.demographics.getDisplayValue('species')
                        },{
                            fieldLabel: 'Age',
                            value: cache.demographics.getDisplayValue('Id/age/AgeFriendly')
                        },{
                            fieldLabel: 'Projects and Groups',
                            value: (cache.demographics.getDisplayValue('Id/activeAssignments/projects') || 'None')
                        }]
                    },{
                        defaults: {
                            xtype: 'displayfield'
                        },
                        items: [{
                            fieldLabel: 'Status',
                            value: '<span ' + (cache.demographics.getDisplayValue('calculated_status') != 'Alive' ? 'style="background-color:yellow"' : '') + '>' + cache.demographics.getDisplayValue('calculated_status') + '</span>'
                        }]
                    }]
                };

                this.appendFlags(toAdd, cache);
                this.cachedData[animalId] = {
                    loadTime: new Date(),
                    toAdd: toAdd
                }
            }

            this.loadRow(animalId);
        }
    },

    appendFlags: function(toAdd, cache){
        var values = [];
        if (cache.flags && cache.flags.length){
            Ext4.Array.forEach(cache.flags, function(sr){
                var flag = sr.getDisplayValue('category');
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
        }

        toAdd.items[1].items.push({
            fieldLabel: 'Flags',
            value: values.length ? values.join('<br>') : 'None'
        });
    },

    loadRow: function(animalId){
        this.removeAll();
        this.add(this.cachedData[animalId].toAdd);
    }
});