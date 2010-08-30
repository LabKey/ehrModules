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

import org.apache.log4j.Logger;
import org.labkey.api.audit.AuditLogService;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.DbSchema;
import org.labkey.api.module.DefaultModule;
import org.labkey.api.module.ModuleContext;
import org.labkey.api.view.WebPartFactory;
import org.labkey.ehr.etl.ETLAuditViewFactory;
import org.labkey.ehr.etl.ETLRunnable;

import java.util.Collection;
import java.util.Collections;
import java.util.Set;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class EHRModule extends DefaultModule
{
    private final static Logger log = Logger.getLogger(EHRModule.class);
    private static ScheduledExecutorService executor;
    private static ETLRunnable etl;

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
        startETL();
        // add a container listener so we'll know when our container is deleted:
        ContainerManager.addContainerListener(new EHRContainerListener());

        AuditLogService.get().addAuditViewFactory(ETLAuditViewFactory.getInstance());
    }

    @Override
    public void destroy()
    {
        stopETL();
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

    static public void startETL()
    {
        if (EHRController.etlStatus != EHRController.ETLStatus.Run)
        {
            executor = Executors.newSingleThreadScheduledExecutor();
            try {
                etl = new ETLRunnable();
                int interval = etl.getRunIntervalInMinutes();
                if (interval != 0)
                {
                    log.info("Scheduling db sync at " + interval + " minute interval.");
                    executor.scheduleWithFixedDelay(etl, 0, interval, TimeUnit.MINUTES);
                    EHRController.etlStatus = EHRController.ETLStatus.Run;
                }
            }
            catch (Exception e)
            {
                log.error("Could not start incremental db sync", e);
            }

        }
    }

    static public void stopETL()
    {
        if (EHRController.etlStatus != EHRController.ETLStatus.Stop)
        {
            log.info("Stopping ETL");
            executor.shutdownNow();
            etl.shutdown();
            EHRController.etlStatus = EHRController.ETLStatus.Stop;
        }
    }

}
