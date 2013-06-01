/*
 * Copyright (c) 2013 LabKey Corporation
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
package org.labkey.ehr.utils;

import org.apache.commons.lang3.time.DateUtils;
import org.apache.log4j.Logger;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.Filter;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.User;
import org.labkey.api.util.ContextListener;
import org.labkey.api.util.ExceptionUtil;
import org.labkey.api.util.ShutdownListener;

import javax.servlet.ServletContextEvent;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.Timer;
import java.util.TimerTask;

/**
 * User: bimber
 * Date: 2/9/13
 * Time: 4:29 PM
 */
public class DescriptionUpdateService
{
    private static final DescriptionUpdateService _instance = new DescriptionUpdateService();

//    private static final Map<Container, Map<String, Long>> CHANGED_ENCOUNTERS = new HashMap<Container, Map<String, Long>>();
//    private static final Map<Container, Map<String, Long>> CHANGED_RUNS = new HashMap<Container, Map<String, Long>>();
//    private static final Map<Container, Map<String, Long>> CHANGED_CASES = new HashMap<Container, Map<String, Long>>();
    
    private static Timer TIMER;
    private static final long UPDATE_BUFFER = DateUtils.MILLIS_PER_SECOND * 30;
    private static final Logger _log = Logger.getLogger(DescriptionUpdateService.class);

    private DescriptionUpdateService()
    {
        
    }
    
    public static DescriptionUpdateService getInstance()
    {
        return _instance;
    }

    public static void scheduleEncounterDescriptionUpdate(String containerId, String[] changedIds)
    {
        Container c = ContainerManager.getForId(containerId);
        if (c == null)
            throw new IllegalArgumentException("Unknown container: " + containerId);

        UPDATE_TYPE.encounterId.addIds(c, changedIds);
    }

    public static void scheduleCaseDescriptionUpdate(String containerId, String[] changedIds)
    {
        Container c = ContainerManager.getForId(containerId);
        if (c == null)
            throw new IllegalArgumentException("Unknown container: " + containerId);

        UPDATE_TYPE.caseId.addIds(c, changedIds);
    }

    public static void scheduleClinpathRunDescriptionUpdate(String containerId, String[] changedIds)
    {
        Container c = ContainerManager.getForId(containerId);
        if (c == null)
            throw new IllegalArgumentException("Unknown container: " + containerId);

        UPDATE_TYPE.runId.addIds(c, changedIds);
    }

    private void ensureTimer()
    {
        if (TIMER == null)
        {
            // This is the first request, so start the timer
            TIMER = new Timer("EHR description update", true);
            TimerTask task = new DescriptionUpdateTask();
            TIMER.scheduleAtFixedRate(task, UPDATE_BUFFER, UPDATE_BUFFER);
            ShutdownListener listener = new DescriptionUpdateContextListener();
            // Add a shutdown listener to stop the worker thread if the webapp is shut down
            ContextListener.addShutdownListener(listener);
        }        
    }
    
    private class DescriptionUpdateTask extends TimerTask
    {
        @Override
        public void run()
        {
            try
            {
                for (UPDATE_TYPE t : UPDATE_TYPE.values())
                {
                    doUpdate(t);
                }
            }
            catch (Exception e)
            {
                _log.error("Failed to update EHR description fields", e);
                ExceptionUtil.logExceptionToMothership(null, e);
            }
        }

        private void doUpdate(UPDATE_TYPE type)
        {
            type.doUpdate();
        }
    }

    private enum UPDATE_TYPE
    {
        encounterId("parentId")
        {
            protected void updateDescriptions(Container c, Set<String> set)
            {
                User u = EHRService.get().getEHRUser(c);
                if (u == null)
                {
                    _log.error("EHRUser not set for container: " + c.getPath() + ".  Dataset records descriptions will not be set correctly");
                    return;
                }

                UserSchema us = QueryService.get().getUserSchema(u, c, "study");
                Filter filter = new SimpleFilter(FieldKey.fromString(_fieldName), set, CompareType.IN);

                TableInfo medications = us.getTable("Drug Administation");
                TableSelector ts = new TableSelector(medications, filter, null);



            }
        },
        caseId("caseId")
        {
            protected void updateDescriptions(Container c, Set<String> set)
            {

            }
        },
        runId("runId")
        {
            protected void updateDescriptions(Container c, Set<String> set)
            {

            }
        };

        protected String _fieldName;
        private Map<Container, Map<String, Long>> _ids;

        UPDATE_TYPE(String fieldName)
        {
            _fieldName = fieldName;
            _ids = new HashMap<Container, Map<String, Long>>();
        }

        public synchronized void addIds(Container c, String[] ids)
        {
            Map<String, Long> map = _ids.get(c);
            if (map == null)
                map = new HashMap<String, Long>();

            Long date = new Date().getTime();
            for (String id : ids)
            {
                map.put(id, date);
            }

            _ids.put(c, map);

            DescriptionUpdateService.getInstance().ensureTimer();
        }

        public synchronized void doUpdate()
        {
            if (_ids.isEmpty())
            {
                return;
            }

            Map<Container, Set<String>> ids = new HashMap<Container, Set<String>>();

            Long d = new Date().getTime();
            for (Container c : _ids.keySet())
            {
                // get all PKs that havent been updated since the buffer amount
                Map<String, Long> map = _ids.get(c);
                Set<String> keys = map.keySet();
                for (String id : keys)
                {
                    if ((d - map.get(id)) > UPDATE_BUFFER)
                    {
                        Set<String> set = ids.get(c);
                        if (set == null)
                            set = new HashSet<String>();

                        set.add(id);
                        map.remove(id);

                        ids.put(c, set);
                    }
                }

                if (map.isEmpty())
                    _ids.remove(c);
                else
                    _ids.put(c, map);
            }

            if (ids.size() > 0)
                updateDescriptions(ids);
        }

        private void updateDescriptions(Map<Container, Set<String>> map)
        {
            //TODO: in case server stops, cache record of pending updates, then remove on complete

            for (Container c : map.keySet())
            {
                updateDescriptions(c, map.get(c));
            }
        }

        abstract protected void updateDescriptions(Container c, Set<String> set);
    }

    private class DescriptionUpdateContextListener implements ShutdownListener
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
}
