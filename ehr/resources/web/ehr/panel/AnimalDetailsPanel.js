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

        this.callParent(arguments);

        if (this.dataEntryPanel){
            this.mon(this.dataEntryPanel, 'animalchange', this.loadAnimal, this, {buffer: 200});
        }

        if (this.animalId){
            this.loadAnimal(this.animalId, true);
        }
    },

    loadAnimal: function(animalId, forceReload){
        if (!forceReload && animalId == this.animalId){
            return;
        }

        this.animalId = animalId;

        this.removeAll();
        this.add({
            html: animalId ? 'Loading...' : 'No Id Selected'
        });

        if (animalId)
            EHR.DemographicsCache.getDemographics(this.animalId, this.onDemographicsLoad, this);
    },

    onDemographicsLoad: function(animalId, cache){
        //Id probably changed prior to data loading
        if (animalId != this.animalId){
            return;
        }

        var toAdd;
        if (!cache.demographics){
            toAdd = {
                html: 'Unknown Id: ' + animalId
            }
        }
        else {
            var location = cache.demographics.getDisplayValue('Id/curLocation/room');
            if (cache.demographics.getDisplayValue('Id/curLocation/cage')){
                location += ' / ' + cache.demographics.getDisplayValue('Id/curLocation/cage');
            }
            location = location || 'No record';

            toAdd = {
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
        }

        this.removeAll();
        this.add(toAdd);
    },

    appendFlags: function(toAdd, cache){
        var values = [];
        if (cache.flags && cache.flags.length){
            Ext4.Array.forEach(cache.flags, function(sr){
                var category = sr.getDisplayValue('category');
                var highlight = sr.getValue('category/doHighlight');
                if (category)
                    category = Ext4.String.trim(category);

                var val = sr.getDisplayValue('value');
                var text = val;
                if (category)
                    text = category + ': ' + val;

                if (text && highlight)
                    text = '<span style="background-color:yellow">' + text + '</span>';

                if (text)
                    values.push(text);
            }, this);
        }

        toAdd.items[1].items.push({
            fieldLabel: 'Flags',
            value: values.length ? values.join('<br>') : 'None'
        });
    }
});