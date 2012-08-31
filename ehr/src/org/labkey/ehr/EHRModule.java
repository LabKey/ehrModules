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

import org.apache.batik.anim.timing.Interval;
import org.jetbrains.annotations.NotNull;
import org.json.JSONObject;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.DbSchema;
import org.labkey.api.module.ModuleContext;
import org.labkey.api.module.SpringModule;
import org.labkey.api.query.DefaultSchema;
import org.labkey.api.query.QuerySchema;
import org.labkey.api.query.QueryService;
import org.labkey.api.security.*;
import org.labkey.api.security.SecurityManager;
import org.labkey.api.security.roles.RoleManager;
import org.labkey.api.util.PageFlowUtil;
import org.labkey.api.view.WebPartFactory;
import org.labkey.ehr.notification.AbnormalLabResultsNotification;
import org.labkey.ehr.notification.AdminAlertsNotification;
import org.labkey.ehr.notification.BloodAdminAlertsNotification;
import org.labkey.ehr.notification.BloodAlertsNotification;
import org.labkey.ehr.notification.ColonyAlertsLiteNotification;
import org.labkey.ehr.notification.ColonyAlertsNotification;
import org.labkey.ehr.notification.ColonyMgmtNotification;
import org.labkey.ehr.notification.LabTestScheduleNotifications;
import org.labkey.ehr.notification.LabResultSummaryNotification;
import org.labkey.ehr.notification.NotificationService;
import org.labkey.ehr.notification.OverdueWeightsNotification;
import org.labkey.ehr.notification.TreatmentAlerts;
import org.labkey.ehr.notification.WeightAlerts;
import org.labkey.ehr.pipeline.KinshipRunnable;
import org.labkey.ehr.security.EHRBasicSubmitterRole;
import org.labkey.ehr.security.EHRDataAdminRole;
import org.labkey.ehr.security.EHRFullSubmitterRole;
import org.labkey.ehr.security.EHRFullUpdaterRole;
import org.labkey.ehr.security.EHRRequestAdminRole;
import org.labkey.ehr.security.EHRRequestorRole;

import java.security.Security;
import java.util.Collection;
import java.util.Collections;
import java.util.Map;
import java.util.Set;
import java.util.Timer;
import java.util.TimerTask;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class EHRModule extends SpringModule
{
    public static final String EHR_ADMIN_USER = "EHRAdminUser@ehr.com";
    public static final String NAME = "EHR";

    public String getName()
    {
        return NAME;
    }

    public double getVersion()
    {
        return 12.22;
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
    public void startupAfterSpringConfig(ModuleContext moduleContext)
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

        NotificationService ns = NotificationService.get();
        ns.addNotification(new AbnormalLabResultsNotification());
        ns.addNotification(new AdminAlertsNotification());
        ns.addNotification(new BloodAdminAlertsNotification());
        ns.addNotification(new BloodAlertsNotification());
        ns.addNotification(new ColonyAlertsLiteNotification());
        ns.addNotification(new ColonyAlertsNotification());
        ns.addNotification(new ColonyMgmtNotification());
        ns.addNotification(new LabTestScheduleNotifications());
        ns.addNotification(new LabResultSummaryNotification());
        ns.addNotification(new OverdueWeightsNotification());
        ns.addNotification(new TreatmentAlerts());
        ns.addNotification(new WeightAlerts());

//        //create a system user if not already present
//        try
//        {
//            ValidEmail email = new ValidEmail(EHR_ADMIN_USER);
//            User u = UserManager.getUser(email);
//            if (u == null)
//            {
//                String verification = SecurityManager.createLogin(email);
//                SecurityManager.verify(email, verification);
//                u = UserManager.getUser(email);
//                SecurityManager.addMember(SecurityManager.getGroup(Group.groupAdministrators), u);
//            }
//        }
//        catch (ValidEmail.InvalidEmailException e)
//        {
//            throw new RuntimeException(e);
//        }
//        catch (SecurityManager.UserManagementException e)
//        {
//            throw new RuntimeException(e);
//        }
//        catch (InvalidGroupMembershipException e)
//        {
//            throw new RuntimeException(e);
//        }

        //TODO
        //int delay = 1000 * 60 * 5;// 5 minutes
        int delay = 1000;
        Timer timer = new Timer();
        timer.schedule( new TimerTask(){
            public void run() {
                NotificationService.get().start();
            }
        }, delay);
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

    public void scheduleKinshipTask()
    {
        ScheduledExecutorService executor = Executors.newSingleThreadScheduledExecutor();
        executor.scheduleAtFixedRate(new KinshipRunnable(), 10, 10000, TimeUnit.SECONDS);
    }
}
