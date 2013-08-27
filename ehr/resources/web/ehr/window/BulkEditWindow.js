/**
 * @cfg formConfig
 * @cfg targetStore
 * @cfg records
 * @cfg suppressConfirmMsg
 */
Ext4.define('EHR.window.BulkEditWindow', {
    extend: 'Ext.window.Window',

    width: 600,

    initComponent: function(){
        LABKEY.ExtAdapter.apply(this, {
            modal: true,
            closeAction: 'destroy',
            bodyStyle: 'padding: 5px;',
            title: 'Bulk Edit',
            defaults: {
                border: false
            },
            items: this.getItemCfg(),
            buttons: this.getButtonCfg(),
            listeners: {
                scope: this,
                beforerender: function(win){
                    var cols = win.down('#formPanel').items.get(0).items.getCount();
                    if (cols > 1){
                        win.setWidth(cols * (EHR.form.Panel.defaultFieldWidth + 20));
                    }
                }
            }
        });

        this.callParent();
    },

    getItemCfg: function(){
        return [{
            html: 'This helper allows you to bulk edit records.  You can choose which fields to edit.  Initially, all fields are greyed out.  To set a value on a field, click the label.  You can disable it by clicking it again.  Please note that any enabled field will be set on the record, even if you did not enter a value.  This is sometimes useful if you want to clear a field across many records.',
            style: 'padding-bottom: 10px;',
            border: false
        },{
            xtype: 'ehr-bulkeditpanel',
            title: null,
            suppressConfirmMsg: this.suppressConfirmMsg,
            formConfig: this.formConfig,
            targetStore: this.targetStore,
            records: this.records,
            getButtons: Ext4.emptyFn,
            listeners: {
                scope: this,
                bulkeditcomplete: this.onBulkEditComplete
            }
        }]
    },

    getButtonCfg: function(){
        var buttons = EHR.panel.BulkEditPanel.getButtonCfg(this);
        buttons.push({
            text: 'Close',
            handler: function(btn){
                btn.up('window').close();
            }
        });

        return buttons;
    },

    onBulkEditComplete: function(){
        this.close();
    }
});