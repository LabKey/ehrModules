/*
 * Copyright (c) 2013-2017 LabKey Corporation
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
import org.labkey.api.data.TableInfo;
import org.labkey.api.security.permissions.Permission;
import org.labkey.api.util.Pair;
import org.labkey.api.view.template.ClientDependency;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * One section of a larger data entry form. Typically bound to a single underlying table, but might also
 * be instructions on usage, a read-only summary snapshot for the selected animal, etc.
 * User: bimber
 * Date: 4/27/13
 */
public interface FormSection
{
    String getName();

    String getLabel();

    /** @return the ExtJS type to use for the rendered component */
    String getXtype();

    String getClientModelClass();

    boolean hasPermission(DataEntryFormContext ctx, Class<? extends Permission> perm);

    Set<Pair<String, String>> getTableNames();

    Set<TableInfo> getTables(DataEntryFormContext ctx);

    JSONObject toJSON(DataEntryFormContext ctx, boolean includeFormElements);

    LinkedHashSet<ClientDependency> getClientDependencies();

    void setConfigSources(List<String> configSources);

    void addConfigSource(String source);

    void addClientDependency(ClientDependency cd);

    void setShowSaveTemplateForAll(Boolean showSaveTemplateForAll);

    void setTemplateMode(AbstractFormSection.TEMPLATE_MODE mode);
}
