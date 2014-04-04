/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * Created to allow a custom row editor plugin and column that summarize observations
 *
 * @cfg observationFilterArray
 */
Ext4.define('EHR.grid.BehaviorRoundsRemarksGridPanel', {
    extend: 'EHR.grid.RoundsRemarksGridPanel',
    alias: 'widget.ehr-behaviorroundsremarksgridpanel',

    getRowEditorPlugin: function(){
        if (this.rowEditorPlugin)
            return this.rowEditorPlugin;

        this.rowEditorPlugin = Ext4.create('EHR.plugin.BehaviorRemarksRowEditor', {
            cmp: this
        });

        return this.rowEditorPlugin;
    }
});