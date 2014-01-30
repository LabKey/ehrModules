Ext4.define('EHR.form.field.VetFieldCombo', {
    extend: 'LABKEY.ext4.ComboBox',
    alias: 'widget.ehr-vetfieldcombo',

    initComponent: function(){
        LABKEY.ExtAdapter.apply(this, {
            queryMode: 'local',
            matchFieldWidth: false,
            anyMatch: true,
            displayField: 'UserId/DisplayName',
            forceSelection: true,
            valueField: 'UserId',
            store: {
                type: 'labkey-store',
                schemaName: 'ehr_lookups',
                queryName: 'veterinarians',
                columns: 'UserId,UserId/DisplayName,UserId/FirstName,UserId/LastName',
                sort: 'UserId/DisplayName',
                autoLoad: true
            },
            listConfig: {
                innerTpl: '{[values["UserId/DisplayName"] + (values["UserId/LastName"] ? " (" + values["UserId/LastName"] + (values["UserId/FirstName"] ? ", " + values["UserId/FirstName"] : "") + ")" : "")]}',
                getInnerTpl: function(){
                    return this.innerTpl;
                }
            }
        });

        this.callParent(arguments);
    }
});