/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

/**
  * This page is a helper to load all the required JS unique to the EHR module.  For many pages it is not necesary to load all this code;
  * however there are enough dependencies between JS classes and the performance hit does not seem to be noticable, so often this is easiest.
  * To use, put this on your page:
  *
  * LABKEY.requiresScript("/ehr/ehrAPI.js");
  *
  * Certain EHR classes support a 'debug' GET URL parameter.  If a value is passed on the URL, this will lead certain classes to output
  * more verbose information.  Often useful if trying to debug a user's machine.
 **/

Ext.namespace('EHR.ext');

var debug;

if(LABKEY.Security.currentUser.isAdmin && LABKEY.ActionURL.getParameter('debug'))
    debug = 1;

LABKEY.requiresScript("/ehr/ExtOverrides.js");
LABKEY.requiresScript("/ehr/ehrMetaHelper.js");
LABKEY.requiresScript("/ehr/Utils.js");
LABKEY.requiresScript("/ehr/Security.js");
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
LABKEY.requiresScript("/ehr/ehrDetailsPanel.js");
LABKEY.requiresScript("/ehr/searchPanel.js");
LABKEY.requiresScript("/ehr/studyButtons.js");
LABKEY.requiresScript("/ehr/animalHistory.js");
LABKEY.requiresScript("StatusBar.js");

