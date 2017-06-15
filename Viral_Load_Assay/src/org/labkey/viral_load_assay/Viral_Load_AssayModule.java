/*
 * Copyright (c) 2012 LabKey Corporation
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
package org.labkey.viral_load_assay;

import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.DbSchema;
import org.labkey.api.laboratory.LaboratoryService;
import org.labkey.api.ldk.ExtendedSimpleModule;
import org.labkey.api.module.ModuleContext;
import org.labkey.api.util.PageFlowUtil;
import org.labkey.api.view.WebPartFactory;
import org.labkey.viral_load_assay.assay.ViralLoadAssayDataProvider;

import java.util.Collection;
import java.util.Collections;
import java.util.Set;

/**
 * User: bimber
 * Date: 9/1/12
 * Time: 8:46 PM
 */
public class Viral_Load_AssayModule extends ExtendedSimpleModule
{
    public static final String NAME = "Viral_Load_Assay";
    public static final String CONTROLLER_NAME = "viralloadassay";
    public static final String SCHEMA_NAME = "viral_load_assay";

    public String getName()
    {
        return NAME;
    }

    public double getVersion()
    {
        return 12.25;
    }

    public boolean hasScripts()
    {
        return true;
    }

    @NotNull
    protected Collection<WebPartFactory> createWebPartFactories()
    {
        return Collections.emptyList();
    }

    protected void init()
    {
        addController(CONTROLLER_NAME, Viral_Load_AssayController.class);
    }

    @Override
    protected void doStartupAfterSpringConfig(ModuleContext moduleContext)
    {
        LaboratoryService.get().registerModule(this);
        LaboratoryService.get().registerDataProvider(new ViralLoadAssayDataProvider(this));
        LaboratoryService.get().registerTableCustomizer(this, ViralLoadCustomizer.class, "*", "*");
    }

    @NotNull
    @Override
    public Set<DbSchema> getSchemasToTest()
    {
        return PageFlowUtil.set(Viral_Load_AssaySchema.getInstance().getSchema());
    }

    @Override
    @NotNull
    public Set<String> getSchemaNames()
    {
        return PageFlowUtil.set(SCHEMA_NAME);
    }
}
