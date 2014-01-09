/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.data.EncounterStoreCollection', {
    extend: 'EHR.data.TaskStoreCollection',

    getEncountersStore: function(){
        if (this.encountersStore){
            return this.encountersStore;
        }

        this.encountersStore = this.getClientStoreByName('encounters');
        LDK.Assert.assertNotEmpty('Unable to find clinical encounters store in EncountersStoreCollection', this.encountersStore);

        return this.encountersStore;
    },

    getEncountersRecord: function(parentid){
        if (!parentid){
            return null;
        }

        var encountersStore = this.getEncountersStore();
        var er;
        encountersStore.each(function(r){
            if (r.get('objectid') == parentid){
                er = r;
                return false;
            }
        }, this);

        return er;
    },

    onClientStoreUpdate: function(){
        this.doUpdateRecords();
        this.callParent(arguments);
    },

    doUpdateRecords: function(){
        var encountersStore = this.getEncountersStore();
        this.clientStores.each(function(cs){
            if (cs.storeId == encountersStore.storeId){
                return;
            }

            if (cs.getFields().get('Id') == null || cs.getFields().get('parentid') == null){
                return;
            }

            var hasProject = cs.getFields().get('project') != null;
            cs.each(function(rec){
                var encountersRec = this.getEncountersRecord(rec.get('parentid'));
                if (encountersRec != null){
                    var obj = {
                        Id: encountersRec.get('Id')
                    };

                    if (hasProject){
                        obj.project = encountersRec.get('project');
                    }

                    rec.set(obj);
                }
            }, this);
        }, this);
    }
});