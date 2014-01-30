Ext4.define('EHR.form.field.UsersAndGroupsCombo', {
    extend: 'LABKEY.ext4.ComboBox',
    alias: 'widget.ehr-usersandgroupscombo',

    initComponent: function(){
        LABKEY.ExtAdapter.apply(this, {
            displayField: 'DisplayName',
            valueField: 'UserId',
            queryMode: 'local',
            forceSelection: true,
            matchFieldWidth: false,
            store: {
                type: 'labkey-store',
                schemaName: 'core',
                queryName: 'PrincipalsWithoutAdmin',
                columns: 'UserId,DisplayName,FirstName,LastName',
                sort: 'Type,DisplayName',
                autoLoad: true
            },
            anyMatch: true,
            listConfig: {
                innerTpl: '{[values.DisplayName + (values.LastName ? " (" + values.LastName + (values.FirstName ? ", " + values.FirstName : "") + ")" : "")]}',
                getInnerTpl: function(){
                    return this.innerTpl;
                }
            }
        });


        this.callParent(arguments);
    }
});