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
package org.labkey.ehr.demographics;

import org.labkey.api.collections.CaseInsensitiveHashMap;
import org.labkey.api.data.Container;
import org.labkey.api.query.FieldKey;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * User: bimber
 * Date: 7/14/13
 * Time: 11:46 AM
 */
public class AnimalRecord
{
    private Map<String, Object> _props = new CaseInsensitiveHashMap<Object>();
    private Container _container;
    private String _id;
    private Date _created;

    private AnimalRecord(Container c, String id)
    {
        _container = c;
        _id = id;
        _created = new Date();
    }

    public static AnimalRecord create(Container c, String id, Map<String, Object> props)
    {
        AnimalRecord rec = new AnimalRecord(c, id);
        rec.applyAll(props);

        return rec;
    }

    private void applyAll(Map<String, Object> props)
    {
        _props.putAll(props);
    }

    public String getId()
    {
        return _id;
    }

    public Container getContainer()
    {
        return _container;
    }

    public Date getCreated()
    {
        return _created;
    }

    public Map<String, Object> getProps()
    {
        return _props;
    }

    public String getGender()
    {
        return (String)_props.get("gender");
    }

    public String getGenderMeaning()
    {
        return (String)_props.get(FieldKey.fromString("gender/meaning").toString());
    }

    public String getOrigGender()
    {
        return (String)_props.get(FieldKey.fromString("gender/origGender").toString());
    }

    public String getSpecies()
    {
        return (String)_props.get("species");
    }

    public String getCalculatedStatus()
    {
        return (String)_props.get("calculated_status");
    }

    public Date getBirth()
    {
        return (Date)_props.get("birth");
    }

    public Date getDeath()
    {
        return (Date)_props.get("death");
    }

    public String getGeographicOrigin()
    {
        return (String)_props.get("geographic_origin");
    }

    public List<Map<String, Object>> getActiveAssignments()
    {
        return getListProperty("activeAssignments");
    }

    public List<Map<String, Object>> getActiveTreatments()
    {
        return getListProperty("activeTreatments");
    }

    public List<Map<String, Object>> getActiveHousing()
    {
        return getListProperty("activeHousing");
    }

    private List<Map<String, Object>> getListProperty(String prop)
    {
        if (_props.containsKey(prop) && _props.get(prop) instanceof List)
            return (List)_props.get(prop);

        return null;
    }

    public String getCurrentRoom()
    {
        List<Map<String, Object>> housing = getActiveHousing();
        if (housing != null && housing.size() > 0)
            return (String)housing.get(0).get("room");

        return null;
    }

    public String getCurrentCage()
    {
        List<Map<String, Object>> housing = getActiveHousing();
        if (housing != null && housing.size() > 0)
            return (String)housing.get(0).get("cage");

        return null;
    }

    public List<Map<String, Object>> getActiveFlags()
    {
        return getListProperty("activeFlags");
    }

    public List<Map<String, Object>> getActiveProblem()
    {
        return getListProperty("activeProblems");
    }

    public List<Map<String, Object>> getActiveCases()
    {
        return getListProperty("activeCases");
    }

    public List<Map<String, Object>> getParents()
    {
        return getListProperty("parents");
    }

    public List<Map<String, Object>> getWeights()
    {
        return getListProperty("weights");
    }

    public Double getMostRecentWeight()
    {
        return (Double)_props.get(FieldKey.fromString("mostRecentWeight").toString());
    }

    public Date getMostRecentWeightDate()
    {
        return (Date)_props.get(FieldKey.fromString("mostRecentWeightDate").toString());
    }

    public Date getMostRecentDeparture()
    {
        return (Date)_props.get(FieldKey.fromString("mostRecentDeparture").toString());
    }

    public Date getMostRecentArrival()
    {
        if (_props.containsKey("source"))
        {
            List<Map<String, Object>> rows = (List)_props.get("source");
            if (rows.size() > 0)
                return (Date)rows.get(0).get("date");
        }

        return null;
    }

    public Integer getDaysSinceWeight()
    {
        return (Integer)_props.get(FieldKey.fromString("daysSinceWeight").toString());
    }
}