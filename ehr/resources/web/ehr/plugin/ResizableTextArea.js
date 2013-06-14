/**
 * A plugin for Ext.form.TextArea that will allow the box to be resized by the user.
 */
Ext4.define('EHR.plugin.ResizableTextArea', {
    extend: 'Ext.AbstractPlugin',
    pluginId: 'ehr-resizabletextarea',
    mixins: {
        observable: 'Ext.util.Observable'
    },

    alias: 'plugin.ehr-resizabletextarea',

    init: function(textArea){
//        textArea.resizeDirections = textArea.resizeDirections || 's,se,e';
//        textArea.on('afterrender', function(f){
//            console.log(f);
//            f.resizer = Ext4.create('Ext.resizer.Resizer', {
//                el: f.getEl(),
//                handles: this.resizeDirections,
//                wrap:true
//            });
//        }, textArea);
    }
});
