/*
 * Copyright (c) 2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

/**
 * Constructs a new EHR AnimalSearchPanel
 * @class
 * @cfg filterTypes
 * @cfg reports
 *
 */
Ext4.define('EHR.panel.AnimalSearchPanel', {
    extend: 'LABKEY.ext4.SearchPanel',
    alias: 'widget.ehr-animalsearchpanel',
    schemaName: 'study',
    queryName: 'Demographics',
    viewName: 'Search Panel',
    defaultViewName: 'Alive, at Center',
    title: 'Search Criteria',
    LABEL_WIDTH: 200,
    width: 660
});
