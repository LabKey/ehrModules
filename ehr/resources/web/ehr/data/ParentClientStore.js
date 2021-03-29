/*
 * Copyright (c) 2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

Ext4.define('EHR.data.ParentClientStore', {
    extend: 'EHR.data.DataEntryClientStore',

    constructor: function(){
        this.callParent(arguments);
        this.on('add', this.onAddRecord, this);
    },

    onAddRecord: function(store, records){
        Ext4.each(records, function(record){
            this.onRecordUpdate(record, ['objectid']);
        }, this);
    },

    afterEdit: function(record, modifiedFieldNames){
        this.onRecordUpdate(record, modifiedFieldNames);
        this.callParent(arguments);
    },

    isParentOf: function(childStore) {
        var parentQueryName = childStore.sectionCfg.extraProperties.parentQueryName;
        if (!parentQueryName) {
            return true;
        }
        var result = false;
        Ext4.each(this.sectionCfg.queries, function(queryInfo) {
            if (queryInfo.queryName === parentQueryName) {
                result = true;
            }
        });
        return result;
    },

    shouldSetParentId: function(childRecord, parentFieldName, parentId) {
        return childRecord.get(parentFieldName) == null;
    },

    onRecordUpdate: function(parentRecord, modifiedFieldNames){
        var parentObjectId = parentRecord.get('objectid');
        if (parentObjectId && Ext4.isArray(modifiedFieldNames)) {
            // iterate through each of the client stores (i.e. sections) in the form
            this.storeCollection.clientStores.each(function(childStore) {

                // find the client stores which are set to track ParentChild relationships
                var isParentChild = childStore.model.prototype.sectionCfg.configSources &&
                        childStore.model.prototype.sectionCfg.configSources.indexOf('ParentChild') > -1 &&
                        this.isParentOf(childStore);
                if (isParentChild) {
                    var parentFieldName = this.getParentFieldName(childStore);
                    var hasParentField = childStore.getFields().get(parentFieldName) != null;
                    if (!hasParentField) {
                        return true; //continue
                    }

                    // keep specific fields in sync between the parent and child (where source metadata has inheritFromParent=true)
                    var hasChanges = false;
                    Ext4.Array.each(childStore.getRange(), function(childRecord) {
                        // if the child record does not currently have a parent id, set it now
                        if (this.shouldSetParentId(childRecord, parentFieldName, parentObjectId)) {
                            childRecord.set(parentFieldName, parentObjectId);
                            hasChanges = true;
                        }

                        if (childRecord.get(parentFieldName) === parentObjectId) {
                            Ext4.each(modifiedFieldNames, function(fieldName) {
                                var childField = childStore.getFields().get(fieldName);
                                if (childField != null && childField.inheritFromParent) {
                                    childRecord.set(fieldName, parentRecord.get(fieldName));
                                    hasChanges = true;
                                }
                            }, this);
                        }
                    }, this);

                    if (hasChanges){
                        childStore.fireEvent('datachanged', childStore);
                    }
                }
            }, this);
        }
    },

    getParentFieldName: function(store) {
        var parentFieldName = 'parentid';

        if (store) {
            Ext4.each(store.getFields().items, function(field) {
                if (field.isParentField) {
                    parentFieldName = field.name;
                    return false; //break
                }
            });
        }

        return parentFieldName;
    }
});
