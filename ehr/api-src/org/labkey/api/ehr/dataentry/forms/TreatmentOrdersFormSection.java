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
package org.labkey.api.ehr.dataentry.forms;

import org.labkey.api.ehr.EHRService;

import java.util.List;

public class TreatmentOrdersFormSection extends DrugAdministrationFormSection
{
    public TreatmentOrdersFormSection()
    {
        this(EHRService.FORM_SECTION_LOCATION.Body);
    }

    public TreatmentOrdersFormSection(EHRService.FORM_SECTION_LOCATION location)
    {
        super(location);
        setName("Treatment Orders");
        setLabel("Medication/Treatment Orders");
        setQueryName("Treatment Orders");
        _showAddTreatments = false;
    }

    @Override
    public List<String> getTbarButtons()
    {
        List<String> defaultButtons = super.getTbarButtons();
        defaultButtons.remove("SEDATIONHELPER");

        return defaultButtons;
    }

    @Override
    public List<String> getTbarMoreActionButtons()
    {
        List<String> defaultButtons = super.getTbarMoreActionButtons();
        defaultButtons.remove("REPEAT_SELECTED");

        return defaultButtons;
    }
}

