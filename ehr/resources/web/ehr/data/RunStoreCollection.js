Ext4.define('EHR.data.EncounterStoreCollection', {
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