/*
 * Copyright (c) 2017-2019 LabKey Corporation
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

package org.labkey.snd;

import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.labkey.api.audit.AuditLogService;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.exp.api.ExperimentService;
import org.labkey.api.exp.property.PropertyService;
import org.labkey.api.module.AdminLinkManager;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleContext;
import org.labkey.api.module.SpringModule;
import org.labkey.api.query.DefaultSchema;
import org.labkey.api.query.QuerySchema;
import org.labkey.api.security.permissions.AdminPermission;
import org.labkey.api.security.roles.RoleManager;
import org.labkey.api.services.ServiceRegistry;
import org.labkey.api.snd.PackageDomainKind;
import org.labkey.api.snd.SNDDomainKind;
import org.labkey.api.snd.SNDService;
import org.labkey.api.view.ActionURL;
import org.labkey.api.view.NavTree;
import org.labkey.api.view.WebPartFactory;
import org.labkey.snd.pipeline.SNDDataHandler;
import org.labkey.snd.security.roles.SNDBasicSubmitterRole;
import org.labkey.snd.security.roles.SNDDataAdminRole;
import org.labkey.snd.security.roles.SNDDataReviewerRole;
import org.labkey.snd.security.roles.SNDEditorRole;
import org.labkey.snd.security.roles.SNDPackageEditorRole;
import org.labkey.snd.security.roles.SNDPackageViewerRole;
import org.labkey.snd.security.roles.SNDProjectEditorRole;
import org.labkey.snd.security.roles.SNDProjectViewerRole;
import org.labkey.snd.security.roles.SNDReaderRole;
import org.labkey.snd.security.roles.SNDViewerRole;

import java.util.Collection;
import java.util.Collections;
import java.util.Set;

public class SNDModule extends SpringModule
{
    public static final String NAME = "SND";

    @Override
    public String getName()
    {
        return NAME;
    }

    @Override
    public @Nullable Double getSchemaVersion()
    {
        return 26.001;
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
        addController(SNDController.NAME, SNDController.class);
        PropertyService.get().registerDomainKind(new SNDDomainKind());
        PropertyService.get().registerDomainKind(new PackageDomainKind());
        ServiceRegistry.get().registerService(SNDService.class, SNDServiceImpl.INSTANCE);

        RoleManager.registerRole(new SNDBasicSubmitterRole(), false);
        RoleManager.registerRole(new SNDDataAdminRole(), false);
        RoleManager.registerRole(new SNDDataReviewerRole(), false);
        RoleManager.registerRole(new SNDReaderRole(), false);
        RoleManager.registerRole(new SNDPackageViewerRole(), true);
        RoleManager.registerRole(new SNDPackageEditorRole(), true);
        RoleManager.registerRole(new SNDProjectViewerRole(), true);
        RoleManager.registerRole(new SNDProjectEditorRole(), true);
        RoleManager.registerRole(new SNDViewerRole(), true);
        RoleManager.registerRole(new SNDEditorRole(), true);

    }

    @Override
    protected void startupAfterSpringConfig(ModuleContext moduleContext)
    {
        // add a container listener so we'll know when our container is deleted:
        ContainerManager.addContainerListener(new SNDContainerListener());

        DefaultSchema.registerProvider(SNDSchema.NAME, new DefaultSchema.SchemaProvider(this)
        {
            @Override
            public QuerySchema createSchema(final DefaultSchema schema, Module module)
            {
                return new SNDUserSchema(SNDSchema.NAME, null, schema.getUser(), schema.getContainer(), SNDSchema.getInstance().getSchema());
            }
        });

        ExperimentService.get().registerExperimentDataHandler(new SNDDataHandler());
        AuditLogService.get().registerAuditType(new NarrativeAuditProvider());

        AdminLinkManager.getInstance().addListener((adminNavTree, container, user) ->
        {
            // Only need read permissions to view manage lists page
            if (container.getActiveModules().contains(SNDModule.this) && container.hasPermission(user, AdminPermission.class))
                adminNavTree.addChild(new NavTree("SND Admin", new ActionURL(SNDController.AdminAction.class, container)));
        });
    }

    @Override
    @NotNull
    public Collection<String> getSummary(Container c)
    {
        return Collections.emptyList();
    }

    @Override
    @NotNull
    public Set<String> getSchemaNames()
    {
        return Collections.singleton(SNDSchema.NAME);
    }
}