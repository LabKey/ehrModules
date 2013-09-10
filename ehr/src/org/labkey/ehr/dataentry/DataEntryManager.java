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
package org.labkey.ehr.dataentry;

import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.Container;
import org.labkey.api.data.TableInfo;
import org.labkey.api.ehr.dataentry.DataEntryForm;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.User;
import org.labkey.ehr.EHRModule;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * User: bimber
 * Date: 4/27/13
 * Time: 8:24 AM
 */
public class DataEntryManager
{
    private static final DataEntryManager _instance = new DataEntryManager();

    private List<DataEntryForm> _forms = new ArrayList<>();
    private Map<String, List<FieldKey>> _defaultFieldKeys = new HashMap<>();

    private DataEntryManager()
    {

    }

    public static DataEntryManager get()
    {
        return _instance;
    }

    public void registerFormType(DataEntryForm form)
    {
        _forms.add(form);
    }

    //designed to produce a non-redunant list of forms that are active in the provided container
    private Map<String, DataEntryForm> getFormMap(Container c, User u)
    {
        Map<String, DataEntryForm> map = new HashMap<>();
        for (DataEntryForm f : _forms)
        {
            if (f.isAvailable(c, u))
                map.put(f.getName(), f);
        }

        return map;
    }

    public Collection<DataEntryForm> getForms(Container c, User u)
    {
        return getFormMap(c, u).values();
    }

    public DataEntryForm getFormByName(String name, Container c, User u)
    {
        return getFormMap(c, u).get(name);
    }

    public DataEntryForm getFormForQuery(String schemaName, String queryName, Container c, User u)
    {
        UserSchema us = QueryService.get().getUserSchema(u, c, schemaName);
        if (us == null)
            throw new IllegalArgumentException("Unable to find schema: " + schemaName);

        TableInfo ti = us.getTable(queryName);
        if (ti == null)
            throw new IllegalArgumentException("Unable to find table: " + schemaName + "." + queryName);

        return SingleQueryForm.create(ModuleLoader.getInstance().getModule(EHRModule.class), ti);
    }

    public void registerDefaultFieldKeys(String schemaName, String queryName, List<FieldKey> keys)
    {
        _defaultFieldKeys.put(getTableKey(schemaName, queryName), keys);
    }

    public List<FieldKey> getDefaultFieldKeys(TableInfo ti)
    {
        String tableKey = getTableKey(ti.getPublicSchemaName(), ti.getPublicName());
        if (_defaultFieldKeys.containsKey(tableKey))
            return _defaultFieldKeys.get(tableKey);


        return inferDefaultFieldKeys(ti);
    }

    private List<FieldKey> inferDefaultFieldKeys(TableInfo ti)
    {
        List<FieldKey> fks = new ArrayList<>();
        for (ColumnInfo ci : ti.getColumns())
        {
            if (ci.isShownInInsertView() && !ci.isCalculated())
            {
                fks.add(ci.getFieldKey());
            }
            else if (ci.isKeyField() || ci.getName().equalsIgnoreCase("objectid") || ci.getName().equalsIgnoreCase("runid") || ci.getName().equalsIgnoreCase("parentid") || ci.getName().equalsIgnoreCase("taskid") || ci.getName().equalsIgnoreCase("requestid"))
            {
                fks.add(ci.getFieldKey());
            }
        }

        return fks;
    }

    public static String getTableKey(String schemaName, String queryName)
    {
        return schemaName + "||" + queryName;
    }

    public static String getTableKey(TableInfo ti)
    {
        return getTableKey(ti.getPublicSchemaName(), ti.getPublicName());
    }
}
