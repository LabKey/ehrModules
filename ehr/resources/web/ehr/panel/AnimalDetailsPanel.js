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
                this.loadRow(this.cachedData[animalId]);
            }
        }
        this.removeAll();
        this.add({
            html: 'Loading...'
        });

        LABKEY.Query.selectRows({
            schemaName: this.schemaName || 'study',
            queryName: this.queryName || 'demographics',
            viewName: this.viewName || 'Clinical Summary',
            filterArray: [LABKEY.Filter.create('Id', this.animalId, LABKEY.Filter.Types.EQUAL)],
            scope: this,
            success: this.onLoad,
            failure: LDK.Utils.getErrorCallback(),
            requiredVersion: 9.1
        });
    },

    onLoad: function(results){
        if (results && results.rows && results.rows.length){
            var row = new LDK.SelectRowsRow(results.rows[0]);
            row.loadTime = new Date();

            var Id = row.getDisplayValue('Id');
            this.cachedData[Id] = row;
            this.loadRow(row);
        }
        else {
            this.removeAll();
            this.add({
                html: 'Unknown Id: ' + this.animalId
            });
        }
    },

    loadRow: function(row){
        this.removeAll();
        this.add({
            defaults: {
                xtype: 'displayfield'
            },
            items: [{
                fieldLabel: 'Id',
                value: row.getDisplayValue('Id')
            },{
                fieldLabel: 'Status',
                value: row.getDisplayValue('calculated_status')
            },{
                fieldLabel: 'Gender',
                value: row.getDisplayValue('gender')
            },{
                fieldLabel: 'Age',
                value: row.getDisplayValue('age')
            },{
                fieldLabel: 'Projects',
                value: row.getDisplayValue('Id/activeAssignments/projects')
            }]
        });
    }
});