/*
 * Copyright (c) 2009-2014 LabKey Corporation
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
import org.labkey.api.ldk.LDKService;
import org.labkey.api.ldk.notification.NotificationService;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleContext;
import org.labkey.api.query.DefaultSchema;
import org.labkey.api.query.DetailsURL;
import org.labkey.api.query.QuerySchema;
import org.labkey.api.security.User;
import org.labkey.api.security.roles.RoleManager;
import org.labkey.api.view.ViewContext;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.ehr.buttons.CompareWeightsButton;
import org.labkey.ehr.buttons.TaskAssignButton;
import org.labkey.ehr.buttons.VetReviewButton;
import org.labkey.ehr.dataentry.RecordDeleteRunner;
import org.labkey.ehr.demographics.ActiveAssignmentsDemographicsProvider;
import org.labkey.ehr.demographics.ActiveProblemsProvider;
import org.labkey.ehr.demographics.ActiveTreatmentsDemographicsProvider;
import org.labkey.ehr.demographics.BasicDemographicsProvider;
import org.labkey.ehr.demographics.BirthDemographicsProvider;
import org.labkey.ehr.demographics.DeathsDemographicsProvider;
import org.labkey.ehr.demographics.DemographicsCache;
import org.labkey.ehr.demographics.DepartureDemographicsProvider;
import org.labkey.ehr.demographics.HousingDemographicsProvider;
import org.labkey.ehr.demographics.MostRecentWeightDemographicsProvider;
import org.labkey.ehr.demographics.WeightsDemographicsProvider;
import org.labkey.ehr.notification.DataEntrySummary;
import org.labkey.ehr.notification.DeathNotification;
import org.labkey.ehr.pipeline.GeneticCalculationsJob;
import org.labkey.ehr.query.EHRLookupsUserSchema;
import org.labkey.ehr.query.EHRUserSchema;
import org.labkey.ehr.query.buttons.ExcelImportButton;
import org.labkey.ehr.query.buttons.JumpToHistoryButton;
import org.labkey.ehr.query.buttons.MarkCompletedButton;
import org.labkey.ehr.query.buttons.ReturnDistinctButton;
import org.labkey.ehr.query.buttons.ShowAuditHistoryButton;
import org.labkey.ehr.security.EHRBasicSubmitterRole;
import org.labkey.ehr.security.EHRDataAdminRole;
import org.labkey.ehr.security.EHRDataEntryRole;
import org.labkey.ehr.security.EHRFullSubmitterRole;
import org.labkey.ehr.security.EHRFullUpdaterRole;
import org.labkey.ehr.security.EHRRequestAdminRole;
import org.labkey.ehr.security.EHRRequestorRole;
import org.labkey.ehr.security.EHRVeternarianRole;
import org.labkey.ehr.study.EHRStudyUpgradeCode;

import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

public class EHRModule extends ExtendedSimpleModule
{
    public static final String NAME = "EHR";
    public static final String CONTROLLER_NAME = "ehr";

    public String getName()
    {
        return NAME;
    }

    public double getVersion()
    {
        return 12.393;
    }

    public boolean hasScripts()
    {
        return true;
    }

    protected void init()
    {
        addController(CONTROLLER_NAME, EHRController.class);
        EHRProperties.register();

        EHRServiceImpl impl = new EHRServiceImpl();
        EHRService.setInstance(impl);

        // NOTE: deliberately register these prior to doStartupAfterSpringConfig(), so other modules
        // can override them
        EHRService.get().registerDemographicsProvider(new BasicDemographicsProvider());
        EHRService.get().registerDemographicsProvider(new DepartureDemographicsProvider());
        EHRService.get().registerDemographicsProvider(new ActiveAssignmentsDemographicsProvider());
        EHRService.get().registerDemographicsProvider(new ActiveProblemsProvider());
        EHRService.get().registerDemographicsProvider(new ActiveTreatmentsDemographicsProvider());
        EHRService.get().registerDemographicsProvider(new BirthDemographicsProvider());
        EHRService.get().registerDemographicsProvider(new DeathsDemographicsProvider());
        EHRService.get().registerDemographicsProvider(new HousingDemographicsProvider());

        EHRService.get().registerDemographicsProvider(new MostRecentWeightDemographicsProvider());
        EHRService.get().registerDemographicsProvider(new WeightsDemographicsProvider());
    }

    @Override
    protected void doStartupAfterSpringConfig(ModuleContext moduleContext)
    {
        RoleManager.registerRole(new EHRDataAdminRole());
        RoleManager.registerRole(new EHRRequestorRole());
        RoleManager.registerRole(new EHRBasicSubmitterRole());
        RoleManager.registerRole(new EHRFullSubmitterRole());
        RoleManager.registerRole(new EHRFullUpdaterRole());
        RoleManager.registerRole(new EHRRequestAdminRole());

        RoleManager.registerRole(new EHRVeternarianRole());
        RoleManager.registerRole(new EHRDataEntryRole());
        RoleManager.registerRole(new EHRRequestorRole());

        EHRService.get().registerReportLink(EHRService.REPORT_LINK_TYPE.project, "View All Projects With Active Assignments", this, DetailsURL.fromString("/query/executeQuery.view?schemaName=ehr&query.queryName=Project&query.activeAssignments/activeAssignments~gt=0"), "Quick Links");
        EHRService.get().registerReportLink(EHRService.REPORT_LINK_TYPE.protocol, "View Total Animals Assigned to Each Protocol, By Species", this, DetailsURL.fromString("/query/executeQuery.view?schemaName=ehr&query.queryName=protocolTotalAnimalsBySpecies"), "Quick Links");
        EHRService.get().registerReportLink(EHRService.REPORT_LINK_TYPE.assignment, "Find Assignments Overlapping A Date Range", this, DetailsURL.fromString("/query/executeQuery.view?schemaName=study&query.queryName=assignmentOverlapsById"), "Quick Links");

        //attempt to schedule genetic calculations.  will abort if not enabled
        GeneticCalculationsJob.schedule();
        RecordDeleteRunner.schedule();

        DemographicsCache.get().onStartup();

        //buttons
        EHRService.get().registerMoreActionsButton(new JumpToHistoryButton(this), "study", LDKService.ALL_TABLES);
        EHRService.get().registerMoreActionsButton(new ReturnDistinctButton(this), "study", LDKService.ALL_TABLES);
        EHRService.get().registerMoreActionsButton(new ShowAuditHistoryButton(this), "study", LDKService.ALL_TABLES);
        EHRService.get().registerMoreActionsButton(new ShowAuditHistoryButton(this), "study", LDKService.ALL_TABLES);

        EHRService.get().registerMoreActionsButton(new CompareWeightsButton(this), "study", "weight");
        EHRService.get().registerMoreActionsButton(new TaskAssignButton(this), "ehr", "my_tasks");
        EHRService.get().registerMoreActionsButton(new TaskAssignButton(this), "ehr", "tasks");
        EHRService.get().registerMoreActionsButton(new MarkCompletedButton(this, "study", "treatment_order"), "study", "treatment_order");
        EHRService.get().registerMoreActionsButton(new MarkCompletedButton(this, "study", "problem"), "study", "problem");
        EHRService.get().registerMoreActionsButton(new MarkCompletedButton(this, "study", "assignment"), "study", "assignment");
        EHRService.get().registerMoreActionsButton(new MarkCompletedButton(this, "study", "feeding"), "study", "feeding");
        EHRService.get().registerMoreActionsButton(new MarkCompletedButton(this, "study", "parentage", "End Selected Calls"), "study", "parentage");
        EHRService.get().registerMoreActionsButton(new ExcelImportButton(this, "study", "parentage", "Import Data"), "study", "parentage");
        EHRService.get().registerMoreActionsButton(new VetReviewButton(this), "study", "cases");

        LDKService.get().registerSiteSummaryNotification(new DataEntrySummary());
        NotificationService.get().registerNotification(new DeathNotification());
    }

    @Override
    public void destroy()
    {
        DemographicsCache.get().shutdown();
        super.destroy();
    }

    @Override
    public void registerSchemas()
    {
        for (final String schemaName : getSchemaNames())
        {
            final DbSchema dbschema = DbSchema.get(schemaName);
            DefaultSchema.registerProvider(schemaName, new DefaultSchema.SchemaProvider(this)
            {
                public QuerySchema createSchema(final DefaultSchema schema, Module module)
                {
                    if (schemaName.equalsIgnoreCase(EHRSchema.EHR_LOOKUPS))
                        return new EHRLookupsUserSchema(schema.getUser(), schema.getContainer(), dbschema);
                    else if (schemaName.equalsIgnoreCase(EHRSchema.EHR_SCHEMANAME))
                        return new EHRUserSchema(schema.getUser(), schema.getContainer(), dbschema);
                    else
                        return null;
                }
            });
        }
    }

    @NotNull
    @Override
    public Collection<String> getSummary(Container c)
    {
        return Collections.emptyList();
    }

    @Override
    @NotNull
    public Collection<String> getSchemaNames()
    {
        return Arrays.asList(EHRSchema.EHR_SCHEMANAME, EHRSchema.EHR_LOOKUPS);
    }

    @NotNull
    @Override
    public JSONObject getPageContextJson(ViewContext context)
    {
        Map<String, Object> ret = new HashMap<>();
        Container c = context.getContainer();
        Map<String, String> map = getDefaultPageContextJson(c);
        ret.putAll(map);

        if (map.containsKey(EHRManager.EHRStudyContainerPropName) && map.get(EHRManager.EHRStudyContainerPropName) != null)
        {
            User u = context.getUser();

            //normalize line endings
            String newPath = map.get(EHRManager.EHRStudyContainerPropName);
            newPath = "/" + newPath.replaceAll("^/|/$", "");
            ret.put(EHRManager.EHRStudyContainerPropName, newPath);

            Container ehrContainer = ContainerManager.getForPath(map.get(EHRManager.EHRStudyContainerPropName));
            if(ehrContainer != null)
            {
                ret.put("EHRStudyContainerInfo", ehrContainer.toJSON(u));

                Set<String> moduleNames = new TreeSet<>();
                Set<Module> activeModules = ehrContainer.getActiveModules();
                for (Module m : EHRService.get().getRegisteredModules())
                {
                    if (activeModules.contains(m))
                        moduleNames.add(m.getName());
                }
                ret.put("EHRModules", new JSONObject(moduleNames));
            }

            //merge client context for registered modules, if they are enabled in current folder
            for (Module m : EHRService.get().getRegisteredModules())
            {
                if (c.getActiveModules().contains(m))
                {
                    JSONObject json = m.getPageContextJson(context);
                    for (String prop : json.keySet())
                    {
                        ret.put(prop, json.get(prop));
                    }
                }
            }
        }

        return new JSONObject(ret);
    }

    @Override
    public UpgradeCode getUpgradeCode()
    {
        return new EHRStudyUpgradeCode();
    }

    @Override
    public @NotNull LinkedHashSet<ClientDependency> getClientDependencies(Container c, User u)
    {
        // allow other modules to register with EHR service, and include them when the module is turned on
        LinkedHashSet<ClientDependency> ret = new LinkedHashSet<>();
        ret.addAll(super.getClientDependencies(c, u));
        ret.addAll(EHRService.get().getRegisteredClientDependencies(c, u));

        return ret;
    }
}
