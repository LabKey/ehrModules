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
import org.labkey.api.data.TableInfo;
import org.labkey.api.security.permissions.Permission;
import org.labkey.api.util.Pair;
import org.labkey.api.view.template.ClientDependency;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.function.Supplier;

/**
 * One section of a larger data entry form. Typically bound to a single underlying table to show an editable grid or
 * single-row form with fields for each column, but might also be a simple HTML section with instructions on usage,
 * a read-only summary snapshot for the selected animal, etc.
 * User: bimber
 * Date: 4/27/13
 */
public interface FormSection
{
    String getName();

    /** @return title to show for the section in the UI */
    String getLabel();

    /** @return the ExtJS type to use for the rendered component */
    String getXtype();

    /**
     * @return the JavaScript class name, typically "EHR.model.DefaultClientModel" or one of its subclasses, that
     * ExtJS should use to represent the data elements in the store
     */
    String getClientModelClass();

    /**
     * @return whether the user has permission to perform the requested type of operation on the underlying data storage
     */
    boolean hasPermission(DataEntryFormContext ctx, Class<? extends Permission> perm);

    /** @return schema/query name combination for the backing storage */
    Set<Pair<String, String>> getTableNames();

    /** @return the TableInfos that represent the tables referenced by getTableNames() */
    Set<TableInfo> getTables(DataEntryFormContext ctx);

    /** @return JSON representation of this section to be passed to the client to configure itself */
    JSONObject toJSON(DataEntryFormContext ctx, boolean includeFormElements);

    /** @return the JavaScript and CSS resources needed to successfully render this section */
    List<Supplier<ClientDependency>> getClientDependencies();

    /**
     * Adds a reference to a JS-supplied set of metadata to be used for configuring the form section. The JS file
     * must be included in the set of ClientDependencies, and it should register its metadata with the same name using
     * EHR.model.DataModelManager.registerMetadata()
     */
    void setConfigSources(List<String> configSources);

    /**
     * @see FormSection#setConfigSources(List)
     */
    void addConfigSource(String source);

    /** Add another dependency reference, such as a JavaScript or CSS file */
    void addClientDependency(Supplier<ClientDependency> cd);

    void setTemplateMode(AbstractFormSection.TEMPLATE_MODE mode);
}
