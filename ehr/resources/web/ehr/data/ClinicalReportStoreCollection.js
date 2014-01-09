/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.data.ClinicalReportStoreCollection', {
    extend: 'EHR.data.TaskStoreCollection',

    setClientModelDefaults: function(model){
        //set animalId?
        var id = this.getAnimalId();
        if (id){
            model.suspendEvents();
            model.set('Id', id);
            model.resumeEvents();
        }

        return this.callParent([model]);
    },

    getRemarksStore: function(){
        if (this.remarkStore){
            return this.remarkStore;
        }

        this.remarkStore = this.getClientStoreByName('Clinical Remarks');
        LDK.Assert.assertNotEmpty('Unable to find clinical remarks store in ClinicalReportStoreCollection', this.remarkStore);

        return this.remarkStore;
    },

    getAnimalId: function(){
        var remarkStore = this.getRemarksStore();
        if (remarkStore){
            LDK.Assert.assertTrue('More than 1 record found in Clinical remarks store, actual: ' + remarkStore.getCount(), remarkStore.getCount() <= 1);
            if (remarkStore.getCount() == 1){
                return remarkStore.getAt(0).get('Id');
            }
        }

        return null;
    },

    onClientStoreUpdate: function(){
        this.doUpdateRecords();
        this.callParent(arguments);
    },

    doUpdateRecords: function(){
        var newId = this.getAnimalId();
        if (newId !== this._cachedId){
            var remarkStore = this.getRemarksStore();
            this.clientStores.each(function(cs){
                if (cs.storeId == remarkStore.storeId){
                    return;
                }

                if (cs.getFields().get('Id') == null){
                    return;
                }

                cs.each(function(rec){
                    if (rec.get('Id') !== newId){
                        rec.set('Id', newId);
                    }
                }, this);
            }, this);
        }

        this._cachedId = newId;
    }
});