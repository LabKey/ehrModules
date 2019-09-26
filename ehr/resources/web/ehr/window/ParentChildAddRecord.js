/*
 * Copyright (c) 2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

// TODO add an implementation of this PARENTCHILDADD which works with the parent being a grid
// allowing the user to select from a window/dialog which parent to associate the child with

EHR.DataEntryUtils.registerGridButton('PARENTCHILDADD', function(config){

    function addChildRow(targetGrid, parentRecord) {
        var store = targetGrid.getStore();

        // find out which field in the targetGrid is the parent field and which are to be inherited from the parent record
        var parentField = 'parentid';
        var model = {};
        Ext4.each(store.getFields().items, function(field) {
            if (field.isParentField) {
                parentField = field.name;
            }

            if (field.inheritFromParent) {
                model[field.name] = parentRecord.get(field.name);
            }
        });

        // set the parent field value to the parent record objectid
        model[parentField] = parentRecord.get('objectid');

        store.add(store.createModel(model));
    }

    return Ext4.Object.merge({
        text: 'Add',
        tooltip: 'Click to add a row associated with the parent record above.',
        handler: function(btn){
            var grid = btn.up('gridpanel');
            if(!grid.store || !grid.store.hasLoaded()){
                console.log('no store or store hasn\'t loaded');
                return;
            }

            var parentQuery = grid.formConfig.extraProperties ? grid.formConfig.extraProperties.parentQueryName : null;
            if (!parentQuery) {
                LABKEY.Utils.alert('Error', 'Missing parentQueryName property for child section configuration.');
                return;
            }

            var panel = grid.up('ehr-dataentrypanel');
            LDK.Assert.assertNotEmpty('Unable to find dataEntryPanel in PARENTCHILDADD button', panel);

            var store = panel.storeCollection.getClientStoreByName(parentQuery);
            LDK.Assert.assertNotEmpty('Unable to find parent store in PARENTCHILDADD button', store);

            var parentRecord = store.getAt(0);
            LDK.Assert.assertNotEmpty('Unable to find parent record in PARENTCHILDADD button', parentRecord);

            addChildRow(grid, parentRecord);
        }
    }, config);
});