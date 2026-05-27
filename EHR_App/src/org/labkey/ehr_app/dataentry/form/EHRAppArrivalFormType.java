/*
 * Copyright (c) 2023-2026 LabKey Corporation
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
package org.labkey.ehr_app.dataentry.form;

import org.labkey.api.ehr.dataentry.AnimalDetailsFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.TaskFormSection;
import org.labkey.api.ehr.dataentry.WeightFormSection;
import org.labkey.api.ehr.dataentry.forms.ArrivalFormType;
import org.labkey.api.ehr.dataentry.forms.ArrivalInstructionsFormSection;
import org.labkey.api.ehr.dataentry.forms.LockAnimalsFormSection;
import org.labkey.api.ehr.dataentry.forms.NewAnimalFormSection;
import org.labkey.api.module.Module;

import java.util.Arrays;

public class EHRAppArrivalFormType extends ArrivalFormType
{
    public EHRAppArrivalFormType(DataEntryFormContext ctx, Module owner)
    {
        super(ctx, owner, Arrays.asList(
                new LockAnimalsFormSection(),
                new ArrivalInstructionsFormSection(),
                new TaskFormSection(),
                new AnimalDetailsFormSection(),
                new NewAnimalFormSection("study", "arrival", "Arrivals", false),
                new WeightFormSection()
        ));
    }
}
