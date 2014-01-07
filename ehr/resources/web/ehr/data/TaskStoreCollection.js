/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.data.TaskStoreCollection', {
    extend: 'EHR.data.StoreCollection',

    getTaskId: function(){
        if (this.taskId) {
            return this.taskId;
        }

        var model = this.getServerStoreForQuery('ehr', 'tasks').getAt(0);
        if (model){
            return model.get('taskid');
        }

        console.error('Unable to find taskid');
        return null
    },

    setClientModelDefaults: function(model){
        if (!model.get('taskid')){
            model.suspendEvents();
            model.set('taskid', this.getTaskId());
            model.resumeEvents();
        }

        return this.callParent([model]);
    }
});