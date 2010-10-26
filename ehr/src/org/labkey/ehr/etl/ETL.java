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

    public static boolean isRunning()
    {
        return Status.Run == status;
    }

    public enum Status
    {
        Run, Stop;
    }
}
