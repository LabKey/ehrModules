/*
 * Copyright (c) 2012-2013 LabKey Corporation
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
import org.labkey.api.data.PropertyManager;
import org.labkey.api.data.TableCustomizer;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.module.Module;
import org.labkey.api.resource.Resource;
import org.labkey.api.security.User;
import org.labkey.api.settings.WriteableAppProps;
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
    private Map<String, Map<String, List<Pair<Module, TableCustomizer>>>> _tableCustomizers = new CaseInsensitiveHashMap<Map<String, List<Pair<Module, TableCustomizer>>>>();
    private Map<String, String> _dateFormats = new HashMap<String, String>();

    private static final String ALL_TABLES = "~~ALL_TABLES~~";
    private static final String ALL_SCHEMAS = "~~ALL_SCHEMAS~~";
    private static final String DATE_CATEGORY = "org.labkey.ehr.dateformat";

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

    public void registerTableCustomizer(Module owner, TableCustomizer customizer)
    {
        registerTableCustomizer(owner, customizer, ALL_SCHEMAS, ALL_TABLES);
    }

    public void registerTableCustomizer(Module owner, TableCustomizer customizer, String schema, String query)
    {
        Map<String, List<Pair<Module, TableCustomizer>>> map = _tableCustomizers.get(schema);
        if (map == null)
            map = new CaseInsensitiveHashMap<List<Pair<Module, TableCustomizer>>>();

        List<Pair<Module, TableCustomizer>> list = map.get(query);
        if (list == null)
            list = new ArrayList<Pair<Module, TableCustomizer>>();

        list.add(Pair.of(owner, customizer));

        map.put(query, list);
        _tableCustomizers.put(schema, map);
    }

    public List<TableCustomizer> getCustomizers(Container c, String schema, String query)
    {
        List<TableCustomizer> list = new ArrayList<TableCustomizer>();
        Set<Module> modules = c.getActiveModules();

        if (_tableCustomizers.get(ALL_SCHEMAS) != null)
        {
            for (Pair<Module, TableCustomizer> pair : _tableCustomizers.get(ALL_SCHEMAS).get(ALL_TABLES))
            {
                if (modules.contains(pair.first))
                    list.add(pair.second);
            }
        }

        if (_tableCustomizers.containsKey(schema))
        {
            if (_tableCustomizers.get(schema).get(ALL_TABLES).contains(ALL_TABLES))
            {
                for (Pair<Module, TableCustomizer> pair : _tableCustomizers.get(schema).get(ALL_TABLES))
                {
                    if (modules.contains(pair.first))
                        list.add(pair.second);
                }
            }

            if (_tableCustomizers.get(schema).get(ALL_TABLES).contains(query))
            {
                for (Pair<Module, TableCustomizer> pair : _tableCustomizers.get(schema).get(query))
                {
                    if (modules.contains(pair.first))
                        list.add(pair.second);
                }
            }
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

    public void setDateFormat(Container c, String format)
    {
        PropertyManager.PropertyMap props = PropertyManager.getWritableProperties(c, DATE_CATEGORY, true);
        props.put("dateFormat", format);
        PropertyManager.saveProperties(props);
        _dateFormats.put(c.getId(), format);
    }

    public String getDateFormat(Container c)
    {
        if (_dateFormats.containsKey(c.getId()))
            return _dateFormats.get(c.getId());

        Map<String, String> props = PropertyManager.getProperties(c, DATE_CATEGORY);
        if (props.containsKey("dateFormat"))
            return props.get("dateFormat");

        return "yyyy-MM-dd HH:mm";
    }

    public User getEHRUser()
    {
        return EHRManager.get().getEHRUser();
    }
}
