Ext4.define('EHR.window.CopyRequestWindow', {
    extend: 'EHR.window.CopyTaskWindow',
    title: 'Copy Previous Request',
    noun: 'Request',
    queryName: 'requests',

    initComponent: function(){
        Ext4.apply(this, {

        });

        this.callParent(arguments);
    }
});

EHR.DataEntryUtils.registerDataEntryFormButton('COPY_REQUEST', {
    text: 'Copy Previous Request',
    name: 'copyFromRequest',
    itemId: 'copyFromRequest',
    tooltip: 'Click to copy records from a previously created request',
    handler: function(btn){
        var dataEntryPanel = btn.up('ehr-dataentrypanel');
        LDK.Assert.assertNotEmpty('Unable to find dataentrypanel in COPY_REQUEST', dataEntryPanel);

        Ext4.create('EHR.window.CopyRequestWindow', {
            dataEntryPanel: dataEntryPanel
        }).show();
    }
});