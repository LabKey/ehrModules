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
package org.labkey.api.ehr.dataentry.forms;

import org.labkey.api.ehr.EHRService;
import org.labkey.api.ehr.dataentry.AnimalDetailsFormSection;
import org.labkey.api.ehr.dataentry.BloodDrawFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.TaskForm;
import org.labkey.api.ehr.dataentry.TaskFormSection;
import org.labkey.api.ehr.dataentry.WeightFormSection;
import org.labkey.api.ehr.dataentry.DrugAdministrationFormSection;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;

import java.util.Arrays;
import java.util.List;
import java.util.function.Supplier;

/**
 * User: bimber
 * Date: 7/29/13
 */
public class BloodDrawFormType extends TaskForm
{
    public static final String NAME = "Blood Draws";

    public BloodDrawFormType(DataEntryFormContext ctx, Module owner)
    {
        this(ctx, owner, Arrays.asList(
            new TaskFormSection(),
            new AnimalDetailsFormSection(),
            new BloodDrawFormSection(false),
            new WeightFormSection(),
            new DrugAdministrationFormSection(EHRService.FORM_SECTION_LOCATION.Body, DrugAdministrationFormSection.LABEL, null)
        ));
    }

    public BloodDrawFormType(DataEntryFormContext ctx, Module owner, List<FormSection> sections)
    {
        super(ctx, owner, NAME, NAME, "Clinical", sections);

        addClientDependency(getAddScheduledTreatmentWindowDependency());
        addClientDependency(ClientDependency.supplierFromPath("ehr/form/field/SnomedTreatmentCombo.js"));

        addClientDependency(ClientDependency.supplierFromPath("ehr/model/sources/BloodDraw.js"));

        for (FormSection s : getFormSections())
        {
            s.addConfigSource("BloodDraw");
        }
    }

    public Supplier<ClientDependency> getAddScheduledTreatmentWindowDependency()
    {
        return ClientDependency.supplierFromPath("ehr/window/AddScheduledTreatmentWindow.js");
    }
}
