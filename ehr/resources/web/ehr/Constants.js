Ext4.ns('EHR.permission');

EHR.permission = new function(){
    var prefix = 'org.labkey.ehr.security';

    return {
        DATA_ENTRY: prefix + '.EHRDataEntryPermission'
    }
};