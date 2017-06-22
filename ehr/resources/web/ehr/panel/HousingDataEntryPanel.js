/*
 * Copyright (c) 2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.panel.HousingDataEntryPanel', {
    extend: 'EHR.panel.TaskDataEntryPanel',
    alias: 'widget.ehr-housingdataentrypanel',
    controllerName: null,

    onStoreCollectionCommitComplete: function(sc, extraContext){
        if (Ext4.Msg.isVisible())
            Ext4.Msg.hide();

        //Modified 6-5-2015 Blasa Note: provided a process to evaluate contents of store
        var store = sc.getClientStoreByName('housing');
        LDK.Assert.assertNotEmpty('Unable to find housing store in HousingDataEntryPanel', store);

        if (extraContext && extraContext.successURL  && store.getCount() > 0){
            Ext4.Msg.confirm('Success', 'Do you want to view to room layout now?  This will allow you to verify and/or change dividers', function(val){
                window.onbeforeunload = Ext4.emptyFn;
                if (val == 'yes'){

                    var rooms = [];
                    store.each(function(r){
                        if (r.get('room') && rooms.indexOf(r.get('room')) == -1){
                            rooms.push(r.get('room'));
                        }
                    }, this);

                    if(this.controllerName == null){
                        Ext4.Msg.alert('Optional', 'Client implementation is required for this feature.',function () {
                            window.location = extraContext.successURL;
                        });
                    }
                    else {
                        window.location = LABKEY.ActionURL.buildURL(this.controllerName, 'printRoom', null, {rooms: rooms});
                    }
                }
                else {
                    window.location = extraContext.successURL;
                }
            }, this);

            return;
        }

        this.callParent(arguments);
    }
});