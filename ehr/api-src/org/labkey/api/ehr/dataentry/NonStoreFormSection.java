/*
 * Copyright (c) 2016-2019 LabKey Corporation
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

import org.json.JSONObject;
import org.labkey.api.view.template.ClientDependency;

import java.util.Collections;
import java.util.List;
import java.util.function.Supplier;

/**
 * Form section that isn't bound to an ExtJS store for its data model. These are typically read-only views, and may
 * present a summary of an animal's info, show the user instructions, etc.
 * User: bimber
 * Date: 1/11/14
 */
public class NonStoreFormSection extends AbstractFormSection
{
    public NonStoreFormSection(String name, String label, String xtype)
    {
        super(name, label, xtype);
    }

    public NonStoreFormSection(String name, String label, String xtype, List<Supplier<ClientDependency>> dependencies)
    {
        super(name, label, xtype);

        if (dependencies != null)
        {
            for (Supplier<ClientDependency> cd : dependencies)
            {
                addClientDependency(cd);
            }
        }
    }

    @Override
    protected List<FormElement> getFormElements(DataEntryFormContext ctx)
    {
        return Collections.emptyList();
    }

    @Override
    public JSONObject toJSON(DataEntryFormContext ctx, boolean includeFormElements)
    {
        JSONObject ret = super.toJSON(ctx, includeFormElements);
        ret.put("supportsTemplates", false);

        return ret;
    }
}
