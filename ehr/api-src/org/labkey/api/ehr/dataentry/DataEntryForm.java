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
import org.labkey.api.view.HttpView;
import org.labkey.api.view.NavTree;
import org.labkey.api.view.template.ClientDependency;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * Top-level data entry form configuration, bound to a specific user via a {@link DataEntryFormContext},
 * composed of potentially many different sections for different data types.
 * User: bimber
 * Date: 4/27/13
 */
public interface DataEntryForm
{
    /** @return unique name for this form, used to resolve the form via a URL parameter, among other canonical references */
    String getName();

    /** @return user-facing name for the form, shown in menus, as the title of the data entry page, etc */
    String getLabel();

    /** @return category under which to list this form on the menu of data entry options */
    String getCategory();

    /**
     * Intended for checks like testing whether an owning module is active. If a form isn't available, it won't
     * be shown in the list of available form, nor will it be resolved if a user requests it by name
     */
    boolean isAvailable();

    /**
     * @return whether the form should be shown in the list of available forms. Does not impact finding a form by
     * name. Forms must also be isAvailable().
     */
    boolean isVisible();

    /**
     * @return ExtJS type for the top-level data entry panel to implement the browser-side UI. Typically
     * "EHR.panel.DataEntryPanel" or one of its subclasses. If using a custom implementation,
     * use getClientDependencies() to include in the set of JS resources on the page
     */
    String getJavascriptClass();

    /**
     * Translate the form definition to JSON so that it can be passed to the client side for configuration.
     * @param includeFormElements whether or not to include column-level metadata
     */
    JSONObject toJSON(boolean includeFormElements);

    /**
     * Defaults to including column-level metadata
     */
    JSONObject toJSON();

    /** @return the components to be rendered as part of the overall form */
    List<FormSection> getFormSections();

    /**
     * @return resources, typically .js and .css files, that are required for the browser to successfully render the form
     */
    LinkedHashSet<ClientDependency> getClientDependencies();

    /**
     *  @return the tables that are backing the form's persistence. Used to validate that the user has permission
     *  to make edits to the tables.
     */
    Set<TableInfo> getTables();

    /**
     * Typically let normal table-level security handle read.
     * This can be set false to complete turn off the ability to see read-only detail versions on some forms.
     */
    boolean canRead();

    /**
     * @return the HTML-based UI to render the data entry components
     */
    HttpView<?> createView();

    /**
     * @return Navigation trail with any ehr data entry form updates
     */
    NavTree appendNavTrail(NavTree root, String title);
}
