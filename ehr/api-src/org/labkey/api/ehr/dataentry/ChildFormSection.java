/*
 * Copyright (c) 2018 LabKey Corporation
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

import java.util.ArrayList;
import java.util.List;

/**
 * A FormSection that has a column that's a FK to another FormSection on the same DataEntryForm. Should be paired
 * with a @{link {@link ParentFormPanelSection} on the same form.
 */
public class ChildFormSection extends SimpleFormSection
{
    public ChildFormSection(String schemaName, String queryName, String label, String parentQueryName, String xtype, EHRService.FORM_SECTION_LOCATION location)
    {
        super(schemaName, queryName, label, xtype, location);
        addClientDependency(ClientDependency.fromPath("ehr/data/ChildClientStore.js"));
        setClientStoreClass("EHR.data.ChildClientStore");
        addExtraProperty("parentQueryName", parentQueryName);

        addClientDependency(ClientDependency.fromPath("ehr/window/ParentChildAddRecord.js"));
    }

    @Override
    public List<String> getTbarButtons()
    {
        List<String> buttons = new ArrayList<>(super.getTbarButtons());

        if (buttons.contains("ADDANIMALS"))
            buttons.remove("ADDANIMALS");

        if (buttons.contains("COPYFROMSECTION"))
            buttons.remove("COPYFROMSECTION");

        int index = buttons.indexOf("ADDRECORD");
        if (index > -1)
        {
            buttons.remove("ADDRECORD");
            buttons.add(index, "PARENTCHILDADD");
        }

        return buttons;
    }

    @Override
    public List<String> getTbarMoreActionButtons()
    {
        List<String> buttons = new ArrayList<>(super.getTbarMoreActionButtons());

        if (buttons.contains("DUPLICATE"))
            buttons.remove("DUPLICATE");
        
        return buttons;
    }
}
