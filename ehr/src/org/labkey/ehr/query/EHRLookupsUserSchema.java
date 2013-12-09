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
package org.labkey.ehr.query;

import org.labkey.api.cache.CacheManager;
import org.labkey.api.collections.CaseInsensitiveHashSet;
import org.labkey.api.data.Container;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.SchemaTableInfo;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.ldk.table.ContainerScopedTable;
import org.labkey.api.module.Module;
import org.labkey.api.query.SimpleUserSchema;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.User;
import org.labkey.ehr.EHRSchema;

import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/**
 * User: bimber
 * Date: 1/31/13
 * Time: 3:50 PM
 */
public class EHRLookupsUserSchema extends SimpleUserSchema
{
    public EHRLookupsUserSchema(User user, Container container, DbSchema dbschema)
    {
        super(EHRSchema.EHR_LOOKUPS, null, user, container, dbschema);
    }

    @Override
    public Set<String> getTableNames()
    {
        Set<String> available = new CaseInsensitiveHashSet();
        available.addAll(super.getTableNames());

        available.addAll(getPropertySetNames().keySet());
        available.addAll(getLabworkTypeNames().keySet());

        return Collections.unmodifiableSet(available);
    }

    @Override
    public synchronized Set<String> getVisibleTableNames()
    {
        Set<String> available = new CaseInsensitiveHashSet();
        available.addAll(super.getTableNames());

        available.addAll(getPropertySetNames().keySet());
        available.addAll(getLabworkTypeNames().keySet());

        return Collections.unmodifiableSet(available);
    }

    private Map<String, Map<String, Object>> getPropertySetNames()
    {
        Map<String, Map<String, Object>> nameMap = (Map<String, Map<String, Object>>) CacheManager.getSharedCache().get(LookupSetTable.CACHE_KEY);
        if (nameMap != null)
            return nameMap;

        nameMap = new HashMap<>();

        TableSelector ts = new TableSelector(_dbSchema.getTable(EHRSchema.TABLE_LOOKUP_SETS));
        Map<String, Object>[] rows = ts.getMapArray();
        if (rows.length > 0)
        {
            Set<String> existing = super.getTableNames();
            for (Map<String, Object> row : rows)
            {
                String setname = (String)row.get("setname");
                if (setname != null && !existing.contains(setname))
                    nameMap.put(setname, row);
            }
        }

        nameMap = Collections.unmodifiableMap(nameMap);
        CacheManager.getSharedCache().put(LookupSetTable.CACHE_KEY, nameMap);

        return nameMap;
    }

    private Map<String, String> getLabworkTypeNames()
    {
        Map<String, String> nameMap = (Map<String, String>) CacheManager.getSharedCache().get(LabworkTypeTable.CACHE_KEY);
        if (nameMap != null)
            return nameMap;

        nameMap = new HashMap<>();

        TableSelector ts = new TableSelector(_dbSchema.getTable(EHRSchema.TABLE_LABWORK_TYPES));
        Map<String, Object>[] rows = ts.getMapArray();
        if (rows.length > 0)
        {
            Set<String> existing = super.getTableNames();
            for (Map<String, Object> row : rows)
            {
                String tableName = (String)row.get("tableName");
                String type = (String)row.get("type");
                if (tableName != null && !existing.contains(tableName))
                    nameMap.put(tableName, type);
            }
        }

        nameMap = Collections.unmodifiableMap(nameMap);
        CacheManager.getSharedCache().put(LabworkTypeTable.CACHE_KEY, nameMap);

        return nameMap;
    }

    protected TableInfo createTable(String name)
    {
        Set<String> available = super.getTableNames();

        //special cases
        if ("snomed".equalsIgnoreCase(name))
        {
            return createSNOMEDTable(name);
        }

        if (available.contains(name))
            return super.createTable(name);

        //try to find it in propertySets
        Map<String, Map<String, Object>> nameMap = getPropertySetNames();
        if (nameMap.containsKey(name))
        {
            return createForPropertySet(this, name, nameMap.get(name));
        }

        Map<String, String> labworkMap = getLabworkTypeNames();
        if (labworkMap.containsKey(name))
        {
            return createForLabwork(this, name, labworkMap.get(name));
        }

        return null;
    }

    private TableInfo createSNOMEDTable(String name)
    {
        SchemaTableInfo table = _dbSchema.getTable(name);
        return new ContainerScopedTable(this, table, "code").init();
    }

    private LookupSetTable createForPropertySet(UserSchema us, String setName, Map<String, Object> map)
    {
        SchemaTableInfo table = _dbSchema.getTable(EHRSchema.TABLE_LOOKUPS);
        return new LookupSetTable(us, table, setName, map).init();
    }

    private LabworkTypeTable createForLabwork(UserSchema us, String tableName, String typeName)
    {
        SchemaTableInfo table = _dbSchema.getTable(EHRSchema.TABLE_LAB_TESTS);
        return new LabworkTypeTable(us, table, tableName, typeName).init();
    }
}
