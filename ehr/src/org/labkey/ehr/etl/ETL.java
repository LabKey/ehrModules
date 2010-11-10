/*
 * Copyright (c) 2010 LabKey Corporation
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
package org.labkey.ehr.etl;

import org.apache.log4j.Logger;
import org.labkey.ehr.EHRModule;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * Created by IntelliJ IDEA.
 * User: newton
 * Date: Oct 26, 2010
 * Time: 10:07:34 AM
 */
public class ETL
{
    private final static Logger log = Logger.getLogger(EHRModule.class);
    private static ScheduledExecutorService executor;
    private static ETLRunnable runnable;
    private static Status status = Status.Stop;
    
    static public synchronized void start()
    {
        if (ETL.status != Status.Run)
        {
            executor = Executors.newSingleThreadScheduledExecutor();

            try
            {
                runnable = new ETLRunnable();
                int interval = runnable.getRunIntervalInMinutes();
                if (interval != 0)
                {
                    log.info("Scheduling db sync at " + interval + " minute interval.");
                    executor.scheduleWithFixedDelay(runnable, 0, interval, TimeUnit.MINUTES);
                    ETL.status = Status.Run;
                }
            }
            catch (Exception e)
            {
                log.error("Could not start incremental db sync", e);
            }
        }
    }

    static public synchronized void stop()
    {
        if (ETL.status != Status.Stop)
        {
            log.info("Stopping ETL");
            executor.shutdownNow();
            runnable.shutdown();
            ETL.status = Status.Stop;
        }
    }

    /// etlAdmin.jsp uses this.
    public static boolean isRunning()
    {
        return Status.Run == status;
    }

    public enum Status
    {
        Run, Stop;
    }
}
