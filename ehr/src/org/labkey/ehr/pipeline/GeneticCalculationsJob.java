/*
 * Copyright (c) 2013-2019 LabKey Corporation
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
package org.labkey.ehr.pipeline;

import org.apache.logging.log4j.Logger;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.DbScope;
import org.labkey.api.data.PropertyManager;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.SqlSelector;
import org.labkey.api.data.TableInfo;
import org.labkey.api.pipeline.PipelineJobException;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.User;
import org.labkey.api.util.logging.LogHelper;
import org.labkey.ehr.EHRManager;
import org.quartz.CronScheduleBuilder;
import org.quartz.Job;
import org.quartz.JobBuilder;
import org.quartz.JobDetail;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.quartz.SchedulerException;
import org.quartz.Trigger;
import org.quartz.TriggerBuilder;
import org.quartz.TriggerKey;
import org.quartz.impl.StdSchedulerFactory;

import java.util.Date;
import java.util.Map;

/**
 * User: bimber
 * Date: 4/25/13
 * Time: 5:56 PM
 */
public class GeneticCalculationsJob implements Job
{
    public final static String GENETICCALCULATIONS_PROPERTY_DOMAIN = "org.labkey.ehr.geneticcalculations";
    private static final Logger _log = LogHelper.getLogger(GeneticCalculationsJob.class, "Management and scheduling of genetic calculation pipeline jobs");
    private static TriggerKey _jobKey = null;

    public GeneticCalculationsJob()
    {

    }

    public static void unschedule()
    {
        if (_jobKey != null)
        {
            try
            {
                _log.info("Unscheduling GeneticCalculationsJob");
                StdSchedulerFactory.getDefaultScheduler().unscheduleJob(_jobKey);
                _jobKey = null;
            }
            catch (SchedulerException e)
            {
                _log.error("Error unscheduling GeneticCalculationsJob", e);
            }
        }
    }

    public static void schedule()
    {
        //already schduled
        if (_jobKey != null)
            return;

        if (!isEnabled())
            return;

        Container c = getContainer();
        if (c == null)
            return;

        Integer hour = getHourOfDay();
        if (hour == null)
            hour = 2;

        JobDetail job = JobBuilder.newJob(GeneticCalculationsJob.class)
                .withIdentity(GeneticCalculationsJob.class.getCanonicalName())
                .build();

        Trigger trigger = TriggerBuilder.newTrigger()
                .withIdentity(GeneticCalculationsJob.class.getCanonicalName())
                .withSchedule(CronScheduleBuilder.dailyAtHourAndMinute(hour, 0))
                .forJob(job)
                .build();

        try
        {
            _log.info("Scheduling GeneticCalculationsJob to run at " + hour + ":00");
            StdSchedulerFactory.getDefaultScheduler().scheduleJob(job, trigger);
            _jobKey = trigger.getKey();
        }
        catch (SchedulerException e)
        {
            _log.error("Error scheduling GeneticCalculationsJob", e);
        }
    }

    public static boolean isScheduled()
    {
        return _jobKey != null;
    }

    public static boolean isKinshipValidation()
    {
        Map<String, String> saved = PropertyManager.getProperties(GENETICCALCULATIONS_PROPERTY_DOMAIN);

        if (saved.containsKey("kinshipValidation"))
            return Boolean.parseBoolean(saved.get("kinshipValidation"));
        else
            return false;
    }

    public static boolean isAllowImportDuringBusinessHours()
    {
        Map<String, String> saved = PropertyManager.getProperties(GENETICCALCULATIONS_PROPERTY_DOMAIN);

        if (saved.containsKey("allowImportDuringBusinessHours"))
            return Boolean.parseBoolean(saved.get("allowImportDuringBusinessHours"));
        else
            return false;
    }

    public static boolean isEnabled()
    {
        Map<String, String> saved = PropertyManager.getProperties(GENETICCALCULATIONS_PROPERTY_DOMAIN);

        if (saved.containsKey("enabled"))
            return Boolean.parseBoolean(saved.get("enabled"));
        else
            return false;
    }

    public static Container getContainer()
    {
        Map<String, String> saved = PropertyManager.getProperties(GENETICCALCULATIONS_PROPERTY_DOMAIN);

        if (saved.containsKey("container"))
            return ContainerManager.getForId(saved.get("container"));

        return null;
    }

    public static Integer getHourOfDay()
    {
        Map<String, String> saved = PropertyManager.getProperties(GENETICCALCULATIONS_PROPERTY_DOMAIN);

        if (saved.containsKey("hourOfDay"))
            return Integer.parseInt(saved.get("hourOfDay"));

        return null;
    }

    public static void setProperties(Boolean isEnabled, Container c, Integer hourOfDay, Boolean isKinshipValidation, Boolean allowImportDuringBusinessHours)
    {
        PropertyManager.PropertyMap props = PropertyManager.getWritableProperties(GENETICCALCULATIONS_PROPERTY_DOMAIN, true);
        props.put("enabled", isEnabled.toString());
        props.put("container", c.getId());
        props.put("hourOfDay", hourOfDay.toString());
        props.put("kinshipValidation", isKinshipValidation.toString());
        props.put("allowImportDuringBusinessHours", allowImportDuringBusinessHours.toString());
        props.save();

        //unschedule in case settings have changed
        unschedule();

        if (isEnabled)
        {
            schedule();
        }
    }

    public static void setLastRun(Container c, @NotNull Long lastRun)
    {
        PropertyManager.PropertyMap pm = PropertyManager.getWritableProperties(c, GENETICCALCULATIONS_PROPERTY_DOMAIN, true);
        pm.put("lastRun", lastRun.toString());
        pm.save();
    }

    public @Nullable Long getLastRun(Container c)
    {
        PropertyManager.PropertyMap pm = PropertyManager.getProperties(c, GENETICCALCULATIONS_PROPERTY_DOMAIN);
        String ret = pm.get("lastRun");
        if (ret != null)
        {
            return Long.parseLong(ret);
        }

        return null;
    }

    @Override
    public void execute(JobExecutionContext context) throws JobExecutionException
    {
        Container c = getContainer();
        if (c == null)
        {
            _log.error("Unable to execute GeneticsCalculationTask, no container defined");
        }

        if (!hasModificationSinceLastRun(c))
        {
            _log.info("No modifications to pedigree data, skipping genetics calculation job");
            return;
        }

        try
        {
            _log.info("Running Scheduled Genetic Calculations Job");
            new GeneticCalculationsRunnable().run(c, isAllowImportDuringBusinessHours());
        }
        catch (PipelineJobException e)
        {
            throw new JobExecutionException(e);
        }
    }

    private boolean hasModificationSinceLastRun(Container c)
    {
        Long lastRun = getLastRun(c);

        // Never run before:
        if (lastRun == null)
        {
            return true;
        }

        // These will be caught elsewhere:
        User u = EHRManager.get().getEHRUser(c);
        if (u == null)
        {
            return true;
        }

        UserSchema us = QueryService.get().getUserSchema(u, c, "study");
        if (us == null)
        {
            return true;
        }

        TableInfo ti = us.getTable("pedigree");
        if (ti == null)
        {
            return true;
        }

        // If the table lacks a modified column, we always need to re-run
        if (ti.getColumn("modified") == null)
        {
            return true;
        }

        SqlSelector ss = new SqlSelector(DbScope.getLabKeyScope(), new SQLFragment("Select max(t.modified) FROM ").append(ti.getFromSQL("t")));
        Date lastModified = ss.getObject(Date.class);
        if (lastModified == null || lastModified.getTime() > lastRun)
        {
            return true;
        }

        return false;
    }
}
