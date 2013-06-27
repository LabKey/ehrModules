Ext4.define('EHR.data.EncounterStoreCollection', {
    extend: 'EHR.data.TaskStoreCollection',

    getTaskId: function(){
        var model = this.getServerStoreForQuery('ehr', 'tasks').getAt(0);
        if (model)
            return model.get('taskid');
    },

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