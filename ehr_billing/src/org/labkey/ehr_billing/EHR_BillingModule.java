/*
 * Copyright (c) 2017-2018 LabKey Corporation
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

package org.labkey.ehr_billing;

import org.jetbrains.annotations.NotNull;
import org.json.JSONObject;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.ehr_billing.EHR_BillingDomainKind;
import org.labkey.api.ehr_billing.EHR_BillingService;
import org.labkey.api.ehr_billing.notification.BillingNotificationProvider;
import org.labkey.api.ehr_billing.notification.BillingNotificationService;
import org.labkey.api.exp.property.PropertyService;
import org.labkey.api.module.Module;
import org.labkey.api.ldk.notification.NotificationService;
import org.labkey.api.module.ModuleContext;
import org.labkey.api.module.SpringModule;
import org.labkey.api.query.DefaultSchema;
import org.labkey.api.query.QuerySchema;
import org.labkey.api.security.roles.RoleManager;
import org.labkey.api.view.WebPartFactory;
import org.labkey.api.writer.ContainerUser;
import org.labkey.ehr_billing.notification.BillingNotification;
import org.labkey.ehr_billing.notification.BillingNotificationServiceImpl;
import org.labkey.ehr_billing.security.EHR_BillingRole;

import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

public class EHR_BillingModule extends SpringModule
{
    public static final String NAME = "EHR_Billing";

    @Override
    public String getName()
    {
        return NAME;
    }

    @Override
    public double getVersion()
    {
        return 19.13;
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
        addController(org.labkey.ehr_billing.EHR_BillingController.NAME, EHR_BillingController.class);
        PropertyService.get().registerDomainKind(new EHR_BillingDomainKind());
        RoleManager.registerRole(new EHR_BillingRole());

        EHR_BillingService.setInstance(new EHR_BillingServiceImpl());
        BillingNotificationService.setInstance(new BillingNotificationServiceImpl());
    }

    @Override
    protected void startupAfterSpringConfig(ModuleContext moduleContext)
    {
        Collection<BillingNotificationProvider> notificationProviders = BillingNotificationServiceImpl.get().getBillingNotificationProviders();
        for (BillingNotificationProvider notificationProvider : notificationProviders)
        {
            NotificationService.get().registerNotification(new BillingNotification(notificationProvider.getModule(), notificationProvider));
        }

        // add a container listener so we'll know when our container is deleted:
        ContainerManager.addContainerListener(new EHR_BillingContainerListener());
        DefaultSchema.registerProvider(EHR_BillingSchema.NAME, new DefaultSchema.SchemaProvider(this)
        {
            public QuerySchema createSchema(final DefaultSchema schema, Module module)
            {
                return new EHR_BillingUserSchema(EHR_BillingSchema.NAME, null, schema.getUser(), schema.getContainer(), EHR_BillingSchema.getInstance().getSchema());
            }
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
        return Collections.singleton(EHR_BillingSchema.NAME);
    }

    @NotNull
    @Override
    public JSONObject getPageContextJson(ContainerUser ctx)
    {
        Map<String, String> map = getDefaultPageContextJson(ctx.getContainer());
        Map<String, Object> ret = new HashMap<>(getDefaultPageContextJson(ctx.getContainer()));

        if (map.containsKey(EHR_BillingManager.EHR_BillingContainerPropName) && map.get(EHR_BillingManager.EHR_BillingContainerPropName) != null)
        {
            //normalize line endings
            String newPath = map.get(EHR_BillingManager.EHR_BillingContainerPropName);
            newPath = "/" + newPath.replaceAll("^/|/$", "");
            ret.put(EHR_BillingManager.EHR_BillingContainerPropName, newPath);

            Container billingContainer = ContainerManager.getForPath(map.get(EHR_BillingManager.EHR_BillingContainerPropName));
            if(billingContainer != null)
            {
                ret.put("EHR_BillingContainerInfo", billingContainer.toJSON(ctx.getUser()));
            }
        }

        return new JSONObject(ret);
    }
}