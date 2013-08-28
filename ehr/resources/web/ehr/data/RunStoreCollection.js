/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.data.RunStoreCollection', {
    extend: 'EHR.data.TaskStoreCollection',

    setClientModelDefaults: function(model){
        //TODO: set animalId?
//        if (!model.get('taskid')){
//            model.suspendEvents();
//            model.set('taskid', this.getTaskId());
//            model.resumeEvents();
//        }

        return this.callParent([model]);
    }
});