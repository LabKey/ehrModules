/*
 * Copyright (c) 2017-2019 LabKey Corporation
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
package org.labkey.api.snd;

import org.apache.logging.log4j.Logger;
import org.jetbrains.annotations.Nullable;
import org.json.JSONObject;
import org.labkey.api.data.Container;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.dataiterator.DataIteratorBuilder;
import org.labkey.api.dataiterator.DataIteratorContext;
import org.labkey.api.gwt.client.model.GWTPropertyDescriptor;
import org.labkey.api.module.Module;
import org.labkey.api.security.User;
import org.labkey.api.services.ServiceRegistry;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.locks.Lock;

/**
 * Created by marty on 8/4/2017.
 */
public interface SNDService
{
    @Nullable
    static SNDService get()
    {
        return ServiceRegistry.get(SNDService.class);
    }

    void savePackage(Container c, User u, Package pkg);
    void savePackage(Container c, User u, Package pkg, SuperPackage superPkg, boolean cloneFlag);
    void savePackage(Container c, User u, Package pkg, SuperPackage superPkg, boolean cloneFlag, boolean isPipelineJob);
    void saveSuperPackages(Container c, User u, List<SuperPackage> superPkgs);
    List<Package> getPackages(Container c, User u, List<Integer> pkgIds, boolean includeExtraFields, boolean includeLookups, boolean includeFullSubpackages);
    void registerAttributeLookup(Container c, User u, String schema, @Nullable String table);
    Map<String, String> getAttributeLookups(Container c, User u);
    Object getDefaultLookupDisplayValue(User u, Container c, String schema, String table, Object key);
    void saveProject(Container c, User u, Project project, boolean isRevision);
    Project getProject(Container c, User u, int projectId, int revNum);
    Event saveEvent(Container c, User u, Event event, boolean validateOnly);
    Event getEvent(Container c, User u, int eventId, @Nullable Set<EventNarrativeOption> narrativeOptions);
    JSONObject convertPropertyDescriptorToJson(Container c, User u, GWTPropertyDescriptor pd, boolean resolveLookupValues);
    Object normalizeLookupValue(User u, Container c, String schema, String table, Object display);
    void registerEventTriggerFactory(Module module, EventTriggerFactory factory);
    void unregisterEventTriggerFactory(Module module);
    Lock getWriteLock();
    List<Map<String,Object>> getMutableData(DataIteratorBuilder rows, DataIteratorContext dataIteratorContext) throws IOException;
    void fillInNarrativeCache(Container c, User u, Logger logger);
    void clearNarrativeCache(Container c, User u);
    void deleteNarrativeCacheRows(Container c, User u, List<Map<String, Object>> eventIds);
    void populateNarrativeCache(Container c, User u, List<Integer> eventIds, Logger logger, boolean isFullReload);
    Map<Integer, Category> getAllCategories(Container c, User u);
    Integer getQCStateId(Container c, User u, QCStateEnum qcState);
    QCStateEnum getQCState(Container c, User u, int qcStateId);
    List<Map<String, Object>> getActiveProjects(Container c, User u, ArrayList<SimpleFilter> filters, Boolean activeProjectItemsOnly, Date eventDate);
    List<Map<String, Object>> getActiveProjects(Container c, User u, ArrayList<SimpleFilter> filters, Boolean activeProjectItemsOnly);
    List<Map<String, Object>> getActiveProjects(Container c, User u, ArrayList<SimpleFilter> filters);
}
