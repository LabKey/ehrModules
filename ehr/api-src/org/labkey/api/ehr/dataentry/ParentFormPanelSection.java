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

import org.labkey.api.data.TableInfo;
import org.labkey.api.query.FieldKey;
import org.labkey.api.view.template.ClientDependency;

import java.util.List;

/**
 * A FormSection that has a column that's the target of a FK from another FormSection on the same DataEntryForm.
 * Should be paired with a @{link {@link ChildFormSection} on the same form.
 */
public class ParentFormPanelSection extends SimpleFormPanelSection
{
    public ParentFormPanelSection(String schemaName, String queryName, String label)
    {
        super(schemaName, queryName, label, true);
        addClientDependency(ClientDependency.fromPath("ehr/data/ParentClientStore.js"));
        setClientStoreClass("EHR.data.ParentClientStore");
    }

    @Override
    protected List<FieldKey> getFieldKeys(TableInfo ti)
    {
        return super.getFieldKeys(ti);
    }
}
