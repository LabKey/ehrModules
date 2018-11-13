/*
 * Copyright (c) 2013-2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

// This component, like AnimalDetailsPanel.js (which this class borrows some from), is meant to update with useful
// information during data entry. As the animal ID changes, the filter on the QueryWebPart will also change.

Ext4.define('EHR.panel.UpdateableQueryPanel', {
    extend: 'Ext.form.Panel',
    alias: 'widget.ehr-updateablequerypanel',
    cls: 'ehr-snapshotpanel',

    defaultLabelWidth: 120,
    border: false,
    doSuspendLayouts: true,

    initComponent: function(){
        Ext4.apply(this, {
            border: true,
            bodyStyle: 'padding: 5px;',
            minHeight: 285,
            defaults: {
                border: false
            },
            items: []
        });

        this.callParent();

        if (this.dataEntryPanel){
            this.mon(this.dataEntryPanel, 'animalchange', this.onAnimalChange, this, {buffer: 500});
        }

        this.mon(EHR.DemographicsCache, 'cachechange', this.demographicsListener, this);

        this.getQWP('');

        if (this.subjectId){
            this.isLoading = true;
            this.setLoading(true);
            this.loadData();
        }
    },

    demographicsListener: function(animalId){
        if (this.isDestroyed){
            console.log('is destroyed');
            return;
        }

        if (animalId == this.subjectId){
            this.loadAnimal(animalId, true);
        }
    },

    onAnimalChange: function(animalId){
        //the intent of this is to avoid querying partial strings as the user types
        if (animalId && animalId.length < 4){
            animalId = '';
        }

        this.loadAnimal(animalId);
        this.getQWP(animalId);
    },

    getQWP: function(animalId) {
        var filter = LABKEY.Filter.create('Id', animalId, LABKEY.Filter.Types.EQUAL);

        if (!this.myqwp) {
            this.myqwp = Ext4.create('LDK.cmp.QueryComponent', {
                queryConfig: {
                    schemaName: this.schemaName,
                    queryName: this.queryName,
                    viewName: this.viewName,
                    removeableFilters: [filter]
                }
            });
            this.add(this.myqwp);
        }
        else {
            this.myqwp.qwp.replaceFilter(filter);
        }

        return this.myqwp;
    },

    loadAnimal: function(animalId, forceReload){
        if (!forceReload && animalId === this.subjectId){
            return;
        }

        this.subjectId = animalId;

        if (animalId)
            EHR.DemographicsCache.getDemographics([this.subjectId], this.onLoad, this, (forceReload ? 0 : -1));
    },

    loadData: function(){
        EHR.DemographicsCache.getDemographics([this.subjectId], this.onLoad, this);
    },

    onLoad: function(ids, resultMap){
        if (this.isDestroyed){
            return;
        }

        this.afterLoad();
    },

    afterLoad: function(){
        if (this.isLoading){
            this.setLoading(false);
            this.isLoading = false;
        }
    }
});
