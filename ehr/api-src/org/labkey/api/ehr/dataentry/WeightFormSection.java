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
import org.labkey.api.ehr.dataentry.SimpleGridPanel;
import org.labkey.api.view.template.ClientDependency;

/**
 * Grid-based entry for the study.Weight table
 * User: bimber
 * Date: 7/7/13
 */
public class WeightFormSection extends SimpleGridPanel
{
    public WeightFormSection()
    {
        this(EHRService.FORM_SECTION_LOCATION.Body);
    }

    public WeightFormSection(EHRService.FORM_SECTION_LOCATION location)
    {
        super("study", "Weight", "Weights", location);
        setClientStoreClass("EHR.data.WeightClientStore");
        addClientDependency(ClientDependency.fromPath("ehr/data/WeightClientStore.js"));

        _showLocation = true;
    }
}
