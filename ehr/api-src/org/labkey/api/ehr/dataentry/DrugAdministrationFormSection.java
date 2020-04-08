/*
 * Copyright (c) 2018-2019 LabKey Corporation
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
package org.labkey.api.ehr.dataentry;

import org.labkey.api.ehr.EHRService;
import org.labkey.api.view.template.ClientDependency;

import java.util.List;
import java.util.function.Supplier;

/**
 * User: bimber
 * Date: 7/7/13
 */
public class DrugAdministrationFormSection extends SimpleFormSection
{
    protected boolean _showAddTreatments = true;
    public static final String LABEL = "Medications/Treatments Given";

    public DrugAdministrationFormSection()
    {
        this(EHRService.FORM_SECTION_LOCATION.Body, LABEL, false);
    }

    public DrugAdministrationFormSection(String label)
    {
        this(EHRService.FORM_SECTION_LOCATION.Body, label, false);
    }

    public DrugAdministrationFormSection(EHRService.FORM_SECTION_LOCATION location)
    {
        this(location, LABEL, false);
    }

    public DrugAdministrationFormSection(boolean includeAddScheduledTreatmentButton)
    {
        this(EHRService.FORM_SECTION_LOCATION.Body, LABEL, includeAddScheduledTreatmentButton);
    }

    public DrugAdministrationFormSection(Supplier<ClientDependency> addScheduledTreatmentWindowClientDependency)
    {
        this(EHRService.FORM_SECTION_LOCATION.Body, LABEL, addScheduledTreatmentWindowClientDependency);
    }

    public DrugAdministrationFormSection(EHRService.FORM_SECTION_LOCATION location, String label, boolean includeAddScheduledTreatmentButton)
    {
        this(location, label, includeAddScheduledTreatmentButton ? ClientDependency.supplierFromPath("ehr/window/AddScheduledTreatmentWindow.js") : null);
    }

    public DrugAdministrationFormSection(EHRService.FORM_SECTION_LOCATION location, String label, Supplier<ClientDependency> addScheduledTreatmentWindowClientDependency)
    {
        super("study", "Drug Administration", label, "ehr-gridpanel");
        setClientStoreClass("EHR.data.DrugAdministrationRunsClientStore");
        addClientDependency(ClientDependency.supplierFromPath("ehr/data/DrugAdministrationRunsClientStore.js"));
        addClientDependency(ClientDependency.supplierFromPath("ehr/window/SedationWindow.js"));
        addClientDependency(ClientDependency.supplierFromPath("ehr/window/RepeatSelectedWindow.js"));
        if (addScheduledTreatmentWindowClientDependency != null)
        {
            addClientDependency(addScheduledTreatmentWindowClientDependency);
            addClientDependency(ClientDependency.supplierFromPath("ehr/form/field/SnomedTreatmentCombo.js"));
        }

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

