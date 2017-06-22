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
import org.labkey.api.ehr.dataentry.AbstractFormSection;
import org.labkey.api.ehr.dataentry.SimpleFormSection;
import org.labkey.api.view.template.ClientDependency;

public class HousingFormSection  extends SimpleFormSection
{
    public HousingFormSection(String schema, String query, String label)
    {
        super(schema, query, label, "ehr-gridpanel",EHRService.FORM_SECTION_LOCATION.Body);

        addClientDependency(ClientDependency.fromPath("ehr/window/RoomTransferWindow.js"));
        setClientStoreClass("EHR.data.HousingClientStore");
        addClientDependency(ClientDependency.fromPath("ehr/data/HousingClientStore.js"));
        addClientDependency(ClientDependency.fromPath("ehr/buttons/housingButtons.js"));
        setTemplateMode(AbstractFormSection.TEMPLATE_MODE.NONE);
    }
}

