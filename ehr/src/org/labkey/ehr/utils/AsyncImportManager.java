package org.labkey.ehr.utils;

import org.apache.commons.lang3.time.DateUtils;
import org.apache.log4j.Logger;
import org.jetbrains.annotations.Nullable;
import org.labkey.api.data.Container;
import org.labkey.api.security.User;
import org.labkey.api.util.ContextListener;
import org.labkey.api.util.ExceptionUtil;
import org.labkey.api.util.ShutdownListener;

import javax.servlet.ServletContextEvent;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import java.util.Timer;
import java.util.TimerTask;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 2/9/13
 * Time: 4:29 PM
 */
public class AsyncImportManager
{
    private static final AsyncImportManager _instance = new AsyncImportManager();

    private static final Map<Container, Set<String>> CHANGED_ENCOUNTERS = new HashMap<Container, Set<String>>();
    private static Timer TIMER;
    private static final long UPDATE_INTERVAL = DateUtils.MILLIS_PER_MINUTE * 5;
    private static final Logger _log = Logger.getLogger(AsyncImportManager.class);

    private AsyncImportManager()
    {
        
    }
    
    public static AsyncImportManager getInstance()
    {
        return _instance;
    }

    public void scheduleEncounterDescriptionUpdate(@Nullable Set<String> changedEncounters, Container c)
    {
        assert changedEncounters == null || !changedEncounters.isEmpty() : "Shouldn't be called with an empty set of encounter ids";
        synchronized (CHANGED_ENCOUNTERS)
        {
            Set<String> mergedEncounterIds;
            if (changedEncounters == null)
            {
                mergedEncounterIds = null;
            }
            else if (CHANGED_ENCOUNTERS.containsKey(c))
            {
                // We already have a set of participants queued to be potentially purged
                Set<String> existingEncounterIds = CHANGED_ENCOUNTERS.get(c);
                if (existingEncounterIds == null)
                {
                    // The existing request is for all participants, so respect that
                    mergedEncounterIds = null;
                }
                else
                {
                    // Add the subset that are now being requested to the existing set
                    mergedEncounterIds = existingEncounterIds;
                    mergedEncounterIds.addAll(changedEncounters);
                }
            }
            else
            {
                // This is the only request for this study in the queue, so copy the set of participants
                mergedEncounterIds = new HashSet<String>(changedEncounters);
            }
            CHANGED_ENCOUNTERS.put(c, mergedEncounterIds);

            if (TIMER == null)
            {
                // This is the first request, so start the timer
                TIMER = new Timer("Encounter description update", true);
                TimerTask task = new EncounterUpdateTask();
                TIMER.scheduleAtFixedRate(task, UPDATE_INTERVAL, UPDATE_INTERVAL);
                ShutdownListener listener = new EncounterUpdateContextListener();
                // Add a shutdown listener to stop the worker thread if the webapp is shut down
                ContextListener.addShutdownListener(listener);
            }
        }
    }

    private class EncounterUpdateTask extends TimerTask
    {
        @Override
        public void run()
        {
            try
            {
                while (true)
                {
                    Container container;
                    Set<String> encounterIds;

                    synchronized (CHANGED_ENCOUNTERS)
                    {
                        if (CHANGED_ENCOUNTERS.isEmpty())
                        {
                            return;
                        }
                        // Grab the first study to be purged, and exit the synchronized block quickly
                        Iterator<Map.Entry<Container, Set<String>>> i = CHANGED_ENCOUNTERS.entrySet().iterator();
                        Map.Entry<Container, Set<String>> entry = i.next();
                        i.remove();
                        container = entry.getKey();
                        encounterIds = entry.getValue();
                    }

                    if (encounterIds != null)
                    {
                        for (String id : encounterIds)
                        {
                            updateEncounterDescription(id);
                        }
                    }
                }
            }
            catch (Exception e)
            {
                _log.error("Failed to update encounter descriptions", e);
                ExceptionUtil.logExceptionToMothership(null, e);
            }
        }
    }

    private class EncounterUpdateContextListener implements ShutdownListener
    {
        @Override
        public void shutdownPre(ServletContextEvent servletContextEvent) {}

        @Override
        public void shutdownStarted(ServletContextEvent servletContextEvent)
        {
            if (TIMER != null)
            {
                TIMER.cancel();
            }
        }
    }

    private void updateEncounterDescription(String id)
    {

    }
}
