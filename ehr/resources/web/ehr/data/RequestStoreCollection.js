Ext4.define('EHR.data.RequestStoreCollection', {
    extend: 'EHR.data.StoreCollection',

    getRequestId: function(){
        var model = this.getServerStoreForQuery('ehr', 'requests').getAt(0);
        if (model)
            return model.get('requestid');
    },

    setClientModelDefaults: function(model){
        if (!model.get('requestid')){
            model.suspendEvents();
            model.set('requestid', this.getRequestId());
            model.resumeEvents();
        }

        return this.callParent([model]);
    }
});