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
package org.labkey.ehr.history;

import org.jetbrains.annotations.Nullable;
import org.labkey.api.data.Container;
import org.labkey.api.ehr.history.LabworkType;
import org.labkey.api.module.Module;
import org.labkey.api.security.User;
import org.labkey.api.util.Pair;
import org.labkey.ehr.EHRServiceImpl;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * User: bimber
 * Date: 3/6/13
 * Time: 9:44 AM
 */
public class LabworkManager
{
    private static final LabworkManager _instance = new LabworkManager();
    private List<LabworkType> _types = new ArrayList<>();

    private LabworkManager()
    {
    }

    public static LabworkManager get()
    {
        return _instance;
    }

    public void registerType(LabworkType type)
    {
        _types.add(type);
    }

    public Collection<LabworkType> getTypes(Container c)
    {
        Map<String, Pair<Module, LabworkType>> labworkTypeOverrides = EHRServiceImpl.get().getLabWorkOverrides();

        Map<String, LabworkType> map = new LinkedHashMap<>();
        for (LabworkType type : _types)
        {
            // NOTE: this override mechanism should not actually be needed, and would be great to phase out.
            // This code is retained to allow legacy code to continue working. Performing a checking on whether the module is part of the
            // container's active modules and checking LabworkType.isEnabled() is probably redundant,
            // but the code does allow the user to provide them separately, so we should respect that.
            if (labworkTypeOverrides.containsKey(type.getName()) && c.getActiveModules().contains(labworkTypeOverrides.get(type.getName()).first) && labworkTypeOverrides.get(type.getName()).second.isEnabled(c))
            {
                map.put(type.getName(), labworkTypeOverrides.get(type.getName()).second);
                continue;
            }

            // NOTE: Because modules initialize in dependency order, they will be registered in order and the code below should allow
            // center modules to override default EHR labwork types.
            // Also, if it ever becomes necessary for a center module to simply eliminate a built-in labwork type we could consider making a
            // NoOpLabworkType. A module could register this to replace a built-in Labwork type with one that doesnt do anything.
            if (type.isEnabled(c))
            {
                map.put(type.getName(), type);
            }
        }

        return Collections.unmodifiableCollection(map.values());
    }

    public List<String> getResults(Container c, User u, String runId, boolean redacted)
    {
        List<String> list = new ArrayList<>();
        for (LabworkType type : getTypes(c))
        {
            list.addAll(type.getResults(c, u, runId, redacted));
        }

        return list;
    }

    public Map<String, List<String>> getResults(Container c, User u, List<String> runIds, boolean redacted)
    {
        Map<String, List<String>> map = new HashMap<>();
        for (LabworkType type : getTypes(c))
        {
            merge(map, type.getResults(c, u, runIds, redacted));
        }

        return map;
    }

    public Map<String, List<String>> getResults(Container c, User u, String id, Date minDate, Date maxDate, boolean redacted)
    {
        Map<String, List<String>> map = new HashMap<>();
        for (LabworkType type : getTypes(c))
        {
            merge(map, type.getResults(c, u, id, minDate, maxDate, redacted));
        }

        return map;
    }

    private void merge(Map<String, List<String>> map, Map<String, List<String>> newMap)
    {
        for (String runId : newMap.keySet())
        {
            List<String> existing = map.get(runId);
            if (existing == null)
                existing = new ArrayList<>();

            existing.addAll(newMap.get(runId));

            map.put(runId, existing);
        }
    }

    public boolean showPerformedBy(Container c, @Nullable String type)
    {
        for (LabworkType labworkType : _types)
        {
            if (labworkType.isEnabled(c) && labworkType.getName().equalsIgnoreCase(type))
            {
                return labworkType.showPerformedBy();
            }
        }
        return true;
    }
}
