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

import org.labkey.api.data.Container;
import org.labkey.api.ehr.dataentry.DataEntryForm;
import org.labkey.api.security.User;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 4/27/13
 * Time: 8:24 AM
 */
public class DataEntryManager
{
    private static final DataEntryManager _instance = new DataEntryManager();

    private List<DataEntryForm> _forms = new ArrayList<DataEntryForm>();

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
        Map<String, DataEntryForm> map = new HashMap<String, DataEntryForm>();
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
}
