/*
 * Copyright (c) 2012 LabKey Corporation
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
package org.labkey.ehr;

import org.labkey.api.collections.CaseInsensitiveHashMap;
import org.labkey.api.data.Container;
import org.labkey.api.data.TableCustomizer;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.module.Module;
import org.labkey.api.resource.Resource;
import org.labkey.api.security.User;
import org.labkey.api.util.Pair;
import org.labkey.api.view.template.ClientDependency;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 9/14/12
 * Time: 4:46 PM
 */
public class EHRServiceImpl extends EHRService
{
    private Set<Module> _registeredModules = new HashSet<Module>();
    private List<Pair<Module, Resource>> _extraTriggerScripts = new ArrayList<Pair<Module, Resource>>();
    private Map<Module, List<ClientDependency>> _clientDependencies = new HashMap<Module, List<ClientDependency>>();
    private Map<String, Map<String, List<TableCustomizer>>> _tableCustomizers = new CaseInsensitiveHashMap<Map<String, List<TableCustomizer>>>();
    private final String ALL_TABLES = "~~ALL_TABLES~~";
    private final String ALL_SCHEMAS = "~~ALL_SCHEMAS~~";

    public EHRServiceImpl()
    {

    }

    public void registerModule(Module module)
    {
        _registeredModules.add(module);
    }

    public Set<Module> getRegisteredModules()
    {
        return _registeredModules;
    }

    public void registerTriggerScript(Module owner, Resource script)
    {
        _extraTriggerScripts.add(Pair.of(owner, script));
    }


    public List<Resource> getExtraTriggerScripts(Container c)
    {
        List<Resource> resouces = new ArrayList<Resource>();
        Set<Module> activeModules = c.getActiveModules();

        for (Pair<Module, Resource> pair : _extraTriggerScripts)
        {
            if (activeModules.contains(pair.first))
            {
                resouces.add(pair.second);
            }
        }
        return Collections.unmodifiableList(resouces);
    }

    public void registerTableCustomizer(TableCustomizer customizer)
    {
        registerTableCustomizer(customizer, ALL_SCHEMAS, ALL_TABLES);
    }

    public void registerTableCustomizer(TableCustomizer customizer, String schema)
    {
        registerTableCustomizer(customizer, schema, ALL_TABLES);
    }

    public void registerTableCustomizer(TableCustomizer customizer, String schema, String query)
    {
        Map<String, List<TableCustomizer>> map = _tableCustomizers.get(schema);
        if (map == null)
            map = new CaseInsensitiveHashMap<List<TableCustomizer>>();

        List<TableCustomizer> list = map.get(query);
        if (list == null)
            list = new ArrayList<TableCustomizer>();

        list.add(customizer);

        map.put(query, list);
        _tableCustomizers.put(schema, map);
    }

    public List<TableCustomizer> getCustomizers(String schema, String query)
    {
        List<TableCustomizer> list = new ArrayList<TableCustomizer>();
        if (_tableCustomizers.get(ALL_SCHEMAS) != null)
            list.addAll(_tableCustomizers.get(ALL_SCHEMAS).get(ALL_TABLES));

        if (_tableCustomizers.containsKey(schema))
        {
            list.addAll(_tableCustomizers.get(schema).get(ALL_TABLES));
            list.addAll(_tableCustomizers.get(schema).get(query));
        }

        return Collections.unmodifiableList(list);
    }

    public void registerClientDependency(ClientDependency cd, Module owner)
    {
        List<ClientDependency> list = _clientDependencies.get(owner);
        if (list == null)
            list = new ArrayList<ClientDependency>();

        list.add(cd);

        _clientDependencies.put(owner, list);
    }

    public Set<ClientDependency> getRegisteredClientDependencies(Container c, User u)
    {
        Set<ClientDependency> set = new HashSet<ClientDependency>();
        for (Module m : _clientDependencies.keySet())
        {
            if (c.getActiveModules().contains(m))
            {
                set.addAll(_clientDependencies.get(m));
            }
        }

        return Collections.unmodifiableSet(set);
    }
}
