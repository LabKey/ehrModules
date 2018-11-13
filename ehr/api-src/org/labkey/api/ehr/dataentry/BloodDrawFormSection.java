/*
 * Copyright (c) 2013-2018 LabKey Corporation
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

public class BloodDrawFormSection extends SimpleGridPanel
{
    boolean _isRequest = false;

    public BloodDrawFormSection(boolean isRequest)
    {
        this(isRequest, EHRService.FORM_SECTION_LOCATION.Body);
    }

    public BloodDrawFormSection(boolean isRequest, EHRService.FORM_SECTION_LOCATION location)
    {
        super("study", "blood", "Blood Draws", location);
        _isRequest = isRequest;

        setClientStoreClass("EHR.data.BloodDrawClientStore");
        addClientDependency(ClientDependency.fromPath("ehr/data/BloodDrawClientStore.js"));
        addClientDependency(ClientDependency.fromPath("ehr/window/BloodBulkAddWindow.js"));
        if (!isRequest)
            addClientDependency(ClientDependency.fromPath("ehr/window/AddScheduledBloodDrawsWindow.js"));
    }

    @Override
    public List<String> getTbarMoreActionButtons()
    {
        List<String> defaultButtons = super.getTbarMoreActionButtons();
        defaultButtons.add("REPEAT_SELECTED");

        if (!_isRequest)
            defaultButtons.add(0, "ADDBLOODDRAWS");

        defaultButtons.add("BULK_ADD_BLOOD");

        return defaultButtons;
    }
}
