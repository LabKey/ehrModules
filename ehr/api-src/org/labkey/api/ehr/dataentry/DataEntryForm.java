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
import org.labkey.api.view.HttpView;
import org.labkey.api.view.NavTree;
import org.labkey.api.view.template.ClientDependency;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * Top-level data entry form, composed of potentially many different sections for different data types.
 * User: bimber
 * Date: 4/27/13
 */
public interface DataEntryForm
{
    String getName();

    String getLabel();

    String getCategory();

    boolean hasPermission(Class<? extends Permission> clazz);

    /**
     * Intended for checks like testing whether an owning module is active
     */
    boolean isAvailable();

    boolean isVisible();

    String getJavascriptClass();

    JSONObject toJSON(boolean includeFormElements);

    JSONObject toJSON();

    /** @return the components to be rendered as part of the overall form */
    List<FormSection> getFormSections();

    LinkedHashSet<ClientDependency> getClientDependencies();

    Set<TableInfo> getTables();

    boolean canRead();

    /**
     * @return the HTML-based UI to render the data entry components
     */
    HttpView createView();

    /**
     *
     * @return Navigation trail with any ehr data entry form updates
     */
    NavTree appendNavTrail(NavTree root, String title);
}
