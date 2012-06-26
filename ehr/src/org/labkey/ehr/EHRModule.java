/*
 * Copyright (c) 2009-2012 LabKey Corporation
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
import org.json.JSONObject;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.DbSchema;
import org.labkey.api.module.DefaultModule;
import org.labkey.api.module.ModuleContext;
import org.labkey.api.module.ModuleProperty;
import org.labkey.api.query.DefaultSchema;
import org.labkey.api.query.QuerySchema;
import org.labkey.api.query.QueryService;
import org.labkey.api.security.User;
import org.labkey.api.security.permissions.AdminPermission;
import org.labkey.api.security.permissions.Permission;
import org.labkey.api.security.roles.RoleManager;
import org.labkey.api.util.PageFlowUtil;
import org.labkey.api.view.WebPartFactory;
import org.labkey.ehr.security.EHRBasicSubmitterRole;
import org.labkey.ehr.security.EHRDataAdminRole;
import org.labkey.ehr.security.EHRFullSubmitterRole;
import org.labkey.ehr.security.EHRFullUpdaterRole;
import org.labkey.ehr.security.EHRRequestAdminRole;
import org.labkey.ehr.security.EHRRequestorRole;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class EHRModule extends DefaultModule
{
    public String getName()
    {
        return "EHR";
    }

    public double getVersion()
    {
        return 11.38;
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

        List<Class<? extends Permission>> perms = new ArrayList<Class<? extends Permission>>();
        perms.add(AdminPermission.class);

        ModuleProperty studyContainer = new ModuleProperty(this, "EHRStudyContainer");
        studyContainer.setCanSetPerContainer(false);
        studyContainer.setDescription("The is the path to the container holding the EHR study.  Use of slashes is very important - it should be in the format '/myProject/ehr'");
        studyContainer.setRequired(true);
        studyContainer.setEditPermissions(perms);
        addModuleProperty(studyContainer);

        ModuleProperty institution = new ModuleProperty(this, "InstitutionName");
        institution.setCanSetPerContainer(false);
        studyContainer.setEditPermissions(perms);
        addModuleProperty(institution);

        ModuleProperty protocolPdf = new ModuleProperty(this, "ProtocolPDFContainer");
        studyContainer.setDescription("The is the path to the container holding PDFs of IACUC protocols.  It is usually separate from the EHR study.  Use of slashes is very important - it should be in the format '/myProject/ehr'");
        institution.setCanSetPerContainer(false);
        studyContainer.setEditPermissions(perms);
        addModuleProperty(protocolPdf);
    }

    @Override
    public void doStartup(ModuleContext moduleContext)
    {
        // add a container listener so we'll know when our container is deleted:
        ContainerManager.addContainerListener(new EHRContainerListener());

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
    public Collection<String> getSummary(Container c)
    {
        return Collections.emptyList();
    }

    @Override
    @NotNull
    public Set<String> getSchemaNames()
    {
        return PageFlowUtil.set("ehr", "ehr_lookups");
    }

    @Override
    @NotNull
    public Set<DbSchema> getSchemasToTest()
    {
        return PageFlowUtil.set(EHRSchema.getInstance().getSchema(), DbSchema.get("ehr_lookups"));
    }

    @Override
    public JSONObject getPageContextJson(User u, Container c)
    {
        Map<String, String> map = getDefaultPageContextJson(u, c);
        if (map.containsKey("EHRStudyContainer") && map.get("EHRStudyContainer") != null)
        {
            Container ehr = ContainerManager.getForPath(map.get("EHRStudyContainer"));
            if(ehr != null)
                map.put("EHRStudyContainerInfo", ehr.toJSON(u).toString());

        }
        return new JSONObject(map);
    }
}
