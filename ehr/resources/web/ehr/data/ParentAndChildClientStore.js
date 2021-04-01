/**
 * Some forms have a procedure as their top-level entity, with a child entity that itself has children. For example,
 * a bacterial culture might be modeled via a procedure with a row in the Bacterial Culture dataset, with SNOMED coding
 * and other results. This section is appropriate for the middle tier of the hierarchy, and ensures that the animal
 * ID, date, and other fields entered at the procedure level are propagated through all the tiers.
 */
Ext4.define('EHR.data.ParentAndChildClientStore', {
    extend: 'EHR.data.ParentClientStore',

    insert: function(index, records) {
        var ret = this.callParent(arguments);

        // after insert of a new, track down the parent record to get the fields to inherit
        if (this.sectionCfg && this.sectionCfg.extraProperties && this.sectionCfg.extraProperties.parentQueryName) {
            var parentQuery = this.sectionCfg.extraProperties.parentQueryName;
            var parentStore = this.storeCollection.getClientStoreByName(parentQuery);
            var parentRecord = parentStore ? parentStore.getAt(0) : null;
            if (parentRecord && Ext4.isFunction(parentStore.onRecordUpdate)) {
                // get the set of inherited field names
                var inheritFieldNames = [];
                Ext4.each(this.getFields().items, function(field) {
                    if (field.inheritFromParent) {
                        inheritFieldNames.push(field.name);
                    }
                });

                parentStore.onRecordUpdate(parentRecord, inheritFieldNames);
            }
        }

        return ret;
    },

    shouldSetParentId: function(childRecord, parentFieldName, parentId) {
        // Only used for 1:1 connections to the parent record (since both are using a form panel instead of a grid),
        // so we always want to keep in sync
        return childRecord.get(parentFieldName) !== parentId;
    }
});

