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
package org.labkey.ehr.utils;

import org.labkey.api.data.Container;
import org.labkey.api.data.TableInfo;
import org.labkey.api.security.User;
import org.labkey.ehr.EHRManager;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * User: bimber
 * Date: 9/17/12
 * Time: 8:35 PM
 */
public class DemographicsCache
{
    private DemographicsCache _instance;
    private TableInfo _demographicsQuery;
    private Map<String, AnimalRecord> _records = new HashMap<String, AnimalRecord>();

    public DemographicsCache(Container c)
    {
        User u = EHRManager.get().getEHRUser(c);


    }

//    private DemographicsCache get()
//    {
//        return _instance;
//    }

    public List<AnimalRecord> getAnimals(String... ids)
    {
        List<AnimalRecord> records = new ArrayList<AnimalRecord>();
        for (String id : ids)
        {
            if (!_records.containsKey(id))
            {
                queryRecord(id);
            }

            records.add(_records.get(id));
        }


        return records;
    }

    public AnimalRecord queryRecord(String id)
    {
        return new AnimalRecord();
    }

    public void updateAnimal(String id)
    {
        updateAnimal(id, null);
    }

    public void updateAnimal(String id, Map<String, Object> values)
    {

    }

    public static class AnimalRecord
    {
        String _id;
        String _currentArea;
        String _currentRoom;
        String _currentCage;

    }
}
