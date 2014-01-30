Ext4.define('EHR.form.field.HxTextArea', {
    extend: 'Ext.form.field.TextArea',
    alias: 'widget.ehr-hxtextarea',

    onRender : function(ct, position){
        this.callParent(arguments);

        this.wrap = this.inputEl.wrap({cls: 'x4-form-field-wrap'});
        this.linkDiv = this.wrap.createChild({
            tag: 'div',
            style: 'vertical-align:top;'
        }, this.inputEl);

        this.linkEl = this.linkDiv.createChild({
            tag: 'a',
            cls: 'labkey-text-link',
            html: 'Copy Most Recent Hx'
        });

        this.linkEl.on('click', function(el){
            var rec = EHR.DataEntryUtils.getBoundRecord(this);
            LDK.Assert.assertNotEmpty('Unable to find record in HxTextArea', rec);
            if (!rec || !rec.get('Id')){
                Ext4.Msg.alert('Error', 'No Id Entered');
                return;
            }

            Ext4.Msg.wait('Loading...');
            LABKEY.Query.selectRows({
                schemaName: 'study',
                queryName: 'demographics',
                columns: 'Id,mostRecentHx',
                filterArray: [
                    LABKEY.Filter.create('Id', rec.get('Id'), LABKEY.Filter.Types.EQUAL)
                ],
                failure: LDK.Utils.getErrorCallback,
                scope: this,
                success: function(results){
                    Ext4.Msg.hide();

                    if (results && results.rows && results.rows.length && results.rows[0].mostRecentHx){
                        this.setValue(results.rows[0].mostRecentHx);
                    }
                    else {
                        Ext4.Msg.alert('No History', 'No History Found');
                    }
                }
            });
        }, this);
    },

    onDestroy : function(){
        if (this.linkDiv){
            this.linkDiv.removeAllListeners();
            this.linkDiv.remove();
        }

        if (this.linkEl){
            this.linkEl.removeAllListeners();
            this.linkEl.remove();
        }

        if (this.wrap){
            this.wrap.remove();
        }

        this.callParent(this);
    }
});