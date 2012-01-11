/*
 * Copyright (c) 2009-2011 LabKey Corporation
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

import org.jetbrains.annotations.NotNull;
import org.labkey.api.audit.AuditLogService;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.DbSchema;
import org.labkey.api.module.DefaultModule;
import org.labkey.api.module.ModuleContext;
import org.labkey.api.query.DefaultSchema;
import org.labkey.api.query.QuerySchema;
import org.labkey.api.query.QueryService;
import org.labkey.api.security.roles.RoleManager;
import org.labkey.api.util.PageFlowUtil;
import org.labkey.api.view.WebPartFactory;
import org.labkey.ehr.etl.ETL;
import org.labkey.ehr.etl.ETLAuditViewFactory;
import org.labkey.ehr.security.EHRDataAdminRole;
import org.labkey.ehr.security.EHRRequestAdminRole;
import org.labkey.ehr.security.EHRRequestorRole;
import org.labkey.ehr.security.EHRBasicSubmitterRole;
import org.labkey.ehr.security.EHRFullSubmitterRole;
import org.labkey.ehr.security.EHRFullUpdaterRole;
import org.labkey.ehr.security.EHRRequestAdminRole;

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
        return 11.31;
    }

    public boolean hasScripts()
    {
        return true;
    }

    protected Collection<WebPartFactory> createWebPartFactories()
    {
        return Collections.emptyList();
    }

    protected void init()
    {
        addController("ehr", EHRController.class);
        EHRProperties.register();
    }

    @Override
    public void startup(ModuleContext moduleContext)
    {
        ETL.start();
        // add a container listener so we'll know when our container is deleted:
        ContainerManager.addContainerListener(new EHRContainerListener());

        AuditLogService.get().addAuditViewFactory(ETLAuditViewFactory.getInstance());

        for (final String schemaName : getSchemaNames())
        {
            final DbSchema dbschema = DbSchema.get(schemaName);

            DefaultSchema.registerProvider(schemaName, new DefaultSchema.SchemaProvider()
            {
                public QuerySchema getSchema(final DefaultSchema schema)
                {
                    if (schema.getContainer().getActiveModules().contains(EHRModule.this))
                    {
                        return QueryService.get().createSimpleUserSchema(schemaName, null, schema.getUser(), schema.getContainer(), dbschema);
                    }
                    return null;
                }
            });
        }
        
        RoleManager.registerRole(new EHRDataAdminRole());
        RoleManager.registerRole(new EHRRequestorRole());
        RoleManager.registerRole(new EHRBasicSubmitterRole());
        RoleManager.registerRole(new EHRFullSubmitterRole());
        RoleManager.registerRole(new EHRFullUpdaterRole());
        RoleManager.registerRole(new EHRRequestAdminRole());
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
    @NotNull
    public Set<String> getSchemaNames()
    {
        return PageFlowUtil.set("ehr", "ehr_lookups");
        //return Collections.emptySet();
    }

    @Override
    @NotNull
    public Set<DbSchema> getSchemasToTest()
    {
        if(EHRSchema.getInstance().getSqlDialect().isPostgreSQL())
        {
            return PageFlowUtil.set(EHRSchema.getInstance().getSchema());
        }
        else
        {
            return Collections.emptySet();
        }
    }
}
