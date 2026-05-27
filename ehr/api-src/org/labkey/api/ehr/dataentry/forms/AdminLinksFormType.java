/*
 * Copyright (c) 2022-2026 LabKey Corporation
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

import org.json.JSONObject;
import org.labkey.api.ehr.dataentry.AbstractDataEntryForm;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.module.Module;
import org.labkey.api.security.permissions.AdminPermission;
import org.labkey.api.security.permissions.Permission;
import org.labkey.api.view.ActionURL;

import java.util.List;

/**
 * Adds a link only visible to admins on the EHR data entry page. Override dataEntryLink() with the desired URL. _formContext
 * can be used to get URL container and context.
 */
public abstract class AdminLinksFormType extends AbstractDataEntryForm
{
    protected final DataEntryFormContext _formContext;

    public AdminLinksFormType(DataEntryFormContext ctx, Module owner, String name, String label, String category, List<FormSection> sections)
    {
        super(ctx, owner, name, label, category, sections);
        _formContext = ctx;
    }

    protected abstract ActionURL dataEntryLink();

    @Override
    public JSONObject toJSON(boolean includeFormElements)
    {
        JSONObject json = super.toJSON(includeFormElements);
        json.put("url", dataEntryLink());

        return json;
    }

    @Override
    public boolean isAvailable()
    {
        return super.isAvailable() && getCtx().getContainer().hasPermission(getCtx().getUser(), AdminPermission.class);
    }

    @Override
    protected List<Class<? extends Permission>> getAvailabilityPermissions()
    {
        List<Class<? extends Permission>> perms = super.getAvailabilityPermissions();
        perms.add(AdminPermission.class);
        return perms;
    }
}
