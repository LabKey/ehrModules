/*
 * Copyright (c) 2012-2014 LabKey Corporation
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
package org.labkey.ehr.demographics;

import org.apache.log4j.Logger;
import org.labkey.api.cache.CacheManager;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.ehr.demographics.DemographicsProvider;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.module.ModuleProperty;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.User;
import org.labkey.api.security.permissions.AdminPermission;
import org.labkey.api.study.Study;
import org.labkey.api.util.ConfigurationException;
import org.labkey.api.util.JobRunner;
import org.labkey.ehr.EHRManager;
import org.labkey.ehr.EHRModule;
import org.springframework.dao.DeadlockLoserDataAccessException;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.TimeUnit;

/**
 * User: bimber
 * Date: 9/17/12
 * Time: 8:35 PM
 */
public class DemographicsCache
{
    private static final DemographicsCache _instance = new DemographicsCache();
    private static final Logger _log = Logger.getLogger(DemographicsCache.class);

    //track stats
    private int _totalCached = 0;
    private int _totalUncached = 0;
    private List<String> _cachedIds = new ArrayList<>();
    private boolean _onStartupCalled = false;
    private ScheduledExecutorService _executor = null;
    private static ScheduledFuture _future = null;

    private Map<Container, Set<String>> _toCache = new HashMap<>();

    private DemographicsCache()
    {

    }

    public static DemographicsCache get()
    {
        return _instance;
    }

    public AnimalRecord getAnimal(Container c, User u, String id)
    {
        List<AnimalRecord> ret = getAnimals(c, u, Collections.singletonList(id));
        return ret.size() > 0 ? ret.get(0) : null;
    }

    public List<AnimalRecord> getAnimals(Container c, User u, Collection<String> ids)
    {
        return getAnimals(c, u, ids, false);
    }

    protected List<AnimalRecord> getAnimals(Container c, User u, Collection<String> ids, boolean forceRecache)
    {
        List<AnimalRecord> records = new ArrayList<>();
        Set<String> toCreate = new HashSet<>();
        for (String id : ids)
        {
            String key = getCacheKey(c, id);
            if (forceRecache || CacheManager.getSharedCache().get(key) == null)
            {
                toCreate.add(id);
            }
            else
            {
                records.add((AnimalRecord)CacheManager.getSharedCache().get(key));
            }
        }

        if (toCreate.size() > 0)
        {
            records.addAll(createRecords(c, toCreate));
        }

        return records;
    }

    public void reportDataChange(Container c, String schema, String query, List<String> ids)
    {
        for (DemographicsProvider p : EHRService.get().getDemographicsProviders(c))
        {
            if (p.requiresRecalc(schema, query))
            {
                uncacheRecords(c, ids);
                break;
            }
        }
    }

    private String getCacheKey(Container c, String id)
    {
        assert c != null && c.getId() != null : "Attempting to cache a record without a container: " + id;
        return getClass().getName() + "||" + c.getId() + "||" + id;
    }

    synchronized public void cacheRecord(AnimalRecord record)
    {
        //_log.info("caching demographics record: " + record.getId());
        String key = getCacheKey(record.getContainer(), record.getId());
        CacheManager.getSharedCache().put(key, record);
        _totalCached++;
        _cachedIds.add(key);
    }

    synchronized public void uncacheRecords(Container c, String... ids)
    {
        uncacheRecords(c, Arrays.asList(ids));
    }

    synchronized public void uncacheRecords(Container c, Collection<String> ids)
    {
        for (String id : ids)
        {
            _log.info("attempting to uncache: " + id);
            String key = getCacheKey(c, id);
            CacheManager.getSharedCache().remove(key);
            _cachedIds.remove(key);
        }
        _totalUncached += ids.size();
    }

    // IDs to recache are placed into a queue that is inspected and processed on a schedule
    public synchronized void asyncCache(Container c, List<String> ids)
    {
        _log.info("Request async cache for " + ids.size() + " animals");

        Set<String> queue = _toCache.get(c);
        if (queue == null)
            queue = new HashSet<>();

        queue.addAll(ids);
        _toCache.put(c, queue);
    }

    // This is intended to run as a background process
    private void processCache()
    {
        for (Container c : _toCache.keySet())
        {
            Set<String> ids;
            synchronized (this)
            {
                ids = _toCache.get(c);
                if (ids.size() == 0)
                    continue;
            }

            User u = EHRService.get().getEHRUser(c);
            if (u == null)
                continue;

            _log.info("Perform async cache for " + ids.size() + " animals");

            //note, if the record is re-requested between the point of uncaching, but prior to commit, we can end up with inconsistent values, so force a re-calculation here
            try
            {
                DemographicsCache.get().getAnimals(c, u, ids, true);
                synchronized (this)
                {
                    _toCache.get(c).removeAll(ids);
                    if (_toCache.get(c).size() == 0)
                        _toCache.remove(c);
                }
            }
            catch (DeadlockLoserDataAccessException e)
            {
                //if we hit a deadlock, the IDs will not be removed from the cache and therefore re-cached on the next cycle
                _log.error("DemographicsCache encountered a deadlock", e);
            }
        }
    }

