/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.namespace('EHR.ext');

LABKEY.requiresScript("/ehr/ExtOverrides.js");
LABKEY.requiresScript("/ehr/ehrMetaHelper.js");
LABKEY.requiresScript("/ehr/utilities.js");
LABKEY.requiresScript("/ehr/navMenu.js");
LABKEY.requiresScript("/ehr/databind.js");
LABKEY.requiresScript("/ehr/ehrStore.js");
LABKEY.requiresScript("/ehr/ehrStoreCollection.js");
LABKEY.requiresScript("/ehr/ehrEditorGridpanel.js");
LABKEY.requiresScript("/ehr/ehrImportPanel.js");
LABKEY.requiresScript("/ehr/ehrFormPanel.js");
LABKEY.requiresScript("/ehr/ehrGridFormPanel.js");
LABKEY.requiresScript("/ehr/ehrPrintTaskPanel.js");

LABKEY.requiresScript("/ehr/ExtComponents.js");
LABKEY.requiresScript("/ehr/ExtContainers.js");
LABKEY.requiresScript("/ehr/ehrMetadata.js");
LABKEY.requiresScript("/ehr/transposeRows.js");
LABKEY.requiresScript("/ehr/searchPanel.js");
LABKEY.requiresScript("/ehr/animalHistory.js");
LABKEY.requiresScript("/ehr/ext.ux.statusbar.js");

var debug;

if(LABKEY.Security.currentUser.isAdmin)
    debug = 1;