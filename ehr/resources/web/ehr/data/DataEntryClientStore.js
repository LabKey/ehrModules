Ext4.define('EHR.data.DataEntryClientStore', {
    extend: 'Ext.data.Store',
    alias: 'store.ehr-dataentryclientstore',
    loaded: true,

    constructor: function(){
        Ext4.apply(this, {

        });

        this.callParent(arguments);
    },

    getFields: function(){
        return this.proxy.reader.model.prototype.fields;
    },

    hasLoaded: function(){
        return this.loaded;
    }
});
