/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.data.ClinicalEncountersClientStore', {
    extend: 'EHR.data.DataEntryClientStore',

    constructor: function(){
        this.callParent(arguments);

        this.on('add', this.onAddRecord, this);
    },

    onAddRecord: function(store, records){
        Ext4.each(records, function(record){
            this.onRecordUpdate(record, ['procedureid']);
        }, this);
    },

    afterEdit: function(record, modifiedFieldNames){
        this.onRecordUpdate(record, modifiedFieldNames);

        this.callParent(arguments);
    },

    onRecordUpdate: function(record, modifiedFieldNames){
        if (record.get('procedureid')){
            modifiedFieldNames = modifiedFieldNames || [];

            var lookupRec = this.getProcedureRecord(record.get('procedureid'));
            if (!lookupRec)
                return;

            if (lookupRec.get('remark')){
                record.beginEdit();
                record.set('remark', lookupRec.get('remark'));
                record.endEdit(true);
            }
        }

        if (modifiedFieldNames && (modifiedFieldNames.indexOf('Id') > -1 || modifiedFieldNames.indexOf('project') > -1)){
            if (record.get('objectid')){
                var toApply = {
                    Id: record.get('Id'),
                    project: record.get('project')
                };

                this.storeCollection.clientStores.each(function(cs){
                    if (cs.storeId == this.storeCollection.collectionId + '-' + 'encounters'){
                        return;
                    }
                    var hasProject = cs.getFields().get('project') != null;

                    if (cs.getFields().get('parentid')){
                        if (cs.getFields().get('Id') || cs.getFields().get('project')){
                            cs.each(function(r){
                                if (r.get('parentid') === record.get('objectid')){
                                    var obj = Ext4.apply({}, toApply);
                                    if (!hasProject)
                                        delete obj.project;

                                    r.set(obj);
                                }
                            }, this);
                        }
                    }
                }, this);
            }
        }
    },

    getProcedureRecord: function(procedureId){
        var procedureStore = EHR.DataEntryUtils.getProceduresStore();
        LDK.Assert.assertNotEmpty('Unable to find procedureStore from ClinicalEncountersClientStore', procedureStore);
        var procRecIdx = procedureStore.findExact('rowid', procedureId);
        var procedureRec = procedureStore.getAt(procRecIdx);
        LDK.Assert.assertNotEmpty('Unable to find procedure record from ClinicalEncountersClientStore', procedureRec);

        return procedureRec;
    }
});
