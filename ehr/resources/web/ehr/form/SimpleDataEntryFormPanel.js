/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.panel.SimpleDataEntryFormPanel', {
    extend: 'EHR.form.Panel',
    alias: 'widget.ehr-simpledataentryformpanel',

    initComponent: function(){
        this.callParent(arguments);

        Ext4.apply(this.bindConfig, {

        });
    }
});