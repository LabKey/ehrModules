/*
 * Copyright (c) 2009-2010 LabKey Corporation
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

package org.labkey.ehr;

import org.labkey.api.audit.AuditLogService;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.DbSchema;
import org.labkey.api.module.DefaultModule;
import org.labkey.api.module.ModuleContext;
import org.labkey.api.view.WebPartFactory;
import org.labkey.ehr.etl.ETL;
import org.labkey.ehr.etl.ETLAuditViewFactory;

import java.util.Collection;
import java.util.Collections;
import java.util.Set;

public class EHRModule extends DefaultModule
{

    public String getName()
    {
        return "EHR";
    }

    public double getVersion()
    {
        return 10.20;
    }

    public boolean hasScripts()
    {
        return false;
    }

    protected Collection<WebPartFactory> createWebPartFactories()
    {
        return Collections.emptyList();
    }

    protected void init()
    {
        addController("ehr", EHRController.class);
        EHRProperties.register();
//        EHRQuerySchema.register();
    }

    @Override
    public void startup(ModuleContext moduleContext)
    {
        ETL.start();
        // add a container listener so we'll know when our container is deleted:
        ContainerManager.addContainerListener(new EHRContainerListener());

        AuditLogService.get().addAuditViewFactory(ETLAuditViewFactory.getInstance());
    }

    @Override
    public void destroy()
    {
        ETL.stop();
        super.destroy();
    }

    @Override
    public Collection<String> getSummary(Container c)
    {
        return Collections.emptyList();
    }

    @Override
    public Set<String> getSchemaNames()
    {
        //return Collections.singleton("ehr");
        return Collections.emptySet();
    }

    @Override
    public Set<DbSchema> getSchemasToTest()
    {
        //return PageFlowUtil.set(EHRSchema.getInstance().getSchema());
        return Collections.emptySet();
    }
}
