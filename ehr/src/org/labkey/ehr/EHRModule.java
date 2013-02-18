/*
 * Copyright (c) 2009-2013 LabKey Corporation
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
import org.labkey.api.data.UpgradeCode;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.ldk.ExtendedSimpleModule;
import org.labkey.api.ldk.notification.NotificationService;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleContext;
import org.labkey.api.query.DefaultSchema;
import org.labkey.api.query.QuerySchema;
import org.labkey.api.query.QueryService;
import org.labkey.api.security.User;
import org.labkey.api.security.roles.RoleManager;
import org.labkey.api.util.PageFlowUtil;
import org.labkey.api.view.WebPartFactory;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.ehr.notification.OverdueWeightsNotification;
import org.labkey.ehr.notification.WeightAlerts;
import org.labkey.ehr.query.EHRLookupsUserSchema;
import org.labkey.ehr.security.EHRBasicSubmitterRole;
import org.labkey.ehr.security.EHRDataAdminRole;
import org.labkey.ehr.security.EHRDataEntryRole;
import org.labkey.ehr.security.EHRFullSubmitterRole;
import org.labkey.ehr.security.EHRFullUpdaterRole;
import org.labkey.ehr.security.EHRRequestAdminRole;
import org.labkey.ehr.security.EHRRequestorRole;
import org.labkey.ehr.study.EHRStudyUpgradeCode;

import java.util.Collection;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

public class EHRModule extends ExtendedSimpleModule
{
    public static final String EHR_ADMIN_USER = "EHRAdminUser@ehr.com";
    public static final String NAME = "EHR";

    public String getName()
    {
        return NAME;
    }

    public double getVersion()
    {
        return 12.315;
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

        EHRServiceImpl impl = new EHRServiceImpl();
        EHRService.setInstance(impl);
    }

    @Override
    public void startupAfterSpringConfig(ModuleContext moduleContext)
    {
        //inerhit from SimpleModule, so we clean up schema on delete
        ContainerManager.addContainerListener(this);

        for (final String schemaName : getSchemaNames())
        {
            final DbSchema dbschema = DbSchema.get(schemaName);
            DefaultSchema.registerProvider(schemaName, new DefaultSchema.SchemaProvider()
            {
                public QuerySchema getSchema(final DefaultSchema schema)
                {
                    if (schema.getContainer().getActiveModules().contains(EHRModule.this))
                    {
                        if (schemaName.equalsIgnoreCase(EHRSchema.EHR_LOOKUPS))
                            return new EHRLookupsUserSchema(schema.getUser(), schema.getContainer(), dbschema);
                        else
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

        RoleManager.registerRole(new EHRDataEntryRole());
        RoleManager.registerRole(new EHRRequestorRole());

        NotificationService ns = NotificationService.get();
        ns.registerNotification(new OverdueWeightsNotification());
        ns.registerNotification(new WeightAlerts());
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
        return PageFlowUtil.set(EHRSchema.EHR_SCHEMANAME, EHRSchema.EHR_LOOKUPS);
    }

    @Override
    public JSONObject getPageContextJson(User u, Container c)
    {
        Map<String, String> map = getDefaultPageContextJson(u, c);
        if (map.containsKey(EHRManager.EHRStudyContainerPropName) && map.get(EHRManager.EHRStudyContainerPropName) != null)
        {
            //normalize line endings
            String newPath = map.get(EHRManager.EHRStudyContainerPropName);
            newPath = "/" + newPath.replaceAll("^/|/$", "");
            map.put(EHRManager.EHRStudyContainerPropName, newPath);

            Container ehrContainer = ContainerManager.getForPath(map.get(EHRManager.EHRStudyContainerPropName));
            if(ehrContainer != null)
            {
                map.put("EHRStudyContainerInfo", ehrContainer.toJSON(u).toString());

                Set<String> moduleNames = new TreeSet<String>();
                Set<Module> activeModules = ehrContainer.getActiveModules();
                for (Module m : EHRService.get().getRegisteredModules())
                {
                    if (activeModules.contains(m))
                        moduleNames.add(m.getName());
                }
                map.put("EHRModules", new JSONObject(moduleNames).toString());
            }

            //merge client context for registered modules, if they are enabled in current folder
            for (Module m : EHRService.get().getRegisteredModules())
            {
                if (c.getActiveModules().contains(m))
                {
                    JSONObject json = m.getPageContextJson(u, c);
                    for (String prop : json.keySet())
                    {
                        map.put(prop, json.getString(prop));
                    }
                }
            }
        }

        return new JSONObject(map);
    }

    @Override
    public UpgradeCode getUpgradeCode()
    {
        return new EHRStudyUpgradeCode();
    }

    @Override
    public LinkedHashSet<ClientDependency> getClientDependencies(Container c, User u)
    {
        // allow other modules to register with EHR service, and include them when the module is turned on
        LinkedHashSet<ClientDependency> ret = new LinkedHashSet<ClientDependency>();
        ret.addAll(_clientDependencies);
        ret.addAll(EHRService.get().getRegisteredClientDependencies(c, u));

        return ret;
    }
}
