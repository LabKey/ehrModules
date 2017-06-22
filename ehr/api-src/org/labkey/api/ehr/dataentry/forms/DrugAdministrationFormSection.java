package org.labkey.api.ehr.dataentry.forms;
/*
 * Copyright (c) 2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import org.labkey.api.ehr.EHRService;
import org.labkey.api.ehr.dataentry.SimpleFormSection;
import org.labkey.api.view.template.ClientDependency;

import java.util.List;
public class DrugAdministrationFormSection extends SimpleFormSection
{
    protected boolean _showAddTreatments = true;
    public static final String LABEL = "Medications/Treatments Given";

    public DrugAdministrationFormSection()
    {
        this(EHRService.FORM_SECTION_LOCATION.Body, LABEL);
    }

    public DrugAdministrationFormSection(String label)
    {
        this(EHRService.FORM_SECTION_LOCATION.Body, label);
    }

    public DrugAdministrationFormSection(EHRService.FORM_SECTION_LOCATION location)
    {
        this(location, LABEL);
    }

    public DrugAdministrationFormSection(EHRService.FORM_SECTION_LOCATION location, String label)
    {
        super("study", "Drug Administration", label, "ehr-gridpanel");
        setClientStoreClass("EHR.data.DrugAdministrationRunsClientStore");
        addClientDependency(ClientDependency.fromPath("ehr/data/DrugAdministrationRunsClientStore.js"));
        addClientDependency(ClientDependency.fromPath("ehr/window/SedationWindow.js"));
        addClientDependency(ClientDependency.fromPath("ehr/window/RepeatSelectedWindow.js"));

        setLocation(location);
        setTabName("Medications");
    }

    @Override
    public List<String> getTbarButtons()
    {
        List<String> defaultButtons = super.getTbarButtons();
        defaultButtons.add(0, "SEDATIONHELPER");

        int idx = defaultButtons.indexOf("SELECTALL");
        if (idx > -1)
            defaultButtons.add(idx + 1, "DRUGAMOUNTHELPER");
        else
            defaultButtons.add("DRUGAMOUNTHELPER");

        return defaultButtons;
    }

    @Override
    public List<String> getTbarMoreActionButtons()
    {
        List<String> defaultButtons = super.getTbarMoreActionButtons();
        defaultButtons.add("REPEAT_SELECTED");

        if (_showAddTreatments)
            defaultButtons.add("ADDTREATMENTS");

        return defaultButtons;
    }
}

