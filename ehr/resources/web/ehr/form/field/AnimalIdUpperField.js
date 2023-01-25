Ext4.define('EHR.form.AnimalIdUpperField', {
    extend: 'EHR.form.field.AnimalField.js',
    alias: 'widget.ehr-animalIdUpperField',

    //configuration
    config: {
        uppercaseValue: true //defaults to true
    },

    constructor: function (config) {
        this.initConfig(config);
        this.callParent([config]);
    },

    initComponent: function () {
        var me = this;
        Ext4.apply(me, {
            fieldStyle: 'text-transform:uppercase',
        });

        me.callParent();
    },

    //overridden function
    getValue: function () {
        var val = this.callParent();
        return this.getUppercaseValue() ? val.toUpperCase() : val;
    }
});