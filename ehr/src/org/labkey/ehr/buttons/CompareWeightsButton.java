/*
 * Copyright (c) 2013-2019 LabKey Corporation
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
package org.labkey.ehr.buttons;

import org.labkey.api.data.TableInfo;
import org.labkey.api.ldk.table.SimpleButtonConfigFactory;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;

/**
 * User: bimber
 * Date: 8/2/13
 * Time: 12:26 PM
 */
public class CompareWeightsButton extends SimpleButtonConfigFactory
{
    public CompareWeightsButton(Module owner)
    {
        super(owner, "Compare Weights", "EHR.DatasetButtons.compareWeightsHandler(dataRegionName);");
        setClientDependencies(ClientDependency.supplierFromPath("ehr/window/CompareWeightsWindow.js"), ClientDependency.supplierFromPath("ehr/studyButtons.js"));
    }

    @Override
    public boolean isAvailable(TableInfo ti)
    {
        if (!super.isAvailable(ti))
            return false;

        //this only requires read permission, so the weight table would handle this upstream
        if (ti.getUserSchema().getName().equalsIgnoreCase("study") && ti.getPublicName().equalsIgnoreCase("weight"))
            return true;

        return false;
    }
}

