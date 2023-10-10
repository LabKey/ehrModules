/*
 * Copyright (c) 2022 LabKey Corporation
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

package org.labkey.ehr_app;

import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.labkey.api.data.UpgradeCode;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.ehr.SharedEHRUpgradeCode;
import org.labkey.api.ehr.dataentry.DefaultDataEntryFormFactory;
import org.labkey.api.ldk.ExtendedSimpleModule;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleContext;
import org.labkey.api.query.DefaultSchema;
import org.labkey.api.query.QuerySchema;
import org.labkey.api.view.WebPartFactory;
import org.labkey.ehr_app.dataentry.form.EHRAppArrivalFormType;
import org.labkey.ehr_app.query.EHR_AppUserSchema;

import java.util.Collection;
import java.util.Collections;

public class EHR_AppModule extends ExtendedSimpleModule
{
    public static final String NAME = "EHR_App";

    @Override
    public String getName()
    {
        return NAME;
    }

    @Override
    public @Nullable Double getSchemaVersion()
    {
        return 23.000;
    }

    @Override
    public boolean hasScripts()
    {
        return true;
    }

    @Override
    @NotNull
    protected Collection<WebPartFactory> createWebPartFactories()
    {
        return Collections.emptyList();
    }

    @Override
    protected void init()
    {

    }

    @Override
    protected void registerSchemas()
    {
        DefaultSchema.registerProvider(EHR_AppSchema.NAME, new DefaultSchema.SchemaProvider(this)
        {
            @Override
            public @Nullable QuerySchema createSchema(DefaultSchema schema, Module module)
            {
                return new EHR_AppUserSchema(EHR_AppSchema.NAME, null, schema.getUser(), schema.getContainer(), EHR_AppSchema.getInstance().getSchema());
            }
        });
    }

    @Override
    protected void doStartupAfterSpringConfig(ModuleContext moduleContext)
    {
        EHRService ehrService = EHRService.get();
        ehrService.registerModule(this);
        ehrService.registerActionOverride("populateInitialData", this, "views/populateData.html");
        registerDataEntryForms();
    }

    @Override
    public @NotNull Collection<String> getSchemaNames()
    {
        return Collections.singleton(EHR_AppSchema.NAME);
    }

    @Override
    public @NotNull UpgradeCode getUpgradeCode()
    {
        return SharedEHRUpgradeCode.getInstance(this);
    }

    private void registerDataEntryForms()
    {
        EHRService.get().registerFormType(new DefaultDataEntryFormFactory(EHRAppArrivalFormType.class, this));
    }
}