    public List<AnimalRecord> createRecords(Container c, Collection<String> ids)
    {
        User u = EHRService.get().getEHRUser(c);
        if (u == null)
        {
            throw new ConfigurationException("EHRUser not set in the container: " + c.getPath());
        }

        Map<String, Map<String, Object>> ret = new HashMap<>();
        //NOTE: SQLServer can complain if requesting more than 2000 at a time, so break into smaller sets
        int start = 0;
        int batchSize = 500;
        List<String> allIds = new ArrayList<>(ids);
        while (start < ids.size())
        {
            List<String> sublist = allIds.subList(start, Math.min(ids.size(), start + batchSize));
            start = start + batchSize;
            _log.info("caching demographics records for " + sublist.size() + " animals");

            for (DemographicsProvider p : EHRService.get().getDemographicsProviders(c))
            {
                Map<String, Map<String, Object>> props = p.getProperties(c, u, sublist);
                for (String id : props.keySet())
                {
                    Map<String, Object> perId = ret.get(id);
                    if (perId == null)
                        perId = new HashMap<>();

                    perId.putAll(props.get(id));

                    ret.put(id, perId);
                }
            }
        }

        //NOTE: we want to keep track of attempt to find an ID.  requesting a non-existing ID still requires a query, so make note of the fact it doesnt exist
        for (String id : ids)
        {
            if (!ret.containsKey(id))
                ret.put(id, new HashMap<String, Object>());
        }

        List<AnimalRecord> records = new ArrayList<>();
        for (String id : ret.keySet())
        {
            Map<String, Object> props = ret.get(id);
            AnimalRecord record = AnimalRecord.create(c, id, props);

            cacheRecord(record);
            records.add(record);
        }

        return records;
    }

    public int getTotalCached()
    {
        return _totalCached;
    }

    public int getTotalUncached()
    {
        return _totalUncached;
    }

    public int getCacheSize()
    {
        return _cachedIds.size();
    }

    public List<String> getCachedIds()
    {
        return Collections.unmodifiableList(_cachedIds);
    }

    public void cacheLivingAnimals(Container c, User u)
    {
        UserSchema us = QueryService.get().getUserSchema(u, c, "study");
        if (us == null)
            throw new IllegalArgumentException("Unable to find study schema");

        TableInfo demographics = us.getTable("demographics");
        if (demographics == null)
            throw new IllegalArgumentException("Unable to find demographics table");

        TableSelector ts = new TableSelector(demographics, Collections.singleton("Id"), new SimpleFilter(FieldKey.fromString("calculated_status"), "Alive", CompareType.EQUAL), null);
        List<String> ids = ts.getArrayList(String.class);

        TableSelector ts2 = new TableSelector(demographics, Collections.singleton("Id"), new SimpleFilter(FieldKey.fromString("death"), "-30d", CompareType.DATE_GTE), null);
        List<String> recentlyDeadIds = ts2.getArrayList(String.class);
        if (recentlyDeadIds.size() > 0)
        {
            ids.addAll(recentlyDeadIds);
        }

        if (ids.size() > 0)
        {
            _log.info("Forcing recache of " + ids.size() + " animals");
            asyncCache(c, ids);
        }
    }

    public Set<String> verifyCache()
    {
        Set<String> missing = new HashSet<>();
        for (String key : _cachedIds)
        {
            if (CacheManager.getSharedCache().get(key) == null)
                missing.add(key);
        }

        return missing;
    }

    public void onStartup()
    {
        if (_onStartupCalled)
        {
            throw new IllegalArgumentException("DemographicsCache.onStartup() has already been called");
        }

        _onStartupCalled = true;

        //schedule the background process to inspect the queue
        _executor = Executors.newSingleThreadScheduledExecutor(new ThreadFactory() {
            public Thread newThread(Runnable r) {
                return new Thread(r, "EHR Demographics Service");
            }
        });

        _future = _executor.scheduleWithFixedDelay(new Runnable(){
            public void run()
            {
                processCache();
            }
        }, 60, 10, TimeUnit.SECONDS);

        //also cause all living animals to be cached, if set
        ModuleProperty shouldCache = ModuleLoader.getInstance().getModule(EHRModule.class).getModuleProperties().get(EHRManager.EHRCacheDemographicsPropName);
        User rootUser = EHRManager.get().getEHRUser(ContainerManager.getRoot(), false);
        if (rootUser == null)
            return;

        for (Study s : EHRManager.get().getEhrStudies(rootUser))
        {
            String value = shouldCache.getEffectiveValue(s.getContainer());
            if (value != null)
            {
                Boolean val = Boolean.parseBoolean(value);
                if (val)
                {
                    User u = EHRService.get().getEHRUser(s.getContainer());
                    if (u == null || !s.getContainer().hasPermission(u, AdminPermission.class))
                    {
                        continue;
                    }

                    DemographicsCache.get().cacheLivingAnimals(s.getContainer(), u);
                }
            }
        }
    }

    public void shutdown()
    {
        if (_executor != null)
            _executor.shutdownNow();
    }
}
